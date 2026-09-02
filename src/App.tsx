import React, { useState } from 'react';
import { LoadstringPlatelet } from './components/LoadstringPlatelet';
import { CopyCodePlatelet } from './components/CopyCodePlatelet';
import { DownloadPlatelet } from './components/DownloadPlatelet';
import { Check, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { SCRIPT_RAW_URL } from './utils/scriptData';

export default function App() {
  const [toast, setToast] = useState<string | null>(null);

  const handleNotify = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((current) => (current === msg ? null : current));
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200 relative overflow-x-hidden">
      {/* Liquid Glass Ambient Backlight Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-purple-600/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[55vw] h-[55vw] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
      </div>

      {/* Floating Dynamic Liquid Toast Notification */}
      {toast && (
        <div
          id="toast-notification"
          className="fixed top-5 inset-x-0 mx-auto w-max max-w-[90vw] z-50 flex items-center gap-2.5 px-5 py-3 rounded-full backdrop-blur-2xl bg-black/80 border border-white/20 text-white text-xs font-medium shadow-[0_12px_32px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <Check size={12} className="stroke-[3]" />
          </div>
          <span>{toast}</span>
        </div>
      )}

      {/* Top Floating Liquid Glass Pill App Bar */}
      <header className="relative z-20 w-full pt-4 sm:pt-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 p-2 pl-3.5 pr-2.5 rounded-full backdrop-blur-2xl bg-white/[0.03] border border-white/[0.1] shadow-[0_8px_24px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/[0.05]">
          {/* Brand Icon & Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 p-[1px] shadow-[0_0_15px_rgba(34,211,238,0.25)]">
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-cyan-300 font-bold text-xs">
                BF
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">
                Blox Fruits Script
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-zinc-400 bg-white/[0.05] border border-white/[0.08]">
                v3.2
              </span>
            </div>
          </div>

          {/* Right Status Badges */}
          <div className="flex items-center gap-2 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>GitHub Synced</span>
            </div>
            <a
              id="header-raw-link"
              href={SCRIPT_RAW_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>Raw Endpoint</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.1] text-cyan-300 backdrop-blur-md mb-4 shadow-xs">
            <Sparkles size={13} />
            <span>Material 3 & Liquid Glass Design</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 leading-tight">
            Blox Fruits Script Portal
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Three dedicated platelets for seamless script deployment. Copy the one-line loadstring, inspect the Luau source code, or download the raw file.
          </p>
        </div>

        {/* The 3 Good Platelets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
          {/* Platelet 1: Copy Loadstring */}
          <LoadstringPlatelet onNotify={handleNotify} />

          {/* Platelet 2: Copy Code Option */}
          <CopyCodePlatelet onNotify={handleNotify} />

          {/* Platelet 3: Download Link of Code */}
          <DownloadPlatelet onNotify={handleNotify} />
        </div>

        {/* Bottom Trust & Verification Banner */}
        <div className="mt-12 sm:mt-16 p-4 sm:p-5 rounded-3xl backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-300">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="font-medium">100% Client-Side Luau • CanCollide Safe • No Account Access Needed</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Direct Endpoint: <code className="text-zinc-400">roshanjaisu/Scripty/main.lua</code>
          </div>
        </div>
      </main>

      {/* Liquid Glass Footer */}
      <footer className="relative z-10 py-6 border-t border-white/[0.06] text-center text-xs text-zinc-500">
        <p>Material 3 & Liquid Glass Script Portal &bull; Universal Executor Ready</p>
      </footer>
    </div>
  );
}
