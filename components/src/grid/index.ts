/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// Dual-grid math: overlays an aligned column grid and ASCII cell grid on a
// frame. Margin, column and gutter widths are whole multiples of the cell
// width `u`, so every edge lands on a cell line:
//
//   N = 2m + c·k + (c−1)·g      (cells across the frame)
//   u = W / N                    (cell size = base unit)
//   margin = m·u   column = k·u   gutter = g·u
//
// See plugins/dual-grid/README.md for the derivation, solver weight
// comparisons and measured error tables.
//
// This module is consumed both as `@oxide/design-system/grid` and bundled
// directly into the dual-grid Figma plugin. Keep it dependency-free, with no
// Figma types and no syntax newer than ES2018 (the plugin engine's ceiling).

export type GridSpec = {
  columns: number // c — layout column count
  width: number // frame width, px
  height: number // frame height, px
  // Rough target for the number of ASCII cell columns N. Only certain counts
  // are reachable (N steps by c with m and g fixed), so the nearest is taken.
  targetCellColumns?: number
  cellAspect?: number // a — cell height as a multiple of cell width
  // Snap the row count so rows fill the height exactly; off, the cell aspect
  // is kept exact and the last row runs off the bottom edge instead.
  snapRows?: boolean
  // Round the cell size to whole pixels when within snapTolerancePx. The
  // leftover (W − N·u) is split between the margins. Off, the cell divides
  // the frame exactly and there is no bleed.
  pixelSnap?: boolean
  // Maximum rounding distance per cell in pixels. Total horizontal bleed is
  // bounded by N times this tolerance. 0 disables snapping; 0.5 always snaps.
  snapTolerancePx?: number
  // With snapRows and pixelSnap on, allow this percentage of aspect deviation
  // to find an integer row height. 0 keeps the original row count.
  aspectTolerancePct?: number
} & (
  | {
      // Margin and gutter are given directly as cell counts; column width is
      // derived from targetCellColumns via the ladder.
      mode: 'manual'
      marginCells: number // m — margin width in cells
      gutterCells: number // g — cells per gutter
    }
  | {
      // The solver finds the whole-cell multiples (m, k, g) whose margin,
      // gutter and column count come closest to the pixel targets.
      mode: 'auto'
      targetMarginPx: number
      targetGutterPx: number
    }
)

export interface GridResult {
  N: number // whole cells that fit across the frame
  u: number // cell size = base unit
  solvedM: number // multiples actually used (from the spec or the solver)
  solvedK: number
  solvedG: number
  solved: boolean // whether the solver chose them
  offsetX: number // phase of the cell grid, so x = margin lands on a boundary
  cellsPerGutter: number
  columnWidth: number
  columnCells: number // columnWidth in whole cells (= k)
  gutterWidth: number
  margin: number
  effectiveMargin: number
  contentWidth: number
  rows: number
  cellH: number
  rowOffset: number
  hRemainder: number // leftover width from snapping u, split between the margins
  vRemainder: number // leftover height — split top/bottom (snapRows) or a partial row at the bottom
  actualAspect: number
  deltaPct: number
  warn: boolean
  cellLadder: number[] // reachable cell-column counts, ascending (manual only)
  cellColumnsTaken: number // the rung actually taken (manual), or N (auto)
}

export interface Solution {
  m: number
  k: number
  g: number
  marginPx: number
  gutterPx: number
  u: number
  N: number
  err: number
}

export interface CellOption {
  u: number // exact cell size
  k: number // cells per column that produces it
  N: number
  bleed: number // px left over after rounding u — padding that lands in the margins
}

// The full-bleed extent of the cell grid: the N × rows grid plus enough whole
// cells on every side to cover the snap's remainder margins, so the grid
// fills the frame edge to edge. Whole units keep everything aligned; the
// overhang is clipped by the frame.
export interface GridExtent {
  startX: number
  startY: number
  cols: number
  rows: number
  width: number
  height: number
}

export type Segment = [number, number, number, number] // x1, y1, x2, y2

// 89 = 2(3) + 12(6) + 11(1), i.e. k=6 — an exact rung for the default margin,
// gutter and column count at 1920 wide, giving a 21.57px cell, 25 rows and a
// 129px column.
export const DEFAULT_TARGET_CELL_COLUMNS = 89
export const DEFAULT_CELL_ASPECT = 2
// Half a pixel accepts any rounding distance. Lower tolerances preserve more
// fractional sizes and limit bleed; 0.1 caps it at N/10 pixels.
export const DEFAULT_SNAP_TOLERANCE_PX = 0.5
// Allow 5% aspect deviation when searching for an integer row height.
// For example, 24 rows of 45px fill a 1080px frame exactly.
export const DEFAULT_ASPECT_TOL_PCT = 5
// 20% of a step: wide enough to catch the few-px inset the pixel snap leaves
// (3px on a 22px cell is 13.6%), narrow enough that a real interior line — a
// full step from the edge — can never be caught.
export const DEFAULT_EDGE_CULL_PCT = 20

// Search all ~10k combinations on each edit to find the best match within these bounds.
export const SOLVE_MAX_GUTTER = 8
export const SOLVE_MAX_MARGIN = 24
export const SOLVE_MAX_COLUMN = 48
// Prioritise column count to preserve cell density. Gutter width is g*W/N with
// integer g, so the two targets may conflict. Report gutter mismatches rather
// than substantially changing N. Margin has weight 1 and is quantised in
// cell-width increments.
export const GUTTER_WEIGHT = 8
export const COLUMNS_WEIGHT = 16

// Cell sizes below this are not a usable design grid, and enumerating them only
// crowds the options.
export const LADDER_MIN_CELL = 2

// Lines on or beyond the frame boundary (to within this epsilon) are always
// culled as doubled frame edges, whatever the edge-cull options say.
export const EDGE_CULL_EPSILON = 0.01

// Round to whole pixels only within tolerance. computeGrid, the solver and the
// ladder must all use this function so previews and generated grids agree.
export function snapUnit(value: number, pixelSnap: boolean, tolPx: number): number {
  if (!pixelSnap) return value
  const snapped = Math.max(1, Math.round(value))
  // The epsilon keeps an exactly-on-tolerance value (and a tolerance of 0.5,
  // where |value − round(value)| can equal 0.5 up to float error) snapping.
  return Math.abs(value - snapped) <= tolPx + 1e-9 ? snapped : value
}

// Treat errors within 1e-6 as ties and prefer the coarser grid.
export function betterFit(a: Solution, b: Solution): boolean {
  if (a.err < b.err - 1e-6) return true
  if (a.err > b.err + 1e-6) return false
  return a.N < b.N
}

// Finds the whole-cell multiples (m, k, g) whose margin, gutter and column count
// come closest to the three requested values.
//
// Whole-cell multiples preserve alignment. Inputs are weighted targets, not
// hard constraints, so a grid is returned even when no exact match exists.
export function solveMultiples(
  W: number,
  c: number,
  targetMargin: number,
  targetGutter: number,
  targetN: number,
  pixelSnap: boolean,
  snapTolPx: number,
): Solution {
  const relErr = (got: number, want: number) => Math.abs(got - want) / Math.max(1, want)

  let best: Solution | null = null

  for (let g = 1; g <= SOLVE_MAX_GUTTER; g++) {
    for (let m = 0; m <= SOLVE_MAX_MARGIN; m++) {
      for (let k = 1; k <= SOLVE_MAX_COLUMN; k++) {
        const N = 2 * m + c * k + (c - 1) * g
        // Must snap exactly as computeGrid will, or the solved fit drifts once
        // the pixel snap rounds the cell size.
        const u = snapUnit(W / N, pixelSnap, snapTolPx)

        // Include half the rounding remainder in the margin to account for centring.
        const gutterPx = g * u
        const marginPx = m * u + (W - N * u) / 2

        const err =
          GUTTER_WEIGHT * relErr(gutterPx, targetGutter) +
          COLUMNS_WEIGHT * relErr(N, targetN) +
          relErr(marginPx, targetMargin)
        const candidate: Solution = { m, k, g, marginPx, gutterPx, u, N, err }

        // Prefer the closest fit, then the coarsest grid on a tie.
        if (!best || betterFit(candidate, best)) best = candidate
      }
    }
  }

  return (
    best || {
      m: 3,
      k: 6,
      g: 1,
      marginPx: 0,
      gutterPx: 0,
      u: 0,
      N: 0,
      err: Infinity,
    }
  )
}

// Two decimals is the resolution at which ladder rungs are considered distinct
// (it is also the resolution the plugin panel displays).
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// The manual-mode cell ladder. With c, m and g fixed, k is the only free
// variable in N = 2m + ck + (c−1)g. Possible counts step by c, giving a
// discrete set of cell sizes u = W/N. Aspect deviation is reported, not used
// to reject sizes.
export function cellLadder(
  W: number,
  c: number,
  m: number,
  g: number,
  pixelSnap: boolean,
  snapTolPx: number,
): CellOption[] {
  const byCell = new Map<number, CellOption>()
  for (let k = 1; k <= SOLVE_MAX_COLUMN; k++) {
    const N = 2 * m + c * k + (c - 1) * g
    const u = snapUnit(W / N, pixelSnap, snapTolPx)
    if (u < LADDER_MIN_CELL) continue

    const bleed = Math.abs(W - N * u)
    // Rounding u to whole pixels collapses several adjacent k onto the same cell
    // size; keep whichever leaves the least bleed, since that is the one that
    // fills the frame most cleanly.
    const key = round2(u)
    const prev = byCell.get(key)
    if (!prev || bleed < prev.bleed) byCell.set(key, { u, k, N, bleed })
  }
  const out: CellOption[] = []
  byCell.forEach((v) => out.push(v))
  return out.sort((a, b) => a.u - b.u)
}

// Nearest available column count. Ties prefer fewer columns, matching the solver.
export function pickCellOption(ladder: CellOption[], targetN: number): CellOption | null {
  let best: CellOption | null = null
  let bestErr = Infinity
  for (const opt of ladder) {
    const err = Math.abs(opt.N - targetN)
    if (err < bestErr - 1e-9 || (best && err < bestErr + 1e-9 && opt.N < best.N)) {
      bestErr = err
      best = opt
    }
  }
  return best
}

// The mathematical core. Dimensions are measured in cells; cell size is
// derived from the frame width. All pixel sizes are reported back in the
// result.
export function computeGrid(spec: GridSpec): GridResult {
  const W = spec.width
  const H = spec.height
  const c = Math.max(1, Math.round(spec.columns))
  const a = spec.cellAspect !== undefined ? spec.cellAspect : DEFAULT_CELL_ASPECT
  const snapRows = spec.snapRows !== undefined ? spec.snapRows : true
  const pixelSnap = spec.pixelSnap === true
  const snapTol =
    spec.snapTolerancePx !== undefined ? spec.snapTolerancePx : DEFAULT_SNAP_TOLERANCE_PX
  // The aspect band as a share, capped at 50%. 0 disables the row-count search.
  const aspectTolPct =
    spec.aspectTolerancePct !== undefined ? spec.aspectTolerancePct : DEFAULT_ASPECT_TOL_PCT
  const targetN = Math.max(
    1,
    Math.round(
      spec.targetCellColumns !== undefined
        ? spec.targetCellColumns
        : DEFAULT_TARGET_CELL_COLUMNS,
    ),
  )

  // In auto mode the multiples come from the solver rather than the spec.
  // Manual: the gutter sets the scale, the margin is measured against it, and the
  // column width is derived. Rounding keeps every part a whole number of cells,
  // which is what holds the two grids in phase.
  let solved: Solution | null = null
  let gm: number
  let m: number
  if (spec.mode === 'auto') {
    solved = solveMultiples(
      W,
      c,
      Math.max(0, spec.targetMarginPx),
      Math.max(1, spec.targetGutterPx),
      targetN,
      pixelSnap,
      snapTol,
    )
    gm = solved.g
    m = solved.m
  } else {
    gm = Math.max(1, Math.round(spec.gutterCells))
    m = Math.max(0, Math.round(spec.marginCells))
  }
  // Manual: the column count is picked straight off the ladder. The ladder depends
  // on c, m, g, the pixel snap and its tolerance, so it is rebuilt whenever any of
  // those move and the request is re-snapped by *count* — 197 cells stays ≈197
  // across a margin change rather than sliding to whatever sits at the same
  // ladder index.
  const ladder = solved ? [] : cellLadder(W, c, m, gm, pixelSnap, snapTol)
  const chosen = solved ? null : pickCellOption(ladder, targetN)
  const k = solved ? solved.k : chosen ? chosen.k : 1

  const N = 2 * m + c * k + (c - 1) * gm
  const uExact = W / N
  const u = snapUnit(uExact, pixelSnap, snapTol)

  const columnWidth = k * u
  const gutterWidth = gm * u
  const margin = m * u
  const columnCells = k
  const contentWidth = c * columnWidth + (c - 1) * gutterWidth

  // Rounding u leaves a remainder; split evenly it shifts both grids by the same
  // amount, so they stay in phase.
  const hRemainder = W - N * u
  const effectiveMargin = margin + hRemainder / 2
  const offsetX = 0 // centring handles the phase; no offset needed

  let rows: number
  let cellH: number
  if (snapRows) {
    // Counted off the exact cell, not the snapped one, so snapping u to a whole
    // pixel cannot flip the row count the fractional grid chose (at the borderline
    // it otherwise does: u 22.07 → 24 rows, u 22 → 25).
    rows = Math.max(1, Math.round(H / (a * uExact)))
    // Search row counts within the aspect tolerance for a height that snaps.
    // Prefer the closest aspect ratio; a divisor of H gives an exact vertical fit.
    const band = pixelSnap ? Math.min(50, aspectTolPct) / 100 : 0
    if (band > 0) {
      const lo = Math.max(1, Math.ceil(H / (a * u * (1 + band))))
      const hi = Math.max(lo, Math.floor(H / (a * u * (1 - band))))
      let bestR = 0
      let bestErr = Infinity
      for (let r = lo; r <= hi; r++) {
        const snapped = Math.max(1, Math.round(H / r))
        if (Math.abs(H / r - snapped) > snapTol + 1e-9) continue
        const err = Math.abs(snapped / u / a - 1)
        if (err > band + 1e-9) continue
        // Closest to the aspect ask wins; ties go to the natural row count.
        if (
          err < bestErr - 1e-12 ||
          (err < bestErr + 1e-12 && Math.abs(r - rows) < Math.abs(bestR - rows))
        ) {
          bestErr = err
          bestR = r
        }
      }
      if (bestR) rows = bestR
    }
    // H/rows divides H exactly; the whole-pixel snap trades that for a small
    // remainder, split top and bottom like the horizontal one.
    cellH = snapUnit(H / rows, pixelSnap, snapTol)
  } else {
    // Keep the aspect exact and let the last row run off the bottom edge rather
    // than stopping the grid short — the overhang is clipped by the frame, the
    // same way the side edges already bleed. Snapping is the opposite trade:
    // exact fit, approximate aspect.
    cellH = snapUnit(a * u, pixelSnap, snapTol)
    rows = Math.max(1, Math.ceil(H / cellH - 1e-9))
  }
  const vRemainder = H - rows * cellH
  // Same trick vertically: centre the leftover so the rows stay in phase.
  const rowOffset = vRemainder / 2

  const actualAspect = cellH / u
  const deltaPct = (actualAspect / a - 1) * 100

  return {
    N,
    u,
    solvedM: m,
    solvedK: k,
    solvedG: gm,
    solved: !!solved,
    offsetX,
    cellsPerGutter: gm,
    columnWidth,
    columnCells,
    gutterWidth,
    margin,
    effectiveMargin,
    contentWidth,
    rows,
    cellH,
    rowOffset,
    hRemainder,
    vRemainder,
    actualAspect,
    deltaPct,
    warn: Math.abs(deltaPct) > 1,
    // Ascending in N, which is *descending* in cell size — the ladder is built
    // u-ascending, so this reverses it.
    cellLadder: ladder.map((o) => o.N).sort((x, y) => x - y),
    // The count actually taken: the nearest ladder rung in manual mode, the
    // solver's N in auto.
    cellColumnsTaken: solved ? N : chosen ? chosen.N : targetN,
  }
}

// Extends the grid by whole cells past its own bounds so the rounding remainder
// at the frame edges is covered too; the frame clips the overhang.
export function gridExtent(g: GridResult): GridExtent {
  const extraCols = g.hRemainder > 0 ? Math.ceil(g.hRemainder / 2 / g.u) : 0
  const extraRows = g.vRemainder > 0 ? Math.ceil(g.vRemainder / 2 / g.cellH) : 0
  const startX = g.hRemainder / 2 - extraCols * g.u
  const startY = g.vRemainder / 2 - extraRows * g.cellH
  const cols = g.N + 2 * extraCols
  const rows = g.rows + 2 * extraRows
  return {
    startX,
    startY,
    cols,
    rows,
    width: cols * g.u,
    height: rows * g.cellH,
  }
}

// The cell grid as drawable line segments over the full-bleed extent. Density
// subdivides (2, 3) or coarsens (0.5, 0.25) the cell. Lines on or beyond the
// frame boundary are always omitted; edge cull additionally removes interior
// lines within edgeCullPct of a step from the boundary, to avoid darkening the
// frame edge. The percentage is capped at half a step so it can never reach
// two adjacent lines.
export function gridLineSegments(
  g: GridResult,
  width: number,
  height: number,
  opts?: { density?: number; edgeCull?: boolean; edgeCullPct?: number },
): Segment[] {
  const o = opts || {}
  const d = o.density !== undefined ? o.density : 1
  const cullOn = o.edgeCull !== undefined ? o.edgeCull : true
  const cullPct = o.edgeCullPct !== undefined ? o.edgeCullPct : DEFAULT_EDGE_CULL_PCT
  const cull = Math.min(50, cullPct) / 100

  const ext = gridExtent(g)
  const right = ext.startX + ext.width
  const bottom = ext.startY + ext.height

  const stepX = g.u / d
  const stepY = g.cellH / d

  const tolX = stepX * cull
  const tolY = stepY * cull

  // Coarse densities can leave a fractional line count; the loop floor just
  // stops at the last coarse line inside the extent.
  const lastCol = Math.floor(ext.cols * d + 1e-9)
  const lastRow = Math.floor(ext.rows * d + 1e-9)

  const segments: Segment[] = []
  for (let i = 0; i <= lastCol; i++) {
    const x = ext.startX + i * stepX
    if (x < EDGE_CULL_EPSILON || x > width - EDGE_CULL_EPSILON) continue
    if (cullOn && (x < tolX || width - x < tolX)) continue
    segments.push([x, ext.startY, x, bottom])
  }
  for (let j = 0; j <= lastRow; j++) {
    const y = ext.startY + j * stepY
    if (y < EDGE_CULL_EPSILON || y > height - EDGE_CULL_EPSILON) continue
    if (cullOn && (y < tolY || height - y < tolY)) continue
    segments.push([ext.startX, y, right, y])
  }
  return segments
}

export function parseAspect(ratio: string): number {
  const parts = ratio.split(':')
  const w = Number(parts[0])
  const h = Number(parts[1])
  return w > 0 && h > 0 ? w / h : 16 / 9
}
