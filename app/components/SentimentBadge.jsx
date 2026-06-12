import clsx from 'clsx';

function toColor(label) {
  const l = (label || '').toLowerCase();
  if (l.includes('positif'))
    return { bg: 'bg-emerald-400/10', text: 'text-emerald-300', border: 'border-emerald-400/25', dot: 'bg-emerald-400' };
  if (l.includes('negatif'))
    return { bg: 'bg-red-400/10', text: 'text-red-300', border: 'border-red-400/25', dot: 'bg-red-400' };
  return { bg: 'bg-slate-500/10', text: 'text-slate-200', border: 'border-slate-500/20', dot: 'bg-slate-400' };
}

export default function SentimentBadge({ label, score }) {
  const c = toColor(label);
  const normalized = label ? label.replace(/_/g, ' ') : 'Netral';
  const displayLabel = normalized.split(' ').filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Pulse pada skor ekstrem (≥8 atau ≤3)
  const isPulsing = typeof score === 'number' && (score >= 8 || score <= 3);

  return (
    <span className={clsx(
      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
      c.bg, c.text, c.border
    )}>
      {/* Dot dengan animasi pulse jika skor ekstrem */}
      <span className="relative flex h-2 w-2 items-center justify-center">
        {isPulsing && (
          <span className={clsx('absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping', c.dot)} />
        )}
        <span className={clsx('relative inline-flex h-1.5 w-1.5 rounded-full', c.dot)} />
      </span>
      <span className="opacity-90">{displayLabel}</span>
      <span className="text-slate-100/50">·</span>
      <span className="tabular-nums">{typeof score === 'number' ? score.toFixed(1) : '—'}</span>
    </span>
  );
}
