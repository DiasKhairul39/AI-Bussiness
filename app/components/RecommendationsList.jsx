import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

// BUG 5 FIX: normalizeRec menghasilkan description yang lebih informatif
function normalizeRec(rec) {
  if (!rec) return null;
  // Sudah format benar (title/description/priority)
  if (rec.title) return {
    title:       rec.title,
    description: rec.description ?? '',
    priority:    (rec.priority ?? 'rendah').toLowerCase(),
    confidence:  typeof rec.confidence === 'number' ? rec.confidence : null,
  };
  // Format backend: {strategy, confidence}
  const confidence = typeof rec.confidence === 'number' ? rec.confidence : 0.5;
  const priority   = confidence >= 0.8 ? 'tinggi' : confidence >= 0.6 ? 'sedang' : 'rendah';
  // BUG 5 FIX: Jika ada rec.reason / rec.detail / rec.explanation, gunakan itu sebagai deskripsi
  const description =
    rec.reason ?? rec.detail ?? rec.explanation ?? rec.description ??
    `Rekomendasi berdasarkan analisis dengan tingkat keyakinan ${Math.round(confidence * 100)}%.`;
  return {
    title:       rec.strategy ?? 'Rekomendasi',
    description,
    priority,
    confidence,
  };
}

function priorityColor(priority) {
  const p = (priority ?? '').toString().toLowerCase();
  if (p === 'tinggi')
    return { bg: 'bg-emerald-400/10', text: 'text-emerald-300', border: 'border-emerald-400/25', bar: 'bg-emerald-400', Icon: ArrowUpRight };
  if (p === 'sedang')
    return { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/25', bar: 'bg-brand-400', Icon: Minus };
  return { bg: 'bg-red-400/10', text: 'text-red-300', border: 'border-red-400/25', bar: 'bg-red-400', Icon: ArrowDownRight };
}

export default function RecommendationsList({ recommendations }) {
  const raw   = Array.isArray(recommendations) ? recommendations : [];
  const items = raw.map(normalizeRec).filter(Boolean);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-xs text-slate-300/70">Recommendations</div>
      <div className="mt-1 text-lg font-semibold">Actionable Insights</div>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300/70 text-center">
            No recommendations available.
          </div>
        ) : (
          // BUG 6 FIX: key lebih stabil — gabungkan title + idx agar tidak konflik
          items.map((rec, idx) => {
            const c    = priorityColor(rec.priority);
            const Icon = c.Icon;
            const conf = rec.confidence;

            return (
              <div key={`${rec.title}-${idx}`} className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 p-1 ${c.text}`}>
                        <Icon size={13} />
                      </span>
                      <div className={`line-clamp-2 font-semibold text-sm ${c.text}`}>
                        {rec.title}
                      </div>
                    </div>
                    {rec.description && (
                      <div className="mt-2 line-clamp-3 text-xs text-slate-200/70 leading-relaxed">
                        {rec.description}
                      </div>
                    )}
                    {conf !== null && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] text-slate-300/60 mb-1">
                          <span>Confidence</span>
                          <span>{Math.round(conf * 100)}%</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-white/10">
                          <div
                            className={`h-1 rounded-full ${c.bar} transition-all duration-700`}
                            style={{ width: `${Math.round(conf * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${c.text} ${c.bg} ${c.border}`}>
                    {rec.priority}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
