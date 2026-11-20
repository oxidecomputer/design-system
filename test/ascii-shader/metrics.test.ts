// @vitest-environment jsdom
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { afterEach, describe, expect, test, vi } from 'vitest'

import { calcMetrics } from '../src/metrics.js'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

function pre(style: string) {
  const el = document.createElement('pre')
  el.style.cssText = style
  document.body.appendChild(el)
  return el
}

describe('calcMetrics (DOM)', () => {
  test('uses the laid-out pitch of a 100×10 probe block, fractions included', () => {
    const el = pre('font-size: 16px; line-height: normal')
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 963,
      height: 187,
    } as DOMRect)
    const m = calcMetrics(el)
    expect(m.cellWidth).toBeCloseTo(9.63)
    expect(m.lineHeight).toBeCloseTo(18.7)
    expect(m.aspect).toBeCloseTo(9.63 / 18.7)
    // The probe is removed.
    expect(el.childNodes.length).toBe(0)
  })

  test('falls back to computed line-height (or 1.2em) without layout', () => {
    expect(calcMetrics(pre('font-size: 16px; line-height: 20px')).lineHeight).toBe(20)
    expect(calcMetrics(pre('font-size: 10px; line-height: normal')).lineHeight).toBe(12)
    expect(calcMetrics(pre('font-size: 10px')).cellWidth).toBe(6)
  })
})

describe('calcMetrics (canvas)', () => {
  test('rounds line height to whole pixels and measures at the draw weight', () => {
    const fonts: string[] = []
    const ctx = {
      set font(f: string) {
        fonts.push(f)
      },
      measureText: (s: string) => ({ width: s.length * 7.5 }),
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D
    )
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'font-size: 13px; line-height: 17.4px; font-family: mono'
    document.body.appendChild(canvas)

    const m = calcMetrics(canvas, 700)
    expect(m.lineHeight).toBe(17)
    expect(m.cellWidth).toBe(7.5)
    expect(fonts).toEqual(['700 13px mono'])
  })
})
