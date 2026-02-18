export type ParticleShape = 'circle' | 'star' | 'streak'

export interface AnimationConfig {
  speed: number          // 0.1 – 3.0
  duration: number       // seconds
  fps: 12 | 24 | 60
  primaryColor: string   // hex
  secondaryColor: string // hex
  shape: ParticleShape
  glow: number           // 0 – 40  (shadowBlur)
  flair: number          // 0 – 1
}

export interface TrailPoint {
  x: number
  y: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number      // 0 = born, 1 = dead
  maxLife: number   // seconds
  size: number      // base radius px
  angle: number     // rotation for stars
  spinSpeed: number
  trail: TrailPoint[]
  // per-particle color tint (for flair variety)
  hueShift: number  // degrees offset from primary
  isBurst: boolean  // micro-burst secondary particle
}
