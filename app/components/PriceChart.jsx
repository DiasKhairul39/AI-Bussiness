'use client';
import { useState, useId } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts';

const RANGES = [
  { label: '1W', days: 7  },
  { label: '2W', days: 14 },
  { label: '1M', days: 30 },
];

// BUG 2 FIX: gunakan !== null && !== undefined (bukan truthy) agar nilai 0 tetap tampil
function StatPill({ label, value, color = 'text-slate-200' }) {
  const display =
    value !== null && value !== undefined
      ? Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })
      : null;
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-center">
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className={`text-xs font-bold ${color}`}>{display ?? '—'}</div>
    </div>
  );
}

// BUG 3 FIX: tooltip menggunakan CSS variable agar ikut tema
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--tooltip-bg, rgba(10,16,32,0.96))',
        border: '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: '0.75rem',
        padding: '8px 12px',
        fontSize: 12,
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ color: 'rgba(148,163,184,0.8)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontWeight: 700, color: '#f1f5f9' }}>
        {Number(payload[0].value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </div>
    </div>
  );
};

export default function PriceChart({
  dates, closingPrices,
  highestPrice, lowestPrice, averagePrice, volatilityPercent,
}) {
  const [rangeIdx, setRangeIdx] = useState(0);
  const uid    = useId().replace(/:/g, '');
  const gradId = `priceGrad-${uid}`;

  const safeDates  = Array.isArray(dates) && dates.length ? dates : [];
  const safePrices = Array.isArray(closingPrices) ? closingPrices : [];

  const maxDays      = RANGES[rangeIdx].days;
  const slicedPrices = safePrices.slice(-maxDays);
  const slicedDates  = safeDates.slice(-maxDays);
  const availableDays = safePrices.length;

  const data = slicedPrices.map((p, i) => ({
    date:  slicedDates[i] ?? `Day ${i + 1}`,
    price: typeof p === 'number' ? p : Number(p),
  }));

  const refPrice  = data[0]?.price;
  const lastPrice = data[data.length - 1]?.price;
  const isUp = refPrice !== undefined && lastPrice !== undefined
    ? lastPrice >= refPrice : true;
  const strokeColor = isUp ? '#34d399' : '#f87171';

  // BUG 4 FIX: warna axis tidak hardcoded — pakai nilai yang cukup kontras di kedua tema
  const axisTickColor  = 'rgba(148,163,184,0.65)';
  const axisLineColor  = 'rgba(148,163,184,0.15)';
  const gridColor      = 'rgba(148,163,184,0.08)';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="text-xs text-slate-300/60">Closing Prices</div>
          <div className="mt-0.5 text-lg font-semibold">Price Trend</div>
        </div>
        <div className="flex items-center gap-2">
          {availableDays < maxDays && (
            <span className="text-[10px] text-slate-500">
              {availableDays} hari tersedia
            </span>
          )}
          <div className="flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1">
            {RANGES.map((r, i) => (
              <button
                key={r.label}
                type="button"
                onClick={() => setRangeIdx(i)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  rangeIdx === i
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {/* BUG 2 FIX: nilai 0 tetap tampil karena pakai !== null check */}
        <StatPill label="Highest" value={highestPrice} color="text-emerald-300" />
        <StatPill label="Lowest"  value={lowestPrice}  color="text-red-300" />
        <StatPill label="Average" value={averagePrice} />
      </div>

      <div className="h-[240px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-300/60">
            No price data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={strokeColor} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              {/* BUG 4 FIX: warna grid/axis tidak hardcoded rgba gelap */}
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: axisTickColor, fontSize: 10 }}
                axisLine={{ stroke: axisLineColor }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: axisTickColor, fontSize: 10 }}
                axisLine={{ stroke: axisLineColor }}
                tickLine={false}
                width={58}
                domain={['auto', 'auto']}
                tickFormatter={v => Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              />
              <Tooltip content={<CustomTooltip />} />
              {refPrice !== undefined && (
                <ReferenceLine y={refPrice} stroke="rgba(148,163,184,0.25)" strokeDasharray="4 4" />
              )}
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#${gradId})`}
                dot={false}
                activeDot={{ r: 4, fill: strokeColor, stroke: '#0a1020', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {volatilityPercent !== undefined && (
        <div className="mt-2 text-right text-[10px] text-slate-400">
          Volatility: <span className="text-slate-300">{Number(volatilityPercent).toFixed(2)}%</span>
        </div>
      )}
    </div>
  );
}
