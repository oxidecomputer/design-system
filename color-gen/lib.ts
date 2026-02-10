/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { formatHex } from 'culori'

import themesData from './themes.json'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Curve = (number | null)[]

export interface ColorEntry {
  name: string
  chromaScale?: number
}

export interface PaletteConfig {
  lightnessCurve: Curve
  chromaCurve: Curve
  hueShift: { darkEnd: number; lightEnd: number }
  colors: ColorEntry[]
}

export interface NeutralPaletteConfig {
  lightnessCurve: Curve
  chromaCurve: Curve
  hueShift: { darkEnd: number; lightEnd: number }
  baseHue: number
}

export interface GeneratedStep {
  step: number
  l: number
  c: number
  h: number
  oklch: string
  hex: string
  contrast: number
}

export interface GeneratedColor {
  name: string
  steps: GeneratedStep[]
}

// ---------------------------------------------------------------------------
// Data from JSON
// ---------------------------------------------------------------------------

export const bases = themesData.bases as unknown as Record<string, [number, number, number]>

export const palette: PaletteConfig = themesData.palette as unknown as PaletteConfig

export const neutralPalette: NeutralPaletteConfig =
  themesData.neutralPalette as unknown as NeutralPaletteConfig

export const backgrounds: Record<string, string> = themesData.backgrounds as Record<
  string,
  string
>

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

export const STEPS = [200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300]

export const BASE_INDEX = 6 // index of 800

export const NEUTRAL_STEPS = [
  0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200,
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const scaleCurve = (curve: Curve, factor: number): Curve =>
  curve.map((v) => (v === null ? null : v * factor))

/** Replace null sentinel values with linearly interpolated values from neighbors */
export function interpolateCurve(curve: Curve): number[] {
  const result: (number | null)[] = [...curve]
  const len = result.length

  // Find all defined (non-null) indices
  const defined: number[] = []
  for (let i = 0; i < len; i++) {
    if (result[i] !== null) defined.push(i)
  }

  if (defined.length === 0) return result.map(() => 0)
  if (defined.length === 1) {
    const val = result[defined[0]] as number
    return result.map(() => val)
  }

  for (let i = 0; i < len; i++) {
    if (result[i] !== null) continue

    // Find nearest defined neighbors
    let left = -1
    let right = -1
    for (const d of defined) {
      if (d < i) left = d
      if (d > i && right === -1) right = d
    }

    if (left === -1) {
      // Before the first defined point: extrapolate from first two defined
      const [a, b] = [defined[0], defined[1]]
      const slope = ((result[b] as number) - (result[a] as number)) / (b - a)
      result[i] = (result[a] as number) + slope * (i - a)
    } else if (right === -1) {
      // After the last defined point: extrapolate from last two defined
      const [a, b] = [defined[defined.length - 2], defined[defined.length - 1]]
      const slope = ((result[b] as number) - (result[a] as number)) / (b - a)
      result[i] = (result[b] as number) + slope * (i - b)
    } else {
      // Between two defined points: linear interpolation
      const t = (i - left) / (right - left)
      result[i] =
        (result[left] as number) +
        t * ((result[right] as number) - (result[left] as number))
    }
  }

  return result as number[]
}

function srgbRelativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

export function generateColor(
  colorEntry: ColorEntry,
  config: PaletteConfig,
  comparisonBg: string,
): GeneratedColor {
  const base = bases[colorEntry.name]
  if (!base) throw new Error(`Unknown base colour: ${colorEntry.name}`)

  const [baseL, baseC, baseH] = base

  const lCurve = interpolateCurve(config.lightnessCurve)
  const cCurve = interpolateCurve(
    colorEntry.chromaScale
      ? scaleCurve(config.chromaCurve, colorEntry.chromaScale)
      : config.chromaCurve,
  )
  const hShift = config.hueShift
  const bgLum = srgbRelativeLuminance(comparisonBg)

  const steps: GeneratedStep[] = STEPS.map((step, i) => {
    // Base step passes through unmodified
    if (i === BASE_INDEX) {
      const oklch = `oklch(${baseL.toFixed(3)} ${baseC.toFixed(4)} ${baseH.toFixed(1)})`
      const hex = formatHex({ mode: 'oklch', l: baseL, c: baseC, h: baseH }) || '#000000'
      const lum = srgbRelativeLuminance(hex)
      const contrast = contrastRatio(lum, bgLum)
      return { step, l: baseL, c: baseC, h: baseH, oklch, hex, contrast }
    }

    const l = lCurve[i]
    const c = baseC * cCurve[i]

    // Hue shift: interpolate from darkEnd/lightEnd to 0 at base
    let hueOffset: number
    if (i < BASE_INDEX) {
      // Dark side: darkEnd at index 0, lerps to 0 at base
      hueOffset = (hShift.darkEnd * (BASE_INDEX - i)) / BASE_INDEX
    } else {
      // Light side: lightEnd at last index, lerps to 0 at base
      const lightSteps = STEPS.length - 1 - BASE_INDEX
      hueOffset = (hShift.lightEnd * (i - BASE_INDEX)) / lightSteps
    }
    const h = baseH + hueOffset

    const oklch = `oklch(${l.toFixed(3)} ${c.toFixed(4)} ${h.toFixed(1)})`
    const hex = formatHex({ mode: 'oklch', l, c, h }) || '#000000'
    const lum = srgbRelativeLuminance(hex)
    const contrast = contrastRatio(lum, bgLum)

    return { step, l, c, h, oklch, hex, contrast }
  })

  return { name: colorEntry.name, steps }
}

// ---------------------------------------------------------------------------
// Neutral generator
// ---------------------------------------------------------------------------

export function generateNeutral(
  config: NeutralPaletteConfig,
  comparisonBg: string,
): GeneratedColor {
  const bgLum = srgbRelativeLuminance(comparisonBg)
  const midIndex = Math.floor((NEUTRAL_STEPS.length - 1) / 2)

  const lCurve = interpolateCurve(config.lightnessCurve)
  const cCurve = interpolateCurve(config.chromaCurve)

  const steps: GeneratedStep[] = NEUTRAL_STEPS.map((step, i) => {
    const l = lCurve[i]
    const c = cCurve[i]

    // Hue shift: interpolate from darkEnd/lightEnd to 0 at midpoint
    let hueOffset: number
    if (i < midIndex) {
      hueOffset = (config.hueShift.darkEnd * (midIndex - i)) / midIndex
    } else if (i > midIndex) {
      const lightSteps = NEUTRAL_STEPS.length - 1 - midIndex
      hueOffset = (config.hueShift.lightEnd * (i - midIndex)) / lightSteps
    } else {
      hueOffset = 0
    }
    const h = config.baseHue + hueOffset

    const oklch = `oklch(${l.toFixed(3)} ${c.toFixed(4)} ${h.toFixed(1)})`
    const hex = formatHex({ mode: 'oklch', l, c, h }) || '#000000'
    const lum = srgbRelativeLuminance(hex)
    const contrast = contrastRatio(lum, bgLum)

    return { step, l, c, h, oklch, hex, contrast }
  })

  return { name: 'neutral', steps }
}

// ---------------------------------------------------------------------------
// CSS output
// ---------------------------------------------------------------------------

export function buildCSS(generated: GeneratedColor[]): string {
  const vars = generated
    .flatMap((color) =>
      color.steps.map((s) => `  --color-${color.name}-${s.step}: ${s.oklch};`),
    )
    .join('\n')

  return `:root {\n${vars}\n}\n`
}
