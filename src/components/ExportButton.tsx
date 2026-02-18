import { useState } from 'react'
import { AnimationConfig } from '../engine/types'
import { exportZip } from '../utils/exportZip'
import styles from './ExportButton.module.css'

interface Props {
  config: AnimationConfig
}

export function ExportButton({ config }: Props) {
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const totalFrames = Math.ceil(config.fps * config.duration)

  async function handleExport() {
    setError(null)
    setProgress(0)
    try {
      await exportZip(config, setProgress)
    } catch (e) {
      setError(String(e))
    } finally {
      setProgress(null)
    }
  }

  const exporting = progress !== null

  return (
    <div className={styles.wrap}>
      <button
        className={styles.btn}
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? `Exporting… ${progress}%` : `Export ZIP (${totalFrames} frames · 512×512)`}
      </button>

      {exporting && (
        <div className={styles.barTrack}>
          <div className={styles.barFill} style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <p className={styles.hint}>
        Transparent PNG sequence · {config.fps} fps · {config.duration}s loop
      </p>
    </div>
  )
}
