import { HitboxColorConfig, ScriptConfig } from '../types';

export const THEME_OPTIONS: HitboxColorConfig[] = [
  {
    id: 'cyan',
    label: 'Marine Cyan',
    hex: '#06b6d4',
    rgb: [6, 182, 212],
    brickColor: 'Toothpaste',
    themeName: 'Cyber Ocean',
  },
  {
    id: 'crimson',
    label: 'Blood Crimson',
    hex: '#ef4444',
    rgb: [239, 68, 68],
    brickColor: 'Bright red',
    themeName: 'Pirate Carnage',
  },
  {
    id: 'neonGreen',
    label: 'Neon Emerald',
    hex: '#10b981',
    rgb: [16, 185, 129],
    brickColor: 'Lime green',
    themeName: 'Acid Jungle',
  },
  {
    id: 'purple',
    label: 'Amethyst Violet',
    hex: '#a855f7',
    rgb: [168, 85, 247],
    brickColor: 'Royal purple',
    themeName: 'Void Fruit',
  },
  {
    id: 'gold',
    label: 'Solar Gold',
    hex: '#f59e0b',
    rgb: [245, 158, 11],
    brickColor: 'Bright yellow',
    themeName: 'Buddha Light',
  },
  {
    id: 'indigo',
    label: 'Midnight Phantom',
    hex: '#6366f1',
    rgb: [99, 102, 241],
    brickColor: 'Deep blue',
    themeName: 'Ghost Astral',
  },
];

export const PRESETS: { name: string; description: string; badge: string; config: Partial<ScriptConfig> }[] = [
  {
    name: 'All-In-One God Grind',
    badge: 'OP FARM',
    description: 'Hitbox + Mob Magnet + Auto M1 Fast Clicker + Safe Sky Float for AFK master grinding',
    config: {
      targetMode: 'enemies',
      hitboxSize: 32,
      transparency: 0.55,
      color: 'cyan',
      autoAttackEnabled: true,
      autoAttackDelay: 0.15,
      mobMagnetEnabled: true,
      mobMagnetRadius: 65,
      espEnabled: true,
      safeSkyFloat: true,
      safeFloatHeight: 14,
      canCollide: false,
    },
  },
  {
    name: 'Fast Auto-Clicker & Magnet',
    badge: 'COMBAT',
    description: 'Brings all mobs directly to your sword blade and autoclicks with 0.12s rapid swings',
    config: {
      targetMode: 'enemies',
      hitboxSize: 28,
      transparency: 0.6,
      color: 'crimson',
      autoAttackEnabled: true,
      autoAttackDelay: 0.12,
      mobMagnetEnabled: true,
      mobMagnetRadius: 50,
      espEnabled: false,
      safeSkyFloat: false,
      canCollide: false,
    },
  },
  {
    name: 'Raid Boss & 3D ESP Hunter',
    badge: 'BOSSES',
    description: 'Displays 3D health meters, distances, and expands boss hitboxes to 45 studs with Void theme',
    config: {
      targetMode: 'both',
      hitboxSize: 45,
      transparency: 0.5,
      color: 'purple',
      autoAttackEnabled: false,
      mobMagnetEnabled: false,
      espEnabled: true,
      espShowHealth: true,
      espShowDistance: true,
      safeSkyFloat: false,
      canCollide: false,
    },
  },
  {
    name: 'Safe Discreet PvP Duel',
    badge: 'STEALTH',
    description: 'Subtle 15 stud hitbox expansion with high transparency and clean ESP indicators',
    config: {
      targetMode: 'self',
      hitboxSize: 15,
      transparency: 0.85,
      color: 'neonGreen',
      autoAttackEnabled: false,
      mobMagnetEnabled: false,
      espEnabled: true,
      espShowHealth: true,
      espShowDistance: false,
      safeSkyFloat: false,
      canCollide: false,
    },
  },
];

export const DEFAULT_CONFIG: ScriptConfig = {
  targetMode: 'enemies',
  hitboxSize: 26,
  transparency: 0.6,
  color: 'cyan',
  canCollide: false,
  
  // Feature 1: Auto Attack
  autoAttackEnabled: true,
  autoAttackDelay: 0.18,
  
  // Feature 2: Mob Magnet
  mobMagnetEnabled: true,
  mobMagnetRadius: 55,
  
  // Feature 4: 3D ESP
  espEnabled: true,
  espShowHealth: true,
  espShowDistance: true,
  
  // Safe sky float
  safeSkyFloat: false,
  safeFloatHeight: 12,

  keybind: 'RightControl',
  includeMobileToggle: true,
  guiTitle: 'Blox Fruits V3 Ultimate Studio',
};
