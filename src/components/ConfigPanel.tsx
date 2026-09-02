import React from 'react';
import { ScriptConfig, TargetMode, HitboxColorName } from '../types';
import { THEME_OPTIONS, PRESETS } from '../utils/constants';
import {
  Sliders,
  Shield,
  Smartphone,
  Keyboard,
  Sparkles,
  RefreshCw,
  Flame,
  Magnet,
  Crosshair,
  Palette,
  Check,
} from 'lucide-react';

interface ConfigPanelProps {
  config: ScriptConfig;
  onChange: (updated: Partial<ScriptConfig>) => void;
  onReset: () => void;
  onApplyPreset: (presetConfig: Partial<ScriptConfig>) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onChange,
  onReset,
  onApplyPreset,
}) => {
  const keybindOptions = [
    { value: 'RightControl', label: 'Right Control [Default]' },
    { value: 'RightShift', label: 'Right Shift' },
    { value: 'H', label: 'H Key' },
    { value: 'V', label: 'V Key' },
    { value: 'Insert', label: 'Insert Key' },
    { value: 'LeftAlt', label: 'Left Alt' },
  ];

  const quickSizes = [15, 25, 35, 50, 65];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6 text-slate-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders size={18} className="text-cyan-400" />
          <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
            Script & UI Customizer
          </h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          title="Reset to defaults"
        >
          <RefreshCw size={13} />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* 1. Quick Presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-400" />
          <span>One-Click Combat & Farming Presets</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onApplyPreset(preset.config)}
              className="p-3 rounded-lg text-left bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                  {preset.name}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {preset.badge}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-2">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. UI Theme Access Switcher */}
      <div className="space-y-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Palette size={14} className="text-cyan-400" />
            <span>UI Theme Color Accent (Live Switcher)</span>
          </label>
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
            {THEME_OPTIONS.find((t) => t.id === config.color)?.label}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {THEME_OPTIONS.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onChange({ color: theme.id as HitboxColorName })}
              className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                config.color === theme.id
                  ? 'border-white bg-slate-800 font-bold text-white shadow-md'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{ backgroundColor: theme.hex }}
                />
                <span className="text-[11px] truncate">{theme.label}</span>
              </div>
              {config.color === theme.id && <Check size={12} className="text-white" />}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Added Core Features: Auto-Attack & Mob Magnet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Feature 1: Auto Attack Fast Clicker */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-slate-200">Auto M1 Clicker</span>
            </div>
            <button
              onClick={() => onChange({ autoAttackEnabled: !config.autoAttackEnabled })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                config.autoAttackEnabled
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {config.autoAttackEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="text-[10px] text-slate-400">
            Automatically triggers melee swings & mouse clicks against enemies in reach.
          </div>
        </div>

        {/* Feature 2: Mob Magnet */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Magnet size={14} className="text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Mob Magnet (Bring)</span>
            </div>
            <button
              onClick={() => onChange({ mobMagnetEnabled: !config.mobMagnetEnabled })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                config.mobMagnetEnabled
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {config.mobMagnetEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="text-[10px] text-slate-400">
            Freezes NPC physics and clusters them 5 studs in front of you for AOE hits.
          </div>
        </div>
      </div>

      {/* 4. Feature 4: 3D ESP & Safe Sky Float */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Feature 4: 3D ESP & Health Indicators */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Crosshair size={14} className="text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">3D ESP & HP Meters</span>
            </div>
            <button
              onClick={() => onChange({ espEnabled: !config.espEnabled })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                config.espEnabled
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {config.espEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="text-[10px] text-slate-400">
            Draws overhead Billboard health bars and distance tags over players & boss NPCs.
          </div>
        </div>

        {/* Safe Sky Float */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-xs font-bold text-slate-200">Safe Sky Hover</span>
            </div>
            <button
              onClick={() => onChange({ safeSkyFloat: !config.safeSkyFloat })}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                config.safeSkyFloat
                  ? 'bg-purple-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {config.safeSkyFloat ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="text-[10px] text-slate-400">
            Zeroes Y velocity to hover safely 14 studs above ground mobs (prevents melee damage).
          </div>
        </div>
      </div>

      {/* 5. Hitbox Stud Size & Scope */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-slate-300">Hitbox Expansion Radius</label>
          <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
            {config.hitboxSize} Studs
          </span>
        </div>

        <input
          type="range"
          min="5"
          max="80"
          step="1"
          value={config.hitboxSize}
          onChange={(e) => onChange({ hitboxSize: Number(e.target.value) })}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        <div className="flex gap-1.5">
          {quickSizes.map((size) => (
            <button
              key={size}
              onClick={() => onChange({ hitboxSize: size })}
              className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
                config.hitboxSize === size
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {size}s
            </button>
          ))}
        </div>
      </div>

      {/* 6. Target Mode Scope */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">Target Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'enemies', label: 'NPCs & Bosses', desc: 'Auto farming & grinding' },
            { id: 'self', label: 'Local Player', desc: 'Expand own sword reach' },
            { id: 'both', label: 'Universal (Both)', desc: 'Dual hitbox expansion' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onChange({ targetMode: item.id as TargetMode })}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                config.targetMode === item.id
                  ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-sm'
                  : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="text-xs font-bold">{item.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Keybind & Mobile Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Keyboard size={14} className="text-cyan-400" />
            <span>Keyboard Toggle Keybind</span>
          </label>
          <select
            value={config.keybind}
            onChange={(e) => onChange({ keybind: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
          >
            {keybindOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 flex flex-col justify-end">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Smartphone size={14} className="text-emerald-400" />
            <span>Mobile Floating Icon</span>
          </label>
          <button
            onClick={() => onChange({ includeMobileToggle: !config.includeMobileToggle })}
            className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-colors ${
              config.includeMobileToggle
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span>Floating Mobile Circle Widget</span>
            <span>{config.includeMobileToggle ? 'ENABLED' : 'DISABLED'}</span>
          </button>
        </div>
      </div>

      {/* 8. Safety Physics Footnote */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield size={15} className="text-cyan-400" />
          <span>Physics Safe Protection</span>
        </div>
        <span className="text-emerald-400 font-semibold">CanCollide = false (No fling)</span>
      </div>
    </div>
  );
};
