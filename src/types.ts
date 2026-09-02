export type TargetMode = 'self' | 'enemies' | 'both';

export type HitboxColorName = 'cyan' | 'crimson' | 'neonGreen' | 'purple' | 'gold' | 'indigo';

export interface HitboxColorConfig {
  id: HitboxColorName;
  label: string;
  hex: string;
  rgb: [number, number, number];
  brickColor: string;
  themeName: string;
}

export interface ScriptConfig {
  // Hitbox core
  targetMode: TargetMode;
  hitboxSize: number; // in studs
  transparency: number; // 0 to 1
  color: HitboxColorName;
  canCollide: boolean;
  
  // Feature 1: Auto-Attack Fast Clicker
  autoAttackEnabled: boolean;
  autoAttackDelay: number; // in seconds, e.g. 0.15s
  
  // Feature 2: Mob Magnet (Bring Mobs)
  mobMagnetEnabled: boolean;
  mobMagnetRadius: number; // in studs e.g. 60
  
  // Feature 4: Boss & Player 3D ESP with HP
  espEnabled: boolean;
  espShowHealth: boolean;
  espShowDistance: boolean;
  
  // Additional feature: Safe Sky-Float
  safeSkyFloat: boolean;
  safeFloatHeight: number; // in studs e.g. 14

  // System & UI Config
  keybind: string; // e.g. "RightControl", "RightShift", "H", "V", "Insert"
  includeMobileToggle: boolean;
  guiTitle: string;
}

export interface DamageFloater {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}
