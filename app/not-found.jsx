import { SearchX, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
          <SearchX size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-100">Halaman Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-slate-400">Halaman yang Anda cari tidak tersedia.</p>
        <a href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 transition-colors">
          <Home size={14} /> Kembali ke Beranda
        </a>
      </div>
    </div>
  );
}
