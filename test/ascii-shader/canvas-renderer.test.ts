// @vitest-environment jsdom
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { afterEach, describe, expect, test, vi } from 'vitest'

import { createCanvasRenderer } from '../../components/src/ascii-shader/renderers/canvas'
import type {
  Cell,
  Context,
  Metrics,
  ResolvedSettings,
} from '../../components/src/ascii-shader/types'

afterEach(() => {
  vi.restoreAllMocks()
})

/** A 2d context that records the calls the renderer makes. */
function fakeContext(fontBox?: { ascent: number; descent: number }) {
  const calls: { op: string; args: unknown[] }[] = []
  const record =
    (op: string) =>
    (...args: unknown[]) =>
      calls.push({ op, args })
  const ctx = {
    fillStyle: '',
    font: '',
    textBaseline: '',
    save: record('save'),
    restore: record('restore'),
    scale: record('scale'),
    clearRect: record('clearRect'),
    fillRect: record('fillRect'),
    fillText: (...args: unknown[]) =>
      calls.push({ op: 'fillText', args: [...args, ctx.textBaseline] }),
    measureText: () =>
      fontBox
        ? {
            width: 8,
            fontBoundingBoxAscent: fontBox.ascent,
            fontBoundingBoxDescent: fontBox.descent,
          }
        : { width: 8 },
  }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  )
  return calls
}

function renderOnce(cells: Cell[], cols: number, rows: number) {
  const element = document.createElement('canvas')
  const metrics: Metrics = {
    cellWidth: 7.3,
    lineHeight: 20,
    aspect: 7.3 / 20,
    fontFamily: 'mono',
    fontSize: 16,
  }
  const settings = { element, fps: 30, loop: true, autoplay: true, reducedMotion: false }
  const context = {
    frame: 0,
    time: 0,
    cols,
    rows,
    metrics,
    width: 0,
    height: 0,
    settings: settings as ResolvedSettings,
    runtime: { fps: 0 },
  } satisfies Context
  createCanvasRenderer().render(context, cells)
}

describe('canvas renderer', () => {
  test('centers the font box in the line, as the DOM does', () => {
    const calls = fakeContext({ ascent: 12, descent: 4 })
    renderOnce([{ char: 'A' }], 1, 1)
    const text = calls.find((c) => c.op === 'fillText')!
    // (20 - 12 - 4) / 2 + 12 = 14 below the line top, on the alphabetic baseline.
    expect(text.args).toEqual(['A', 0, 14, 'alphabetic'])
  })

  test('falls back to a middle baseline without font bounding-box metrics', () => {
    const calls = fakeContext()
    renderOnce([{ char: 'A' }], 1, 1)
    expect(calls.find((c) => c.op === 'fillText')!.args).toEqual(['A', 0, 10, 'middle'])
  })

  test('snaps cell backgrounds to whole pixels so neighbours meet', () => {
    const calls = fakeContext({ ascent: 12, descent: 4 })
    renderOnce(
      [
        { char: ' ', backgroundColor: 'red' },
        { char: ' ', backgroundColor: 'red' },
        { char: ' ', backgroundColor: 'red' },
      ],
      3,
      1,
    )
    const rects = calls.filter((c) => c.op === 'fillRect').map((c) => c.args)
    expect(rects).toEqual([
      [0, 0, 8, 20],
      [7, 0, 8, 20],
      [15, 0, 8, 20],
    ])
  })
})
