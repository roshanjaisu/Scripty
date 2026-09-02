import React, { useState, useEffect, useRef } from 'react';
import { TargetMode, HitboxColorConfig, HitboxColorName, DamageFloater } from '../types';
import { THEME_OPTIONS } from '../utils/constants';
import {
  Sword,
  Sparkles,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Magnet,
  Palette,
  Crosshair,
  Maximize2,
  Minimize2,
  X,
  Flame,
  Check,
  RotateCcw,
} from 'lucide-react';

interface SimulatorProps {
  hitboxEnabled: boolean;
  onToggleHitbox: (val: boolean) => void;
  targetMode: TargetMode;
  onTargetModeChange: (mode: TargetMode) => void;
  hitboxSize: number;
  onHitboxSizeChange: (size: number) => void;
  transparency: number;
  onTransparencyChange: (trans: number) => void;
  selectedColor: HitboxColorConfig;
  onColorChange: (colorId: HitboxColorName) => void;
  autoAttackEnabled: boolean;
  onToggleAutoAttack: (val: boolean) => void;
  mobMagnetEnabled: boolean;
  onToggleMobMagnet: (val: boolean) => void;
  espEnabled: boolean;
  onToggleEsp: (val: boolean) => void;
  safeSkyFloat: boolean;
  onToggleSafeSkyFloat: (val: boolean) => void;
  keybind: string;
  mobileToggleEnabled: boolean;
}

export const RobloxScreenSimulator: React.FC<SimulatorProps> = ({
  hitboxEnabled,
  onToggleHitbox,
  targetMode,
  onTargetModeChange,
  hitboxSize,
  onHitboxSizeChange,
  transparency,
  onTransparencyChange,
  selectedColor,
  onColorChange,
  autoAttackEnabled,
  onToggleAutoAttack,
  mobMagnetEnabled,
  onToggleMobMagnet,
  espEnabled,
  onToggleEsp,
  safeSkyFloat,
  onToggleSafeSkyFloat,
  keybind,
  mobileToggleEnabled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAttacking, setIsAttacking] = useState(false);
  const [slashWave, setSlashWave] = useState(false);
  const [damageFloaters, setDamageFloaters] = useState<DamageFloater[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // ScreenGui Window State
  const [isGuiVisible, setIsGuiVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [guiTab, setGuiTab] = useState<'combat' | 'mobs' | 'esp' | 'theme'>('combat');
  const [guiPos, setGuiPos] = useState({ x: 20, y: 50 });
  const [isDraggingGui, setIsDraggingGui] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Combat Simulation State
  const [enemyHealth, setEnemyHealth] = useState(2400);
  const [totalHits, setTotalHits] = useState(0);

  // Position calculations
  const playerX = 130;
  // When Mob Magnet is active, enemy is pulled right in front of player
  const defaultEnemyX = 390;
  const magnetizedEnemyX = 210;
  const currentEnemyX = mobMagnetEnabled ? magnetizedEnemyX : defaultEnemyX;

  const normalReach = 65;
  const effectiveReach = normalReach + (hitboxEnabled ? hitboxSize * 2.8 : 0);
  const distance = Math.abs(currentEnemyX - playerX);
  const isWithinHitbox = distance <= effectiveReach;

  // Handle Dragging of the replica ScreenGui inside the canvas
  const handleMouseDownGui = (e: React.MouseEvent) => {
    // Only drag if clicking the titlebar background, not action buttons
    e.stopPropagation();
    setIsDraggingGui(true);
    setDragStart({ x: e.clientX - guiPos.x, y: e.clientY - guiPos.y });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingGui || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newX = Math.max(6, Math.min(rect.width - 320, e.clientX - dragStart.x));
      const newY = Math.max(38, Math.min(rect.height - (isMinimized ? 60 : 380), e.clientY - dragStart.y));
      setGuiPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDraggingGui(false);
    };

    if (isDraggingGui) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingGui, dragStart, isMinimized]);

  // Web Audio API hit/whoosh sound synthesis
  const playHitSound = (isHit: boolean) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isHit) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.14);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.11);
      }
    } catch {
      // Audio context policy safe guard
    }
  };

  // Perform an attack slash
  const executeAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    setSlashWave(true);

    setTimeout(() => {
      setSlashWave(false);
      setIsAttacking(false);
    }, 280);

    const didHit = isWithinHitbox;
    playHitSound(didHit);

    if (didHit) {
      const dmg = Math.floor(1420 + Math.random() * 420);
      setEnemyHealth((prev) => {
        const nextHp = Math.max(0, prev - dmg);
        if (nextHp === 0) {
          // Auto respawn after 2 seconds
          setTimeout(() => setEnemyHealth(2400), 2200);
        }
        return nextHp;
      });
      setTotalHits((prev) => prev + 1);

      const floaterId = Date.now();
      const newFloater: DamageFloater = {
        id: floaterId,
        text: `-${dmg} CRIT!`,
        x: currentEnemyX + Math.random() * 20 - 10,
        y: 130 - Math.random() * 20,
        color: selectedColor.hex,
      };

      setDamageFloaters((prev) => [...prev, newFloater]);
      setTimeout(() => {
        setDamageFloaters((prev) => prev.filter((f) => f.id !== floaterId));
      }, 1000);
    } else {
      const floaterId = Date.now();
      setDamageFloaters((prev) => [
        ...prev,
        {
          id: floaterId,
          text: `OUT OF REACH`,
          x: playerX + 70,
          y: 140,
          color: '#94a3b8',
        },
      ]);
      setTimeout(() => {
        setDamageFloaters((prev) => prev.filter((f) => f.id !== floaterId));
      }, 1000);
    }
  };

  // Feature 1: Auto-Attack Fast Clicker Loop
  useEffect(() => {
    if (!autoAttackEnabled) return;
    const interval = setInterval(() => {
      if (isWithinHitbox && enemyHealth > 0) {
        executeAttack();
      }
    }, 380);
    return () => clearInterval(interval);
  }, [autoAttackEnabled, isWithinHitbox, enemyHealth, isAttacking]);

  // Spacebar and Keybind listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        executeAttack();
      }
      // Re-toggle ScreenGui with keybind
      if (
        (keybind === 'RightControl' && e.code === 'ControlRight') ||
        (keybind === 'RightShift' && e.code === 'ShiftRight') ||
        (keybind === 'H' && e.key.toLowerCase() === 'h' && document.activeElement?.tagName !== 'INPUT') ||
        (keybind === 'V' && e.key.toLowerCase() === 'v' && document.activeElement?.tagName !== 'INPUT') ||
        (keybind === 'Insert' && e.code === 'Insert')
      ) {
        setIsGuiVisible((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hitboxEnabled, isWithinHitbox, keybind]);

  const pixelHitboxSize = hitboxSize * 3.4;
  const enemyHpPercent = Math.max(0, Math.min(100, (enemyHealth / 2400) * 100));

  return (
    <div className="w-full flex flex-col rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl">
      {/* Top Simulator Status / Control Header */}
      <div className="bg-slate-900/95 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full animate-pulse shadow-sm"
            style={{ backgroundColor: selectedColor.hex }}
          />
          <span className="font-bold text-slate-100 tracking-wide">Live Blox Fruits 3D Simulator</span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">
            Drag ScreenGui &bull; Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[10px]">{keybind}</kbd> to toggle
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick SFX toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Master ScreenGui Visibility toggle */}
          <button
            onClick={() => setIsGuiVisible(!isGuiVisible)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
              isGuiVisible
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-md'
            }`}
          >
            {isGuiVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{isGuiVisible ? 'Hide Menu' : 'Open ScreenGui'}</span>
          </button>
        </div>
      </div>

      {/* Main 3D Roblox Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative w-full h-[470px] sm:h-[500px] overflow-hidden select-none"
        style={{
          background: 'linear-gradient(180deg, #090d16 0%, #0f172a 40%, #082f49 75%, #0284c7 100%)',
        }}
      >
        {/* Top Roblox In-Game Bar HUD */}
        <div className="absolute top-0 left-0 right-0 h-9 bg-black/50 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-3.5 z-20 text-white text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-slate-800 border border-white/20 flex items-center justify-center font-black text-amber-400 text-xs">
              R
            </div>
            <span className="font-bold tracking-wider text-slate-200 text-[11px]">BLOX FRUITS [THIRD SEA]</span>
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>60 FPS &bull; 28ms</span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-amber-300 font-bold">$3,420,000 Beli</span>
            <span className="text-cyan-300 font-bold">Lv. 2550 (MAX)</span>
            <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/20 hidden sm:block">
              <div className="w-full h-full bg-emerald-500"></div>
            </div>
          </div>
        </div>

        {/* 3D Perspective Grid Ocean Ground */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              transform: 'perspective(400px) rotateX(60deg) translateY(70px)',
              transformOrigin: 'bottom center',
            }}
          />
        </div>

        {/* Mob Magnet Suction Wave Effect */}
        {mobMagnetEnabled && (
          <div
            className="absolute bottom-36 pointer-events-none z-10 flex items-center"
            style={{
              left: `${playerX + 40}px`,
              width: `${currentEnemyX - playerX}px`,
            }}
          >
            <div
              className="w-full h-1 border-t-2 border-dashed animate-pulse"
              style={{
                borderColor: selectedColor.hex,
                boxShadow: `0 0 12px ${selectedColor.hex}`,
              }}
            />
            <div
              className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono text-white tracking-wider absolute left-1/2 -translate-x-1/2 -top-5"
              style={{ backgroundColor: selectedColor.hex }}
            >
              🧲 MOB MAGNET PULL
            </div>
          </div>
        )}

        {/* 3D ESP Tracer Line */}
        {espEnabled && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <line
              x1={playerX + 20}
              y1={safeSkyFloat ? 260 : 310}
              x2={currentEnemyX + 15}
              y2={290}
              stroke={selectedColor.hex}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeOpacity="0.75"
            />
          </svg>
        )}

        {/* 1. LOCAL PLAYER AVATAR */}
        <div
          className={`absolute z-20 pointer-events-none transition-all duration-300 ${
            safeSkyFloat ? 'bottom-44' : 'bottom-28'
          }`}
          style={{ left: `${playerX}px` }}
        >
          {/* Safe Sky-Float Levitation Aura Ring */}
          {safeSkyFloat && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div
                className="w-16 h-3 rounded-full border-2 animate-ping"
                style={{
                  borderColor: selectedColor.hex,
                  boxShadow: `0 0 18px ${selectedColor.hex}`,
                }}
              />
              <span className="text-[9px] font-bold font-mono text-cyan-300 mt-1">SAFE SKY FLOAT (AIR)</span>
            </div>
          )}

          {/* Player Hitbox Expander Visualizer (When TargetMode is 'self' or 'both') */}
          {hitboxEnabled && (targetMode === 'self' || targetMode === 'both') && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 pointer-events-none transition-all duration-200 flex items-center justify-center"
              style={{
                width: `${pixelHitboxSize}px`,
                height: `${pixelHitboxSize}px`,
                backgroundColor: `${selectedColor.hex}${Math.round((1 - transparency) * 255).toString(16).padStart(2, '0')}`,
                borderColor: selectedColor.hex,
                boxShadow: `0 0 26px ${selectedColor.hex}55, inset 0 0 16px ${selectedColor.hex}33`,
              }}
            >
              <div
                className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider text-white shadow"
                style={{ backgroundColor: selectedColor.hex }}
              >
                PLAYER HITBOX ({hitboxSize}s)
              </div>
            </div>
          )}

          {/* Player Character Model (Marine Captain / Pirate) */}
          <div className="relative flex flex-col items-center">
            {/* Player Overhead Badge */}
            <div className="mb-1 flex flex-col items-center">
              <span className="text-[10px] font-extrabold text-cyan-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                [Crew Captain] You
              </span>
              <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div className="w-full h-full bg-emerald-400"></div>
              </div>
            </div>

            {/* Hat / Straw Hat */}
            <div className="w-9 h-2 bg-amber-600 rounded-full border border-amber-800 mb-0.5"></div>

            {/* Head */}
            <div className="w-6 h-6 bg-amber-200 rounded-md border border-amber-400 flex items-center justify-center relative">
              <div className="flex gap-1.5">
                <div className="w-1 h-1 bg-slate-900 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-900 rounded-full"></div>
              </div>
            </div>

            {/* Torso & Sword */}
            <div className="relative w-8 h-10 bg-slate-900 rounded-sm border border-slate-700 flex items-center justify-center">
              <div className="text-[10px]">⚓</div>

              {/* Katana / Blox Fruit Sword in hand */}
              <div
                className={`absolute -right-3 top-1 w-1.5 h-12 rounded-sm origin-bottom transition-transform duration-150 ${
                  isAttacking ? 'rotate-90 scale-125' : 'rotate-25'
                }`}
                style={{
                  background: 'linear-gradient(to top, #64748b, #f8fafc, #38bdf8)',
                  boxShadow: isAttacking ? `0 0 14px ${selectedColor.hex}` : 'none',
                }}
              >
                <div className="w-3 h-1 bg-amber-500 absolute bottom-1 -left-0.75"></div>
              </div>
            </div>

            {/* Legs */}
            <div className="flex gap-1">
              <div className="w-3.5 h-8 bg-blue-950 rounded-b-sm border border-slate-800"></div>
              <div className="w-3.5 h-8 bg-blue-950 rounded-b-sm border border-slate-800"></div>
            </div>
          </div>
        </div>

        {/* Attack Slash Wave Particle Effect */}
        {slashWave && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-200 ease-out"
            style={{
              left: `${playerX + 30}px`,
              bottom: safeSkyFloat ? '180px' : '120px',
              width: `${effectiveReach}px`,
            }}
          >
            <div
              className="h-16 rounded-r-full border-r-8 border-t-4 border-b-4 filter blur-[1px] animate-ping"
              style={{
                borderColor: selectedColor.hex,
                boxShadow: `0 0 25px ${selectedColor.hex}`,
                background: `linear-gradient(to right, transparent, ${selectedColor.hex}44)`,
              }}
            />
          </div>
        )}

        {/* 2. ENEMY NPC DUMMY (Bandit / Boss) */}
        <div
          className={`absolute bottom-28 z-15 pointer-events-none transition-all duration-300 ${
            enemyHealth <= 0 ? 'opacity-30' : 'opacity-100'
          }`}
          style={{ left: `${currentEnemyX}px` }}
        >
          {/* Feature 4: 3D ESP Billboard GUI */}
          {espEnabled && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 border border-slate-700 px-2 py-1 rounded-md shadow-2xl flex flex-col items-center gap-0.5 z-40">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black text-rose-400">⚔️ [Lv. 2400]</span>
                <span className="text-[10px] font-bold text-white">Bandit Captain</span>
              </div>
              {/* Dynamic Health Bar */}
              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full transition-all duration-150 rounded-full"
                  style={{
                    width: `${enemyHpPercent}%`,
                    backgroundColor:
                      enemyHpPercent > 50 ? '#22c55e' : enemyHpPercent > 25 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <div className="flex items-center justify-between w-full text-[8px] font-mono text-slate-300">
                <span>{enemyHealth}/2400 HP</span>
                <span className="text-cyan-300 font-bold">{Math.round(distance / 5)} Studs</span>
              </div>
            </div>
          )}

          {/* Enemy Hitbox Expander Visualizer (When TargetMode is 'enemies' or 'both') */}
          {hitboxEnabled && (targetMode === 'enemies' || targetMode === 'both') && (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 pointer-events-none transition-all duration-200 animate-pulse flex items-center justify-center"
              style={{
                width: `${pixelHitboxSize}px`,
                height: `${pixelHitboxSize}px`,
                backgroundColor: `${selectedColor.hex}${Math.round((1 - transparency) * 255).toString(16).padStart(2, '0')}`,
                borderColor: selectedColor.hex,
                boxShadow: `0 0 24px ${selectedColor.hex}44, inset 0 0 16px ${selectedColor.hex}33`,
              }}
            >
              <div
                className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider text-white shadow"
                style={{ backgroundColor: selectedColor.hex }}
              >
                TARGET HITBOX ({hitboxSize}s)
              </div>
            </div>
          )}

          {/* Enemy Avatar Body */}
          <div className="relative flex flex-col items-center">
            {/* Standard Health Bar if ESP is off */}
            {!espEnabled && (
              <div className="mb-1 flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-bold text-rose-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  [Lv. 2400] Bandit Captain
                </span>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-rose-500 transition-all duration-150"
                    style={{ width: `${enemyHpPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Pirate Bandana */}
            <div className="w-7 h-2 bg-red-700 rounded-t-sm mb-0.5"></div>
            {/* Head */}
            <div className="w-6 h-6 bg-amber-100 rounded-md border border-amber-300 flex items-center justify-center relative">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1 bg-red-900 rounded-full"></div>
                <div className="w-1.5 h-1 bg-red-900 rounded-full"></div>
              </div>
              <div className="w-2.5 h-0.5 bg-slate-700 absolute bottom-1"></div>
            </div>
            {/* Torso */}
            <div className="relative w-8 h-10 bg-red-900 rounded-sm border border-red-950 flex items-center justify-center">
              <span className="text-[10px]">☠️</span>
            </div>
            {/* Legs */}
            <div className="flex gap-1">
              <div className="w-3.5 h-8 bg-slate-800 rounded-b-sm border border-slate-900"></div>
              <div className="w-3.5 h-8 bg-slate-800 rounded-b-sm border border-slate-900"></div>
            </div>
          </div>
        </div>

        {/* Damage Numbers Floating in 3D Space */}
        {damageFloaters.map((floater) => (
          <div
            key={floater.id}
            className="absolute pointer-events-none font-black text-sm sm:text-base animate-bounce drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-30"
            style={{
              left: `${floater.x}px`,
              top: `${floater.y}px`,
              color: floater.color,
            }}
          >
            {floater.text}
          </div>
        ))}

        {/* --- REPLICA ROBLOX SCREENGUI (Interactive, Multi-Tab & Theme Switcher) --- */}
        {isGuiVisible && (
          <div
            className="absolute z-40 select-none shadow-2xl rounded-2xl border bg-slate-950/95 backdrop-blur-md overflow-hidden transition-all duration-150"
            style={{
              left: `${guiPos.x}px`,
              top: `${guiPos.y}px`,
              width: '300px',
              borderColor: selectedColor.hex,
              boxShadow: `0 0 30px ${selectedColor.hex}33, 0 20px 40px rgba(0,0,0,0.8)`,
            }}
          >
            {/* Top Drag Handle Header Bar */}
            <div
              onMouseDown={handleMouseDownGui}
              className="px-3 py-2.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between cursor-move"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">🗡️</span>
                <span className="text-xs font-bold text-slate-100 tracking-wide">
                  Blox Fruits V3 Suite {isMinimized && <span className="text-[10px] text-slate-400 font-normal">(Minimized)</span>}
                </span>
              </div>

              {/* Window Action Controls (Minus & Close buttons with stopPropagation) */}
              <div className="flex items-center gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
                {/* Minimize Button ('—') */}
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 active:scale-90 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-transform border border-slate-700"
                  title={isMinimized ? 'Expand Menu' : 'Minimize Menu'}
                >
                  {isMinimized ? <Maximize2 size={11} /> : '—'}
                </button>

                {/* Close Button ('✕') */}
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGuiVisible(false);
                  }}
                  className="w-6 h-6 rounded bg-red-950/80 hover:bg-red-800 active:scale-90 text-red-300 hover:text-white flex items-center justify-center text-xs transition-transform border border-red-800/80"
                  title="Close ScreenGui (reopen with floating icon or keybind)"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Content when NOT minimized */}
            {!isMinimized && (
              <div className="p-3 space-y-3">
                {/* 4 Multi-Tab Navigation */}
                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold">
                  <button
                    onClick={() => setGuiTab('combat')}
                    className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                      guiTab === 'combat'
                        ? 'text-slate-950 shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    style={{
                      backgroundColor: guiTab === 'combat' ? selectedColor.hex : 'transparent',
                    }}
                  >
                    <span>⚔️</span>
                    <span>Combat</span>
                  </button>

                  <button
                    onClick={() => setGuiTab('mobs')}
                    className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                      guiTab === 'mobs'
                        ? 'text-slate-950 shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    style={{
                      backgroundColor: guiTab === 'mobs' ? selectedColor.hex : 'transparent',
                    }}
                  >
                    <span>🧲</span>
                    <span>Mobs</span>
                  </button>

                  <button
                    onClick={() => setGuiTab('esp')}
                    className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                      guiTab === 'esp'
                        ? 'text-slate-950 shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    style={{
                      backgroundColor: guiTab === 'esp' ? selectedColor.hex : 'transparent',
                    }}
                  >
                    <span>👁️</span>
                    <span>ESP</span>
                  </button>

                  <button
                    onClick={() => setGuiTab('theme')}
                    className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                      guiTab === 'theme'
                        ? 'text-slate-950 shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    style={{
                      backgroundColor: guiTab === 'theme' ? selectedColor.hex : 'transparent',
                    }}
                  >
                    <span>🎨</span>
                    <span>Theme</span>
                  </button>
                </div>

                {/* TAB 1: COMBAT CONTROLS */}
                {guiTab === 'combat' && (
                  <div className="space-y-2.5 animate-in fade-in duration-150">
                    {/* Primary Hitbox Toggle */}
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200">Hitbox Expander</div>
                        <div
                          className={`text-[9px] font-mono font-bold ${
                            hitboxEnabled ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          STATUS: {hitboxEnabled ? 'ACTIVE (ON)' : 'DISABLED'}
                        </div>
                      </div>
                      <button
                        onClick={() => onToggleHitbox(!hitboxEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 p-0.5 border ${
                          hitboxEnabled
                            ? 'bg-emerald-600 border-emerald-400'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            hitboxEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Feature 1: Auto M1 Fast Clicker Toggle */}
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                          <Flame size={12} className="text-amber-400" />
                          <span>Auto M1 Fast Clicker</span>
                        </div>
                        <div className="text-[9px] text-slate-400">Swings equipped sword 0.15s</div>
                      </div>
                      <button
                        onClick={() => onToggleAutoAttack(!autoAttackEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 p-0.5 border ${
                          autoAttackEnabled
                            ? 'bg-amber-600 border-amber-400'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            autoAttackEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Hitbox Size Slider */}
                    <div className="space-y-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-300 font-medium">Hitbox Studs</span>
                        <span className="font-mono font-bold" style={{ color: selectedColor.hex }}>
                          {hitboxSize} Studs
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="70"
                        step="1"
                        value={hitboxSize}
                        onChange={(e) => onHitboxSizeChange(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        style={{ accentColor: selectedColor.hex }}
                      />
                    </div>

                    {/* Scope Selector */}
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      {(['self', 'enemies', 'both'] as TargetMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => onTargetModeChange(mode)}
                          className={`py-1 rounded-md border font-semibold transition-colors ${
                            targetMode === mode
                              ? 'bg-slate-800 text-white border-white'
                              : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {mode === 'self' ? 'Player' : mode === 'enemies' ? 'NPCs' : 'Both'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: MOBS & FARMING CONTROLS */}
                {guiTab === 'mobs' && (
                  <div className="space-y-2.5 animate-in fade-in duration-150">
                    {/* Feature 2: Mob Magnet Toggle */}
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                          <Magnet size={13} className="text-cyan-400" />
                          <span>Mob Magnet (Bring Mobs)</span>
                        </div>
                        <div className="text-[9px] text-slate-400">Pulls all mobs into attack range</div>
                      </div>
                      <button
                        onClick={() => onToggleMobMagnet(!mobMagnetEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 p-0.5 border ${
                          mobMagnetEnabled
                            ? 'bg-cyan-600 border-cyan-400'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            mobMagnetEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Safe Sky-Hover Float */}
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                          <Sparkles size={13} className="text-purple-400" />
                          <span>Safe Sky Hover (Anti-Dmg)</span>
                        </div>
                        <div className="text-[9px] text-slate-400">Hovers safely above ground mobs</div>
                      </div>
                      <button
                        onClick={() => onToggleSafeSkyFloat(!safeSkyFloat)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 p-0.5 border ${
                          safeSkyFloat
                            ? 'bg-purple-600 border-purple-400'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            safeSkyFloat ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Mob Magnet Status Banner */}
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                      <div className="text-slate-200 font-semibold mb-0.5">Magnet Radius: 60 Studs</div>
                      Locks NPC physics with <code className="text-cyan-300">PlatformStand = true</code> so mobs stack together safely.
                    </div>
                  </div>
                )}

                {/* TAB 3: 3D ESP & HEALTH INDICATORS */}
                {guiTab === 'esp' && (
                  <div className="space-y-2.5 animate-in fade-in duration-150">
                    {/* Feature 4: 3D ESP Master Toggle */}
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1">
                          <Crosshair size={13} className="text-emerald-400" />
                          <span>3D ESP & HP Meters</span>
                        </div>
                        <div className="text-[9px] text-slate-400">Overhead HP bar & distance tag</div>
                      </div>
                      <button
                        onClick={() => onToggleEsp(!espEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 p-0.5 border ${
                          espEnabled
                            ? 'bg-emerald-600 border-emerald-400'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            espEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Box Transparency */}
                    <div className="space-y-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-300 font-medium">Box Transparency</span>
                        <span className="font-mono text-slate-200">{Math.round(transparency * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.05"
                        value={transparency}
                        onChange={(e) => onTransparencyChange(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        style={{ accentColor: selectedColor.hex }}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: UI THEME ACCESS SWITCHER */}
                {guiTab === 'theme' && (
                  <div className="space-y-2.5 animate-in fade-in duration-150">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>UI Accent Color (Live)</span>
                      <span className="text-white font-mono">{selectedColor.label}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {THEME_OPTIONS.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => onColorChange(theme.id)}
                          className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                            selectedColor.id === theme.id
                              ? 'bg-slate-800 border-white text-white font-bold shadow-md'
                              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full shadow-sm"
                              style={{ backgroundColor: theme.hex }}
                            />
                            <span className="text-[11px]">{theme.label}</span>
                          </div>
                          {selectedColor.id === theme.id && <Check size={12} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Keybind Footnote */}
                <div className="pt-1 border-t border-slate-800/80 text-[9px] text-center text-slate-400 flex items-center justify-between">
                  <span>Press <strong className="text-slate-200 font-mono">[{keybind}]</strong> to hide/show</span>
                  <span className="text-emerald-400 font-bold">&bull; V3.2 Active</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Closed ScreenGui Restoration Banner (When closed with '✕') */}
        {!isGuiVisible && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-slate-700 px-3.5 py-1.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <span className="text-xs text-slate-300">
              ScreenGui Hidden &bull; Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[10px]">{keybind}</kbd>
            </span>
            <button
              onClick={() => setIsGuiVisible(true)}
              className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-950 shadow transition-transform active:scale-95"
              style={{ backgroundColor: selectedColor.hex }}
            >
              Reopen UI
            </button>
          </div>
        )}

        {/* Floating Mini Toggle Circle Button (Mobile Widget & Quick Restorer) */}
        {mobileToggleEnabled && (
          <button
            onClick={() => {
              setIsGuiVisible(true);
              setIsMinimized(false);
            }}
            className="absolute bottom-4 left-4 z-40 w-11 h-11 rounded-full text-slate-950 active:scale-95 border-2 border-white/90 shadow-2xl flex items-center justify-center text-lg transition-transform hover:scale-105"
            style={{ backgroundColor: selectedColor.hex }}
            title="Click to reopen / expand Blox Fruits Hub"
          >
            🗡️
            {hitboxEnabled && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border border-slate-900 animate-ping"></span>
            )}
          </button>
        )}

        {/* Bottom Right Interactive Combat Actions */}
        <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2">
          {enemyHealth <= 0 && (
            <button
              onClick={() => setEnemyHealth(2400)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400 shadow-lg flex items-center gap-1.5"
            >
              <RotateCcw size={13} /> Respawn Boss
            </button>
          )}

          <button
            onClick={executeAttack}
            disabled={isAttacking}
            className={`px-4 py-2 rounded-xl text-xs font-black shadow-xl border flex items-center gap-2 transition-all duration-150 ${
              isAttacking
                ? 'bg-amber-600 border-amber-400 scale-95 text-white'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-cyan-300 text-slate-950 font-black'
            }`}
          >
            <Sword size={16} />
            <span>Attack Slash (Space)</span>
          </button>
        </div>
      </div>

      {/* Simulator Bottom Status / Analysis Bar */}
      <div className="bg-slate-900/90 p-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex flex-col">
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Hitbox Expander</span>
          <span className={`font-bold ${hitboxEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
            {hitboxEnabled ? `ACTIVE (${hitboxSize} Studs)` : 'OFF'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Auto-Attack Clicker</span>
          <span className={`font-bold ${autoAttackEnabled ? 'text-amber-400' : 'text-slate-400'}`}>
            {autoAttackEnabled ? 'FAST CLICKING (0.15s)' : 'MANUAL'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Mob Magnet</span>
          <span className={`font-bold ${mobMagnetEnabled ? 'text-cyan-400' : 'text-slate-400'}`}>
            {mobMagnetEnabled ? 'PULLING MOBS (60s)' : 'DISABLED'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Hits Connected</span>
          <span className="font-mono font-bold text-purple-300">
            {totalHits} Hits Connected
          </span>
        </div>
      </div>
    </div>
  );
};
