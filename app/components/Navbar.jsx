'use client';
import { useState, useEffect } from 'react';
import { BarChart2, Moon, Sun, Wifi, WifiOff, Loader2, TrendingUp, Search, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function useTimeAgo(isoString) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!isoString) { setLabel(''); return; }
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
      if (diff < 60)        setLabel('baru saja');
      else if (diff < 3600) setLabel(`${Math.floor(diff / 60)} mnt lalu`);
      else                  setLabel(`${Math.floor(diff / 3600)} jam lalu`);
    };
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, [isoString]);
  return label;
}

const NAV_LINKS = [
  { href: '/',       label: 'Stock Analyzer', Icon: Search },
  { href: '/ihsg',   label: 'IHSG Dashboard', Icon: TrendingUp },
];

export default function Navbar({ wsStatus, generatedAt, darkMode, onToggleDark }) {
  const timeAgo  = useTimeAgo(generatedAt);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const wsIcon =
    wsStatus === 'connected'  ? <Wifi size={14} className="text-emerald-400" /> :
    wsStatus === 'connecting' ? <Loader2 size={14} className="text-yellow-400 animate-spin" /> :
                                <WifiOff size={14} className="text-slate-500" />;

  const wsColor  =
    wsStatus === 'connected'  ? 'text-emerald-300' :
    wsStatus === 'connecting' ? 'text-yellow-300'  :
    wsStatus === 'error'      ? 'text-red-300'      : 'text-slate-500';

  const wsLabel = {
    idle: 'Idle', connecting: 'Connecting…', connected: 'Connected',
    disconnected: 'Disconnected', error: 'Error',
  }[wsStatus] ?? wsStatus;

  const navBg     = darkMode ? 'bg-[#060A12]/90 border-white/[0.06]' : 'bg-white/90 border-slate-200/60';
  const logoColor = darkMode ? 'text-slate-100' : 'text-slate-800';
  const timeColor = darkMode ? 'text-slate-400'  : 'text-slate-500';
  const timeVal   = darkMode ? 'text-slate-200'  : 'text-slate-700';
  const btnBorder = darkMode ? 'border-white/10 bg-white/[0.04] text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-500';
  const mobileBg  = darkMode ? 'bg-[#060A12] border-white/[0.06]' : 'bg-white border-slate-200/60';

  return (
    <nav className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${navBg}`}>
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600/20 text-brand-400">
            <BarChart2 size={17} />
          </span>
          <div>
            <div className={`text-sm font-bold leading-none tracking-tight ${logoColor}`}>BI AI</div>
            <div className="text-[10px] text-slate-400 leading-none mt-0.5">Dashboard</div>
          </div>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden sm:flex items-center gap-1 ml-2">
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? darkMode
                      ? 'bg-brand-600/20 text-brand-300'
                      : 'bg-brand-50 text-brand-600'
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon size={13} />
                {label}
                {isActive && (
                  <span className="ml-0.5 h-1 w-1 rounded-full bg-brand-400" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Timestamp — tengah */}
        {timeAgo && (
          <div className={`hidden lg:block text-xs ml-auto ${timeColor}`}>
            Diperbarui <span className={timeVal}>{timeAgo}</span>
          </div>
        )}

        <div className={`flex items-center gap-3 ${timeAgo ? '' : 'ml-auto'}`}>
          {/* WS status */}
          <div className="hidden sm:flex items-center gap-1.5">
            {wsIcon}
            <span className={`text-xs font-medium ${wsColor}`}>{wsLabel}</span>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-opacity hover:opacity-70 ${btnBorder}`}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(v => !v)}
            className={`sm:hidden inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-opacity hover:opacity-70 ${btnBorder}`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className={`sm:hidden border-t px-4 py-3 space-y-1 ${mobileBg}`}>
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-300'
                    : darkMode
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
          <div className={`pt-2 mt-2 border-t flex items-center gap-2 ${darkMode ? 'border-white/[0.06]' : 'border-slate-200'}`}>
            {wsIcon}
            <span className={`text-xs font-medium ${wsColor}`}>{wsLabel}</span>
          </div>
        </div>
      )}
    </nav>
  );
}
