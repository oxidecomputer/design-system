/*
 * This Source Code Form is subject to the terms of the Apache License,
 * v. 2.0. If a copy of the license was not distributed with this file, you can
 * obtain one at https://github.com/ertdfgcvb/play.core/blob/master/LICENSE.
 *
 * Modified from https://github.com/ertdfgcvb/play.core
 * Copyright ertdfgcvb (Andreas Gysin)
 */
import { get2dContext } from './color.js'
import type { Metrics } from './types.js'

/**
 * Resolve once the element's font is actually usable for measurement.
 *
 * `document.fonts.ready` alone resolves before a face nothing has used yet
 * has started loading, so the element's face is requested explicitly first.
 * Even after that the font may still not be usable on Safari 13.x/14.0 — the
 * workaround is to wait three rAF ticks.
 * https://bugs.webkit.org/show_bug.cgi?id=217047
 */
export async function waitForFonts(
  el?: HTMLElement,
  fontWeight?: string | number
): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return
  if (el) {
    try {
      await document.fonts.load(fontShorthand(el, fontWeight))
    } catch {
      // An unparsable family: fonts.ready below still applies.
    }
  }
  await document.fonts.ready
  await new Promise<void>((resolve) => {
    let count = 3
    const tick = () => {
      if (--count > 0) requestAnimationFrame(tick)
      else resolve()
    }
    // rAF, not a sync call, so three real frames pass.
    requestAnimationFrame(tick)
  })
}

/** The CSS `font` shorthand the element (or the canvas renderer) draws with. */
export function fontShorthand(el: HTMLElement, fontWeight?: string | number): string {
  const s = getComputedStyle(el)
  return `${s.fontStyle || 'normal'} ${fontWeight ?? (s.fontWeight || 'normal')} ${s.fontSize} ${s.fontFamily}`
}

// Measurement block: averaging over many cells and lines captures the
// fractional pitch and rounding the layout actually produces.
const PROBE_COLS = 100
const PROBE_ROWS = 10

/**
 * Measure the cell width, line height, and aspect ratio of the element's
 * font. Assumes the CSS font-family is monospaced.
 */
export function calcMetrics(el: HTMLElement, fontWeight?: string | number): Metrics {
  const style = getComputedStyle(el)

  const fontFamily = style.getPropertyValue('font-family')
  const lineHeightStyle = style.getPropertyValue('line-height')
  const fontSize = Number.parseFloat(style.getPropertyValue('font-size'))
  // Fallback only: 'normal' is font dependent, 1.2 is the usual value.
  let lineHeight =
    Number.parseFloat(lineHeightStyle) || (fontSize > 0 ? fontSize : 16) * 1.2
  let cellWidth = 0

  if (el.nodeName === 'CANVAS') {
    const canvas = el as HTMLCanvasElement
    // Must match the renderer's context options — the first getContext call
    // on the canvas decides its color space
    const ctx = get2dContext(canvas)

    if (ctx) {
      // Must match the font string the canvas renderer draws with — measuring
      // at the default weight undersizes cells for wider bold faces.
      ctx.font =
        (fontWeight != null ? fontWeight + ' ' : '') + fontSize + 'px ' + fontFamily
      cellWidth = ctx.measureText('X'.repeat(50)).width / 50
    }
    // Whole-pixel rows: fractional ones leave seams between cell backgrounds.
    lineHeight = Math.max(1, Math.round(lineHeight))
  } else {
    // The pitch the layout produces, not the computed line-height (unreliable
    // for 'normal', and blind to rounding).
    const span = document.createElement('span')
    span.style.cssText =
      'display:inline-block;white-space:pre;position:absolute;visibility:hidden'
    span.textContent =
      ('X'.repeat(PROBE_COLS) + '\n').repeat(PROBE_ROWS - 1) + 'X'.repeat(PROBE_COLS)
    el.appendChild(span)
    const rect = span.getBoundingClientRect()
    el.removeChild(span)
    cellWidth = rect.width / PROBE_COLS
    if (rect.height > 0) lineHeight = rect.height / PROBE_ROWS
  }

  // display:none measures 0, which turns into NaN in grid/cursor math.
  if (!(cellWidth > 0)) {
    cellWidth = (fontSize > 0 ? fontSize : 16) * 0.6
  }

  return {
    aspect: cellWidth / lineHeight,
    cellWidth: cellWidth,
    lineHeight,
    fontFamily,
    fontSize,
  }
}
