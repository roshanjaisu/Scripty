import React, { useState, useMemo } from 'react';
import { ScriptConfig, TargetMode, HitboxColorName } from './types';
import { DEFAULT_CONFIG, THEME_OPTIONS } from './utils/constants';
import { generateLuauScript } from './utils/scriptGenerator';
import { RobloxScreenSimulator } from './components/RobloxScreenSimulator';
import { ConfigPanel } from './components/ConfigPanel';
import { ScriptViewer } from './components/ScriptViewer';
import {
  Sword,
  Copy,
  Check,
  Sparkles,
  Terminal,
  Sliders,
  PlayCircle,
  Flame,
  Magnet,
  Crosshair,
  Palette,
} from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<ScriptConfig>(DEFAULT_CONFIG);
  const [hitboxEnabled, setHitboxEnabled] = useState<boolean>(true);
  const [activeViewTab, setActiveViewTab] = useState<'simulator' | 'code' | 'settings'>('simulator');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Derive selected color object
  const selectedTheme = useMemo(() => {
    return THEME_OPTIONS.find((c) => c.id === config.color) || THEME_OPTIONS[0];
  }, [config.color]);

  // Generate real-time Luau script
  const generatedScript = useMemo(() => {
    return generateLuauScript(config);
  }, [config]);

  const handleConfigChange = (updated: Partial<ScriptConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    setHitboxEnabled(true);
  };

  const handleApplyPreset = (presetConfig: Partial<ScriptConfig>) => {
    setConfig((prev) => ({ ...prev, ...presetConfig }));
    if (presetConfig.autoAttackEnabled !== undefined) {
      setHitboxEnabled(true);
    }
  };

  const handleQuickCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = generatedScript;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold shadow-2xl flex items-center gap-2 border border-emerald-300 animate-in fade-in slide-in-from-top-3 duration-200">
          <Check size={18} className="stroke-[3]" />
          <span>Luau Script Copied to Clipboard!</span>
        </div>
      )}

      {/* Top Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg border transition-colors"
              style={{
                backgroundColor: `${selectedTheme.hex}22`,
                borderColor: selectedTheme.hex,
                boxShadow: `0 0 16px ${selectedTheme.hex}33`,
              }}
            >
              🗡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-100 tracking-tight">
                  Blox Fruits Ultimate Combat Suite V3
                </h1>
                <span
                  className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  style={{
                    backgroundColor: `${selectedTheme.hex}20`,
                    color: selectedTheme.hex,
                    borderColor: `${selectedTheme.hex}40`,
                  }}
                >
                  {selectedTheme.label} Theme
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hitbox Expander &bull; Auto M1 Clicker &bull; Mob Magnet &bull; 3D ESP &bull; ScreenGui
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Quick Feature Badges */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${config.autoAttackEnabled ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-500'}`}>
                M1 Clicker
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${config.mobMagnetEnabled ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-500'}`}>
                Magnet
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${config.espEnabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-500'}`}>
                3D ESP
              </span>
            </div>

            {/* Quick Theme Switcher Pill in Top Header */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleConfigChange({ color: t.id as HitboxColorName })}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    config.color === t.id ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: t.hex }}
                  title={`Switch Theme: ${t.label}`}
                />
              ))}
            </div>

            {/* Copy Script Button */}
            <button
              onClick={handleQuickCopy}
              className="px-3.5 py-2 rounded-lg font-black text-xs flex items-center gap-1.5 shadow-lg transition-all active:scale-95 text-slate-950"
              style={{
                backgroundColor: selectedTheme.hex,
                boxShadow: `0 0 15px ${selectedTheme.hex}44`,
              }}
            >
              <Copy size={14} />
              <span>Copy Script</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveViewTab('simulator')}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                activeViewTab === 'simulator'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle size={15} />
              <span>Interactive 3D Simulator & ScreenGui</span>
            </button>
            <button
              onClick={() => setActiveViewTab('code')}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                activeViewTab === 'code'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal size={15} />
              <span>Generated Luau Script</span>
            </button>
            <button
              onClick={() => setActiveViewTab('settings')}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                activeViewTab === 'settings'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders size={15} />
              <span>Customizer & Presets</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Sparkles size={14} className="text-amber-400" />
            <span>Theme: <strong>{selectedTheme.label}</strong> &bull; Size: <strong>{config.hitboxSize} Studs</strong></span>
          </div>
        </div>

        {/* Dynamic Content Views */}
        {activeViewTab === 'simulator' && (
          <div className="space-y-6">
            {/* Top: The Interactive Simulator with Replica ScreenGui */}
            <RobloxScreenSimulator
              hitboxEnabled={hitboxEnabled}
              onToggleHitbox={setHitboxEnabled}
              targetMode={config.targetMode}
              onTargetModeChange={(m: TargetMode) => handleConfigChange({ targetMode: m })}
              hitboxSize={config.hitboxSize}
              onHitboxSizeChange={(s: number) => handleConfigChange({ hitboxSize: s })}
              transparency={config.transparency}
              onTransparencyChange={(t: number) => handleConfigChange({ transparency: t })}
              selectedColor={selectedTheme}
              onColorChange={(colorId: HitboxColorName) => handleConfigChange({ color: colorId })}
              autoAttackEnabled={config.autoAttackEnabled}
              onToggleAutoAttack={(val: boolean) => handleConfigChange({ autoAttackEnabled: val })}
              mobMagnetEnabled={config.mobMagnetEnabled}
              onToggleMobMagnet={(val: boolean) => handleConfigChange({ mobMagnetEnabled: val })}
              espEnabled={config.espEnabled}
              onToggleEsp={(val: boolean) => handleConfigChange({ espEnabled: val })}
              safeSkyFloat={config.safeSkyFloat}
              onToggleSafeSkyFloat={(val: boolean) => handleConfigChange({ safeSkyFloat: val })}
              keybind={config.keybind}
              mobileToggleEnabled={config.includeMobileToggle}
            />

            {/* Quick Summary & Code Preview Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ScriptViewer scriptCode={generatedScript} />
              </div>
              <div className="lg:col-span-1">
                <ConfigPanel
                  config={config}
                  onChange={handleConfigChange}
                  onReset={handleResetConfig}
                  onApplyPreset={handleApplyPreset}
                />
              </div>
            </div>
          </div>
        )}

        {activeViewTab === 'code' && (
          <div className="space-y-6">
            <ScriptViewer scriptCode={generatedScript} />
            <ConfigPanel
              config={config}
              onChange={handleConfigChange}
              onReset={handleResetConfig}
              onApplyPreset={handleApplyPreset}
            />
          </div>
        )}

        {activeViewTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ConfigPanel
                config={config}
                onChange={handleConfigChange}
                onReset={handleResetConfig}
                onApplyPreset={handleApplyPreset}
              />
            </div>
            <div className="lg:col-span-1">
              <ScriptViewer scriptCode={generatedScript} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Sword size={14} className="text-cyan-400" />
            <span>Blox Fruits ScreenGui Hitbox Expander &bull; Luau Game Mechanics Engine</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            CoreGui auto-fallback &bull; Safe CFrame revert &bull; Smooth tweens &bull; Mobile widget support
          </div>
        </div>
      </footer>
    </div>
  );
}
