/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import {
  baselineOffset,
  cellLadder,
  COLUMNS_WEIGHT,
  computeGrid,
  gridLineSegments,
  GUTTER_WEIGHT,
  pickCellOption,
  snapLineHeight,
  snapUnit,
  SOLVE_MAX_COLUMN,
  SOLVE_MAX_GUTTER,
  SOLVE_MAX_MARGIN,
  solveMultiples,
  type GridSpec,
} from '../components/src/grid/index'

const manual = (overrides: Partial<GridSpec> = {}): GridSpec => ({
  mode: 'manual',
  columns: 12,
  width: 1920,
  height: 1080,
  marginCells: 3,
  gutterCells: 1,
  targetCellColumns: 89,
  ...overrides,
})

const auto = (overrides: Partial<GridSpec> = {}): GridSpec => ({
  mode: 'auto',
  columns: 12,
  width: 1920,
  height: 1080,
  targetMarginPx: 50,
  targetGutterPx: 20,
  targetCellColumns: 89,
  ...overrides,
})

// An independent check of the solver: the exhaustive minimum of the same
// objective, written from the definition rather than the implementation.
function bruteForceSolve(
  W: number,
  c: number,
  targetMargin: number,
  targetGutter: number,
  targetN: number,
  pixelSnap: boolean,
  snapTolPx: number,
) {
  const relErr = (got: number, want: number) => Math.abs(got - want) / Math.max(1, want)
  let best: { m: number; k: number; g: number; N: number; err: number } | null = null
  for (let g = 1; g <= SOLVE_MAX_GUTTER; g++) {
    for (let m = 0; m <= SOLVE_MAX_MARGIN; m++) {
      for (let k = 1; k <= SOLVE_MAX_COLUMN; k++) {
        const N = 2 * m + c * k + (c - 1) * g
        const u = snapUnit(W / N, pixelSnap, snapTolPx)
        const err =
          GUTTER_WEIGHT * relErr(g * u, targetGutter) +
          COLUMNS_WEIGHT * relErr(N, targetN) +
          relErr(m * u + (W - N * u) / 2, targetMargin)
        if (!best || err < best.err - 1e-6 || (err < best.err + 1e-6 && N < best.N)) {
          best = { m, k, g, N, err }
        }
      }
    }
  }
  return best!
}

describe('snapUnit', () => {
  it('returns the value untouched when pixel snap is off', () => {
    expect(snapUnit(21.573, false, 0.5)).toBe(21.573)
  })

  it('snaps within tolerance, including exactly on it', () => {
    expect(snapUnit(21.5, true, 0.5)).toBe(22)
    expect(snapUnit(21.9, true, 0.5)).toBe(22)
    expect(snapUnit(21.7, true, 0.1)).toBe(21.7)
  })

  it('never snaps below 1', () => {
    expect(snapUnit(0.6, true, 0.5)).toBe(1)
  })
})

describe('solveMultiples', () => {
  it('matches an exhaustive brute-force search of the objective', () => {
    const cases: Array<[number, number, number, number, number, boolean, number]> = [
      [1920, 12, 50, 20, 89, false, 0.5],
      [1920, 12, 50, 20, 89, true, 0.5],
      [1440, 6, 32, 16, 120, false, 0.5],
      [1024, 4, 80, 24, 60, true, 0.25],
      [3840, 16, 100, 40, 200, true, 0.5],
    ]
    for (const [W, c, tm, tg, tn, snap, tol] of cases) {
      const got = solveMultiples(W, c, tm, tg, tn, snap, tol)
      const want = bruteForceSolve(W, c, tm, tg, tn, snap, tol)
      expect({ m: got.m, k: got.k, g: got.g }).toEqual({
        m: want.m,
        k: want.k,
        g: want.g,
      })
    }
  })

  it('prioritises column count over gutter, and gutter over margin', () => {
    const s = solveMultiples(1920, 12, 50, 20, 89, false, 0.5)
    // The default targets are an exact rung: 89 = 2·3 + 12·6 + 11·1.
    expect(s.N).toBe(89)
    expect(s).toMatchObject({ m: 3, k: 6, g: 1 })
  })
})

describe('cellLadder / pickCellOption', () => {
  it('is ascending in u, unique per rounded cell size, and above the minimum', () => {
    const ladder = cellLadder(1920, 12, 3, 1, true, 0.5)
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i].u).toBeGreaterThan(ladder[i - 1].u)
    }
    const keys = ladder.map((o) => Math.round(o.u * 100) / 100)
    expect(new Set(keys).size).toBe(keys.length)
    for (const o of ladder) expect(o.u).toBeGreaterThanOrEqual(2)
  })

  it('rungs step by the column count', () => {
    const ladder = cellLadder(1920, 12, 3, 1, false, 0.5)
    const ns = ladder.map((o) => o.N).sort((a, b) => a - b)
    for (let i = 1; i < ns.length; i++) {
      expect((ns[i] - ns[i - 1]) % 12).toBe(0)
    }
  })

  it('picks the nearest rung, preferring fewer columns on a tie', () => {
    const ladder = cellLadder(1920, 12, 3, 1, false, 0.5)
    const exact = pickCellOption(ladder, 89)
    expect(exact?.N).toBe(89)
    // 89 and 101 are adjacent rungs; 95 is equidistant between them.
    const tied = pickCellOption(ladder, 95)
    expect(tied?.N).toBe(89)
  })
})

describe('computeGrid', () => {
  it('keeps the core identity N = 2m + ck + (c−1)g and fills the width', () => {
    for (const spec of [manual(), auto(), manual({ pixelSnap: true })]) {
      const g = computeGrid(spec)
      expect(g.N).toBe(
        2 * g.solvedM + spec.columns * g.solvedK + (spec.columns - 1) * g.solvedG,
      )
      expect(g.N * g.u + g.hRemainder).toBeCloseTo(spec.width, 9)
      expect(g.effectiveMargin).toBeCloseTo(g.margin + g.hRemainder / 2, 9)
    }
  })

  it('defaults give k=6, N=89 and 25 rows at 1920×1080', () => {
    const g = computeGrid(manual())
    expect(g.solvedK).toBe(6)
    expect(g.N).toBe(89)
    expect(g.rows).toBe(25)
    expect(g.u).toBeCloseTo(1920 / 89, 9)
    expect(g.cellColumnsTaken).toBe(89)
    expect(g.solved).toBe(false)
  })

  it('re-snaps the manual request by count across a margin change', () => {
    const g = computeGrid(manual({ marginCells: 6, targetCellColumns: 89 }))
    // 89 is not a rung with m=6; the nearest reachable count is taken.
    expect(g.cellLadder).toContain(g.cellColumnsTaken)
    expect(Math.abs(g.cellColumnsTaken - 89)).toBeLessThanOrEqual(6)
  })

  it('auto mode reports the solver result and an empty ladder', () => {
    const g = computeGrid(auto())
    expect(g.solved).toBe(true)
    expect(g.cellLadder).toEqual([])
    expect(g.cellColumnsTaken).toBe(g.N)
    expect(g.gutterWidth).toBeCloseTo(g.solvedG * g.u, 9)
  })

  it('with snapRows the rows fill the height; without, the last row overhangs', () => {
    const snapped = computeGrid(manual({ snapRows: true }))
    expect(snapped.rows * snapped.cellH + snapped.vRemainder).toBeCloseTo(1080, 9)
    expect(snapped.rowOffset).toBeCloseTo(snapped.vRemainder / 2, 9)

    const exact = computeGrid(manual({ snapRows: false, cellAspect: 2 }))
    expect(exact.cellH).toBeCloseTo(2 * exact.u, 9)
    expect(exact.rows * exact.cellH).toBeGreaterThanOrEqual(1080 - 1e-9)
  })

  it('pixel snap with aspect tolerance finds an integer row height', () => {
    const g = computeGrid(manual({ pixelSnap: true, aspectTolerancePct: 5 }))
    // 24 rows of 45px would fill 1080 exactly, but its aspect error against the
    // snapped 22px cell ties the natural count's (43/44 vs 45/44), and ties go
    // to the natural row count: 25 rows of 43px, remainder split top/bottom.
    expect(Number.isInteger(g.cellH)).toBe(true)
    expect(g.rows).toBe(25)
    expect(g.cellH).toBe(43)
    expect(g.vRemainder).toBeCloseTo(1080 - 25 * 43, 9)
    expect(Math.abs(g.deltaPct)).toBeLessThanOrEqual(5)
  })

  it('zero aspect tolerance keeps the natural row count', () => {
    const free = computeGrid(manual({ pixelSnap: true, aspectTolerancePct: 0 }))
    const unsnapped = computeGrid(manual())
    expect(free.rows).toBe(unsnapped.rows)
  })

  it('warns when the cell aspect deviates by more than 1%', () => {
    const g = computeGrid(manual({ pixelSnap: true, aspectTolerancePct: 5 }))
    expect(g.warn).toBe(Math.abs(g.deltaPct) > 1)
  })
})

describe('snapLineHeight', () => {
  const g = computeGrid(manual())

  it('rounds a target to the nearest whole number of cell rows', () => {
    const lh = snapLineHeight(g, 1080 * 0.06)
    expect(lh.px).toBeCloseTo(lh.cells * g.cellH, 9)
    expect(Math.abs(lh.px - 1080 * 0.06)).toBeLessThanOrEqual(g.cellH / 2)
  })

  it('never returns less than one cell', () => {
    expect(snapLineHeight(g, 1).cells).toBe(1)
    expect(snapLineHeight(g, 1).px).toBeCloseTo(g.cellH, 9)
  })

  it('a stack of snapped line heights stays on the grid', () => {
    const heights = [0.02, 0.06, 0.12, 0.24].map((r) => snapLineHeight(g, 1080 * r))
    const total = heights.reduce((sum, lh) => sum + lh.px, 0)
    const cells = heights.reduce((sum, lh) => sum + lh.cells, 0)
    expect(total).toBeCloseTo(cells * g.cellH, 9)
  })
})

describe('baselineOffset', () => {
  // Suisse Int'l, per the capsize metrics.
  const suisse = { ascent: 986, descent: -311, lineGap: 0, unitsPerEm: 1000 }

  it('is one ascent below the top when the line height equals the em box', () => {
    const emBox = 100 * ((986 + 311) / 1000)
    expect(baselineOffset(suisse, 100, emBox)).toBeCloseTo(98.6, 9)
  })

  it('splits extra leading evenly above and below', () => {
    const emBox = 100 * ((986 + 311) / 1000)
    expect(baselineOffset(suisse, 100, emBox + 20)).toBeCloseTo(98.6 + 10, 9)
  })

  it('counts half the line gap above the baseline', () => {
    const gapped = { ...suisse, lineGap: 40 }
    const emBox = 100 * ((986 + 40 + 311) / 1000)
    expect(baselineOffset(gapped, 100, emBox)).toBeCloseTo(98.6 + 2, 9)
  })
})

describe('gridLineSegments', () => {
  const g = computeGrid(manual({ pixelSnap: true }))

  it('never draws on or beyond the frame boundary', () => {
    const segs = gridLineSegments(g, 1920, 1080, { edgeCull: false })
    for (const [x1, y1, x2, y2] of segs) {
      if (x1 === x2) {
        expect(x1).toBeGreaterThan(0)
        expect(x1).toBeLessThan(1920)
      } else {
        expect(y1).toBe(y2)
        expect(y1).toBeGreaterThan(0)
        expect(y1).toBeLessThan(1080)
      }
    }
  })

  it('edge cull removes interior lines near the boundary, and only those', () => {
    const culled = gridLineSegments(g, 1920, 1080, { edgeCull: true, edgeCullPct: 20 })
    const all = gridLineSegments(g, 1920, 1080, { edgeCull: false })
    expect(culled.length).toBeLessThanOrEqual(all.length)
    const tolX = g.u * 0.2
    const tolY = g.cellH * 0.2
    for (const [x1, y1, x2] of culled) {
      if (x1 === x2) {
        expect(x1).toBeGreaterThanOrEqual(tolX)
        expect(1920 - x1).toBeGreaterThanOrEqual(tolX)
      } else {
        expect(y1).toBeGreaterThanOrEqual(tolY)
        expect(1080 - y1).toBeGreaterThanOrEqual(tolY)
      }
    }
    // A line a full step inside the frame can never be culled at ≤50%.
    const kept = new Set(culled.map(([x1, y1, x2]) => (x1 === x2 ? `x${x1}` : `y${y1}`)))
    for (const [x1, y1, x2] of all) {
      const inset = x1 === x2 ? Math.min(x1, 1920 - x1) : Math.min(y1, 1080 - y1)
      const step = x1 === x2 ? g.u : g.cellH
      if (inset >= step) {
        expect(kept.has(x1 === x2 ? `x${x1}` : `y${y1}`)).toBe(true)
      }
    }
  })

  it('density subdivides the step', () => {
    const single = gridLineSegments(g, 1920, 1080, { edgeCull: false })
    const double = gridLineSegments(g, 1920, 1080, { density: 2, edgeCull: false })
    expect(double.length).toBeGreaterThan(single.length)
  })
})
