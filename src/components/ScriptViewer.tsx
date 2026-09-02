import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  FileCode,
  Terminal,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Zap,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface ScriptViewerProps {
  scriptCode: string;
  defaultRawUrl?: string;
}

export const ScriptViewer: React.FC<ScriptViewerProps> = ({
  scriptCode,
  defaultRawUrl = 'https://raw.githubusercontent.com/roshanjaisu/Scripty/main/main.lua',
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLoadstring, setCopiedLoadstring] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'loadstring' | 'script' | 'guide'>('loadstring');
  const [customRawUrl, setCustomRawUrl] = useState<string>(defaultRawUrl);

  const cleanUrl = customRawUrl.trim();

  // Different standard loadstring executor patterns
  const standardLoadstring = `loadstring(game:HttpGet("${cleanUrl}"))()`;
  const safeHttpLoadstring = `loadstring(game:HttpGet("${cleanUrl}", true))()`;
  const pcallLoadstring = `local success, err = pcall(function()\n    loadstring(game:HttpGet("${cleanUrl}"))()\nend)\nif not success then\n    warn("[Hub Error]: Failed to load remote script: " .. tostring(err))\nend`;

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLoadstring(label);
      setTimeout(() => setCopiedLoadstring(null), 2200);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedLoadstring(label);
      setTimeout(() => setCopiedLoadstring(null), 2200);
    }
  };

  const handleCopyFullScript = async () => {
    try {
      await navigator.clipboard.writeText(scriptCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
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
        'Enum', 'TweenInfo', 'pcall', 'print', 'math', 'table', 'task', 'loadstring'
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
              onClick={() => setActiveTab('loadstring')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'loadstring'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap size={14} className="fill-current" />
              <span>1-Line Loadstring</span>
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'script'
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode size={14} />
              <span>Full Luau Code</span>
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
              <span>How To Run & Host</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
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
            onClick={handleCopyFullScript}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied Full Code!' : 'Copy Full Code'}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'loadstring' && (
        <div className="p-5 bg-slate-950/90 text-slate-200 space-y-5">
          {/* Quick Explanation Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/30 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Zap size={18} className="fill-amber-400" />
                <span>One-Line Loadstring Hub Link</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Execute directly in any executor console without pasting thousands of lines of code. The game will fetch the freshest script directly from your GitHub repository every time you launch.
              </p>
            </div>
            <button
              onClick={() => handleCopy(standardLoadstring, 'main-header')}
              className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95 whitespace-nowrap"
            >
              {copiedLoadstring === 'main-header' ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLoadstring === 'main-header' ? 'Copied Link!' : 'Copy 1-Line Loadstring'}</span>
            </button>
          </div>

          {/* Raw GitHub URL Input Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Target Raw GitHub URL</span>
                <span className="text-[10px] text-slate-400 font-normal">(Auto-stripped of temporary tokens)</span>
              </label>
              <button
                onClick={() => setCustomRawUrl('https://raw.githubusercontent.com/roshanjaisu/Scripty/main/main.lua')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Reset to your repo
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customRawUrl}
                onChange={(e) => setCustomRawUrl(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 text-cyan-300 text-xs rounded-lg px-3 py-2.5 font-mono focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                placeholder="https://raw.githubusercontent.com/username/repo/main/script.lua"
              />
              <button
                onClick={() => handleCopy(cleanUrl, 'raw-url')}
                className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                title="Copy Raw URL"
              >
                {copiedLoadstring === 'raw-url' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>URL</span>
              </button>
            </div>
          </div>

          {/* Formats Container */}
          <div className="space-y-3">
            {/* Format 1: Standard Universal */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-slate-100">Universal Loadstring (Recommended)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Works on Mobile & PC
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(standardLoadstring, 'standard')}
                  className="px-3 py-1 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  {copiedLoadstring === 'standard' ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedLoadstring === 'standard' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto select-all">
                {standardLoadstring}
              </div>
            </div>

            {/* Format 2: Bypass Cache (Always Fetch Latest) */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-slate-100">Bypass Cache Format</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                    Forces Live Refresh
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(safeHttpLoadstring, 'cache')}
                  className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
                >
                  {copiedLoadstring === 'cache' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedLoadstring === 'cache' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-amber-200 overflow-x-auto select-all">
                {safeHttpLoadstring}
              </div>
            </div>

            {/* Format 3: Protected Pcall Wrapper */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-purple-400" />
                  <span className="text-xs font-bold text-slate-100">Protected Pcall Wrapper</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                    Safe Error Diagnostics
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(pcallLoadstring, 'pcall')}
                  className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700"
                >
                  {copiedLoadstring === 'pcall' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedLoadstring === 'pcall' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-purple-300 overflow-x-auto select-all">
                {pcallLoadstring}
              </pre>
            </div>
          </div>

          {/* Automated GitHub Raw Info */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 text-slate-400">
            <div className="flex items-center gap-2 text-slate-200 font-bold">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Automated GitHub Sync Setup:</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              We have created a pure Luau script file at <code className="text-emerald-300 font-bold">/main.lua</code> in this project root. Whenever you export/push this AI Studio app to your GitHub (<code className="text-cyan-300">roshanjaisu/Scripty</code>), GitHub will automatically contain <strong className="text-slate-100">main.lua</strong>. You can run the 1-line loadstring in Delta without ever copying the full code again!
            </p>
          </div>
        </div>
      )}

      {activeTab === 'script' && (
        <div className="relative">
          <div className="overflow-x-auto max-h-[460px] p-4 text-xs font-mono bg-slate-950/90 text-slate-200 select-text">
            <div className="table w-full">{highlightLuau(scriptCode)}</div>
          </div>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="p-6 bg-slate-950/80 text-slate-300 text-xs space-y-6 max-h-[460px] overflow-y-auto">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Zap size={16} className="text-amber-400" />
              1. How to use Loadstring in Executors (Mobile & PC)
            </h3>
            <p className="text-slate-400 leading-relaxed mb-3">
              Instead of copying and pasting the entire massive script file each time you launch:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <li>
                Open your executor (Delta, Arceus X, Fluxus, Hydrogen, Codex, Synapse, Wave, etc.).
              </li>
              <li>
                Copy the 1-line loadstring:
                <code className="block mt-1 p-2 rounded bg-slate-950 text-cyan-300 font-mono text-[11px] border border-slate-800">
                  {standardLoadstring}
                </code>
              </li>
              <li>Paste this single line into the executor script editor and click <strong className="text-emerald-400">Execute / Run</strong>.</li>
              <li>Whenever you update your code on GitHub, your in-game script automatically loads the newest version without having to re-copy anything!</li>
            </ol>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Terminal size={16} className="text-cyan-400" />
              2. Setting up a Public GitHub Raw Lua File
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              <li>Go to your GitHub repository: <span className="text-cyan-300 font-mono">roshanjaisu/Scripty</span>.</li>
              <li>Click <strong className="text-slate-100">Add File &gt; Create new file</strong> and name it <strong className="text-amber-300">script.lua</strong>.</li>
              <li>Paste the full generated Luau code from the <strong className="text-cyan-300">Full Luau Code</strong> tab.</li>
              <li>Commit changes. Click <strong className="text-slate-100">Raw</strong> to get your permanent public raw link:</li>
              <code className="block p-1.5 rounded bg-slate-950 text-emerald-400 font-mono text-[11px]">
                https://raw.githubusercontent.com/roshanjaisu/Scripty/main/script.lua
              </code>
            </ol>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              3. How the Script Operates Inside Roblox
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
        <span className="text-amber-400 font-mono">loadstring(game:HttpGet(...))()</span>
      </div>
    </div>
  );
};

