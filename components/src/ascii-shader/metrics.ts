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
 * Even after `document.fonts.ready` the font may still not be loaded on
 * Safari 13.x/14.0 — the workaround is to wait three rAF ticks.
 * https://bugs.webkit.org/show_bug.cgi?id=217047
 */
export function waitForFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve()
  return document.fonts.ready.then(
    () =>
      new Promise<void>((resolve) => {
        let count = 3
        const tick = () => {
          if (--count > 0) requestAnimationFrame(tick)
          else resolve()
        }
        // rAF, not a sync call, so three real frames pass.
        requestAnimationFrame(tick)
      })
  )
}

/**
 * Measure the cell width, line height, and aspect ratio of the element's
 * font. Assumes the CSS font-family is monospaced.
 */
export function calcMetrics(el: HTMLElement, fontWeight?: string | number): Metrics {
  const style = getComputedStyle(el)

  const fontFamily = style.getPropertyValue('font-family')
  const lineHeightStyle = style.getPropertyValue('line-height')
  const fontSize = Number.parseFloat(style.getPropertyValue('font-size'))
  const lineHeight =
    lineHeightStyle === 'normal' ? fontSize * 1.2 : Number.parseFloat(lineHeightStyle)
  let cellWidth

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
      cellWidth = ctx.measureText(''.padEnd(50, 'X')).width / 50
    } else {
      cellWidth = fontSize * 0.6 // fallback
    }
  } else {
    const span = document.createElement('span')
    el.appendChild(span)
    span.innerHTML = ''.padEnd(50, 'X')
    cellWidth = span.getBoundingClientRect().width / 50
    el.removeChild(span)
  }

  // display:none measures 0, which turns into NaN in grid/cursor math.
  if (!(cellWidth > 0)) {
    cellWidth = (fontSize > 0 ? fontSize : 16) * 0.6
  }

  return {
    aspect: cellWidth / lineHeight,
    cellWidth,
    lineHeight,
    fontFamily,
    fontSize,
  }
}
