import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Terminal, HelpCircle, CheckCircle2 } from 'lucide-react';

interface ScriptViewerProps {
  scriptCode: string;
}

export const ScriptViewer: React.FC<ScriptViewerProps> = ({ scriptCode }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'guide'>('script');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback for clipboard
      const textarea = document.createElement('textarea');
      textarea.value = scriptCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([scriptCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blox_fruits_hitbox_gui.lua';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fast syntax highlighter helper for Luau code
  const highlightLuau = (code: string) => {
    return code.split('\n').map((line, idx) => {
      // Check comments
      if (line.trim().startsWith('--')) {
        return (
          <div key={idx} className="table-row leading-relaxed">
            <span className="table-cell pr-4 text-right select-none text-slate-600 text-xs">{idx + 1}</span>
            <span className="table-cell text-emerald-400/80 italic font-mono">{line}</span>
          </div>
        );
      }

      // Format keywords and symbols
      let formatted = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Highlight strings
      formatted = formatted.replace(
        /(".*?"|'.*?')/g,
        '<span class="text-amber-300">$1</span>'
      );

      // Highlight keywords
      const keywords = [
        'local', 'function', 'return', 'end', 'if', 'then', 'else', 'elseif',
        'true', 'false', 'nil', 'for', 'in', 'pairs', 'ipairs', 'do', 'not', 'and', 'or'
      ];
      const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
      formatted = formatted.replace(keywordRegex, '<span class="text-purple-400 font-semibold">$1</span>');

      // Highlight Roblox globals & types
      const robloxGlobals = [
        'game', 'workspace', 'Vector3', 'UDim2', 'UDim', 'Color3', 'Instance',
        'Enum', 'TweenInfo', 'pcall', 'print', 'math', 'table', 'task'
      ];
      const robloxRegex = new RegExp(`\\b(${robloxGlobals.join('|')})\\b`, 'g');
      formatted = formatted.replace(robloxRegex, '<span class="text-cyan-300 font-medium">$1</span>');

      return (
        <div key={idx} className="table-row leading-relaxed">
          <span className="table-cell pr-4 text-right select-none text-slate-600 text-xs">{idx + 1}</span>
          <span
            className="table-cell text-slate-200 font-mono"
            dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }}
          />
        </div>
      );
    });
  };

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900 overflow-hidden shadow-xl flex flex-col">
      {/* Header bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('script')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'script'
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode size={14} />
              <span>Generated Luau Script</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'guide'
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle size={14} />
              <span>How To Run & Test</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            blox_fruits_hitbox_gui.lua
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download</span> .lua
          </button>
          <button
            onClick={handleCopy}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'script' ? (
        <div className="relative">
          <div className="overflow-x-auto max-h-[460px] p-4 text-xs font-mono bg-slate-950/90 text-slate-200 select-text">
            <div className="table w-full">{highlightLuau(scriptCode)}</div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-slate-950/80 text-slate-300 text-xs space-y-6 max-h-[460px] overflow-y-auto">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Terminal size={16} className="text-cyan-400" />
              1. Testing Locally in Roblox Studio (Game Development)
            </h3>
            <p className="text-slate-400 leading-relaxed mb-3">
              If you are testing or developing combat systems in Roblox Studio:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <li>Open your project or place in <strong className="text-slate-100">Roblox Studio</strong>.</li>
              <li>Under <strong className="text-slate-100">StarterPlayer &gt; StarterPlayerScripts</strong>, create a new <strong className="text-cyan-300">LocalScript</strong>.</li>
              <li>Paste the generated script code into the LocalScript.</li>
              <li>Click <strong className="text-emerald-400">Play (F5)</strong>. The ScreenGui with the toggle button and floating icon will appear immediately!</li>
              <li>Press the keybind (e.g., <span className="text-amber-300 font-mono">[RightControl]</span>) or click the screen toggle button to turn hitbox expansion on or off.</li>
            </ol>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              2. How the Script Operates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="font-semibold text-cyan-300 mb-1">HumanoidRootPart Resizing</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Modifies the character&apos;s bounding root part to the configured stud size. Attack damage detection in Roblox weapon engines raycasts against the RootPart.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="font-semibold text-emerald-300 mb-1">Safe CanCollide = false</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Ensures expanded hitboxes don&apos;t collide with walls, terrain, or other players, avoiding physics glitches or flinging across the map.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="font-semibold text-purple-300 mb-1">Auto Respawn & NPC Detection</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  The loop scans the Blox Fruits <code className="text-purple-300">workspace.Enemies</code> folder so newly spawned bandits or boss mobs receive the hitbox immediately.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                <div className="font-semibold text-amber-300 mb-1">Clean Revert on Toggle OFF</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Caches all original part dimensions. When turned OFF, every hitbox is restored back to normal (2, 2, 1) and 100% transparency.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Script Footer stats */}
      <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Language: Luau (Roblox Engine)</span>
        <span>Includes Draggable ScreenGui + Mobile Widget</span>
      </div>
    </div>
  );
};
