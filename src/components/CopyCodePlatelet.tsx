import React, { useState } from 'react';
import { FileCode, Copy, Check, ChevronDown, ChevronUp, Code2, ShieldCheck, Layers } from 'lucide-react';
import { SCRIPT_CODE } from '../utils/scriptData';

interface CopyCodePlateletProps {
  onNotify: (msg: string) => void;
}

export const CopyCodePlatelet: React.FC<CopyCodePlateletProps> = ({ onNotify }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const totalLines = SCRIPT_CODE.split('\n').length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SCRIPT_CODE);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = SCRIPT_CODE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    onNotify('Full Luau script copied to clipboard!');
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div
      id="platelet-copy-code"
      className="group relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 backdrop-blur-2xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.12] hover:border-white/[0.22] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/[0.08]"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.08) 0%, rgba(255, 255, 255, 0.03) 75%)',
      }}
    >
      {/* Specular Liquid Top Sheen */}
      <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/40 to-transparent pointer-events-none" />

      {/* Top Header & Badge */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-400/25 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:scale-105 transition-transform">
              <Code2 size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide bg-purple-500/10 text-purple-300 border border-purple-400/20 mb-1">
                <Layers size={11} />
                <span>Platelet 02 • Source Code</span>
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Copy Luau Code
              </h2>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed mb-5">
          Copy the complete un-obfuscated script directly for offline execution, executor auto-exec folders, or manual inspection.
        </p>

        {/* Feature Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-zinc-300">
            {totalLines} Lines
          </span>
          <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-mono text-zinc-300">
            Luau 5.1
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-xs font-medium text-emerald-400 flex items-center gap-1">
            <ShieldCheck size={12} />
            Pure Client-Side
          </span>
        </div>

        {/* Preview Code Viewport */}
        <div className="rounded-2xl bg-black/50 border border-white/[0.08] p-3.5 mb-5 relative overflow-hidden group/view">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-[11px] font-mono text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>main.lua preview</span>
            </div>
            <button
              type="button"
              id="btn-toggle-code-expand"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px] transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={13} />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <ChevronDown size={13} />
                  <span>Expand All</span>
                </>
              )}
            </button>
          </div>

          <div
            className={`font-mono text-xs text-zinc-300 overflow-x-auto select-all leading-relaxed transition-all duration-300 ${
              isExpanded ? 'max-h-72 overflow-y-auto' : 'max-h-28 overflow-hidden'
            }`}
          >
            <pre className="text-zinc-300">
              {isExpanded
                ? SCRIPT_CODE
                : SCRIPT_CODE.split('\n').slice(0, 8).join('\n') + '\n... [Click Expand to inspect all lines]'}
            </pre>
          </div>
        </div>
      </div>

      {/* Primary M3 Liquid Action Button */}
      <button
        type="button"
        id="btn-copy-code"
        onClick={handleCopy}
        className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg active:scale-[0.98] ${
          copied
            ? 'bg-purple-500 text-white shadow-purple-500/25'
            : 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_8px_24px_rgba(255,255,255,0.15)] border border-white/40'
        }`}
      >
        {copied ? (
          <>
            <Check size={18} className="stroke-[3]" />
            <span>Full Script Copied!</span>
          </>
        ) : (
          <>
            <Copy size={18} />
            <span>Copy Full Script</span>
          </>
        )}
      </button>
    </div>
  );
};
