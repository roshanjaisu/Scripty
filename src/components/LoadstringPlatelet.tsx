import React, { useState } from 'react';
import { Zap, Copy, Check, Terminal, Sparkles, ShieldCheck } from 'lucide-react';
import { SCRIPT_RAW_URL } from '../utils/scriptData';

interface LoadstringPlateletProps {
  onNotify: (msg: string) => void;
}

export const LoadstringPlatelet: React.FC<LoadstringPlateletProps> = ({ onNotify }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [loadstringType, setLoadstringType] = useState<'standard' | 'pcall'>('standard');

  const standardCode = `loadstring(game:HttpGet("${SCRIPT_RAW_URL}"))()`;
  const pcallCode = `local ok, err = pcall(function()\n    loadstring(game:HttpGet("${SCRIPT_RAW_URL}"))()\nend)\nif not ok then warn("[Error]:", err) end`;

  const activeCode = loadstringType === 'standard' ? standardCode : pcallCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = activeCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    onNotify('Loadstring copied to clipboard!');
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div
      id="platelet-loadstring"
      className="group relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 backdrop-blur-2xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.12] hover:border-white/[0.22] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/[0.08]"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.08) 0%, rgba(255, 255, 255, 0.03) 75%)',
      }}
    >
      {/* Specular Liquid Top Sheen */}
      <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

      {/* Top Header & Badge */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)] group-hover:scale-105 transition-transform">
              <Zap size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 mb-1">
                <Sparkles size={11} />
                <span>Platelet 01 • Instant Executor</span>
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Copy Loadstring
              </h2>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed mb-5">
          Execute directly into Delta, Arceus X, Codex, Hydrogen, or PC executors with no manual file downloads required.
        </p>

        {/* Format Selector Pills (M3 Segmented Tab) */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/[0.08] backdrop-blur-md mb-4 text-xs">
          <button
            type="button"
            id="tab-loadstring-standard"
            onClick={() => setLoadstringType('standard')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
              loadstringType === 'standard'
                ? 'bg-white/15 text-white shadow-sm border border-white/15'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal size={12} />
            <span>Standard (1-Line)</span>
          </button>
          <button
            type="button"
            id="tab-loadstring-pcall"
            onClick={() => setLoadstringType('pcall')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
              loadstringType === 'pcall'
                ? 'bg-white/15 text-white shadow-sm border border-white/15'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck size={12} />
            <span>Safe Pcall</span>
          </button>
        </div>

        {/* Liquid Glass Code Snippet Box */}
        <div
          onClick={handleCopy}
          className="relative group/box cursor-pointer rounded-2xl p-4 bg-black/50 border border-white/[0.08] hover:border-cyan-400/30 transition-all mb-5 overflow-hidden"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-2 select-none">
            <span>EXECUTOR INPUT</span>
            <span className="text-cyan-400/80 flex items-center gap-1 group-hover/box:text-cyan-300">
              <Copy size={11} /> Click box to copy
            </span>
          </div>
          <pre className="font-mono text-xs text-zinc-200 overflow-x-auto whitespace-pre-wrap break-all select-all leading-relaxed">
            <span className="text-purple-400">loadstring</span>(
            <span className="text-cyan-300">game</span>:
            <span className="text-amber-300">HttpGet</span>(
            <span className="text-emerald-300">"{SCRIPT_RAW_URL}"</span>))()
          </pre>
        </div>

        {/* Supported Executor Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-6 text-[11px] text-zinc-400">
          <span className="text-zinc-500 mr-1">Compatible:</span>
          {['Delta', 'Arceus X', 'Codex', 'Hydrogen', 'Fluxus', 'Solara'].map((exec) => (
            <span
              key={exec}
              className="px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-300 font-medium"
            >
              {exec}
            </span>
          ))}
        </div>
      </div>

      {/* Primary M3 Liquid Action Button */}
      <button
        type="button"
        id="btn-copy-loadstring"
        onClick={handleCopy}
        className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg active:scale-[0.98] ${
          copied
            ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/25'
            : 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_8px_24px_rgba(255,255,255,0.15)] border border-white/40'
        }`}
      >
        {copied ? (
          <>
            <Check size={18} className="stroke-[3]" />
            <span>Loadstring Copied!</span>
          </>
        ) : (
          <>
            <Copy size={18} />
            <span>Copy Loadstring</span>
          </>
        )}
      </button>
    </div>
  );
};
