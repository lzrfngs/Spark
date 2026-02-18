import { AnimationConfig, Particle, TrailPoint } from './types'

const TAU = Math.PI * 2

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}


export class SparkSystem {
  particles: Particle[] = []
  private config: AnimationConfig
  private cx: number
  private cy: number
  private time = 0
  private emitAccum = 0

  constructor(config: AnimationConfig, cx: number, cy: number) {
    this.config = config
    this.cx = cx
    this.cy = cy
  }

  reset() {
    this.particles = []
    this.time = 0
    this.emitAccum = 0
    this.burst()
  }

  updateConfig(config: AnimationConfig) {
    this.config = config
  }

  setCenter(cx: number, cy: number) {
    this.cx = cx
    this.cy = cy
  }

  // Anime-style: big initial burst + continuous emitter
  private burst() {
    const { speed, flair } = this.config
    const count = Math.floor(rand(18, 30) * (1 + flair))
    for (let i = 0; i < count; i++) {
      this.spawnParticle(false)
    }
    // Flair: extra micro-sparkle burst
    if (flair > 0.3) {
      const microCount = Math.floor(rand(8, 16) * flair)
      for (let i = 0; i < microCount; i++) {
        this.spawnParticle(true)
      }
    }
    void speed // used in spawnParticle
  }

  private spawnParticle(isBurst: boolean) {
    const { speed, flair, shape } = this.config

    // Anime sparks shoot in all directions with higher horizontal bias
    const angle = rand(0, TAU)

    // Speed varies a lot — some fast streaks, some slow floaters (anime feel)
    const baseSpeed = isBurst
      ? rand(20, 80) * speed
      : rand(40, 220) * speed

    const vx = Math.cos(angle) * baseSpeed
    // Angled upward bias with gravity arc for classic anime look
    const vy = Math.sin(angle) * baseSpeed - rand(0, 60) * speed

    // Slight origin scatter (not all from exact center)
    const ox = rand(-8, 8)
    const oy = rand(-8, 8)

    const maxLife = isBurst
      ? rand(0.15, 0.35)
      : rand(0.25, 0.9) / Math.max(0.4, speed * 0.6)

    const size = isBurst
      ? rand(1.5, 4)
      : shape === 'star'
        ? rand(4, 10)
        : rand(2, 8)

    // Flair: small hue shift per particle for rainbow shimmer
    const hueShift = flair > 0.5 ? rand(-40, 40) : rand(-10, 10)

    const p: Particle = {
      x: this.cx + ox,
      y: this.cy + oy,
      vx,
      vy,
      life: 0,
      maxLife,
      size,
      angle: rand(0, TAU),
      spinSpeed: rand(-8, 8),
      trail: [],
      hueShift,
      isBurst,
    }
    this.particles.push(p)
  }

  tick(dt: number) {
    const { speed, duration, flair } = this.config

    this.time += dt

    // Loop: reset when animation completes
    if (this.time >= duration) {
      this.reset()
      return
    }

    const gravity = 120 * speed
    const drag = 0.96 // per-frame drag (applied per second equivalent)
    const dragPerDt = Math.pow(drag, dt * 60)

    // Continuous emission (slower trickle after initial burst)
    const emitRate = rand(4, 10) * (1 + flair * 2) * speed
    this.emitAccum += emitRate * dt
    while (this.emitAccum >= 1) {
      this.spawnParticle(false)
      if (flair > 0.6 && Math.random() < flair * 0.3) {
        this.spawnParticle(true)
      }
      this.emitAccum -= 1
    }

    // Update each particle
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]

      // Save trail point every tick (anime motion trail)
      const trail: TrailPoint = { x: p.x, y: p.y }
      p.trail.push(trail)
      const maxTrailLen = p.isBurst ? 4 : 12
      if (p.trail.length > maxTrailLen) p.trail.shift()

      // Physics
      p.vx *= dragPerDt
      p.vy *= dragPerDt
      p.vy += gravity * dt  // gravity

      p.x += p.vx * dt
      p.y += p.vy * dt
      p.angle += p.spinSpeed * dt

      p.life += dt / p.maxLife

      // Remove dead
      if (p.life >= 1) {
        this.particles.splice(i, 1)
      }
    }
  }

  // Step by exact dt without looping — used for export
  stepExact(dt: number) {
    const { speed } = this.config
    const gravity = 120 * speed
    const dragPerDt = Math.pow(0.96, dt * 60)
    const flair = this.config.flair

    const emitRate = 6 * (1 + flair * 2) * speed
    this.emitAccum += emitRate * dt
    while (this.emitAccum >= 1) {
      this.spawnParticle(false)
      if (flair > 0.6 && Math.random() < flair * 0.3) this.spawnParticle(true)
      this.emitAccum -= 1
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]

      p.trail.push({ x: p.x, y: p.y })
      const maxTrailLen = p.isBurst ? 4 : 12
      if (p.trail.length > maxTrailLen) p.trail.shift()

      p.vx *= dragPerDt
      p.vy *= dragPerDt
      p.vy += gravity * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.angle += p.spinSpeed * dt
      p.life += dt / p.maxLife

      if (p.life >= 1) this.particles.splice(i, 1)
    }
  }
}
