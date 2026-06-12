import clsx from 'clsx';
import { DollarSign, TrendingUp, TrendingDown, Minus, Brain, Activity } from 'lucide-react';

function formatPrice(price, ticker = '') {
  if (price === null || price === undefined) return '—';
  const num = Number(price);
  if (Number.isNaN(num)) return '—';
  const isIDR =
    ticker.endsWith('.JK') ||
    /^(BBCA|TLKM|BBRI|BMRI|ASII|GOTO|BREN)$/i.test(ticker.replace('.JK', ''));
  if (isIDR) return `Rp ${num.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// BUG 9 FIX: Sparkline sebagai komponen terpisah agar tidak re-create setiap render
function Sparkline({ prices, up }) {
  if (!Array.isArray(prices) || prices.length < 2) return null;
  const mn = Math.min(...prices), mx = Math.max(...prices), rng = mx - mn || 1;
  const W = 72, H = 22;
  const pts = prices
    .map((p, i) => `${(i / (prices.length - 1)) * W},${H - ((p - mn) / rng) * H}`)
    .join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible shrink-0">
      <polyline
        points={pts}
        fill="none"
        stroke={up ? '#34d399' : '#f87171'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// BUG 9 FIX: PriceChangeExtra sebagai komponen terpisah
function PriceChangeExtra({ closingPrices, isUp, priceChangePercent }) {
  const chgBg     = isUp === null ? 'bg-white/5'           : isUp ? 'bg-emerald-400/10'    : 'bg-red-400/10';
  const chgBorder = isUp === null ? 'border-white/10'      : isUp ? 'border-emerald-400/25' : 'border-red-400/25';
  const chgColor  = isUp === null ? 'text-slate-200'       : isUp ? 'text-emerald-300'      : 'text-red-300';
  const pctLabel  =
    typeof priceChangePercent === 'number' && Number.isFinite(priceChangePercent)
      ? `${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%`
      : '—';
  return (
    <div className="flex items-center justify-between mt-2 gap-2">
      <Sparkline prices={closingPrices} up={!!isUp} />
      <div className={clsx('rounded-xl border px-2.5 py-1 text-xs font-semibold', chgColor, chgBg, chgBorder)}>
        {pctLabel}
      </div>
    </div>
  );
}

function ScoreBar({ score }) {
  const color =
    score >= 7 ? 'bg-emerald-400' :
    score >= 5 ? 'bg-brand-400' :
    score >= 3 ? 'bg-orange-400' : 'bg-red-400';
  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
      <div
        className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${(score / 10) * 100}%` }}
      />
    </div>
  );
}

export default function MetricCards({
  currentPrice, priceChange, priceChangePercent, sentimentScore,
  ticker = '', volatilityPercent, closingPrices = [],
}) {
  const isUp =
    typeof priceChangePercent === 'number' && Number.isFinite(priceChangePercent)
      ? priceChangePercent >= 0
      : null; // BUG 10 FIX: null = tidak diketahui

  const scoreNum = typeof sentimentScore === 'number' ? sentimentScore : null;
  const scoreColor =
    scoreNum === null     ? 'text-slate-100' :
    scoreNum >= 7         ? 'text-emerald-300' :
    scoreNum >= 5         ? 'text-brand-400' :
    scoreNum >= 3         ? 'text-orange-300' : 'text-red-300';

  const volNum = typeof volatilityPercent === 'number' ? volatilityPercent : null;
  const volColor =
    volNum === null ? 'text-slate-300' :
    volNum < 1      ? 'text-emerald-300' :
    volNum < 3      ? 'text-yellow-300' : 'text-red-300';
  const volLabel = volNum === null ? '—' : volNum < 1 ? 'Rendah' : volNum < 3 ? 'Sedang' : 'Tinggi';

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

      {/* Card 1: Current Price */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-300/60">
          <DollarSign size={13} className="text-slate-400" /> Current Price
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-slate-100">
          {formatPrice(currentPrice, ticker)}
        </div>
        {ticker && <div className="mt-1 text-[10px] text-slate-300/60">{ticker}</div>}
      </div>

      {/* Card 2: Price Change */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-300/60">
          {/* BUG 10 FIX: ikon Minus untuk isUp === null */}
          {isUp === null
            ? <Minus size={13} className="text-slate-400" />
            : isUp
            ? <TrendingUp size={13} className="text-slate-400" />
            : <TrendingDown size={13} className="text-slate-400" />}
          Price Change
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-slate-100">
          {priceChange !== null && priceChange !== undefined
            ? `${Number(priceChange) >= 0 ? '+' : ''}${Number(priceChange).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
            : '—'}
        </div>
        <PriceChangeExtra
          closingPrices={closingPrices}
          isUp={isUp}
          priceChangePercent={priceChangePercent}
        />
      </div>

      {/* Card 3: Sentiment Score */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-300/60">
          <Brain size={13} className="text-slate-400" /> Sentiment Score
        </div>
        <div className={`mt-2 text-2xl font-bold tracking-tight ${scoreColor}`}>
          {scoreNum !== null ? scoreNum.toFixed(1) : '—'}
        </div>
        {scoreNum !== null && <ScoreBar score={scoreNum} />}
        <div className="mt-1 text-[10px] text-slate-300/60">1—10 (FinBERT)</div>
      </div>

      {/* Card 4: Volatility */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-300/60">
          <Activity size={13} className="text-slate-400" /> Volatility
        </div>
        <div className={`mt-2 text-2xl font-bold tracking-tight ${volColor}`}>
          {volNum !== null ? `${volNum.toFixed(2)}%` : '—'}
        </div>
        <div className="mt-1 text-[10px] text-slate-300/60">{volLabel}</div>
      </div>

    </div>
  );
}
