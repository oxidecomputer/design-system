/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useMemo } from 'react'

import type { FontMetrics } from '../grid'

// Capsize-style leading trim: ::before/::after pseudo-elements pull the space
// above the cap height and below the baseline out of the first and last line,
// so the element's box runs exactly from cap top to baseline. Anchoring the
// trimmed box's bottom edge to a grid row therefore seats the baseline on the
// grid — pair with snapLineHeight from @oxide/design-system/grid.

// Grid FontMetrics plus the cap height, which the top trim needs.
// Generate values on https://seek-oss.github.io/capsize/
export interface CapsizeFontMetrics extends FontMetrics {
  capHeight: number
}

export const FONT_METRICS: Record<string, CapsizeFontMetrics> = {
  'suisse-intl': {
    capHeight: 725,
    ascent: 986,
    descent: -311,
    lineGap: 0,
    unitsPerEm: 1000,
  },
}

export interface CapsizeOptions {
  // Key into FONT_METRICS; ignored when metrics is given. Unknown families
  // fall through with untrimmed font-size/line-height styles.
  fontFamily?: string
  metrics?: CapsizeFontMetrics
  fontSize: number | string
  lineHeight?: number | string
  rootSize?: number
}

export interface CapsizeResult {
  styles: React.CSSProperties
  className: string
  // Rules for the trim pseudo-elements; useCapsize injects these, non-React
  // consumers add them to a stylesheet themselves.
  cssText?: string
}

function isRelativeValue(value: string) {
  const isPercentValue = value.endsWith('%')
  const isUnitlessValue = /\d$/.test(value)
  return isPercentValue || isUnitlessValue
}

function getRelativeValue(value: string) {
  const isPercentValue = value.endsWith('%')
  return isPercentValue
    ? Number.parseInt(value.replace('%', ''), 10) / 100
    : Number.parseFloat(value)
}

function normalizeValue(value: string | number, root: number, fs?: number): number {
  if (typeof value === 'number') return value

  if (value.endsWith('px')) return Number.parseFloat(value.replace('px', ''))
  if (value.endsWith('rem')) return root * Number.parseFloat(value.replace('rem', ''))

  if (isRelativeValue(value) && fs !== undefined) {
    return fs * getRelativeValue(value)
  }

  return Number.parseInt(value, 10)
}

function round(value: number): string {
  return Number.parseFloat(value.toFixed(4)).toString()
}

// With a fixed line height the em box is centred in the line box; this is the
// resulting half leading in em, which both trims subtract.
function lineHeightProperties(
  lineHeight?: string | number,
  rootSize = 16,
  fontSizePx?: number,
) {
  if (lineHeight === undefined) return {}

  const lineHeightStr = typeof lineHeight === 'number' ? `${lineHeight}px` : lineHeight

  const lineHeightActual = isRelativeValue(lineHeightStr)
    ? `calc(${getRelativeValue(lineHeightStr).toString()} * var(--font-size-px))`
    : normalizeValue(lineHeightStr, rootSize, fontSizePx).toString()

  return {
    '--line-height-offset': `calc((((var(--line-height-scale) * var(--font-size-px)) - ${lineHeightActual}) / 2) / var(--font-size-px))`,
  }
}

// The pure computation behind useCapsize.
export function capsize({
  fontFamily = 'sans',
  metrics,
  fontSize,
  lineHeight,
  rootSize = 16,
}: CapsizeOptions): CapsizeResult {
  const fontMetrics = metrics || FONT_METRICS[fontFamily]

  if (!fontMetrics) {
    return {
      styles: {
        fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
        lineHeight: typeof lineHeight === 'number' ? `${lineHeight}px` : lineHeight,
      },
      className: '',
    }
  }

  const { ascent, descent, lineGap, unitsPerEm, capHeight } = fontMetrics

  const ascentScale = ascent / unitsPerEm
  const descentScale = Math.abs(descent) / unitsPerEm
  const capHeightScale = capHeight / unitsPerEm
  const lineGapScale = lineGap / unitsPerEm
  const lineHeightScale = (ascent + lineGap + Math.abs(descent)) / unitsPerEm

  const fontSizeActual = normalizeValue(fontSize, rootSize)

  const lineHeightProps = lineHeightProperties(lineHeight, rootSize, fontSizeActual)

  const fontSizeKey = typeof fontSize === 'number' ? fontSize : fontSizeActual
  const className = `capsize-${fontFamily}-${Math.round(fontSizeKey)}`

  const styles = {
    fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
    lineHeight: typeof lineHeight === 'number' ? `${lineHeight}px` : lineHeight,
    '--font-size-px': String(fontSizeActual),
    '--ascent-scale': round(ascentScale),
    '--descent-scale': round(descentScale),
    '--cap-height-scale': round(capHeightScale),
    '--line-gap-scale': round(lineGapScale),
    '--line-height-scale': round(lineHeightScale),
    ...lineHeightProps,
  }

  return {
    styles,
    className,
    cssText: `
      .${className}::before {
        display: table;
        content: "";
        margin-bottom: calc(((var(--ascent-scale) - var(--cap-height-scale) + var(--line-gap-scale) / 2) - var(--line-height-offset)) * -1em);
      }
      .${className}::after {
        display: table;
        content: "";
        margin-top: calc(((var(--descent-scale) + var(--line-gap-scale) / 2) - var(--line-height-offset)) * -1em);
      }
    `,
  }
}

export const useCapsize = (options: CapsizeOptions): CapsizeResult => {
  const { fontFamily = 'sans', metrics, fontSize, lineHeight, rootSize = 16 } = options

  const result = useMemo(
    () => capsize({ fontFamily, metrics, fontSize, lineHeight, rootSize }),
    [fontFamily, metrics, fontSize, lineHeight, rootSize],
  )

  // Inject CSS for the trim pseudo-elements, one shared style tag, one rule
  // per class.
  useEffect(() => {
    if (!result.cssText) return

    const styleId = 'capsize-styles'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    if (!styleElement.textContent?.includes(result.className)) {
      styleElement.textContent += result.cssText
    }
  }, [result.cssText, result.className])

  return {
    styles: result.styles,
    className: result.className,
  }
}
