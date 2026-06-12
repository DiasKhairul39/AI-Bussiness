'use client';
import { useEffect } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
          <AlertOctagon size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-100">Terjadi Kesalahan</h1>
        <p className="mt-2 text-sm text-slate-400">{error?.message ?? 'Unexpected error occurred.'}</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 transition-colors">
            <RotateCcw size={14} /> Coba lagi
          </button>
          <a href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.08] transition-colors">
            <Home size={14} /> Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
