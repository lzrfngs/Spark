import { useState, useCallback } from 'react'
import { AnimationConfig } from './engine/types'
import { AnimationCanvas } from './components/AnimationCanvas'
import { ControlPanel } from './components/ControlPanel'
import { ExportButton } from './components/ExportButton'
import styles from './App.module.css'

const DEFAULT_CONFIG: AnimationConfig = {
  speed: 1.2,
  duration: 2.5,
  fps: 24,
  primaryColor: '#ffdd44',
  secondaryColor: '#ff6600',
  shape: 'star',
  glow: 22,
  flair: 0.55,
}

export default function App() {
  const [config, setConfig] = useState<AnimationConfig>(DEFAULT_CONFIG)

  const handleChange = useCallback((next: AnimationConfig) => {
    setConfig(next)
  }, [])

  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        <span className={styles.logo}>✦ SPARK</span>
        <span className={styles.sub}>Anime FX Generator</span>
      </header>

      {/* Main layout */}
      <main className={styles.main}>
        {/* Canvas area */}
        <section className={styles.canvasArea}>
          <div className={styles.canvasWrap}>
            <AnimationCanvas config={config} size={512} />
          </div>
          <div className={styles.exportWrap}>
            <ExportButton config={config} />
          </div>
        </section>

        {/* Controls */}
        <aside className={styles.sidebar}>
          <ControlPanel config={config} onChange={handleChange} />
        </aside>
      </main>
    </div>
  )
}
