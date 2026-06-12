'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import Navbar                     from './components/Navbar';
import SearchBar                  from './components/SearchBar';
import LoadingSkeleton            from './components/LoadingSkeleton';
import ErrorState                 from './components/ErrorState';
import MetricCards                from './components/MetricCards';
import SentimentBadge             from './components/SentimentBadge';
import PriceChart                 from './components/PriceChart';
import RecommendationsList        from './components/RecommendationsList';
import NewsList                   from './components/NewsList';
import TransparencyExplainability from './components/TransparencyExplainability';
import { fetchAnalyze, createRealtimeAnalyzeSocket } from '@/lib/api';

const REFRESH_INTERVAL = 30;

export default function Page() {
  const [ticker,    setTicker]    = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [analysis,  setAnalysis]  = useState(null);
  const [wsStatus,  setWsStatus]  = useState('idle');
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [darkMode,  setDarkMode]  = useState(true);

  // BUG F FIX: simpan ticker di ref agar onAnalyze selalu pakai nilai terbaru
  // tanpa perlu ticker masuk ke deps — mencegah re-create callback yang tidak perlu
  const tickerRef   = useRef('');
  const wsRef       = useRef(null);
  const intervalRef = useRef(null);
  const cntRef      = useRef(null);

  // Sync tickerRef dengan state
  useEffect(() => { tickerRef.current = ticker; }, [ticker]);

  // Baca tema dari localStorage saat mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bi_theme');
      setDarkMode(saved !== 'light');
    } catch {}
  }, []);

  // Sync class dark/light ke <html>
  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode);
    document.documentElement.classList.toggle('dark',   darkMode);
    try { localStorage.setItem('bi_theme', darkMode ? 'dark' : 'light'); } catch {}
  }, [darkMode]);

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(intervalRef.current);
    clearInterval(cntRef.current);
    wsRef.current?.close?.();
  }, []);

  // BUG F FIX: onAnalyze tanpa ticker di deps — pakai tickerRef untuk nilai fresh
  const onAnalyze = useCallback(async (overrideTicker) => {
    const t = ((overrideTicker ?? tickerRef.current) || '').toString().trim().toUpperCase();
    if (!t) return;

    setError(null);
    setLoading(true);
    setWsStatus('connecting');
    setCountdown(REFRESH_INTERVAL);

    clearInterval(intervalRef.current);
    clearInterval(cntRef.current);
    wsRef.current?.close?.();
    wsRef.current = null;

    try {
      wsRef.current = createRealtimeAnalyzeSocket({
        ticker: t,
        onStatus: s => setWsStatus(s),
        onMessage: data => { setAnalysis(data); setLoading(false); },
        onError: async () => {
          try {
            const res = await fetchAnalyze(t);
            setAnalysis(res);
            setLoading(false);
          } catch (e) {
            setError(e?.message ?? 'Unknown error');
            setAnalysis(null);
            setLoading(false);
          }
        },
      });

      intervalRef.current = setInterval(() => {
        wsRef.current?.sendTick?.();
        setCountdown(REFRESH_INTERVAL);
      }, REFRESH_INTERVAL * 1_000);

      cntRef.current = setInterval(() => {
        setCountdown(c => (c <= 1 ? REFRESH_INTERVAL : c - 1));
      }, 1_000);

    } catch (e) {
      setError(e?.message ?? 'Unknown error');
      setAnalysis(null);
      setLoading(false);
      setWsStatus('error');
    }
  }, []); // deps kosong — aman karena pakai tickerRef

  const handleExport = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${analysis.ticker}-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  // Shorthand data dari backend
  const stock           = analysis?.data?.stock_data;
  const sentiment       = analysis?.data?.sentiment;
  const recommendations = analysis?.data?.recommendations;
  const newsData        = analysis?.data?.news_data;
  const headlines       = newsData?.headlines;
  const analysisData    = analysis?.data?.analysis;
  const volData         = analysisData?.volatility_analysis;
  const currentPrice    = stock?.current_price;
  const priceChange     = stock?.price_change;
  const pricePct        = stock?.price_change_percent;
  const sentimentScore  = sentiment?.score;
  const sentimentLabel  = sentiment?.label;
  const overallOutlook  = analysisData?.overall;
  const showContent     = !loading && !error && analysis?.ticker;

  return (
    <>
      <Navbar
        wsStatus={wsStatus}
        generatedAt={analysis?.generated_at}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />

      <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
        <SearchBar
          ticker={ticker}
          onTickerChange={setTicker}
          onAnalyze={() => onAnalyze()}
          onAnalyzeDirect={onAnalyze}
          disabled={loading}
        />

        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={() => onAnalyze()} />
        ) : showContent ? (
          <div className="space-y-4">

            {/* Ticker header */}
            <div className="animate-fade-in rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-xs text-slate-300/60 mb-1">Analisis ticker</div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="text-3xl font-extrabold tracking-tight">{analysis.ticker}</div>
                    <SentimentBadge label={sentimentLabel} score={sentimentScore} />
                    {overallOutlook && (
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        overallOutlook === 'Bullish'
                          ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                          : overallOutlook === 'Bearish'
                          ? 'border-red-400/25 bg-red-400/10 text-red-300'
                          : 'border-slate-400/20 bg-slate-400/10 text-slate-300'
                      }`}>
                        {overallOutlook}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {wsStatus === 'connected' && (
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <div className="text-[10px] text-slate-400">Auto-refresh dalam {countdown}s</div>
                      <div className="h-1 w-28 rounded-full bg-white/10">
                        <div
                          className="h-1 rounded-full bg-brand-400 transition-all duration-1000"
                          style={{ width: `${(countdown / REFRESH_INTERVAL) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white active:scale-95"
                  >
                    <Download size={13} /> Export JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Metric cards */}
            <div className="animate-fade-in delay-1">
              <MetricCards
                currentPrice={currentPrice}
                priceChange={priceChange}
                priceChangePercent={pricePct}
                sentimentScore={sentimentScore}
                ticker={analysis.ticker}
                volatilityPercent={volData?.volatility_percent}
                closingPrices={stock?.closing_prices}
              />
            </div>

            {/* Chart + News */}
            <div className="animate-fade-in delay-2 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <PriceChart
                  dates={stock?.dates}
                  closingPrices={stock?.closing_prices}
                  highestPrice={stock?.highest_price}
                  lowestPrice={stock?.lowest_price}
                  averagePrice={stock?.average_price}
                  volatilityPercent={volData?.volatility_percent}
                />
              </div>
              <div>
                <NewsList
                  headlines={headlines}
                  sentimentBreakdown={sentiment?.breakdown}
                />
              </div>
            </div>

            {/* Recs + Transparency */}
            <div className="animate-fade-in delay-3 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
              <div className="lg:col-span-2">
                <RecommendationsList recommendations={recommendations} />
              </div>
              <div className="lg:col-span-1">
                <TransparencyExplainability
                  analysis={analysisData}
                  sentiment={sentiment}
                  newsData={newsData}
                  topPositiveDrivers={analysis?.data?.top_positive_drivers}
                  topNegativeDrivers={analysis?.data?.top_negative_drivers}
                />
              </div>
            </div>

          </div>
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-slate-500">
            Pilih saham dari daftar atau ketik ticker untuk memulai analisis.
          </div>
        )}
      </main>
    </>
  );
}
