import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-red-300">
          <AlertTriangle size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-red-200">Gagal menganalisis</div>
          {/* FIX: break-words agar pesan panjang tidak overflow */}
          <div className="mt-1 break-words text-sm text-red-200/70 leading-relaxed">
            {message ?? 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.'}
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition-all hover:bg-red-400/20 active:scale-95"
          >
            <RefreshCw size={12} />
            Coba lagi
          </button>
        )}
      </div>
    </div>
  );
}
