
export enum BehaviorType {
  FOUNTAIN = 'fountain',
  VORTEX = 'vortex',
  EXPLOSION = 'explosion',
  CHAOS = 'chaos',
  ORBIT = 'orbit'
}

export interface ParticleConfig {
  id: string;
  name: string;
  count: number;
  sizeMin: number;
  sizeMax: number;
  speed: number;
  gravity: number;
  wind: number; // New: Rightward force
  friction: number;
  life: number; // in frames
  colorRange: string[];
  behavior: BehaviorType;
  blur: number;
  glow: boolean;
}

export interface Vector {
  x: number;
  y: number;
}
