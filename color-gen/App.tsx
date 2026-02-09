/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  backgrounds,
  BASE_INDEX,
  bases,
  generateColor,
  palette,
  STEPS,
  type GeneratedColor,
  type GeneratedStep,
  type PaletteConfig,
} from './lib'

const bgNames = Object.keys(backgrounds)

function clonePalette(p: PaletteConfig): PaletteConfig {
  return {
    lightnessCurve: [...p.lightnessCurve],
    chromaCurve: [...p.chromaCurve],
    hueShift: { ...p.hueShift },
    colors: p.colors.map((c) => ({ ...c })),
  }
}

const CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Suisse Intl", ui-sans, sans-serif;
    padding: 0;
    transition: background 0.2s, color 0.2s;
  }
  body.dark {
    background: #080F11;
    color: #fff;
  }
  body.light {
    background: #F5F5F5;
    color: #111;
  }
  .sticky-controls {
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 1px solid rgba(128,128,128,0.2);
  }
  body.dark .sticky-controls { background: #080F11; }
  body.light .sticky-controls { background: #F5F5F5; }
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
  }
  .toolbar-left, .toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .toolbar select, .toolbar button, .toolbar input[type="text"] {
    padding: 0.375rem 0.75rem;
    border-radius: 4px;
    border: 1px solid #555;
    background: #222;
    color: #fff;
    font-size: 0.8125rem;
    font-family: inherit;
    cursor: pointer;
  }
  .toolbar input[type="text"] {
    width: 5.5rem;
    font-variant-numeric: tabular-nums;
    cursor: text;
  }
  body.light .toolbar select,
  body.light .toolbar button,
  body.light .toolbar input[type="text"] {
    background: #fff;
    color: #111;
    border-color: #ccc;
  }
  .comparison-swatch-inline {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 3px;
    border: 1px solid #555;
    flex-shrink: 0;
  }
  .tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid rgba(128,128,128,0.2);
  }
  .tab {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: inherit;
    opacity: 0.5;
    cursor: pointer;
    transition: opacity 0.15s, border-color 0.15s;
  }
  .tab:hover { opacity: 0.75; }
  .tab.active {
    opacity: 1;
    border-bottom-color: currentColor;
  }
  .tab-panel {
    padding: 1rem;
  }
  .curve-section h3 {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.6;
    margin-bottom: 0.375rem;
  }
  .curve-editor {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 0;
    height: 6rem;
  }
  .curve-editor .curve-svg {
    position: absolute;
    inset: 0;
    top: 16px;
    bottom: 16px;
    pointer-events: none;
  }
  .curve-editor .curve-svg polyline {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    opacity: 0.25;
  }
  .curve-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    position: relative;
    z-index: 1;
  }
  .curve-col .curve-label {
    font-size: 0.5625rem;
    opacity: 0.45;
    flex-shrink: 0;
    height: 1rem;
    line-height: 1rem;
  }
  .curve-col .curve-slider-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
  }
  .curve-col input[type="range"] {
    writing-mode: vertical-lr;
    direction: rtl;
    appearance: slider-vertical;
    height: 100%;
    width: 1rem;
    accent-color: #888;
    margin: 0;
  }
  .curve-col .curve-val {
    font-size: 0.5625rem;
    font-variant-numeric: tabular-nums;
    opacity: 0.7;
    flex-shrink: 0;
    height: 1rem;
    line-height: 1rem;
  }
  .curve-col.disabled {
    opacity: 0.3;
    pointer-events: none;
  }
  .hue-row {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  .hue-row label {
    font-size: 0.6875rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
  .hue-row input[type="number"],
  .hue-row input[type="text"] {
    width: 4.5rem;
    padding: 0.25rem 0.375rem;
    border-radius: 3px;
    border: 1px solid #555;
    background: #222;
    color: #fff;
    font-size: 0.75rem;
    font-family: inherit;
    font-variant-numeric: tabular-nums;
  }
  body.light .hue-row input[type="number"],
  body.light .hue-row input[type="text"] {
    background: #fff;
    color: #111;
    border-color: #ccc;
  }

  .grid {
    display: flex;
    gap: 4px;
    padding: 1rem;
  }
  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .cell {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    font-size: 0.6875rem;
    min-height: 5rem;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
  }
  .cell strong { font-size: 0.875rem; margin-bottom: 0.25rem; }
  .values { opacity: 0.8; }
  .hex { opacity: 0.6; margin-top: 0.125rem; }
  .contrast { opacity: 0.7; margin-top: 0.25rem; font-weight: 600; }
  .toast {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.6); color: #fff;
    font-size: 0.75rem; font-weight: 600;
    opacity: 0; transition: opacity 0.15s;
    pointer-events: none;
    border-radius: 2px;
  }
  .toast.show { opacity: 1; }
`

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function CurveSliders({
  curve,
  fixedIndex,
  fixedValue,
  onChange,
}: {
  curve: number[]
  fixedIndex: number
  fixedValue: number
  onChange: (index: number, value: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: width, h: height - 32 })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Use fixedValue for the pinned index in both display and SVG
  const displayCurve = curve.map((v, i) => (i === fixedIndex ? fixedValue : v))

  // Build polyline points: x = center of each column, y = value mapped to height
  const colWidth = displayCurve.length > 0 ? size.w / displayCurve.length : 0
  const points = displayCurve
    .map((v, i) => {
      const x = colWidth * (i + 0.5)
      const y = size.h - v * size.h // 0 at bottom, 1 at top
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="curve-section">
      <div className="curve-editor" ref={containerRef}>
        {size.w > 0 && (
          <svg
            className="curve-svg"
            viewBox={`0 0 ${size.w} ${size.h}`}
            preserveAspectRatio="none"
          >
            <polyline points={points} />
          </svg>
        )}
        {displayCurve.map((v, i) => (
          <div key={i} className={`curve-col ${i === fixedIndex ? 'disabled' : ''}`}>
            <span className="curve-label">{STEPS[i]}</span>
            <div className="curve-slider-wrap">
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={v}
                onChange={(e) => onChange(i, parseFloat(e.target.value))}
                disabled={i === fixedIndex}
              />
            </div>
            <span className="curve-val">{v.toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ColorCell({ s, comparisonBg }: { s: GeneratedStep; comparisonBg: string }) {
  const textColor = s.l > 0.6 ? '#000' : '#fff'
  const [showToast, setShowToast] = useState(false)

  const handleClick = useCallback(async () => {
    await navigator.clipboard.writeText(s.oklch)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 600)
  }, [s.oklch])

  return (
    <div
      className="cell"
      style={{ background: s.oklch, color: textColor }}
      onClick={handleClick}
    >
      <strong>{s.step}</strong>
      <span className="values">L {s.l.toFixed(3)}</span>
      <span className="values">C {s.c.toFixed(4)}</span>
      <span className="values">H {s.h.toFixed(1)}</span>
      <span className="hex">{s.hex}</span>
      <span className="contrast">
        {s.contrast.toFixed(2)}:1 vs {comparisonBg}
      </span>
      <div className={`toast${showToast ? 'show' : ''}`}>Copied</div>
    </div>
  )
}

function ColorGrid({
  generated,
  comparisonBg,
}: {
  generated: GeneratedColor[]
  comparisonBg: string
}) {
  return (
    <div className="grid">
      {generated.map((color) => (
        <div className="column" key={color.name}>
          {color.steps.map((s) => (
            <ColorCell key={s.step} s={s} comparisonBg={comparisonBg} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [bgName, setBgName] = useState(bgNames[0])
  const [comparisonBg, setComparisonBg] = useState(backgrounds[bgNames[0]])
  const [config, setConfig] = useState<PaletteConfig>(() => clonePalette(palette))
  const [copyLabel, setCopyLabel] = useState('Copy JSON')
  const [activeTab, setActiveTab] = useState<'lightness' | 'chroma' | 'hue'>('lightness')

  const handleBgChange = useCallback((name: string) => {
    setBgName(name)
    setComparisonBg(backgrounds[name])
  }, [])

  const generated = config.colors.map((c) => generateColor(c, config, comparisonBg))

  // Average base lightness across all colors for the curve editor display
  const baseValues = config.colors.map((c) => bases[c.name])
  const avgBaseL = baseValues.reduce((sum, b) => sum + b[0], 0) / baseValues.length

  document.body.className = bgName

  const updateLightness = useCallback((i: number, v: number) => {
    setConfig((prev) => {
      const next = clonePalette(prev)
      next.lightnessCurve[i] = v
      return next
    })
  }, [])

  const updateChroma = useCallback((i: number, v: number) => {
    setConfig((prev) => {
      const next = clonePalette(prev)
      next.chromaCurve[i] = v
      return next
    })
  }, [])

  const updateHueShift = useCallback((field: 'darkEnd' | 'lightEnd', v: number) => {
    setConfig((prev) => {
      const next = clonePalette(prev)
      next.hueShift[field] = v
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    setConfig(clonePalette(palette))
    setBgName(bgNames[0])
    setComparisonBg(backgrounds[bgNames[0]])
  }, [])

  const handleCopy = useCallback(async () => {
    const serializePalette = (p: PaletteConfig) => {
      const { colors, ...curves } = p
      return {
        ...curves,
        colors: colors.map((c) =>
          c.chromaScale != null
            ? { name: c.name, chromaScale: c.chromaScale }
            : { name: c.name },
        ),
      }
    }

    const out = { bases, palette: serializePalette(config), backgrounds }
    await navigator.clipboard.writeText(JSON.stringify(out, null, 2))
    setCopyLabel('Copied!')
    setTimeout(() => setCopyLabel('Copy JSON'), 1200)
  }, [config])

  const tabs = [
    { id: 'lightness' as const, label: 'Lightness' },
    { id: 'chroma' as const, label: 'Chroma' },
    { id: 'hue' as const, label: 'Hue' },
  ]

  return (
    <>
      <style>{CSS}</style>
      <div className="sticky-controls">
        <div className="toolbar">
          <div className="toolbar-left">
            <select value={bgName} onChange={(e) => handleBgChange(e.target.value)}>
              {bgNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={comparisonBg}
              onChange={(e) => setComparisonBg(e.target.value)}
              title="Comparison background"
            />
            <div
              className="comparison-swatch-inline"
              style={{ background: comparisonBg }}
            />
          </div>
          <div className="toolbar-right">
            <button onClick={handleReset}>Reset</button>
            <button onClick={handleCopy}>{copyLabel}</button>
          </div>
        </div>
        <div className="tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="tab-panel">
          {activeTab === 'lightness' && (
            <CurveSliders
              curve={config.lightnessCurve}
              fixedIndex={BASE_INDEX}
              fixedValue={avgBaseL}
              onChange={updateLightness}
            />
          )}
          {activeTab === 'chroma' && (
            <CurveSliders
              curve={config.chromaCurve}
              fixedIndex={BASE_INDEX}
              fixedValue={1}
              onChange={updateChroma}
            />
          )}
          {activeTab === 'hue' && (
            <div className="curve-section">
              <div className="hue-row">
                <label>
                  Dark end
                  <input
                    type="number"
                    min={-60}
                    max={60}
                    step={0.5}
                    value={config.hueShift.darkEnd}
                    onChange={(e) =>
                      updateHueShift('darkEnd', parseFloat(e.target.value) || 0)
                    }
                  />
                </label>
                <label>
                  Light end
                  <input
                    type="number"
                    min={-60}
                    max={60}
                    step={0.5}
                    value={config.hueShift.lightEnd}
                    onChange={(e) =>
                      updateHueShift('lightEnd', parseFloat(e.target.value) || 0)
                    }
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <ColorGrid generated={generated} comparisonBg={comparisonBg} />
    </>
  )
}
