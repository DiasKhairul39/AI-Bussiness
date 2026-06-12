'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Activity, BarChart2, Globe, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// Saham IDX utama yang dipantau
const IDX_STOCKS = [
  { ticker: 'BBCA',  name: 'Bank Central Asia',     sector: 'Perbankan' },
  { ticker: 'BBRI',  name: 'Bank Rakyat Indonesia',  sector: 'Perbankan' },
  { ticker: 'BMRI',  name: 'Bank Mandiri',           sector: 'Perbankan' },
  { ticker: 'TLKM',  name: 'Telkom Indonesia',       sector: 'Telecom' },
  { ticker: 'ASII',  name: 'Astra International',    sector: 'Otomotif' },
  { ticker: 'GOTO',  name: 'GoTo Gojek Tokopedia',   sector: 'Teknologi' },
  { ticker: 'BREN',  name: 'Barito Renewables',      sector: 'Energi' },
  { ticker: 'UNVR',  name: 'Unilever Indonesia',     sector: 'FMCG' },
];

// IHSG index historical data placeholder (diganti dengan data real dari backend)
const IHSG_HISTORY_PLACEHOLDER = [
  { date: 'Jan', value: 7100 }, { date: 'Feb', value: 7250 },
  { date: 'Mar', value: 7180 }, { date: 'Apr', value: 7320 },
  { date: 'Mei', value: 7290 }, { date: 'Jun', value: 7410 },
  { date: 'Jul', value: 7480 },
];

function StatCard({ icon: Icon, label, value, sub, color = 'text-slate-100', trend }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Icon size={13} />
          {label}
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 border ${
            trend >= 0
              ? 'bg-emerald-400/10 border-emerald-400/25 text-emerald-300'
              : 'bg-red-400/10 border-red-400/25 text-red-300'
          }`}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(2)}%
          </span>
        )}
      </div>
      <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
      {sub && <div className="mt-1 text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}

function SectorBadge({ sector }) {
  const colors = {
    'Perbankan':  'bg-blue-400/10 border-blue-400/20 text-blue-300',
    'Telecom':    'bg-purple-400/10 border-purple-400/20 text-purple-300',
    'Otomotif':   'bg-orange-400/10 border-orange-400/20 text-orange-300',
    'Teknologi':  'bg-cyan-400/10 border-cyan-400/20 text-cyan-300',
    'Energi':     'bg-green-400/10 border-green-400/20 text-green-300',
    'FMCG':       'bg-yellow-400/10 border-yellow-400/20 text-yellow-300',
  };
  return (
    <span className={`text-[10px] font-medium rounded-md border px-1.5 py-0.5 ${colors[sector] ?? 'bg-slate-400/10 border-slate-400/20 text-slate-300'}`}>
      {sector}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a1020]/95 px-3 py-2 text-xs shadow-xl">
      <div className="text-slate-400 mb-1">{label}</div>
      <div className="font-bold text-slate-100">
        {Number(payload[0].value).toLocaleString('id-ID')}
      </div>
    </div>
  );
};

export default function IHSGPage() {
  const [darkMode,   setDarkMode]   = useState(true);
  const [stocks,     setStocks]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error,      setError]      = useState(null);
  const abortRef = useRef(null);

  // Baca tema dari localStorage
  useEffect(() => {
    try { setDarkMode(localStorage.getItem('bi_theme') !== 'light'); } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light', !darkMode);
    document.documentElement.classList.toggle('dark',  darkMode);
    try { localStorage.setItem('bi_theme', darkMode ? 'dark' : 'light'); } catch {}
  }, [darkMode]);

  const fetchAllStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

      // Fetch semua saham IDX secara paralel
      const results = await Promise.allSettled(
        IDX_STOCKS.map(s =>
          fetch(`${base}/api/bi?ticker=${s.ticker}&detail=summary`, {
            signal: abortRef.current.signal,
            cache: 'no-store',
          }).then(r => r.json())
        )
      );

      const parsed = results.map((res, i) => {
        const info = IDX_STOCKS[i];
        if (res.status === 'fulfilled' && res.value?.data?.stock_data) {
          const sd  = res.value.data.stock_data;
          const sent = res.value.data.sentiment;
          return {
            ...info,
            price:    sd.current_price,
            change:   sd.price_change,
            pct:      sd.price_change_percent,
            score:    sent?.score ?? null,
            label:    sent?.label ?? null,
            volume:   sd.volume ?? null,
            high:     sd.highest_price ?? null,
            low:      sd.lowest_price  ?? null,
            ok: true,
          };
        }
        return { ...info, ok: false };
      });

      setStocks(parsed);
      setLastUpdate(new Date());
    } catch (e) {
      if (e.name !== 'AbortError') setError('Gagal mengambil data. Cek koneksi ke backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStocks();
    const interval = setInterval(fetchAllStocks, 60_000); // refresh tiap 60 detik
    return () => { clearInterval(interval); abortRef.current?.abort(); };
  }, [fetchAllStocks]);

  // Hitung summary
  const validStocks = stocks.filter(s => s.ok);
  const gainers     = validStocks.filter(s => (s.pct ?? 0) > 0).length;
  const losers      = validStocks.filter(s => (s.pct ?? 0) < 0).length;
  const avgScore    = validStocks.length
    ? (validStocks.reduce((a, s) => a + (s.score ?? 5), 0) / validStocks.length).toFixed(1)
    : '—';
  const overallSentiment = parseFloat(avgScore) >= 6 ? 'Bullish' : parseFloat(avgScore) >= 4 ? 'Netral' : 'Bearish';
  const sentColor = overallSentiment === 'Bullish' ? 'text-emerald-300' : overallSentiment === 'Bearish' ? 'text-red-300' : 'text-yellow-300';

  // Bar chart data — sentimen per saham
  const barData = validStocks.map(s => ({
    ticker: s.ticker,
    score:  s.score ?? 0,
    fill:   (s.score ?? 5) >= 6 ? '#34d399' : (s.score ?? 5) >= 4 ? '#fbbf24' : '#f87171',
  }));

  return (
    <>
      <Navbar
        wsStatus="idle"
        generatedAt={lastUpdate?.toISOString()}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <Globe size={12} /> Pasar Modal Indonesia
            </div>
            <h1 className="text-2xl font-bold tracking-tight">IHSG Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">
              Pantau sentimen AI dan pergerakan saham-saham utama IDX
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock size={11} />
                Update {lastUpdate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            <button
              type="button"
              onClick={fetchAllStocks}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/[0.08] transition-all disabled:opacity-50 active:scale-95"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-in">
          <StatCard
            icon={TrendingUp}
            label="Sentimen Pasar"
            value={loading ? '—' : overallSentiment}
            color={sentColor}
            sub="rata-rata saham IDX"
          />
          <StatCard
            icon={Activity}
            label="Avg Skor AI"
            value={loading ? '—' : `${avgScore}/10`}
            color="text-brand-300"
            sub="FinBERT score"
          />
          <StatCard
            icon={TrendingUp}
            label="Saham Naik"
            value={loading ? '—' : gainers}
            color="text-emerald-300"
            sub={`dari ${validStocks.length} saham`}
          />
          <StatCard
            icon={TrendingDown}
            label="Saham Turun"
            value={loading ? '—' : losers}
            color="text-red-300"
            sub={`dari ${validStocks.length} saham`}
          />
        </div>

        {/* IHSG Chart + Sentiment Bar */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 animate-fade-in delay-1">
          {/* IHSG Trend (historis placeholder) */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs text-slate-400">Indeks Harga Saham Gabungan</div>
            <div className="mt-0.5 text-base font-semibold mb-1">IHSG — Tren 7 Bulan</div>
            <div className="text-[10px] text-slate-500 mb-3">Data historis (YTD 2025)</div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={IHSG_HISTORY_PLACEHOLDER} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ihsgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#60a5fa" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(148,163,184,0.65)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.65)', fontSize: 10 }} axisLine={false} tickLine={false} width={50}
                    domain={['auto','auto']}
                    tickFormatter={v => v.toLocaleString('id-ID')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} fill="url(#ihsgGrad)" dot={false}
                    activeDot={{ r: 4, fill: '#93c5fd', stroke: '#60a5fa', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sentiment Bar per saham */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs text-slate-400">Analisis Sentimen AI</div>
            <div className="mt-0.5 text-base font-semibold mb-1">Skor FinBERT — Saham IDX</div>
            <div className="text-[10px] text-slate-500 mb-3">Skala 1–10 · hijau ≥6 · kuning 4–6 · merah ≤4</div>
            <div className="h-[180px]">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">Memuat data...</div>
              ) : barData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">Tidak ada data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="ticker" tick={{ fill: 'rgba(148,163,184,0.65)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: 'rgba(148,163,184,0.65)', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}
                      fill="#60a5fa"
                      label={{ position: 'top', fill: 'rgba(148,163,184,0.8)', fontSize: 9,
                        formatter: v => v > 0 ? v.toFixed(1) : '' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Tabel saham IDX */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden animate-fade-in delay-2">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-400">Saham Utama Bursa</div>
              <div className="text-base font-semibold mt-0.5">IDX Blue Chip Watchlist</div>
            </div>
            <div className="text-xs text-slate-500">
              {validStocks.length}/{IDX_STOCKS.length} saham berhasil dimuat
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Ticker', 'Nama', 'Sektor', 'Harga', 'Perubahan', 'Skor Sentimen', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {IDX_STOCKS.map((info, i) => {
                  const s   = stocks.find(x => x.ticker === info.ticker);
                  const up  = s?.pct !== undefined ? s.pct >= 0 : null;
                  const scC = !s?.score ? '#94a3b8'
                    : s.score >= 7 ? '#34d399'
                    : s.score >= 5 ? '#60a5fa'
                    : s.score >= 3 ? '#fb923c' : '#f87171';

                  return (
                    <tr key={info.ticker} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-100 text-sm">{info.ticker}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-slate-300 text-xs">{info.name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <SectorBadge sector={info.sector} />
                      </td>
                      <td className="px-4 py-3.5">
                        {loading ? (
                          <div className="h-3 w-20 rounded bg-white/[0.06] animate-pulse" />
                        ) : s?.ok ? (
                          <span className="font-semibold text-slate-100">
                            Rp {Number(s.price).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {loading ? (
                          <div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse" />
                        ) : s?.ok && up !== null ? (
                          <span className={`font-semibold text-xs ${up ? 'text-emerald-300' : 'text-red-300'}`}>
                            {up ? '▲' : '▼'} {Math.abs(s.pct ?? 0).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {loading ? (
                          <div className="h-3 w-20 rounded bg-white/[0.06] animate-pulse" />
                        ) : s?.ok ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[60px] h-1.5 rounded-full bg-white/10">
                              <div
                                className="h-1.5 rounded-full transition-all duration-700"
                                style={{ width: `${((s.score ?? 0) / 10) * 100}%`, background: scC }}
                              />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: scC }}>
                              {s.score?.toFixed(1) ?? '—'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {loading ? (
                          <div className="h-5 w-16 rounded-full bg-white/[0.06] animate-pulse" />
                        ) : s?.ok ? (
                          <span className={`text-[10px] font-semibold rounded-full border px-2 py-0.5 ${
                            s.label?.toLowerCase().includes('positif')
                              ? 'bg-emerald-400/10 border-emerald-400/25 text-emerald-300'
                              : s.label?.toLowerCase().includes('negatif')
                              ? 'bg-red-400/10 border-red-400/25 text-red-300'
                              : 'bg-slate-400/10 border-slate-400/20 text-slate-400'
                          }`}>
                            {s.label ?? 'Netral'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 border border-white/10 rounded-full px-2 py-0.5">
                            Error
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-white/[0.06] text-[10px] text-slate-500 flex items-center gap-1.5">
            <Activity size={10} />
            Data dari Yahoo Finance via FinBERT AI · Auto-refresh setiap 60 detik
          </div>
        </div>

      </main>
    </>
  );
}
