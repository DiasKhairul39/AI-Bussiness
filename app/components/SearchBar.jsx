'use client';
import { useEffect, useRef, useState } from 'react';
import { Search, Clock, X, ChevronDown, ChevronUp } from 'lucide-react';
import StockList from './StockList';

const STORAGE_KEY = 'bi_ticker_history';
const MAX_HISTORY = 5;

function useTickerHistory() {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setHistory(Array.isArray(stored) ? stored : []);
    } catch {}
  }, []);

  const addToHistory = (ticker) => {
    setHistory(prev => {
      const next = [ticker, ...prev.filter(t => t !== ticker)].slice(0, MAX_HISTORY);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeFromHistory = (ticker) => {
    setHistory(prev => {
      const next = prev.filter(t => t !== ticker);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return { history, addToHistory, removeFromHistory };
}

export default function SearchBar({
  ticker,
  onTickerChange,
  onAnalyze,
  onAnalyzeDirect,
  disabled,
}) {
  const { history, addToHistory, removeFromHistory } = useTickerHistory();
  const [showList, setShowList] = useState(false);
  const wrapRef = useRef(null);

  // Tutup stock list saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAnalyze = () => {
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    addToHistory(t);
    setShowList(false);
    onAnalyze();
  };

  const handleChipClick = (t) => {
    onTickerChange(t);
    addToHistory(t);
    setShowList(false);
    onAnalyzeDirect?.(t);
  };

  // Pilih dari StockList — set ticker & langsung analisis
  const handleStockSelect = (t) => {
    onTickerChange(t);
    addToHistory(t);
    setShowList(false);
    onAnalyzeDirect?.(t);
  };

  return (
    <div ref={wrapRef} className="space-y-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-soft">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
              <Search size={17} />
            </span>
            <div>
              <div className="text-xs text-slate-300/60">Ticker</div>
              <div className="text-base font-semibold">Stock Analyzer</div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 md:max-w-2xl md:flex-row md:items-center">
            <input
              value={ticker}
              onChange={e => onTickerChange(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === 'Enter' && !disabled) handleAnalyze(); }}
              placeholder="Ketik ticker atau pilih dari daftar…"
              maxLength={10}
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="w-full flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all"
            />

            {/* Tombol toggle stock list */}
            <button
              type="button"
              onClick={() => setShowList(v => !v)}
              title={showList ? 'Tutup daftar saham' : 'Buka daftar saham utama'}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                showList
                  ? 'border-brand-500/50 bg-brand-500/15 text-brand-300'
                  : 'border-white/10 bg-white/[0.04] text-slate-400 hover:border-brand-500/30 hover:text-slate-200'
              }`}
            >
              {showList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span className="hidden sm:inline">{showList ? 'Tutup' : 'Pilih Saham'}</span>
            </button>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={disabled || !ticker.trim()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:bg-brand-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {disabled ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>
        </div>

        {/* Chip riwayat */}
        {history.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock size={10} /> Riwayat:
            </span>
            {history.map(t => (
              <span
                key={t}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:border-brand-500/40 hover:text-white"
              >
                <button type="button" onClick={() => handleChipClick(t)} className="hover:text-brand-300 transition-colors">
                  {t}
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); removeFromHistory(t); }}
                  aria-label={`Hapus ${t} dari riwayat`}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stock list panel — muncul/hilang dengan animasi */}
      {showList && (
        <div className="animate-fade-in">
          <StockList
            onSelect={handleStockSelect}
            currentTicker={ticker}
          />
        </div>
      )}
    </div>
  );
}
