# Spark Animation Effects Generator — Implementation Plan

## Summary

React + TypeScript app using HTML5 Canvas 2D for a real-time spark particle animation generator.
Users can tweak parameters and export the animation as a ZIP of numbered 512×512 transparent PNGs.

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | React 18 + TypeScript (Vite scaffold) |
| Rendering | HTML5 Canvas 2D |
| ZIP export | `jszip` + `file-saver` |
| Styling | CSS Modules (no extra UI lib) |

---

## Project Structure

```
src/
├── engine/
│   ├── types.ts          # Particle, EmitterConfig, AnimationConfig interfaces
│   ├── SparkSystem.ts    # Particle emitter + update logic (pure TS, no React)
│   └── renderer.ts       # Canvas draw calls: particles, glow, trails
├── components/
│   ├── AnimationCanvas.tsx   # Canvas element + animation loop via requestAnimationFrame
│   ├── ControlPanel.tsx      # All sliders, pickers, selects
│   └── ExportButton.tsx      # Frame capture loop → JSZip → download
├── utils/
│   └── exportZip.ts      # Render N frames offscreen, pack into ZIP
├── App.tsx
├── App.module.css
├── main.tsx
└── index.css
```

---

## Controls

| Control | Type | Range / Options |
|---------|------|----------------|
| Speed | Slider | 0.1 – 3.0 |
| Loop Duration | Slider | 0.5 – 10 s |
| Frame Rate | Radio | 12 / 24 / 60 fps |
| Primary Color | Color picker | Any hue |
| Secondary Color | Color picker | Trail/fade color |
| Shape | Select | Circle, Star, Streak |
| Glow Intensity | Slider | 0 – 40 (canvas shadowBlur) |
| Flair | Slider | 0 – 1 (extra sparkle/shimmer/burst) |

---

## Spark Particle System (`SparkSystem.ts`)

Each particle stores:
- `x, y` — current position
- `vx, vy` — velocity (affected by speed + gravity + drag)
- `life` (0→1) — normalized age
- `maxLife` — seconds alive
- `size` — radius in px
- `color` — interpolated from primary → secondary based on `life`
- `trail` — array of past positions for motion-blur streak

Emitter fires new particles every frame from a configurable origin (default: canvas center).
Emission rate scales with `flair`.

---

## Renderer (`renderer.ts`)

- Clears canvas to transparent each frame (`clearRect`)
- Draws each particle:
  - Sets `ctx.shadowBlur` and `ctx.shadowColor` for glow
  - **Circle**: `arc()` fill
  - **Star**: 5-point polygon path
  - **Streak**: line from trail head to tail, width tapers with life
- Flair > 0.5 adds secondary micro-sparkles

---

## Export Flow (`exportZip.ts`)

1. Compute total frame count = `Math.ceil(fps × duration)`
2. Create an offscreen `OffscreenCanvas` (512×512)
3. Reset `SparkSystem` to t=0; step through each frame
4. Capture each frame via `canvas.toBlob('image/png')` (preserves alpha)
5. Add to `JSZip` as `frame_001.png`, `frame_002.png`, …
6. `zip.generateAsync({ type: 'blob' })` → `saveAs(blob, 'sparks.zip')`

Export progress shown with a simple progress bar in `ExportButton`.

---

## Rendering Loop (`AnimationCanvas.tsx`)

- `useRef` for canvas element
- `useEffect` starts `requestAnimationFrame` loop
- On each tick: advance `SparkSystem` by `dt`, call `renderer.draw(ctx, particles, config)`
- Config changes via `props` trigger system reset

---

## Git Branch

Branch: `claude/animation-effects-generator-PiqNE`
