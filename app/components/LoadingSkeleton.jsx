function Sk({ className = '' }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
      }}
    />
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Ticker header */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-3">
          <Sk className="h-9 w-28" />
          <Sk className="h-6 w-24 rounded-full" />
          <Sk className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <Sk className="mb-3 h-3 w-20" />
            <Sk className="mb-2 h-7 w-28" />
            <Sk className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Chart + News */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between mb-4">
            <Sk className="h-4 w-32" />
            <Sk className="h-8 w-28 rounded-xl" />
          </div>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map(i => <Sk key={i} className="h-10" />)}
          </div>
          <Sk className="h-[240px] w-full" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <Sk className="mb-4 h-4 w-32" />
          {[0, 1, 2, 3, 4].map(i => <Sk key={i} className="mb-2 h-10 last:mb-0" />)}
        </div>
      </div>

      {/* Recs + Transparency */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <Sk className="mb-4 h-4 w-40" />
          {[0, 1, 2].map(i => <Sk key={i} className="mb-3 h-20 last:mb-0" />)}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <Sk className="mb-4 h-4 w-32" />
          {[0, 1, 2, 3].map(i => <Sk key={i} className="mb-2 h-14 last:mb-0" />)}
        </div>
      </div>
    </div>
  );
}
