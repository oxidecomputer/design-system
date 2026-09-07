// Dual Grid Generator
//
// Overlays aligned column and cell grids on a frame. Margin, column and gutter
// widths are whole multiples of the cell width `u`. See README.md for the equations.

type GridMode = 'Manual' | 'Solve'

interface Params {
  mode: GridMode
  columnCount: number // c: number of columns
  // Margin and gutter are independent cell counts; column width is derived.
  marginCells: number // m — margin width in cells
  gutterMultiple: number // g: cells per gutter
  // Solve mode: targets the solver aims at instead of the multiples above.
  targetMarginPx: number
  targetGutterPx: number
  targetColumns: number // target N in Solve mode
  // Manual cell count N, snapped to the nearest value in cellLadder. With m, g
  // and c fixed, preserving N keeps the grid's proportions across frame sizes.
  cellColumns: number
  cellAspect: number // a
  snapRows: boolean
  pixelPerfect: boolean
  // Maximum rounding distance per cell in pixels. Total horizontal bleed is
  // bounded by N times this tolerance. 0 disables snapping; 0.5 always snaps.
  snapTolerancePx: number
  // Cull interior lines near the frame edge (see edgeCullPct). Lines on or
  // beyond the boundary are always culled.
  edgeCull: boolean
  // How close (as a % of the step between lines) a drawn line may sit to the
  // frame boundary before it is culled as a doubled frame edge.
  edgeCullPct: number
  // With Snap rows and Pixel snap on, allow this percentage of aspect deviation
  // to find an integer row height. 0 keeps the original row count.
  aspectTolPct: number
  cellDensity: number // 1 | 2 | 3 — cells per gutter, i.e. cell-grid fineness
  showLines: boolean // draw the grid as real vector layers
  showSpecimens: boolean // render the type specimens
  // Font families for the char grid, mono specimen and sans specimens. Resolve
  // styles per family: GT America Mono's regular style is named "Regular OCC".
  monoFamily: string
  sansFamily: string
  // Comma-separated percentages of frame height, one specimen per entry.
  // See parseSizesPct for validation and fallbacks.
  monoSizes: string
  sansSizes: string
  // All three are used only by the "create frame" action. When a frame is
  // selected the panel mirrors its real size into these fields instead, read
  // only, so they always describe the frame in front of you.
  frameWidth: number
  frameAspect: string // "16:9" etc, or "Custom" to use frameHeight directly
  frameHeight: number // only consulted when frameAspect is "Custom"
}

interface GridResult {
  N: number // whole cells that fit across the frame
  u: number // cell size = base unit
  solvedM: number // multiples actually used (from the sliders or the solver)
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
  vRemainder: number // leftover height — split top/bottom (Snap rows) or a partial row at the bottom
  actualAspect: number
  deltaPct: number
  warn: boolean
  cellLadder: number[] // reachable cell-column counts, ascending (Manual only)
  cellColumnsTaken: number // the rung actually taken, = N in Manual
}

interface FontProbe {
  family: string
  style: string
  advancePer100: number
  bearingsPer100: number
}

// Vertical metrics of a text face, used to seat its baselines on the cell
// grid.
interface MetricsProbe {
  family: string
  style: string
  autoPer100: number // Figma's automatic line height at fontSize 100
}

interface StoredData {
  version: 1
  params: Params
  state: {
    charGridId: string | null
    linesId?: string | null
    specimensId?: string | null
    // The families the cached probes were measured against. Probes are expensive
    // and cached per frame, so they must be invalidated when the request changes.
    probedMono?: string
    probedSans?: string
    fontProbe: FontProbe | null
    monoProbe?: MetricsProbe | null
    sansProbe?: MetricsProbe | null
  }
}

const DATA_KEY = 'dualGrid'
const MONO_FONT: FontName = { family: 'GT America Mono', style: 'Regular OCC' }

// Share of the font's full (ascent + descent) box taken by the ascent. Figma
// exposes no baseline metric, so this is the one assumed value; 0.80 is exact
// for Inter (1984/2048 asc, 494/2048 desc) and holds across Latin UI sans
// faces. Everything else below is measured.
const ASCENT_SHARE = 0.8

// ----- type specimens ------------------------------------------------------
const SANS_FONT: FontName = { family: "Suisse Int'l", style: 'Regular' }

// Oxide's optical tracking curve, from the design system's styles/main.css:
//
//   letter-spacing (em) = 0.981 / fontSize − 0.0401
//
// Small sizes open up for legibility, display sizes tighten (65px → −0.025em).
// Returned as a percentage of the font size, which is what Figma's PERCENT
// letter-spacing unit means.
function opticalTrackingPct(fontSize: number): number {
  return (0.981 / fontSize - 0.0401) * 100
}

// Mono is set uppercase at a flat 4% per the design system's mono scale.
const MONO_TRACKING_PCT = 4

// Size specimens relative to frame height, then round line heights to whole
// cells. This keeps the type scale largely independent of cell density.
interface SpecimenSpec {
  name: string
  face: 'mono' | 'sans'
  heightRatio: number // share of the frame height, before snapping
  scale: number // fontSize as a share of the snapped line height
  text: string
}

// Font size as a share of the line box, increasing with specimen size to reduce
// leading. Custom sizes interpolate between reference points and clamp at the ends.
const SANS_SCALE_CURVE: Array<[number, number]> = [
  [0.06, 0.82],
  [0.12, 0.92],
  [0.24, 1.0],
]
// Mono starts at a 2% caption with font size 0.62 of line height.
// Larger mono sizes use tighter leading, closer to the sans scale.
const MONO_SCALE_CURVE: Array<[number, number]> = [
  [0.02, 0.62],
  [0.12, 0.8],
]

function scaleAt(curve: Array<[number, number]>, ratio: number): number {
  if (ratio <= curve[0][0]) return curve[0][1]
  for (let i = 1; i < curve.length; i++) {
    if (ratio <= curve[i][0]) {
      const [x0, y0] = curve[i - 1]
      const [x1, y1] = curve[i]
      return y0 + ((ratio - x0) / (x1 - x0)) * (y1 - y0)
    }
  }
  return curve[curve.length - 1][1]
}

// Ignore invalid entries and use the fallback if none remain. Sort ascending
// for placement, and deduplicate to avoid reusing one layer for multiple entries.
const MAX_SPECIMENS = 8 // per font family
function parseSizesPct(raw: string | undefined, fallback: string): number[] {
  const parse = (s: string) =>
    s
      .split(/[,\s]+/)
      .map((t) => Number(t.replace('%', '')))
      .filter((n) => Number.isFinite(n) && n >= 0.5 && n <= 100)
  const asked = parse(typeof raw === 'string' ? raw : '')
  const sizes = asked.length ? asked : parse(fallback)
  return Array.from(new Set(sizes))
    .sort((a, b) => a - b)
    .slice(0, MAX_SPECIMENS)
}

// Placeholder text sized to the block it fills — display sizes get a word,
// small sizes a sentence. Only written on creation, so anything typed over it
// survives reapplies.
function sansSpecimenText(pct: number): string {
  if (pct >= 16) return 'Display'
  if (pct >= 8) return `${pct} percent`
  return `${pct} percent of the height`
}

function specimensOf(p: Params): SpecimenSpec[] {
  const mono = parseSizesPct(p.monoSizes, DEFAULT_PARAMS.monoSizes).map(
    (pct): SpecimenSpec => ({
      name: `Mono ${pct}%`,
      face: 'mono',
      heightRatio: pct / 100,
      scale: scaleAt(MONO_SCALE_CURVE, pct / 100),
      text: 'GT America Mono · 0123456789',
    }),
  )
  const sans = parseSizesPct(p.sansSizes, DEFAULT_PARAMS.sansSizes).map(
    (pct): SpecimenSpec => ({
      name: `Sans ${pct}%`,
      face: 'sans',
      heightRatio: pct / 100,
      scale: scaleAt(SANS_SCALE_CURVE, pct / 100),
      text: sansSpecimenText(pct),
    }),
  )
  return mono.concat(sans)
}

// Cell row the specimen stack starts on.
const SPECIMEN_START_CELL = 1

const PANEL_WIDTH = 280
const PANEL_MIN_HEIGHT = 120
const PANEL_MAX_HEIGHT = 900

const DEFAULT_PARAMS: Params = {
  mode: 'Manual',
  columnCount: 12,
  marginCells: 3,
  gutterMultiple: 1,
  targetMarginPx: 50,
  targetGutterPx: 20,
  // = 2(3) + 12(6) + 11(1), i.e. k=6 — an exact rung at 1920 wide, giving a
  // 21.57px cell, 25 rows and a 129px column. Both modes default to it, so
  // switching between them does not jump the grid.
  cellColumns: 89,
  targetColumns: 89,
  cellAspect: 2,
  snapRows: true,
  // Off by default: with it on, u snaps to a whole pixel when within
  // snapTolerancePx (always, at the default 0.5) and the leftover (W − N·u) is
  // split between the margins. Off, the cell divides the frame exactly and
  // there is no bleed.
  pixelPerfect: false,
  // Half a pixel accepts any rounding distance. Lower tolerances preserve more
  // fractional sizes and limit bleed; 0.1 caps it at N/10 pixels.
  snapTolerancePx: 0.5,
  // 20% of a step: wide enough to catch the few-px inset the pixel snap leaves
  // (3px on a 22px cell is 13.6%), narrow enough that a real interior line — a
  // full step from the edge — can never be caught.
  edgeCull: true,
  edgeCullPct: 20,
  // Allow 5% aspect deviation when searching for an integer row height.
  // For example, 24 rows of 45px fill a 1080px frame exactly.
  aspectTolPct: 5,
  cellDensity: 1,
  showLines: true,
  showSpecimens: true,
  monoFamily: MONO_FONT.family,
  sansFamily: SANS_FONT.family,
  // The reference specimen scale: a 2% mono caption, then sans at 6/12/24%.
  monoSizes: '2',
  sansSizes: '6, 12, 24',
  frameWidth: 1920,
  frameAspect: '16:9',
  frameHeight: 1080, // 1920 at 16:9, so switching to Custom changes nothing
}

let lastParams: Params = { ...DEFAULT_PARAMS }

// themeColors is what makes Figma inject the --figma-color-* variables (and a
// figma-dark/figma-light class) into the iframe. Without it the UI silently
// falls back to its light defaults even when Figma is in dark mode.
figma.showUI(__html__, { width: PANEL_WIDTH, height: 320, themeColors: true })

figma.on('selectionchange', () => onSelectionChange())

figma.ui.onmessage = async (msg) => {
  if (!msg || typeof msg !== 'object') return

  try {
    if (msg.type === 'resize') {
      const h = Math.max(
        PANEL_MIN_HEIGHT,
        Math.min(PANEL_MAX_HEIGHT, Math.round(msg.height)),
      )
      figma.ui.resize(PANEL_WIDTH, h)
    } else if (msg.type === 'params-changed') {
      lastParams = msg.params
      // Only grid params reapply live; the "New frame" params affect nothing
      // until "Create frame" is pressed.
      if (msg.reapply) await maybeLiveReapply(lastParams)
      sendActionState()
    } else if (msg.type === 'action') {
      lastParams = msg.params
      await handleAction(msg.action, lastParams)
      sendActionState()
    }
  } catch (err) {
    figma.notify('⚠ ' + (err as Error).message, { error: true })
  }
}

// ---------------------------------------------------------------------------
// Solver
// ---------------------------------------------------------------------------

interface Solution {
  m: number
  k: number
  g: number
  marginPx: number
  gutterPx: number
  u: number
  N: number
  err: number
}

// Search all ~10k combinations on each edit to find the best match within these bounds.
const SOLVE_MAX_GUTTER = 8
const SOLVE_MAX_MARGIN = 24
const SOLVE_MAX_COLUMN = 48
// Prioritise column count to preserve cell density. Gutter width is g*W/N with
// integer g, so the two targets may conflict. Report gutter mismatches rather
// than substantially changing N. See README.md for weight comparisons.
const GUTTER_WEIGHT = 8
const COLUMNS_WEIGHT = 16
// Margin has weight 1 and is quantised in cell-width increments.

// Round to whole pixels only within tolerance. computeGrid, the solver and the
// ladder must all use this function so previews and generated grids agree.
function snapUnit(value: number, pixelPerfect: boolean, tolPx: number): number {
  if (!pixelPerfect) return value
  const snapped = Math.max(1, Math.round(value))
  // The epsilon keeps an exactly-on-tolerance value (and a tolerance of 0.5,
  // where |value − round(value)| can equal 0.5 up to float error) snapping.
  return Math.abs(value - snapped) <= tolPx + 1e-9 ? snapped : value
}

// Tolerates stored params missing the tolerance; the 0.5 default always snaps.
function snapToleranceOf(p: Params): number {
  return typeof p.snapTolerancePx === 'number' && p.snapTolerancePx >= 0
    ? p.snapTolerancePx
    : DEFAULT_PARAMS.snapTolerancePx
}

// The aspect band as a share (from the % param), capped at 50%. 0 disables the
// row-count search entirely.
function aspectTolOf(p: Params): number {
  const pct =
    typeof p.aspectTolPct === 'number' && p.aspectTolPct >= 0
      ? p.aspectTolPct
      : DEFAULT_PARAMS.aspectTolPct
  return Math.min(50, pct) / 100
}

// Finds the whole-cell multiples (m, k, g) whose margin, gutter and column count
// come closest to the three requested values.
//
// Whole-cell multiples preserve alignment. Inputs are weighted targets, not
// hard constraints, so a grid is returned even when no exact match exists.
function solveMultiples(
  W: number,
  H: number,
  c: number,
  targetMargin: number,
  targetGutter: number,
  targetN: number,
  pixelPerfect: boolean,
  snapTolPx: number,
): Solution {
  const relErr = (got: number, want: number) => Math.abs(got - want) / Math.max(1, want)

  let best: Solution | null = null

  for (let g = 1; g <= SOLVE_MAX_GUTTER; g++) {
    for (let m = 0; m <= SOLVE_MAX_MARGIN; m++) {
      for (let k = 1; k <= SOLVE_MAX_COLUMN; k++) {
        const N = 2 * m + c * k + (c - 1) * g
        // Must snap exactly as computeGrid will, or the solved fit drifts once
        // Pixel snap rounds the cell size.
        const u = snapUnit(W / N, pixelPerfect, snapTolPx)

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

// ----- the Manual-mode cell ladder ------------------------------------------
//
// With c, m and g fixed, k is the only free variable in N = 2m + ck + (c−1)g.
// Possible counts step by c, giving a discrete set of cell sizes u = W/N.
// The panel offers these valid counts directly. Aspect deviation is reported,
// not used to reject sizes.

interface CellOption {
  u: number // exact cell size
  k: number // cells per column that produces it
  N: number
  bleed: number // px left over after rounding u — padding that lands in the margins
}

// Cell sizes below this are not a usable design grid, and enumerating them only
// crowds the slider.
const LADDER_MIN_CELL = 2

// The edge cull as a share of the step, from params. Capped at half a step so
// it can never reach two adjacent lines. The epsilon is the separate,
// unconditional rule: lines on or beyond the frame boundary (to within it) are
// always culled, whatever the toggle or percentage say.
const EDGE_CULL_EPSILON = 0.01
function edgeCullRatioOf(p: Params): number {
  const pct =
    typeof p.edgeCullPct === 'number' && p.edgeCullPct >= 0
      ? p.edgeCullPct
      : DEFAULT_PARAMS.edgeCullPct
  return Math.min(50, pct) / 100
}

// ----- palette -------------------------------------------------------------
// Plain literal colours. Binding these to design-system COLOR variables does
// not work reliably in practice — see the README before attempting it.
function hex(value: string): RGB {
  const n = parseInt(value.replace('#', ''), 16)
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  }
}

const COLOR_BG = hex('#000000') // the frame fill, on Create frame
const COLOR_TEXT = hex('#FFFFFF') // specimen text
const COLOR_CHAR = hex('#333333') // the ASCII char grid
const COLOR_LINES = hex('#666666') // the drawn cell-grid strokes

// Two decimals is the resolution the panel displays and the slider steps
// through, so it is also the resolution at which rungs are considered distinct.
function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function cellLadder(
  W: number,
  H: number,
  c: number,
  m: number,
  g: number,
  pixelPerfect: boolean,
  snapTolPx: number,
): CellOption[] {
  const byCell = new Map<number, CellOption>()
  for (let k = 1; k <= SOLVE_MAX_COLUMN; k++) {
    const N = 2 * m + c * k + (c - 1) * g
    const u = snapUnit(W / N, pixelPerfect, snapTolPx)
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
function pickCellOption(ladder: CellOption[], targetN: number): CellOption | null {
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

// The requested cell-column count.
function targetColumns(p: Params): number {
  if (typeof p.cellColumns === 'number' && p.cellColumns > 0) {
    return Math.round(p.cellColumns)
  }
  return DEFAULT_PARAMS.cellColumns
}

// Treat errors within 1e-6 as ties and prefer the coarser grid.
function betterFit(a: Solution, b: Solution): boolean {
  if (a.err < b.err - 1e-6) return true
  if (a.err > b.err + 1e-6) return false
  return a.N < b.N
}

// ---------------------------------------------------------------------------
// The mathematical core
// ---------------------------------------------------------------------------

// Dimensions are measured in cells; cell size is derived from frame width:
//
//   N = 2m + c·k + (c−1)·g      (cells across the frame)
//   u = W / N                    (cell size = base unit)
//   margin = m·u   column = k·u   gutter = g·u
//
// Whole-cell margins, columns and gutters keep every edge on a cell line.
//
// The pixel sizes are reported back in the panel.
function computeGrid(p: Params, W: number, H: number): GridResult {
  const c = columnCountOf(p)
  const a = p.cellAspect
  const snapTol = snapToleranceOf(p)

  // In Solve mode the multiples come from the solver rather than the sliders.
  const solved =
    p.mode === 'Solve'
      ? solveMultiples(
          W,
          H,
          c,
          Math.max(0, p.targetMarginPx),
          Math.max(1, p.targetGutterPx),
          Math.max(1, Math.round(p.targetColumns || DEFAULT_PARAMS.targetColumns)),
          p.pixelPerfect,
          snapTol,
        )
      : null

  // Manual: the gutter sets the scale, the margin is measured against it, and the
  // column width is derived. Rounding keeps every part a whole number of cells,
  // which is what holds the two grids in phase.
  const gm = solved ? solved.g : Math.max(1, Math.round(p.gutterMultiple))
  const m = solved ? solved.m : marginCellsOf(p)
  // Manual: the column count is picked straight off the ladder. The ladder depends
  // on c, m, g, Pixel snap and its tolerance, so it is rebuilt whenever any of
  // those move and the request is re-snapped by *count* — 197 cells stays ≈197
  // across a margin change rather than sliding to whatever sits at the same
  // slider index.
  const ladder = solved ? [] : cellLadder(W, H, c, m, gm, p.pixelPerfect, snapTol)
  const chosen = solved ? null : pickCellOption(ladder, targetColumns(p))
  const k = solved ? solved.k : chosen ? chosen.k : 1

  const N = 2 * m + c * k + (c - 1) * gm
  const uExact = W / N
  const u = snapUnit(uExact, p.pixelPerfect, snapTol)

  const columnWidth = k * u
  const gutterWidth = gm * u
  const margin = m * u
  const columnCells = k
  const contentWidth = c * columnWidth + (c - 1) * gutterWidth

  // Rounding u leaves a remainder; split evenly it shifts both grids by the same
  // amount, so they stay in phase — Figma's CENTER alignment does exactly that.
  const hRemainder = W - N * u
  const effectiveMargin = margin + hRemainder / 2
  const offsetX = 0 // CENTER alignment handles the phase; no offset needed

  let rows: number
  let cellH: number
  if (p.snapRows) {
    // Counted off the exact cell, not the snapped one, so snapping u to a whole
    // pixel cannot flip the row count the fractional grid chose (at the borderline
    // it otherwise does: u 22.07 → 24 rows, u 22 → 25).
    rows = Math.max(1, Math.round(H / (a * uExact)))
    // Search row counts within the aspect tolerance for a height that snaps.
    // Prefer the closest aspect ratio; a divisor of H gives an exact vertical fit.
    const band = p.pixelPerfect ? aspectTolOf(p) : 0
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
    cellH = snapUnit(H / rows, p.pixelPerfect, snapTol)
  } else {
    // Keep the aspect exact and let the last row run off the bottom edge rather
    // than stopping the grid short — the overhang is clipped by the frame, the
    // same way the side edges already bleed. Snapping is the opposite trade:
    // exact fit, approximate aspect.
    cellH = snapUnit(a * u, p.pixelPerfect, snapTol)
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
    // u-ascending, so this reverses it. Dragging the slider right therefore adds
    // columns, which is the direction the label implies.
    cellLadder: ladder.map((o) => o.N).sort((a, b) => a - b),
    // In Solve the grid is the solver's business, so the Manual request is echoed
    // back untouched rather than overwritten with the solved count.
    cellColumnsTaken: chosen ? chosen.N : targetColumns(p),
  }
}

function buildLayoutGrids(g: GridResult, columns: number, density: number): LayoutGrid[] {
  const d = clampDensity(density)
  const stepY = g.cellH / d

  // Figma rejects negative ROWS offsets. Shift by whole rows to preserve line
  // positions, adding rows to maintain coverage. Clamp small negative
  // floating-point remainders from H - rows*(H/rows) to zero.
  let rowOffset = g.rowOffset
  // Coarse densities (0.5x / 0.25x) can leave a fractional count; MIN-aligned
  // grids can simply round up, since the excess renders past the frame edge
  // where Figma clips it.
  let rowCount = Math.ceil(g.rows * d - 1e-9)
  if (rowOffset < -1e-6) {
    const steps = Math.ceil(-rowOffset / stepY)
    rowOffset += steps * stepY
    rowCount += steps
  }
  if (rowOffset < 0) rowOffset = 0

  // Cell grid — CENTER, like the column grid, so both share an origin and a
  // margin/column/gutter edge always coincides with a cell line. CENTER derives
  // the origin from count × sectionSize though, so it needs the exact span: a
  // fractional count (odd N at 0.5x) would recentre half a step off. There the
  // grid falls back to MIN with the origin re-expressed as a non-negative
  // offset — the same lines in terms Figma accepts, count rounded up and the
  // excess clipped by the frame.
  const cellStep = g.u / d
  const cellCount = g.N * d
  const W = g.N * g.u + g.hRemainder
  const cellGrid = Number.isInteger(cellCount)
    ? {
        pattern: 'COLUMNS',
        alignment: 'CENTER',
        count: cellCount,
        sectionSize: cellStep,
        gutterSize: 0,
        color: { r: 0, g: 0.85, b: 0.9, a: 0.3 },
        visible: true,
      }
    : {
        pattern: 'COLUMNS',
        alignment: 'MIN',
        count: Math.ceil(W / cellStep) + 1,
        sectionSize: cellStep,
        gutterSize: 0,
        offset: (((g.hRemainder / 2) % cellStep) + cellStep) % cellStep,
        color: { r: 0, g: 0.85, b: 0.9, a: 0.3 },
        visible: true,
      }

  return [
    {
      pattern: 'COLUMNS',
      alignment: 'CENTER',
      count: columns,
      sectionSize: g.columnWidth,
      gutterSize: g.gutterWidth,
      color: { r: 0.53, g: 0.2, b: 0.92, a: 0.3 },
      visible: true,
    },
    cellGrid,
    {
      pattern: 'ROWS',
      alignment: 'MIN',
      count: rowCount,
      sectionSize: stepY,
      gutterSize: 0,
      offset: rowOffset,
      color: { r: 0, g: 0.85, b: 0.9, a: 0.3 },
      visible: true,
    },
  ] as LayoutGrid[]
}

// The full-bleed extent of the cell grid: the N × rows grid plus enough whole
// cells on every side to cover the snap's remainder margins, so the grid
// fills the frame edge to edge. Whole units keep everything aligned; the
// overhang is clipped by the frame.
interface GridExtent {
  startX: number
  startY: number
  cols: number
  rows: number
  width: number
  height: number
}

// Extends the grid by whole cells past its own bounds so the rounding remainder
// at the frame edges is covered too; the frame clips the overhang.
function gridExtent(g: GridResult, _W: number, _H: number): GridExtent {
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

function columnCountOf(p: Params): number {
  // Tolerates anything sane, not just the UI's choices, and defaults to 12 for
  // params stored before this option existed.
  const c = Math.round(p.columnCount)
  return c >= 1 ? c : 12
}

// `visible` must be a real boolean — stored params can be missing a flag
// entirely, and assigning undefined is not valid.
function flag(value: boolean | undefined, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

// The margin in cells.
function marginCellsOf(p: Params): number {
  if (typeof p.marginCells === 'number') {
    return Math.max(0, Math.round(p.marginCells))
  }
  return DEFAULT_PARAMS.marginCells
}

// 1x–3x subdivide the cell for finer reference; 0.5x and 0.25x coarsen it —
// the drawn grid shows every 2nd or 4th cell line instead. Anything else
// rounds into the 1–3 range.
function clampDensity(d: number): number {
  const n = Number(d)
  if (n === 0.25 || n === 0.5) return n
  const r = Math.round(n)
  return r >= 1 && r <= 3 ? r : 1
}

function parseAspect(ratio: string): number {
  const parts = ratio.split(':')
  const w = Number(parts[0])
  const h = Number(parts[1])
  return w > 0 && h > 0 ? w / h : 16 / 9
}

// The height a new frame would get: taken directly when the aspect is "Custom",
// else derived from the ratio.
function frameHeightOf(p: Params, W: number): number {
  if (p.frameAspect === 'Custom') {
    return Math.max(1, Math.round(p.frameHeight || DEFAULT_PARAMS.frameHeight))
  }
  return Math.max(1, Math.round(W / parseAspect(p.frameAspect)))
}

// ---------------------------------------------------------------------------
// Font probing
// ---------------------------------------------------------------------------

// Measures a monospace font's per-character advance width and fixed bearing
// overhead at font size 100, by comparing the rendered width of one vs. two
// characters. Falls back to another style in the requested family, then any
// family matching /mono/i, then any available regular.
async function probeFont(family: string): Promise<FontProbe> {
  const wanted = family || MONO_FONT.family
  let fontName: FontName = {
    family: wanted,
    // The canonical style for the default family; for anything else, ask for
    // "Regular" and let the fallback below sort it out.
    style: wanted === MONO_FONT.family ? MONO_FONT.style : 'Regular',
  }
  try {
    await figma.loadFontAsync(fontName)
  } catch {
    const available = await figma.listAvailableFontsAsync()
    const sameFamily = available.find((f) => f.fontName.family === wanted)
    const mono = sameFamily || available.find((f) => /mono/i.test(f.fontName.family))
    fontName = mono
      ? mono.fontName
      : (available.find((f) => f.fontName.style === 'Regular') || available[0]).fontName
    await figma.loadFontAsync(fontName)
  }

  const probe = figma.createText()
  probe.fontName = fontName
  probe.fontSize = 100
  probe.characters = 'X'
  const w1 = probe.width
  probe.characters = 'XX'
  const w2 = probe.width
  probe.remove()

  const advancePer100 = w2 - w1
  const bearingsPer100 = w1 - advancePer100

  return {
    family: fontName.family,
    style: fontName.style,
    advancePer100,
    bearingsPer100,
  }
}

// Measures a face's automatic line height at size 100, which is the font's
// ascent + descent (+ any line gap). Scaled down, this gives the em box Figma
// centres inside a fixed line height — the basis for baseline placement.
async function probeMetrics(font: FontName): Promise<MetricsProbe> {
  await figma.loadFontAsync(font)

  const probe = figma.createText()
  probe.fontName = font
  probe.fontSize = 100
  probe.lineHeight = { unit: 'AUTO' }
  probe.characters = 'Xg' // ascender + descender
  const autoPer100 = probe.height
  probe.remove()

  return { family: font.family, style: font.style, autoPer100 }
}

// Picks the first installed face from a preference list, else any regular.
async function resolveFont(preferred: FontName[]): Promise<FontName> {
  const available = await figma.listAvailableFontsAsync()
  const has = (f: FontName) =>
    available.some((a) => a.fontName.family === f.family && a.fontName.style === f.style)
  for (const font of preferred) {
    if (has(font)) return font
  }
  const regular = available.find((f) => f.fontName.style === 'Regular')
  return (regular || available[0]).fontName
}

// Measure the baseline from the bottom of a flat-footed capital's ink bounds.
// Return null when bounds are unavailable so the caller can use the estimate below.
async function measureBaselineOffset(
  font: FontName,
  fontSize: number,
  lineHeight: number,
): Promise<number | null> {
  const probe = figma.createText()
  probe.fontName = font
  probe.fontSize = fontSize
  probe.lineHeight = { value: lineHeight, unit: 'PIXELS' }
  probe.textAutoResize = 'WIDTH_AND_HEIGHT'
  probe.characters = 'H' // flat bottom, no descender, negligible overshoot

  const box = probe.absoluteBoundingBox
  const ink = probe.absoluteRenderBounds
  const offset = box && ink ? ink.y + ink.height - box.y : null
  probe.remove()
  return offset
}

// Fallback estimate for the first baseline, used only when the measurement above
// is unavailable.
//
// With a fixed line height Figma centres the font's (ascent + descent) box in
// each line box, so the baseline sits one ascent below the top of that box:
//
//   firstBaseline = (lineHeight - emBox) / 2 + ascent
//
// Returned separately from the node so it can be asserted in tests.
function firstBaselineOffset(
  lineHeight: number,
  fontSize: number,
  probe: MetricsProbe,
): number {
  const emBox = (probe.autoPer100 / 100) * fontSize
  const ascent = emBox * ASCENT_SHARE
  return (lineHeight - emBox) / 2 + ascent
}

// ---------------------------------------------------------------------------
// Layer creation / update
// ---------------------------------------------------------------------------

const CHAR_GRID_NAME = 'Char Grid'
const GRID_LINES_NAME = 'Grid Lines'
const SPECIMENS_NAME = 'Type Specimens'
const GENERATED_NAMES = [CHAR_GRID_NAME, GRID_LINES_NAME, SPECIMENS_NAME]

function isInside(node: BaseNode, frame: FrameNode): boolean {
  let current: BaseNode | null = node
  while (current) {
    if (current === frame) return true
    current = current.parent
  }
  return false
}

// Reuse the stored layer only if it belongs to this frame. Duplicated frames
// retain IDs pointing to the original, and older data may have no layer IDs.
// Fall back to the first child with the expected name and type; remove duplicates.
async function claimLayer(
  frame: FrameNode,
  name: string,
  type: 'TEXT' | 'FRAME',
  storedId: string | null | undefined,
): Promise<SceneNode | null> {
  const sameName = frame.children.filter(
    (child) => child.name === name && child.type === type,
  )

  let chosen: SceneNode | null = null
  if (storedId) {
    const node = await figma.getNodeByIdAsync(storedId)
    if (
      node &&
      !node.removed &&
      node.type === type &&
      isInside(node, frame) &&
      node.parent === frame
    ) {
      chosen = node as SceneNode
    }
  }
  if (!chosen) chosen = sameName[0] || null

  for (const other of sameName) {
    if (other !== chosen) other.remove()
  }
  return chosen
}

async function ensureCharGrid(
  frame: FrameNode,
  g: GridResult,
  p: Params,
  probe: FontProbe,
  existingId: string | null,
): Promise<string> {
  let node = (await claimLayer(
    frame,
    CHAR_GRID_NAME,
    'TEXT',
    existingId,
  )) as TextNode | null
  if (!node) {
    node = figma.createText()
    node.name = CHAR_GRID_NAME
    frame.appendChild(node)
  }

  const fontName: FontName = { family: probe.family, style: probe.style }
  await figma.loadFontAsync(fontName)
  node.fontName = fontName

  // Share the line grid's cell dimensions and extend past the frame as needed.
  // Stretching letter spacing to fill the frame would misalign the characters.
  const ext = gridExtent(g, frame.width, frame.height)
  // One character per cell — so it subdivides (or coarsens) with the cell
  // density too. Coarse densities can leave a fractional count; round up so
  // the chars still cover the frame, and let the frame clip the overhang.
  const d = clampDensity(p.cellDensity)
  const cols = Math.ceil(ext.cols * d - 1e-9)
  const rows = Math.ceil(ext.rows * d - 1e-9)
  const cellW = g.u / d

  // Solve the size so one character advances exactly one cell.
  const fontSize =
    (100 * cols * cellW) / (cols * probe.advancePer100 + probe.bearingsPer100)
  node.fontSize = fontSize
  node.lineHeight = { value: g.cellH / d, unit: 'PIXELS' }
  node.letterSpacing = { value: 0, unit: 'PIXELS' }
  node.textAlignHorizontal = 'LEFT'
  node.textAlignVertical = 'TOP'

  // Auto width: the font size was solved so each character measures exactly one
  // cell, so letting the node size to its content gives the right box — and
  // avoids a fixed frame that would wrap or clip the rows.
  node.textAutoResize = 'WIDTH_AND_HEIGHT'
  const rowLine = '.'.repeat(cols)
  // Avoid rewriting unchanged text: assigning thousands of characters is
  // expensive and resets per-character styling, including bound fills.
  const wanted = new Array(rows).fill(rowLine).join('\n')
  if (node.characters !== wanted) node.characters = wanted

  node.x = ext.startX
  node.y = ext.startY

  node.fills = [{ type: 'SOLID', color: COLOR_CHAR }]

  return node.id
}

// ---------------------------------------------------------------------------
// Grid drawn as real vector lines
// ---------------------------------------------------------------------------

type Segment = [number, number, number, number] // x1, y1, x2, y2

// One VectorNode holds every line of a layer as a single multi-segment path,
// so a 3× grid costs two nodes instead of several hundred rectangles.
function drawLines(
  parent: FrameNode,
  name: string,
  segs: Segment[],
  color: RGB,
  weight: number,
): VectorNode | null {
  if (segs.length === 0) return null

  let minX = Infinity
  let minY = Infinity
  for (const s of segs) {
    minX = Math.min(minX, s[0], s[2])
    minY = Math.min(minY, s[1], s[3])
  }

  // Emit the path relative to its own top-left, then place the node at that
  // offset — independent of how Figma normalises vector bounds.
  const data = segs
    .map((s) => `M ${s[0] - minX} ${s[1] - minY} L ${s[2] - minX} ${s[3] - minY}`)
    .join(' ')

  const node = figma.createVector()
  node.name = name
  parent.appendChild(node)
  node.vectorPaths = [{ windingRule: 'NONE', data }]
  node.x = minX
  node.y = minY
  node.fills = []
  node.strokes = [{ type: 'SOLID', color }]
  node.strokeWeight = weight
  node.strokeAlign = 'CENTER'
  return node
}

async function ensureGridLines(
  frame: FrameNode,
  g: GridResult,
  p: Params,
  existingId: string | null,
): Promise<string> {
  let container = (await claimLayer(
    frame,
    GRID_LINES_NAME,
    'FRAME',
    existingId,
  )) as FrameNode | null
  if (!container) {
    container = figma.createFrame()
    container.name = GRID_LINES_NAME
    frame.appendChild(container)
  }

  container.fills = []
  // The grid runs full bleed past the frame edges; clipping here crops it to
  // the frame regardless of the parent frame's own clip setting.
  container.clipsContent = true
  container.resize(frame.width, frame.height)
  container.x = 0
  container.y = 0
  container.visible = flag(p.showLines, DEFAULT_PARAMS.showLines)

  // Rebuilt from scratch each time — cheap at two nodes, and avoids having to
  // diff line counts when the density or params change.
  for (const child of container.children.slice()) child.remove()

  // Same full-bleed extent as the char grid, so the two line up exactly.
  const ext = gridExtent(g, frame.width, frame.height)
  const right = ext.startX + ext.width
  const bottom = ext.startY + ext.height

  // Subdivided by the cell density, matching the layout grid.
  const d = clampDensity(p.cellDensity)
  const stepX = g.u / d
  const stepY = g.cellH / d

  // Always omit lines on or beyond the frame boundary. Edge cull also removes
  // nearby interior lines within edgeCullPct of a step to avoid darkening the edge.
  const cullOn = flag(p.edgeCull, DEFAULT_PARAMS.edgeCull)
  const cull = edgeCullRatioOf(p)
  const tolX = stepX * cull
  const tolY = stepY * cull

  // Coarse densities can leave a fractional line count; the loop floor just
  // stops at the last coarse line inside the extent.
  const lastCol = Math.floor(ext.cols * d + 1e-9)
  const lastRow = Math.floor(ext.rows * d + 1e-9)

  const cells: Segment[] = []
  for (let i = 0; i <= lastCol; i++) {
    const x = ext.startX + i * stepX
    if (x < EDGE_CULL_EPSILON || x > frame.width - EDGE_CULL_EPSILON) continue
    if (cullOn && (x < tolX || frame.width - x < tolX)) continue
    cells.push([x, ext.startY, x, bottom])
  }
  for (let j = 0; j <= lastRow; j++) {
    const y = ext.startY + j * stepY
    if (y < EDGE_CULL_EPSILON || y > frame.height - EDGE_CULL_EPSILON) continue
    if (cullOn && (y < tolY || frame.height - y < tolY)) continue
    cells.push([ext.startX, y, right, y])
  }
  // Only the cell grid is drawn — the columns stay a Figma layout grid.
  drawLines(container, `Cell Grid ${d}x`, cells, COLOR_LINES, 1.0)

  return container.id
}

// ---------------------------------------------------------------------------
// Type specimens
// ---------------------------------------------------------------------------

// A stack of text set to the grid: line height is a whole multiple of the cell
// height and every baseline lands on a cell line. Mono is uppercase at a flat 4%;
// sans uses the design system's optical tracking curve.
async function ensureSpecimens(
  frame: FrameNode,
  g: GridResult,
  p: Params,
  monoProbe: MetricsProbe,
  sansProbe: MetricsProbe,
  existingId: string | null,
): Promise<string> {
  let container = (await claimLayer(
    frame,
    SPECIMENS_NAME,
    'FRAME',
    existingId,
  )) as FrameNode | null
  if (!container) {
    container = figma.createFrame()
    container.name = SPECIMENS_NAME
    frame.appendChild(container)
  }

  container.fills = []
  container.clipsContent = false
  container.resize(frame.width, frame.height)
  container.x = 0
  container.y = 0
  container.visible = flag(p.showSpecimens, DEFAULT_PARAMS.showSpecimens)

  const monoFont: FontName = {
    family: monoProbe.family,
    style: monoProbe.style,
  }
  const sansFont: FontName = {
    family: sansProbe.family,
    style: sansProbe.style,
  }
  await figma.loadFontAsync(monoFont)
  await figma.loadFontAsync(sansFont)

  // Size each specimen from the frame height, then snap to whole cells so the
  // line height still lands on the grid.
  const sized = specimensOf(p).map((spec) => ({
    spec,
    cells: Math.max(1, Math.round((frame.height * spec.heightRatio) / g.cellH)),
  }))

  // Each specimen's baseline sits on the cell line at the bottom of its own
  // block, so the stack never overlaps and every baseline is on the grid. Only
  // include what fits — dropping the largest keeps everything on canvas instead
  // of hanging the display sizes off the bottom.
  const budget = g.rows - SPECIMEN_START_CELL
  const fitting: typeof sized = []
  let used = 0
  for (const item of sized) {
    if (used + item.cells > budget) continue
    used += item.cells
    fitting.push(item)
  }

  // Anchor mono at the top and sans at the bottom. Both stacks use whole-cell
  // offsets to keep their baselines on the grid.
  const monoItems = fitting.filter((i) => i.spec.face === 'mono')
  const sansItems = fitting.filter((i) => i.spec.face !== 'mono')
  const sansCells = sansItems.reduce((sum, i) => sum + i.cells, 0)

  // A baseline is not the bottom of the text — the descender hangs below it. So
  // the last baseline cannot sit on the final cell line, or the node's box spills
  // out of the frame. Reserve the measured descender, rounded up to whole cells,
  // which keeps every baseline on a cell line while the box stays inside.
  const tail = sansItems[sansItems.length - 1]
  let tailCells = 0
  if (tail) {
    const lineHeight = tail.cells * g.cellH
    const fontSize = lineHeight * tail.spec.scale
    const offset = await measureBaselineOffset(sansFont, fontSize, lineHeight)
    const descender =
      lineHeight -
      (offset !== null ? offset : firstBaselineOffset(lineHeight, fontSize, sansProbe))
    // Add the same inset as the mono block. Rounding the descender alone can
    // leave almost no clearance from the frame edge.
    tailCells = Math.max(0, Math.ceil(descender / g.cellH - 1e-9)) + SPECIMEN_START_CELL
  }

  // Clamped so a stack too tall for the frame still starts on the grid rather
  // than above it, in which case it clips as it did before.
  const sansStart = Math.max(SPECIMEN_START_CELL, g.rows - sansCells - tailCells)

  // Match specimens by layer name and update them in place to preserve edited
  // text and avoid resetting per-character styling during live updates.
  const reusable = new Map<string, TextNode>()
  for (const child of container.children) {
    if (child.type === 'TEXT') reusable.set(child.name, child as TextNode)
  }

  // Reuse the node of that name if there is one, else make it. `characters` is
  // written only on creation, so edited specimen text survives a reapply.
  const place = async (
    spec: SpecimenSpec,
    mult: number,
    baselineCell: number,
  ): Promise<void> => {
    const isMono = spec.face === 'mono'
    const font = isMono ? monoFont : sansFont
    const probe = isMono ? monoProbe : sansProbe
    const lineHeight = mult * g.cellH
    const fontSize = lineHeight * spec.scale

    let node = reusable.get(spec.name) || null
    if (node) {
      reusable.delete(spec.name)
    } else {
      node = figma.createText()
      node.name = spec.name
      container.appendChild(node)
      node.fontName = font
      node.textAlignHorizontal = 'LEFT'
      node.textAlignVertical = 'TOP'
      node.textAutoResize = 'WIDTH_AND_HEIGHT'
      node.characters = spec.text
    }
    if (node.parent !== container) container.appendChild(node)

    // Only reassigned when it differs: setting fontName re-shapes the text.
    const current = node.fontName
    const sameFont =
      current !== figma.mixed &&
      (current as FontName).family === font.family &&
      (current as FontName).style === font.style
    if (!sameFont) node.fontName = font

    node.fontSize = fontSize
    node.lineHeight = { value: lineHeight, unit: 'PIXELS' }
    node.letterSpacing = {
      value: isMono ? MONO_TRACKING_PCT : opticalTrackingPct(fontSize),
      unit: 'PERCENT',
    }
    node.textCase = isMono ? 'UPPER' : 'ORIGINAL'
    node.fills = [{ type: 'SOLID', color: COLOR_TEXT }]

    const targetBaseline = g.rowOffset + baselineCell * g.cellH
    const measured = await measureBaselineOffset(font, fontSize, lineHeight)
    node.x = g.effectiveMargin
    node.y =
      targetBaseline -
      (measured !== null ? measured : firstBaselineOffset(lineHeight, fontSize, probe))
  }

  let cell = SPECIMEN_START_CELL
  for (const { spec, cells: mult } of monoItems) {
    cell += mult
    await place(spec, mult, cell)
  }

  cell = sansStart
  for (const { spec, cells: mult } of sansItems) {
    cell += mult
    await place(spec, mult, cell)
  }

  // Remove specimens that are no longer used.
  reusable.forEach((node) => node.remove())

  return container.id
}

// ---------------------------------------------------------------------------
// Apply / remove / create
// ---------------------------------------------------------------------------

async function applyGrids(frame: FrameNode, p: Params): Promise<void> {
  const stored = getStoredData(frame)
  const g = computeGrid(p, frame.width, frame.height)

  frame.layoutGrids = buildLayoutGrids(g, columnCountOf(p), p.cellDensity)

  const monoWanted = p.monoFamily || DEFAULT_PARAMS.monoFamily
  const sansWanted = p.sansFamily || DEFAULT_PARAMS.sansFamily
  // Cached probes describe a specific pair of families. Asking for different ones
  // must re-measure, or the char grid keeps the old family's advance width and
  // every character stops being exactly one cell wide.
  const cache =
    stored &&
    (stored.state.probedMono || DEFAULT_PARAMS.monoFamily) === monoWanted &&
    (stored.state.probedSans || DEFAULT_PARAMS.sansFamily) === sansWanted
      ? stored.state
      : null

  const fontProbe = (cache && cache.fontProbe) || (await probeFont(monoWanted))
  // Metrics for the specimen faces: the char grid's mono, and the sans.
  const monoProbe =
    (cache && cache.monoProbe) ||
    (await probeMetrics({ family: fontProbe.family, style: fontProbe.style }))
  const sansProbe =
    (cache && cache.sansProbe) ||
    (await probeMetrics(
      await resolveFont([
        { family: sansWanted, style: 'Regular' },
        SANS_FONT,
        { family: 'Suisse Intl', style: 'Regular' },
        { family: 'Inter', style: 'Regular' },
      ]),
    ))
  const charGridId = await ensureCharGrid(
    frame,
    g,
    p,
    fontProbe,
    (stored && stored.state.charGridId) || null,
  )

  const linesId = await ensureGridLines(
    frame,
    g,
    p,
    (stored && stored.state.linesId) || null,
  )

  const specimensId = await ensureSpecimens(
    frame,
    g,
    p,
    monoProbe,
    sansProbe,
    (stored && stored.state.specimensId) || null,
  )

  setStoredData(frame, {
    version: 1,
    params: p,
    state: {
      probedMono: monoWanted,
      probedSans: sansWanted,
      charGridId,
      linesId,
      specimensId,
      fontProbe,
      monoProbe,
      sansProbe,
    },
  })
}

async function removeGrids(frame: FrameNode): Promise<void> {
  frame.layoutGrids = []

  const stored = getStoredData(frame)
  if (stored) {
    for (const id of [
      stored.state.charGridId,
      stored.state.linesId,
      stored.state.specimensId,
    ]) {
      if (!id) continue
      const node = await figma.getNodeByIdAsync(id)
      // Guarded by isInside for the same reason claimLayer is: on a duplicated
      // frame the stored ids belong to the original, and removing them here would
      // strip the grid off the frame you copied from.
      if (node && !node.removed && isInside(node, frame) && 'remove' in node) {
        node.remove()
      }
    }
  }

  // Then anything of ours still in the frame — layers an older version never
  // stored an id for, and duplicates left by a previous apply.
  for (const child of frame.children.slice()) {
    if (GENERATED_NAMES.indexOf(child.name) !== -1) child.remove()
  }

  clearStoredData(frame)
}

function createFrame(p: Params): FrameNode {
  const W = Math.max(1, Math.round(p.frameWidth))
  const H = frameHeightOf(p, W)

  const frame = figma.createFrame()
  frame.name = 'Dual Grid Frame'
  frame.resize(W, H)
  frame.fills = [{ type: 'SOLID', color: COLOR_BG }]

  const center = figma.viewport.center
  frame.x = Math.round(center.x - W / 2)
  frame.y = Math.round(center.y - H / 2)
  figma.currentPage.appendChild(frame)

  return frame
}

async function handleAction(
  action: 'create' | 'apply' | 'remove',
  p: Params,
): Promise<void> {
  if (action === 'create') {
    const frame = createFrame(p)
    await serialiseApply(() => applyGrids(frame, p))
    figma.currentPage.selection = [frame]
    figma.viewport.scrollAndZoomIntoView([frame])
    figma.notify('Frame created')
    return
  }

  const frame = selectedFrame()
  if (!frame) {
    figma.notify('Select a single frame first', { error: true })
    return
  }

  if (action === 'apply') {
    await serialiseApply(() => applyGrids(frame, p))
    figma.notify('Grids applied')
  } else {
    await removeGrids(frame)
    figma.notify('Grids removed')
  }
}

// Queue applies so asynchronous font loading and measurement cannot interleave
// layer updates. Recover from rejections so later applies can still run.
let applyQueue: Promise<unknown> = Promise.resolve()
function serialiseApply<T>(work: () => Promise<T>): Promise<T> {
  const run = applyQueue.then(work, work)
  applyQueue = run.catch(() => {})
  return run
}

// While a frame with existing grids is selected, editing params re-applies
// live — this is the "bind" described in the spec.
async function maybeLiveReapply(p: Params): Promise<void> {
  const frame = selectedFrame()
  if (frame && getStoredData(frame)) {
    await serialiseApply(() => applyGrids(frame, p))
  }
}

// ---------------------------------------------------------------------------
// pluginData persistence
// ---------------------------------------------------------------------------

function getStoredData(frame: FrameNode): StoredData | null {
  const raw = frame.getPluginData(DATA_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredData
  } catch {
    return null
  }
}

function setStoredData(frame: FrameNode, data: StoredData): void {
  frame.setPluginData(DATA_KEY, JSON.stringify(data))
}

function clearStoredData(frame: FrameNode): void {
  frame.setPluginData(DATA_KEY, '')
}

// ---------------------------------------------------------------------------
// UI state sync
// ---------------------------------------------------------------------------

// The nearest frame at or above this node that carries grid data.
function griddedAncestor(node: BaseNode): FrameNode | null {
  let current: BaseNode | null = node
  while (current) {
    if (current.type === 'FRAME' && getStoredData(current as FrameNode)) {
      return current as FrameNode
    }
    current = current.parent
  }
  return null
}

// Prefer the nearest gridded ancestor so selecting its children keeps live
// editing active and does not target generated container frames. Otherwise,
// use a directly selected frame for the first apply; ignore ungridded ancestors.
function selectedFrame(): FrameNode | null {
  const sel = figma.currentPage.selection
  if (sel.length === 0) return null

  // Every selected node has to resolve to the same frame, else it is ambiguous.
  let agreed: FrameNode | null = null
  for (const node of sel) {
    const frame =
      griddedAncestor(node) || (node.type === 'FRAME' ? (node as FrameNode) : null)
    if (!frame) return null
    if (agreed && frame !== agreed) return null
    agreed = frame
  }
  return agreed
}

// Selecting a frame that already carries grid state restores its stored params
// into the panel, so the controls always describe the bound frame.
function onSelectionChange(): void {
  const frame = selectedFrame()
  if (frame) {
    const stored = getStoredData(frame)
    if (stored) {
      lastParams = { ...lastParams, ...stored.params }
      figma.ui.postMessage({ type: 'params-change', params: lastParams })
    }
  }
  sendActionState()
}

function sendActionState(): void {
  const frame = selectedFrame()
  const bound = !!(frame && getStoredData(frame))

  // Live preview of the resulting grid. Measured against the selected frame if
  // there is one, otherwise against the "New frame" params.
  const W = frame ? frame.width : Math.max(1, Math.round(lastParams.frameWidth))
  const H = frame ? frame.height : frameHeightOf(lastParams, W)
  const g = computeGrid(lastParams, W, H)

  // Offer removal for a gridded frame, apply for an ungridded frame, and creation
  // when the selection does not resolve to a frame.
  const action = !frame ? 'create' : bound ? 'remove' : 'apply'
  const label =
    action === 'create'
      ? 'Create frame'
      : action === 'remove'
        ? 'Remove grids'
        : 'Apply grids'

  figma.ui.postMessage({
    type: 'action-state',
    action,
    actionLabel: label,
    actionDanger: action === 'remove',
    status: bound ? 'Live editing' : '',
    preview: {
      source: frame ? 'selection' : 'new frame',
      frameW: W,
      frameH: H,
      cols: g.N,
      rows: g.rows,
      u: g.u,
      cellH: g.cellH,
      columns: columnCountOf(lastParams),
      mode: lastParams.mode,
      solved: g.solved,
      solvedM: g.solvedM,
      solvedK: g.solvedK,
      solvedG: g.solvedG,
      targetColumns: lastParams.targetColumns,
      monoFamily: lastParams.monoFamily,
      sansFamily: lastParams.sansFamily,
      frameHeightParam: lastParams.frameHeight,
      frameAspect: lastParams.frameAspect,
      cellLadder: g.cellLadder,
      cellColumns: g.cellColumnsTaken,
      targetMarginPx: lastParams.targetMarginPx,
      targetGutterPx: lastParams.targetGutterPx,
      actualAspect: g.actualAspect,
      density: g.cellsPerGutter,
      gutterCells: g.cellsPerGutter,
      gutterPx: g.gutterWidth,
      marginPx: g.margin,
      effectiveMargin: g.effectiveMargin,
      hRemainder: g.hRemainder,
      rowOffset: g.rowOffset,
      vRemainder: g.vRemainder,
      offsetX: g.offsetX,
      columnWidth: g.columnWidth,
      columnCells: g.columnCells,
      marginCells: g.solvedM,
      contentWidth: g.contentWidth,
      gridW: g.N * g.u,
      gridH: g.rows * g.cellH,
      deltaPct: g.deltaPct,
      warn: g.warn,
    },
  })
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

// Run after the constants used by computeGrid are initialised to avoid a
// temporal-dead-zone error.
sendActionState()
