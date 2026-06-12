import { AlertTriangle, Sparkles } from 'lucide-react';

function scoreColor(score) {
  if (typeof score !== 'number') return 'text-slate-300';
  if (score >= 7) return 'text-emerald-300';
  if (score >= 5) return 'text-brand-400';
  if (score >= 3) return 'text-orange-300';
  return 'text-red-300';
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-slate-300/70">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-200/90">{title}</div>
        {subtitle && <div className="mt-0.5 text-xs text-slate-300/60 leading-relaxed">{subtitle}</div>}
      </div>
    </div>
  );
}

function ScoreBar({ value, max = 10 }) {
  const pct = typeof value === 'number' ? Math.min(100, (value / max) * 100) : 0;
  const color =
    pct >= 70 ? 'bg-emerald-400' : pct >= 50 ? 'bg-brand-400' : pct >= 30 ? 'bg-orange-400' : 'bg-red-400';
  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
      <div className={`h-1.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// BUG 7 FIX: resolve score dari semua kemungkinan nama field backend
function resolveDriverScore(d) {
  const candidates = [d?.mapped_score, d?.score, d?.s, d?.finbert_score, d?.sentiment_score];
  for (const v of candidates) {
    if (typeof v === 'number') return v;
  }
  return null;
}

function DriverList({ title, drivers, accent }) {
  const items = Array.isArray(drivers) ? drivers : [];
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-slate-300/60">{title}</div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300/60">
          Tidak ada driver.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((d, idx) => {
            // BUG 7 FIX: resolve score dari berbagai field name
            const score   = resolveDriverScore(d);
            const label   = (d?.finbert_label ?? d?.label ?? d?.sentiment ?? '').toString();
            const headline = d?.headline ?? d?.title ?? d?.text ?? '';
            return (
              <div key={idx} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-xs font-medium text-slate-200/90">{headline}</div>
                    {label && (
                      <span className={`mt-1.5 inline-flex items-center rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-semibold ${accent}`}>
                        {label}
                      </span>
                    )}
                  </div>
                  {score !== null && (
                    <div className="shrink-0 text-right">
                      <div className="text-[10px] text-slate-300/60">score</div>
                      <div className={`text-base font-bold ${accent}`}>{score.toFixed(1)}/10</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TransparencyExplainability({
  analysis, sentiment, newsData, topPositiveDrivers, topNegativeDrivers,
}) {
  const quantAnalysis = analysis?.quantitative_analysis || {};
  const volAnalysis   = analysis?.volatility_analysis   || {};

  const scrapingSuccess = newsData?.success;
  const finbertResults  = analysis?.qualitative_analysis?.finbert_results;
  const analysedCount   = Array.isArray(finbertResults) ? finbertResults.length : 0;

  // BUG 8 FIX: scrapeStatus yang lebih akurat
  // "belum dianalisis" hanya jika scrapingSuccess secara eksplisit false
  // jika finbertResults undefined (data dari REST tanpa qualitative_analysis), jangan salahkan analisis
  let scrapeStatus = 'data lengkap';
  let scrapeColor  = 'text-emerald-300';
  if (scrapingSuccess === false) {
    scrapeStatus = 'data parsial (news unavailable)';
    scrapeColor  = 'text-orange-300';
  }

  const finalScore        = sentiment?.score;
  const breakdown         = sentiment?.breakdown || {};
  const quantitativeScore = breakdown?.quantitative_score;
  const finbertScore      = breakdown?.finbert_score;
  const quantWeight       = breakdown?.quantitative_weight ?? '40%';
  const qualWeight        = breakdown?.qualitative_weight  ?? '60%';
  const interpretation    = sentiment?.interpretation ?? analysis?.overall ?? '';

  const positiveCount = breakdown?.positive_count ?? 0;
  const negativeCount = breakdown?.negative_count ?? 0;
  const neutralCount  = breakdown?.neutral_count  ?? 0;
  const totalCount    = positiveCount + negativeCount + neutralCount;

  const pctChange  = quantAnalysis?.price_change_percent;
  const volatility = volAnalysis?.volatility_percent;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-5">
      <SectionHeader
        icon={Sparkles}
        title="Transparansi & Explainability"
        subtitle="Skor diturunkan dari harga (Yahoo Finance) + news (CNBC World Markets) via FinBERT."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Kolom kiri */}
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold text-slate-300/60 mb-2">Sumber data</div>
            <div className="space-y-2 text-sm">
              {[['Harga', 'Yahoo Finance'], ['News', 'CNBC World Markets'], ['Model', 'FinBERT NLP']].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between gap-2">
                  <span className="text-slate-200/80 text-xs">{l}</span>
                  <span className="text-slate-300/60 text-xs">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={13} className={scrapingSuccess === false ? 'text-orange-300' : 'text-slate-300/60'} />
              <div className="text-xs font-semibold text-slate-300/60">Kualitas input</div>
            </div>
            <div className="space-y-2 text-xs">
              {/* BUG 8 FIX: hanya tampilkan analysedCount jika data tersedia */}
              {Array.isArray(finbertResults) && (
                <div className="flex justify-between">
                  <span className="text-slate-200/80">Headline dianalisis</span>
                  <span className="text-slate-300/60">{analysedCount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-200/80">Status scraping</span>
                <span className={scrapeColor}>{scrapeStatus}</span>
              </div>
              {totalCount > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                  <div className="flex justify-between"><span className="text-emerald-300/80">Positif</span><span className="text-emerald-300">{positiveCount}</span></div>
                  <div className="flex justify-between"><span className="text-slate-300/60">Netral</span><span className="text-slate-300/60">{neutralCount}</span></div>
                  <div className="flex justify-between"><span className="text-red-300/80">Negatif</span><span className="text-red-300">{negativeCount}</span></div>
                </div>
              )}
            </div>
          </div>

          {(pctChange !== undefined || volatility !== undefined) && (
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold text-slate-300/60 mb-2">Metrik kuantitatif</div>
              <div className="space-y-2 text-xs">
                {pctChange !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-200/80">Price change</span>
                    <span className={Number(pctChange) >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                      {Number(pctChange) >= 0 ? '+' : ''}{Number(pctChange).toFixed(2)}%
                    </span>
                  </div>
                )}
                {volatility !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-200/80">Volatility</span>
                    <span className="text-slate-300/60">{Number(volatility).toFixed(2)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Kolom kanan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold text-slate-300/60 mb-3">Breakdown skor 1–10</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs text-slate-300/60">Final sentiment</div>
                <div className={`mt-1 text-3xl font-extrabold ${scoreColor(finalScore)}`}>
                  {typeof finalScore === 'number' ? `${finalScore}/10` : '—'}
                </div>
                {typeof finalScore === 'number' && <ScoreBar value={finalScore} />}
              </div>
              <div className="sm:text-right">
                <div className="text-xs text-slate-300/60">Market outlook</div>
                <div className="mt-1 text-sm font-semibold text-slate-200/90">{interpretation || '—'}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs font-semibold text-slate-300/60">Kuantitatif</div>
                <div className="mt-1 text-xl font-extrabold text-brand-400">
                  {typeof quantitativeScore === 'number' ? `${quantitativeScore}/10` : '—'}
                </div>
                {typeof quantitativeScore === 'number' && <ScoreBar value={quantitativeScore} />}
                <div className="mt-1.5 text-[10px] text-slate-300/60">Bobot: {quantWeight}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="text-xs font-semibold text-slate-300/60">Kualitatif (FinBERT)</div>
                <div className="mt-1 text-xl font-extrabold text-emerald-300">
                  {typeof finbertScore === 'number' ? `${Math.round(finbertScore)}/10` : '—'}
                </div>
                {typeof finbertScore === 'number' && <ScoreBar value={finbertScore} />}
                <div className="mt-1.5 text-[10px] text-slate-300/60">Bobot: {qualWeight}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold text-slate-300/60 mb-3">Top drivers (dari headline)</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DriverList title="Driver Positif" drivers={topPositiveDrivers} accent="text-emerald-300" />
              <DriverList title="Driver Negatif" drivers={topNegativeDrivers} accent="text-red-300" />
            </div>
            <div className="mt-3 text-[10px] text-slate-300/60">
              Skor FinBERT dipetakan ke skala 1–10.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
