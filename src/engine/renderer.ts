import { AnimationConfig, Particle } from './types'

// Parse hex → [r,g,b]
function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '')
  const n = parseInt(c, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// Lerp two rgb triples
function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t)
  const g = Math.round(a[1] + (b[1] - a[1]) * t)
  const bv = Math.round(a[2] + (b[2] - a[2]) * t)
  return `rgb(${r},${g},${bv})`
}

function lerpColorAlpha(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
  alpha: number
): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t)
  const g = Math.round(a[1] + (b[1] - a[1]) * t)
  const bv = Math.round(a[2] + (b[2] - a[2]) * t)
  return `rgba(${r},${g},${bv},${alpha})`
}

// Rotate hue of an rgb triple by degrees
function rotateHue(
  rgb: [number, number, number],
  deg: number
): [number, number, number] {
  const r = rgb[0] / 255
  const g = rgb[1] / 255
  const b = rgb[2] / 255
  const rad = (deg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const nr = r * (0.213 + 0.787 * cos - 0.213 * sin) + g * (0.715 - 0.715 * cos - 0.715 * sin) + b * (0.072 - 0.072 * cos + 0.928 * sin)
  const ng = r * (0.213 - 0.213 * cos + 0.143 * sin) + g * (0.715 + 0.285 * cos + 0.140 * sin) + b * (0.072 - 0.072 * cos - 0.283 * sin)
  const nb = r * (0.213 - 0.213 * cos - 0.787 * sin) + g * (0.715 - 0.715 * cos + 0.715 * sin) + b * (0.072 + 0.928 * cos + 0.072 * sin)
  return [
    Math.max(0, Math.min(255, Math.round(nr * 255))),
    Math.max(0, Math.min(255, Math.round(ng * 255))),
    Math.max(0, Math.min(255, Math.round(nb * 255))),
  ]
}

// Draw a 4-point diamond star (classic anime sparkle ✦)
function drawDiamondStar(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  outer: number,
  inner: number,
  angle: number,
  points = 4
) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (i * Math.PI) / points + angle
    if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
    else ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
  }
  ctx.closePath()
}

// Main draw function
export function drawFrame(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  particles: Particle[],
  config: AnimationConfig
) {
  const { primaryColor, secondaryColor, shape, glow } = config

  const primary = hexToRgb(primaryColor)
  const secondary = hexToRgb(secondaryColor)

  // Sort: burst particles behind main
  const sorted = [...particles].sort((a, b) => (a.isBurst ? -1 : 1) - (b.isBurst ? -1 : 1))

  for (const p of sorted) {
    const t = p.life              // 0 → 1 (young → old)
    const alpha = Math.pow(1 - t, 1.5)  // fade out with slight easing
    if (alpha <= 0.01) continue

    // Apply per-particle hue shift for flair variety
    const pc = rotateHue(primary, p.hueShift)
    const sc = rotateHue(secondary, p.hueShift)

    // Particle color: primary (young) → secondary (old)
    const col = lerpColorAlpha(pc, sc, t, alpha)

    // Effective size shrinks with age
    const sz = p.size * (1 - t * 0.6)

    ctx.save()

    // --- GLOW (anime outer glow) ---
    if (glow > 0) {
      ctx.shadowBlur = glow * (1 - t * 0.5)
      ctx.shadowColor = lerpColor(pc, sc, t)
    }

    if (shape === 'circle') {
      drawCircleParticle(ctx, p, sz, col, pc, sc, t, alpha)
    } else if (shape === 'star') {
      drawStarParticle(ctx, p, sz, col, pc, sc, t, alpha, glow)
    } else {
      drawStreakParticle(ctx, p, sz, col, pc, sc, t, alpha)
    }

    ctx.restore()
  }
}

function drawCircleParticle(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  p: Particle,
  sz: number,
  col: string,
  pc: [number, number, number],
  sc: [number, number, number],
  t: number,
  alpha: number
) {
  // Trail
  if (p.trail.length > 1) {
    for (let i = 1; i < p.trail.length; i++) {
      const tf = i / p.trail.length
      const ta = alpha * tf * 0.5
      ctx.beginPath()
      ctx.strokeStyle = lerpColorAlpha(pc, sc, t, ta)
      ctx.lineWidth = sz * tf * 0.7
      ctx.lineCap = 'round'
      ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y)
      ctx.lineTo(p.trail[i].x, p.trail[i].y)
      ctx.stroke()
    }
  }

  // White hot core (anime inner bright)
  ctx.beginPath()
  const coreGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz)
  coreGrad.addColorStop(0, `rgba(255,255,255,${alpha})`)
  coreGrad.addColorStop(0.35, col)
  coreGrad.addColorStop(1, lerpColorAlpha(pc, sc, t, 0))
  ctx.fillStyle = coreGrad
  ctx.arc(p.x, p.y, sz, 0, Math.PI * 2)
  ctx.fill()
}

function drawStarParticle(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  p: Particle,
  sz: number,
  col: string,
  pc: [number, number, number],
  sc: [number, number, number],
  t: number,
  alpha: number,
  glow: number
) {
  // Trail dots
  if (p.trail.length > 1) {
    for (let i = 0; i < p.trail.length; i++) {
      const tf = (i + 1) / p.trail.length
      const ta = alpha * tf * 0.35
      ctx.beginPath()
      ctx.fillStyle = lerpColorAlpha(pc, sc, t, ta)
      ctx.arc(p.trail[i].x, p.trail[i].y, sz * tf * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Main diamond star — classic anime sparkle ✦
  ctx.fillStyle = col
  drawDiamondStar(ctx, p.x, p.y, sz * 1.1, sz * 0.22, p.angle)
  ctx.fill()

  // White core dot
  if (glow > 0) {
    ctx.shadowBlur = 0
  }
  ctx.beginPath()
  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`
  ctx.arc(p.x, p.y, sz * 0.28, 0, Math.PI * 2)
  ctx.fill()

  // Second smaller cross rotated 45°
  ctx.fillStyle = lerpColorAlpha(pc, sc, t, alpha * 0.6)
  drawDiamondStar(ctx, p.x, p.y, sz * 0.7, sz * 0.12, p.angle + Math.PI / 4)
  ctx.fill()
}

function drawStreakParticle(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  p: Particle,
  sz: number,
  col: string,
  pc: [number, number, number],
  sc: [number, number, number],
  t: number,
  alpha: number
) {
  if (p.trail.length < 2) {
    // Fallback: small dot
    ctx.beginPath()
    ctx.fillStyle = col
    ctx.arc(p.x, p.y, sz * 0.5, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  // Draw tapered streak along entire trail
  const tail = p.trail[0]
  const head = { x: p.x, y: p.y }

  // Direction vector
  const dx = head.x - tail.x
  const dy = head.y - tail.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const nx = -dy / len  // normal
  const ny = dx / len

  // Streak: wide at head, pointy at tail
  const w = sz * 0.9

  ctx.beginPath()
  ctx.moveTo(tail.x, tail.y) // tip
  ctx.lineTo(head.x + nx * w, head.y + ny * w)
  ctx.lineTo(head.x - nx * w, head.y - ny * w)
  ctx.closePath()

  const grad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y)
  grad.addColorStop(0, lerpColorAlpha(pc, sc, t, 0))
  grad.addColorStop(0.4, lerpColorAlpha(pc, sc, t, alpha * 0.6))
  grad.addColorStop(1, `rgba(255,255,255,${alpha * 0.95})`)
  ctx.fillStyle = grad
  ctx.fill()

  // Bright tip dot
  ctx.beginPath()
  ctx.fillStyle = `rgba(255,255,255,${alpha})`
  ctx.arc(head.x, head.y, sz * 0.35, 0, Math.PI * 2)
  ctx.fill()
}
