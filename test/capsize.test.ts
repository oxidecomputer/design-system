/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { capsize, FONT_METRICS } from '../components/src/capsize/index'
import { baselineOffset } from '../components/src/grid/index'

describe('capsize', () => {
  it('falls through untrimmed for an unknown family', () => {
    const r = capsize({ fontFamily: 'nope', fontSize: 16, lineHeight: 24 })
    expect(r.styles).toEqual({ fontSize: '16px', lineHeight: '24px' })
    expect(r.className).toBe('')
    expect(r.cssText).toBeUndefined()
  })

  it('emits the metric scales and trim rules for a known family', () => {
    const r = capsize({ fontFamily: 'suisse-intl', fontSize: 16, lineHeight: 24 })
    expect(r.className).toBe('capsize-suisse-intl-16')
    const styles = r.styles as Record<string, string>
    expect(styles['--ascent-scale']).toBe('0.986')
    expect(styles['--descent-scale']).toBe('0.311')
    expect(styles['--cap-height-scale']).toBe('0.725')
    expect(styles['--line-height-scale']).toBe('1.297')
    expect(styles['--line-height-offset']).toContain('- 24) / 2)')
    expect(r.cssText).toContain(`.${r.className}::before`)
    expect(r.cssText).toContain(`.${r.className}::after`)
  })

  it('accepts explicit metrics in place of a registry family', () => {
    const r = capsize({
      metrics: { capHeight: 700, ascent: 800, descent: -200, lineGap: 0, unitsPerEm: 1000 },
      fontSize: 16,
    })
    const styles = r.styles as Record<string, string>
    expect(styles['--ascent-scale']).toBe('0.8')
    expect(styles['--line-height-scale']).toBe('1')
  })

  it('bottom trim and baselineOffset are two halves of the same line box', () => {
    // The ::after trim removes (descentScale + lineGapScale/2 − halfLeading) em
    // below the baseline; what remains above is exactly baselineOffset.
    const m = FONT_METRICS['suisse-intl']
    const fontSize = 100
    const lineHeight = 130
    const lineHeightScale = (m.ascent + m.lineGap + Math.abs(m.descent)) / m.unitsPerEm
    const offsetEm = (lineHeightScale * fontSize - lineHeight) / 2 / fontSize
    const bottomTrimPx =
      (Math.abs(m.descent) / m.unitsPerEm + m.lineGap / 2 / m.unitsPerEm - offsetEm) *
      fontSize
    expect(baselineOffset(m, fontSize, lineHeight) + bottomTrimPx).toBeCloseTo(
      lineHeight,
      9,
    )
  })
})
