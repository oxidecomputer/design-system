/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { formatHex } from 'culori'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A curve is an array of numbers, one per step. */
type Curve = number[]

/** Scale every value in a curve by a factor */
const scaleCurve = (curve: Curve, factor: number): Curve => curve.map((v) => v * factor)

/** Shift every value in a curve by an amount */
// const shiftCurve = (curve: Curve, amount: number): Curve => curve.map((v) => v + amount)

interface ColorDefinition {
  name: string
  /** Base colour in OKLCH – [lightness, chroma, hue] */
  base: [number, number, number]
  /** Which step the base colour sits at (e.g. 800) */
  basePosition: number
  /** Optional overrides for shared curves */
  lightnessCurve?: Curve
  chromaCurve?: Curve
  hueCurve?: { start: number; end: number }
}

interface GeneratedStep {
  step: number
  l: number
  c: number
  h: number
  oklch: string
  hex: string
}

interface GeneratedColor {
  name: string
  steps: GeneratedStep[]
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

const STEPS = [200, 300, 400, 500, 600, 700, 800, 900]

// ---------------------------------------------------------------------------
// Curves
// ---------------------------------------------------------------------------

// Shared lightness values per step (absolute, same for all colours)
//                          100    200      300      400      600      700    800    900
const lightnessCurve: Curve = [0.24, 0.3078, 0.3791, 0.4741, 0.5631, 0.67, 0, 0.9016]
// Note: 800 is 0 as a placeholder — it gets replaced by the base L

// Chroma multiplier curve — 1.0 at base, scales chroma relative to base C
//                             100    200    300    400    600    700   800   900
const chromaCurve: Curve = [0.376, 0.489, 0.609, 0.772, 0.893, 0.954, 1.0, 0.49]

// Hue shift range — interpolated linearly across steps
// Darker steps (100) shift by hueShiftStart, lighter steps (900) shift by hueShiftEnd
const hueShiftStart = 20 // coolest at darkest
const hueShiftEnd = 0 // no shift at lightest

// ---------------------------------------------------------------------------
// Colour definitions
// ---------------------------------------------------------------------------

const colors: ColorDefinition[] = [
  { name: 'green', base: [0.7702, 0.1919, 163.69], basePosition: 800 },
  {
    name: 'blue',
    base: [0.71, 0.15, 272],
    basePosition: 800,
  },
  {
    name: 'purple',
    base: [0.74, 0.175, 305.395],
    basePosition: 800,
    chromaCurve: scaleCurve(chromaCurve, 0.85),
  },
  {
    name: 'red',
    base: [0.712, 0.185, 11.344],
    basePosition: 800,
    chromaCurve: scaleCurve(chromaCurve, 0.9),
  },
  { name: 'yellow', base: [0.837, 0.14, 75], basePosition: 800 },
]

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

function generateColor(def: ColorDefinition): GeneratedColor {
  const [baseL, baseC, baseH] = def.base
  const firstStep = STEPS[0]
  const lastStep = STEPS[STEPS.length - 1]
  const baseIndex = STEPS.indexOf(def.basePosition)

  const lCurve = def.lightnessCurve ?? lightnessCurve
  const cCurve = def.chromaCurve ?? chromaCurve
  const hShift = def.hueCurve ?? { start: hueShiftStart, end: hueShiftEnd }

  const steps: GeneratedStep[] = STEPS.map((step, i) => {
    const l = i === baseIndex ? baseL : lCurve[i]
    const c = baseC * cCurve[i]
    const t = (step - firstStep) / (lastStep - firstStep)
    const hueOffset = hShift.start + t * (hShift.end - hShift.start)
    const h = baseH + hueOffset

    const oklch = `oklch(${l.toFixed(3)} ${c.toFixed(4)} ${h.toFixed(1)})`
    const hex = formatHex({ mode: 'oklch', l, c, h }) || '#000000'

    return { step, l, c, h, oklch, hex }
  })

  return { name: def.name, steps }
}

// ---------------------------------------------------------------------------
// CSS output
// ---------------------------------------------------------------------------

function buildCSS(generated: GeneratedColor[]): string {
  const vars = generated
    .flatMap((color) =>
      color.steps.map((s) => `  --color-${color.name}-${s.step}: ${s.oklch};`),
    )
    .join('\n')

  return `:root {\n${vars}\n}\n`
}

// ---------------------------------------------------------------------------
// HTML output (JSX)
// ---------------------------------------------------------------------------

const CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
  font-family: "Suisse Intl", ui-sans, sans-serif;
    background: #080F11;
    color: #fff;
    padding: 2rem;
  }
  h1 { margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 500; }
  .grid {
    display: flex;
    gap: 4px;
  }
  .column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .header {
    padding: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
    font-size: 0.8125rem;
    border-bottom: 1px solid #333;
  }
  .cell {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    font-size: 0.6875rem;
    min-height: 5rem;
    border-radius: 2px;
  }
  .cell { cursor: pointer; position: relative; }
  .cell strong { font-size: 0.875rem; margin-bottom: 0.25rem; }
  .values { opacity: 0.8; }
  .hex { opacity: 0.6; margin-top: 0.125rem; }
  .toast {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.6); color: #fff;
    font-size: 0.75rem; font-weight: 600;
    opacity: 0; transition: opacity 0.15s;
    pointer-events: none;
  }
  .toast.show { opacity: 1; }
`

function clientScript(colorData: string) {
  return `
    const COLOR_DATA = ${colorData}

    // Click to copy
    document.querySelectorAll('.cell').forEach(cell => {
      cell.addEventListener('click', async () => {
        const oklch = cell.dataset.oklch
        await navigator.clipboard.writeText(oklch)
        const toast = cell.querySelector('.toast')
        toast.classList.add('show')
        setTimeout(() => toast.classList.remove('show'), 600)
      })
    })
  `
}

function ColorCell({ s }: { s: GeneratedStep }) {
  return (
    <div
      className="cell"
      style={{ background: s.oklch, color: s.l > 0.6 ? '#000' : '#fff' }}
      data-oklch={s.oklch}
    >
      <strong>{s.step}</strong>
      <span className="values">L {s.l.toFixed(3)}</span>
      <span className="values">C {s.c.toFixed(4)}</span>
      <span className="values">H {s.h.toFixed(1)}</span>
      <span className="hex">{s.hex}</span>
      <div className="toast">Copied</div>
    </div>
  )
}

function ColorGrid({ generated }: { generated: GeneratedColor[] }) {
  return (
    <div className="grid">
      {generated.map((color) => (
        <div className="column" key={color.name}>
          {color.steps.map((s) => (
            <ColorCell key={s.step} s={s} />
          ))}
        </div>
      ))}
    </div>
  )
}

function ColorGenPage({ generated }: { generated: GeneratedColor[] }) {
  const colorData = JSON.stringify(
    generated.map((c) => ({
      name: c.name,
      steps: c.steps.map((s) => ({ step: s.step, oklch: s.oklch })),
    })),
  )

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Colour Generator</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <ColorGrid generated={generated} />
        <script dangerouslySetInnerHTML={{ __html: clientScript(colorData) }} />
      </body>
    </html>
  )
}

function buildHTML(generated: GeneratedColor[]): string {
  return '<!DOCTYPE html>\n' + renderToStaticMarkup(<ColorGenPage generated={generated} />)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const generated = colors.map(generateColor)

const css = buildCSS(generated)
const cssPath = resolve(import.meta.dirname!, 'color-gen.css')
writeFileSync(cssPath, css, 'utf-8')
console.log(`Written to ${cssPath}`)

const html = buildHTML(generated)
const htmlPath = resolve(import.meta.dirname!, 'color-gen.html')
writeFileSync(htmlPath, html, 'utf-8')
console.log(`Written to ${htmlPath}`)
