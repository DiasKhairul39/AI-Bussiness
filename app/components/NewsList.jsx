import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function normalizeHeadline(h) {
  if (typeof h === 'string') return { title: h, url: null };
  if (h && typeof h === 'object')
    return { title: h.title ?? h.headline ?? h.text ?? JSON.stringify(h), url: h.url ?? h.link ?? null };
  return { title: String(h), url: null };
}

export default function NewsList({ headlines, sentimentBreakdown }) {
  const items = Array.isArray(headlines) ? headlines.slice(0, 5) : [];
  const pos = sentimentBreakdown?.positive_count ?? 0;
  const neg = sentimentBreakdown?.negative_count ?? 0;
  const neu = sentimentBreakdown?.neutral_count  ?? 0;
  const total = pos + neg + neu;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-xs text-slate-300/60">Market News</div>
      <div className="mt-0.5 text-lg font-semibold">Latest Headlines</div>

      {/* Badge distribusi sentimen dari backend */}
      {total > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 text-[10px] font-semibold text-emerald-300">
            <TrendingUp size={10} />{pos} positif
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-400/10 border border-slate-400/20 px-2 py-1 text-[10px] font-semibold text-slate-400">
            <Minus size={10} />{neu} netral
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-red-400/10 border border-red-400/20 px-2 py-1 text-[10px] font-semibold text-red-300">
            <TrendingDown size={10} />{neg} negatif
          </span>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300/60 text-center">
            No news headlines available.
          </div>
        ) : (
          items.map((h, idx) => {
            const { title, url } = normalizeHeadline(h);
            return (
              <div
                key={idx}
                className="group flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-slate-400">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-200/90 leading-relaxed hover:text-white transition-colors"
                    >
                      {title}
                    </a>
                  ) : (
                    <div className="text-xs text-slate-200/90 leading-relaxed">{title}</div>
                  )}
                </div>
                {url && (
                  <ExternalLink size={11} className="mt-0.5 shrink-0 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
