import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { AnimationConfig } from '../engine/types'
import { SparkSystem } from '../engine/SparkSystem'
import { drawFrame } from '../engine/renderer'

const SIZE = 512

function pad(n: number, len: number) {
  return String(n).padStart(len, '0')
}

export async function exportZip(
  config: AnimationConfig,
  onProgress: (pct: number) => void
): Promise<void> {
  const { fps, duration } = config
  const totalFrames = Math.ceil(fps * duration)
  const dt = 1 / fps

  const canvas = new OffscreenCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D

  const system = new SparkSystem(config, SIZE / 2, SIZE / 2)
  system.reset()

  const zip = new JSZip()
  const folder = zip.folder('frames')!

  for (let f = 0; f < totalFrames; f++) {
    ctx.clearRect(0, 0, SIZE, SIZE)
    drawFrame(ctx, system.particles, config)
    system.stepExact(dt)

    // Capture frame
    const blob = await canvas.convertToBlob({ type: 'image/png' })
    const name = `frame_${pad(f + 1, 4)}.png`
    folder.file(name, blob)

    onProgress(Math.round(((f + 1) / totalFrames) * 100))

    // Yield to UI every 8 frames to keep progress bar responsive
    if (f % 8 === 0) {
      await new Promise<void>((res) => setTimeout(res, 0))
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, 'sparks.zip')
}
