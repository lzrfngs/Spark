import { useEffect, useRef } from 'react'
import { AnimationConfig } from '../engine/types'
import { SparkSystem } from '../engine/SparkSystem'
import { drawFrame } from '../engine/renderer'
import styles from './AnimationCanvas.module.css'

interface Props {
  config: AnimationConfig
  size?: number
}

export function AnimationCanvas({ config, size = 512 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const systemRef = useRef<SparkSystem | null>(null)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number | null>(null)

  // Sync config changes into system
  useEffect(() => {
    if (systemRef.current) {
      systemRef.current.updateConfig(config)
    }
  }, [config])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const cx = canvas.width / 2
    const cy = canvas.height / 2

    const system = new SparkSystem(config, cx, cy)
    system.reset()
    systemRef.current = system

    let lastT: number | null = null

    function loop(t: number) {
      if (!lastT) lastT = t
      const dt = Math.min((t - lastT) / 1000, 0.05) // cap dt at 50ms
      lastT = t
      lastTimeRef.current = t

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      drawFrame(ctx!, system.particles, config)
      system.tick(dt)

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      systemRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]) // only remount when canvas size changes; config synced via updateConfig

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={styles.canvas}
      style={{ width: size, height: size }}
    />
  )
}
