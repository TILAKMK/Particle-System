
import { ParticleConfig, BehaviorType } from './types';

export const DEFAULT_CONFIGS: ParticleConfig[] = [
  {
    id: 'cosmic-nebula',
    name: 'Cosmic Nebula',
    count: 300,
    sizeMin: 1,
    sizeMax: 4,
    speed: 2.0,
    gravity: 0.05,
    wind: 0.02,
    friction: 0.98,
    life: 150,
    colorRange: ['#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'],
    behavior: BehaviorType.CHAOS,
    blur: 2,
    glow: true
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    count: 200,
    sizeMin: 2,
    sizeMax: 8,
    speed: 3.5,
    gravity: 0.1,
    wind: 0.05,
    friction: 0.97,
    life: 80,
    colorRange: ['#fbbf24', '#f59e0b', '#ea580c', '#b91c1c'],
    behavior: BehaviorType.FOUNTAIN,
    blur: 4,
    glow: true
  },
  {
    id: 'deep-sea',
    name: 'Deep Sea',
    count: 400,
    sizeMin: 0.5,
    sizeMax: 3,
    speed: 0.8,
    gravity: 0.02,
    wind: -0.01,
    friction: 0.95,
    life: 300,
    colorRange: ['#06b6d4', '#0891b2', '#0e7490', '#164e63'],
    behavior: BehaviorType.ORBIT,
    blur: 1,
    glow: false
  }
];
