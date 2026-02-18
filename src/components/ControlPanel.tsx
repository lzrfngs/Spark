import { AnimationConfig, ParticleShape } from '../engine/types'
import styles from './ControlPanel.module.css'

interface Props {
  config: AnimationConfig
  onChange: (next: AnimationConfig) => void
}

function set<K extends keyof AnimationConfig>(
  config: AnimationConfig,
  key: K,
  value: AnimationConfig[K]
): AnimationConfig {
  return { ...config, [key]: value }
}

export function ControlPanel({ config, onChange }: Props) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Controls</h2>

      {/* Speed */}
      <label className={styles.row}>
        <span className={styles.label}>
          Speed <em>{config.speed.toFixed(1)}×</em>
        </span>
        <input
          type="range"
          min={0.1}
          max={3.0}
          step={0.1}
          value={config.speed}
          onChange={(e) => onChange(set(config, 'speed', parseFloat(e.target.value)))}
        />
      </label>

      {/* Duration */}
      <label className={styles.row}>
        <span className={styles.label}>
          Duration <em>{config.duration.toFixed(1)}s</em>
        </span>
        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={config.duration}
          onChange={(e) => onChange(set(config, 'duration', parseFloat(e.target.value)))}
        />
      </label>

      {/* FPS */}
      <div className={styles.row}>
        <span className={styles.label}>Frame Rate</span>
        <div className={styles.radioGroup}>
          {([12, 24, 60] as const).map((f) => (
            <label key={f} className={styles.radioLabel}>
              <input
                type="radio"
                name="fps"
                value={f}
                checked={config.fps === f}
                onChange={() => onChange(set(config, 'fps', f))}
              />
              {f} fps
            </label>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className={styles.row}>
        <span className={styles.label}>Primary Color</span>
        <input
          type="color"
          value={config.primaryColor}
          className={styles.colorInput}
          onChange={(e) => onChange(set(config, 'primaryColor', e.target.value))}
        />
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Secondary Color</span>
        <input
          type="color"
          value={config.secondaryColor}
          className={styles.colorInput}
          onChange={(e) => onChange(set(config, 'secondaryColor', e.target.value))}
        />
      </div>

      {/* Shape */}
      <div className={styles.row}>
        <span className={styles.label}>Shape</span>
        <select
          className={styles.select}
          value={config.shape}
          onChange={(e) => onChange(set(config, 'shape', e.target.value as ParticleShape))}
        >
          <option value="circle">Circle</option>
          <option value="star">Star ✦</option>
          <option value="streak">Streak</option>
        </select>
      </div>

      {/* Glow */}
      <label className={styles.row}>
        <span className={styles.label}>
          Glow <em>{config.glow}</em>
        </span>
        <input
          type="range"
          min={0}
          max={40}
          step={1}
          value={config.glow}
          onChange={(e) => onChange(set(config, 'glow', parseInt(e.target.value, 10)))}
        />
      </label>

      {/* Flair */}
      <label className={styles.row}>
        <span className={styles.label}>
          Flair <em>{config.flair.toFixed(2)}</em>
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={config.flair}
          onChange={(e) => onChange(set(config, 'flair', parseFloat(e.target.value)))}
        />
      </label>
    </div>
  )
}
