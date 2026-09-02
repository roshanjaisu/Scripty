import React, { useState } from 'react';
import { Download, Check, ExternalLink, Link2, FileCheck2, HardDriveDownload } from 'lucide-react';
import { SCRIPT_CODE, SCRIPT_RAW_URL } from '../utils/scriptData';

interface DownloadPlateletProps {
  onNotify: (msg: string) => void;
}

export const DownloadPlatelet: React.FC<DownloadPlateletProps> = ({ onNotify }) => {
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  const fileSizeKb = (new Blob([SCRIPT_CODE]).size / 1024).toFixed(2);

  const handleDownloadFile = () => {
    const blob = new Blob([SCRIPT_CODE], { type: 'text/x-lua;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'main.lua';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    onNotify('Downloaded main.lua to your device!');
    setTimeout(() => setDownloaded(false), 2400);
  };

  const handleCopyRawUrl = async () => {
    try {
      await navigator.clipboard.writeText(SCRIPT_RAW_URL);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = SCRIPT_RAW_URL;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setLinkCopied(true);
    onNotify('Raw GitHub URL copied!');
    setTimeout(() => setLinkCopied(false), 2200);
  };

  return (
    <div
      id="platelet-download-code"
      className="group relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 backdrop-blur-2xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.12] hover:border-white/[0.22] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/[0.08]"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(34, 197, 94, 0.08) 0%, rgba(255, 255, 255, 0.03) 75%)',
      }}
    >
      {/* Specular Liquid Top Sheen */}
      <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

      {/* Top Header & Badge */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.15)] group-hover:scale-105 transition-transform">
              <Download size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide bg-emerald-500/10 text-emerald-300 border border-emerald-400/20 mb-1">
                <FileCheck2 size={11} />
                <span>Platelet 03 • File & Direct Link</span>
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Download Code
              </h2>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed mb-5">
          Download the standalone script file directly for auto-execute scripts or open the official raw GitHub endpoint.
        </p>

        {/* File Details Liquid Card */}
        <div className="rounded-2xl bg-black/50 border border-white/[0.08] p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
                lua
              </div>
              <div>
                <div className="font-semibold text-sm text-zinc-200">main.lua</div>
                <div className="text-[11px] text-zinc-500 font-mono">{fileSizeKb} KB • Luau Source</div>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 text-[11px] font-medium">
              Verified
            </span>
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2 text-xs">
            <span className="text-zinc-400 truncate font-mono text-[11px]">
              roshanjaisu/Scripty/main
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="btn-copy-raw-link"
                onClick={handleCopyRawUrl}
                className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 text-[11px] font-medium transition-colors flex items-center gap-1"
                title="Copy Raw GitHub URL"
              >
                {linkCopied ? <Check size={11} className="text-emerald-400" /> : <Link2 size={11} />}
                <span>{linkCopied ? 'Copied' : 'Copy Link'}</span>
              </button>
              <a
                id="link-open-raw-github"
                href={SCRIPT_RAW_URL}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 text-[11px] font-medium transition-colors flex items-center gap-1"
                title="Open GitHub Raw file in browser"
              >
                <ExternalLink size={11} />
                <span>Open Raw</span>
              </a>
            </div>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-6 text-[11px] text-zinc-400">
          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-300">
            Auto-Execute Ready
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-300">
            UTF-8 Encoded
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-300">
            Direct GitHub Mirror
          </span>
        </div>
      </div>

      {/* Primary M3 Liquid Action Button */}
      <button
        type="button"
        id="btn-download-file"
        onClick={handleDownloadFile}
        className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg active:scale-[0.98] ${
          downloaded
            ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/25'
            : 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_8px_24px_rgba(255,255,255,0.15)] border border-white/40'
        }`}
      >
        {downloaded ? (
          <>
            <Check size={18} className="stroke-[3]" />
            <span>Downloaded main.lua!</span>
          </>
        ) : (
          <>
            <HardDriveDownload size={18} />
            <span>Download .lua File</span>
          </>
        )}
      </button>
    </div>
  );
};
