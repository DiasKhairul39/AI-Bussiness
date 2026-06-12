'use client';
import { useState } from 'react';
import { TrendingUp, Globe, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';

// Daftar saham utama per kategori
const STOCK_GROUPS = [
  {
    label: 'US Tech',
    icon: '🇺🇸',
    stocks: [
      { ticker: 'AAPL',  name: 'Apple Inc.',          sector: 'Technology' },
      { ticker: 'MSFT',  name: 'Microsoft Corp.',     sector: 'Technology' },
      { ticker: 'GOOGL', name: 'Alphabet Inc.',       sector: 'Technology' },
      { ticker: 'AMZN',  name: 'Amazon.com',          sector: 'E-Commerce' },
      { ticker: 'NVDA',  name: 'NVIDIA Corp.',        sector: 'Semiconductors' },
      { ticker: 'META',  name: 'Meta Platforms',      sector: 'Social Media' },
      { ticker: 'TSLA',  name: 'Tesla Inc.',          sector: 'EV / Energy' },
    ],
  },
  {
    label: 'IDX — Perbankan',
    icon: '🇮🇩',
    stocks: [
      { ticker: 'BBCA',  name: 'Bank Central Asia',   sector: 'Banking' },
      { ticker: 'BBRI',  name: 'Bank Rakyat Indonesia', sector: 'Banking' },
      { ticker: 'BMRI',  name: 'Bank Mandiri',        sector: 'Banking' },
      { ticker: 'BBNI',  name: 'Bank Negara Indonesia', sector: 'Banking' },
    ],
  },
  {
    label: 'IDX — Teknologi & Konsumer',
    icon: '🇮🇩',
    stocks: [
      { ticker: 'TLKM',  name: 'Telkom Indonesia',    sector: 'Telecom' },
      { ticker: 'GOTO',  name: 'GoTo Gojek Tokopedia', sector: 'Tech' },
      { ticker: 'BREN',  name: 'Barito Renewables',   sector: 'Energy' },
      { ticker: 'ASII',  name: 'Astra International', sector: 'Conglomerate' },
      { ticker: 'UNVR',  name: 'Unilever Indonesia',  sector: 'FMCG' },
    ],
  },
  {
    label: 'Global Finance',
    icon: '🌐',
    stocks: [
      { ticker: 'JPM',   name: 'JPMorgan Chase',      sector: 'Banking' },
      { ticker: 'BAC',   name: 'Bank of America',     sector: 'Banking' },
      { ticker: 'GS',    name: 'Goldman Sachs',       sector: 'Investment' },
      { ticker: 'BRK-B', name: 'Berkshire Hathaway',  sector: 'Conglomerate' },
    ],
  },
];

export default function StockList({ onSelect, currentTicker }) {
  const [openGroup, setOpenGroup] = useState(null);

  const toggleGroup = (label) => {
    setOpenGroup(prev => prev === label ? null : label);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06]">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
          <BarChart2 size={14} />
        </span>
        <div>
          <div className="text-xs text-slate-300/60">Pilih Saham</div>
          <div className="text-sm font-semibold">Daftar Saham Utama</div>
        </div>
        <span className="ml-auto text-[10px] text-slate-500">atau ketik manual di atas</span>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {STOCK_GROUPS.map((group) => {
          const isOpen = openGroup === group.label;
          // Cek apakah ada saham aktif di grup ini
          const hasActive = group.stocks.some(s => s.ticker === currentTicker);

          return (
            <div key={group.label}>
              {/* Group header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-base leading-none">{group.icon}</span>
                <span className="text-xs font-semibold text-slate-300/80">{group.label}</span>
                {hasActive && (
                  <span className="ml-1 h-1.5 w-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                )}
                <span className="ml-auto text-slate-500">
                  {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </span>
              </button>

              {/* Stock chips — tampil saat grup terbuka */}
              {isOpen && (
                <div className="px-4 pb-3 flex flex-wrap gap-2">
                  {group.stocks.map((stock) => {
                    const isActive = stock.ticker === currentTicker;
                    return (
                      <button
                        key={stock.ticker}
                        type="button"
                        onClick={() => onSelect(stock.ticker)}
                        title={`${stock.name} — ${stock.sector}`}
                        className={`inline-flex flex-col items-start rounded-xl border px-3 py-2 text-left transition-all hover:scale-[1.02] active:scale-95 ${
                          isActive
                            ? 'border-brand-500/50 bg-brand-500/15 ring-1 ring-brand-500/30'
                            : 'border-white/10 bg-black/20 hover:border-brand-500/30 hover:bg-brand-500/[0.07]'
                        }`}
                      >
                        <span className={`text-xs font-bold tracking-wide ${isActive ? 'text-brand-300' : 'text-slate-200'}`}>
                          {stock.ticker}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight mt-0.5 max-w-[90px] truncate">
                          {stock.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
