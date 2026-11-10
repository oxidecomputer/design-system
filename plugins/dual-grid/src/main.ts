// Dual Grid Generator
//
// Overlays aligned column and cell grids on a frame. Margin, column and gutter
// widths are whole multiples of the cell width `u`. See README.md for the equations.
//
// The grid math is imported from components/src/grid (published as
// @oxide/design-system/grid); Vite bundles it into dist/main.js.

import {
  computeGrid,
  DEFAULT_ASPECT_TOL_PCT,
  DEFAULT_CELL_ASPECT,
  DEFAULT_EDGE_CULL_PCT,
  DEFAULT_SNAP_TOLERANCE_PX,
  DEFAULT_TARGET_CELL_COLUMNS,
  gridExtent,
  gridLineSegments,
  parseAspect,
  snapLineHeight,
  type GridResult,
  type GridSpec,
  type Segment,
} from '../../../components/src/grid'

type GridMode = 'Manual' | 'Solve'
type DisplayMode = 'Screen' | 'Social' | 'Print' | 'Custom'

interface Params {
  mode: GridMode
  columnCount: number // c: number of columns
  // Margin and gutter are independent cell counts; column width is derived.
  marginCells: number // m — margin width in cells (the left margin if asymmetric)
  // Manual mode: when on, marginRightCells sets the right margin and
  // marginCells only the left.
  asymmetricMargin: boolean
  marginRightCells: number
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
  // Round specimen font sizes to whole pixels. Line heights stay on cell steps,
  // which may be fractional, so baselines remain on the grid.
  snapFontPx: boolean
  // Leading (line height ÷ font size) and tracking (% of font size) curves.
  // See parseCurve for the format. Empty sans tracking uses the optical curve.
  monoLeading: string
  sansLeading: string
  monoTracking: string
  sansTracking: string
  // How large the frame appears to its reader; see displayScaleOf. Shown width
  // is read only in Custom, print width and distance only in Print.
  displayMode: DisplayMode
  shownWidthPx: number
  printWidthMm: number
  viewingDistanceCm: number
  // All three are used only by the "create frame" action. When a frame is
  // selected the panel mirrors its real size into these fields instead, read
  // only, so they always describe the frame in front of you.
  frameWidth: number
  frameAspect: string // "16:9" etc, or "Custom" to use frameHeight directly
  frameHeight: number // only consulted when frameAspect is "Custom"
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

// The optical curve was tuned on a laptop screen, so it describes type by how
// large it looks there. A frame seen at a different size passes the curve the
// laptop px its type appears as: fontSize × displayScaleOf(p, frameWidth).
//
// A laptop CSS px is about 1/125 in, seen from about 22 in, so it subtends
// 1/2750 of a radian. Physical type converts through that angle.
const LAPTOP_PX_PER_RADIAN = 2750
// The CSS px width a phone feed shows a post at. The same post appears in
// desktop feeds too, at about 550px, but type has to work at the smallest size
// it is seen, so the phone sets the tracking. Phones are held closer than
// laptops and their CSS px are already sized for it, so no distance term is
// needed.
const SOCIAL_FEED_PX = 400

function positiveOr(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && value > 0 ? value : fallback
}

// The width the frame appears as, in laptop px.
function apparentWidthOf(p: Params, frameWidth: number): number {
  switch (p.displayMode) {
    case 'Social':
      return SOCIAL_FEED_PX
    case 'Custom':
      return positiveOr(p.shownWidthPx, DEFAULT_PARAMS.shownWidthPx)
    case 'Print': {
      const widthMm = positiveOr(p.printWidthMm, DEFAULT_PARAMS.printWidthMm)
      const distanceMm =
        positiveOr(p.viewingDistanceCm, DEFAULT_PARAMS.viewingDistanceCm) * 10
      return (LAPTOP_PX_PER_RADIAN * widthMm) / distanceMm
    }
    default:
      return frameWidth
  }
}

function displayScaleOf(p: Params, frameWidth: number): number {
  return frameWidth > 0 ? apparentWidthOf(p, frameWidth) / frameWidth : 1
}

// Size specimens relative to frame height, then round line heights to whole
// cells. This keeps the type scale largely independent of cell density.
interface SpecimenSpec {
  name: string
  face: 'mono' | 'sans'
  heightRatio: number // share of the frame height, before snapping
  scale: number // fontSize as a share of the requested line height
  trackingPct: number | null // letter spacing in % of the font size; null = optical
  text: string
  // Position in its family's size list, e.g. "sans:2". Specimens are matched by
  // slot, so text typed into the third sans specimen stays with the third one
  // whatever its size becomes.
  slot: string
}

// A curve keyed by specimen size (% of frame height), written as
// "size: value" pairs separated by commas, e.g. "6: 1.22, 12: 1.09, 24: 1".
// A single bare number is a constant. Values between points interpolate
// linearly and clamp beyond the ends. Entries outside [min, max] are ignored;
// if none remain the curve is null and the caller falls back.
type Curve = Array<[number, number]>
function parseCurve(raw: string | undefined, min: number, max: number): Curve | null {
  const text = typeof raw === 'string' ? raw.trim() : ''
  if (!text) return null
  const inRange = (n: number) => Number.isFinite(n) && n >= min && n <= max
  const bare = Number(text.replace('%', ''))
  if (inRange(bare)) return [[0, bare]]
  const points: Curve = []
  for (const entry of text.split(',')) {
    const parts = entry.split(':')
    if (parts.length !== 2) continue
    const xText = parts[0].trim().replace('%', '')
    const yText = parts[1].trim().replace('%', '')
    // Number('') is 0, so an unfinished pair such as "6:" would otherwise read as
    // a real value of 0 mid-typing.
    if (!xText || !yText) continue
    const x = Number(xText)
    const y = Number(yText)
    if (Number.isFinite(x) && x > 0 && inRange(y)) points.push([x, y])
  }
  if (!points.length) return null
  points.sort((a, b) => a[0] - b[0])
  // Keep the first value for a repeated size, so the curve stays a function.
  return points.filter((pt, i) => i === 0 || pt[0] !== points[i - 1][0])
}

// `inverse` interpolates linearly in 1/x rather than x, so each segment
// follows y = a / x + b — the shape of the optical tracking curve. Two points
// then pin down exactly one such curve: the design system's curve, moved to
// pass through them. Sizes are all positive (see parseCurve), so 1/x is safe.
function curveAt(curve: Curve, x: number, inverse = false): number {
  if (x <= curve[0][0]) return curve[0][1]
  const t = (v: number) => (inverse ? 1 / v : v)
  for (let i = 1; i < curve.length; i++) {
    if (x <= curve[i][0]) {
      const [x0, y0] = curve[i - 1]
      const [x1, y1] = curve[i]
      return y0 + ((t(x) - t(x0)) / (t(x1) - t(x0))) * (y1 - y0)
    }
  }
  return curve[curve.length - 1][1]
}

// Leading is line height ÷ font size. Below 1 has no effect, since font size is
// capped at the snapped line height; the upper bound only rejects typos.
const LEADING_MIN = 0.5
const LEADING_MAX = 5
// Tracking in % of the font size, Figma's PERCENT unit. Wide enough for
// letterspaced caps; beyond it is almost certainly a typo.
const TRACKING_MIN = -50
const TRACKING_MAX = 100

function leadingCurveOf(raw: string | undefined, fallback: string): Curve {
  return (
    parseCurve(raw, LEADING_MIN, LEADING_MAX) ||
    (parseCurve(fallback, LEADING_MIN, LEADING_MAX) as Curve)
  )
}

// Empty or unusable sans tracking means the optical curve, so null is a valid
// result here rather than a reason to fall back.
function trackingCurveOf(raw: string | undefined, fallback: string): Curve | null {
  return (
    parseCurve(raw, TRACKING_MIN, TRACKING_MAX) ||
    parseCurve(fallback, TRACKING_MIN, TRACKING_MAX)
  )
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
  const monoLeading = leadingCurveOf(p.monoLeading, DEFAULT_PARAMS.monoLeading)
  const sansLeading = leadingCurveOf(p.sansLeading, DEFAULT_PARAMS.sansLeading)
  const monoTracking = trackingCurveOf(p.monoTracking, DEFAULT_PARAMS.monoTracking)
  const sansTracking = trackingCurveOf(p.sansTracking, DEFAULT_PARAMS.sansTracking)
  const mono = parseSizesPct(p.monoSizes, DEFAULT_PARAMS.monoSizes).map(
    (pct, i): SpecimenSpec => ({
      slot: `mono:${i}`,
      name: `Mono ${pct}%`,
      face: 'mono',
      heightRatio: pct / 100,
      scale: 1 / curveAt(monoLeading, pct),
      trackingPct: monoTracking ? curveAt(monoTracking, pct, true) : null,
      text: 'GT America Mono · 0123456789',
    }),
  )
  const sans = parseSizesPct(p.sansSizes, DEFAULT_PARAMS.sansSizes).map(
    (pct, i): SpecimenSpec => ({
      slot: `sans:${i}`,
      name: `Sans ${pct}%`,
      face: 'sans',
      heightRatio: pct / 100,
      scale: 1 / curveAt(sansLeading, pct),
      trackingPct: sansTracking ? curveAt(sansTracking, pct, true) : null,
      text: sansSpecimenText(pct),
    }),
  )
  return mono.concat(sans)
}

interface SizedSpecimen {
  spec: SpecimenSpec
  cells: number // line height in cells; a multiple of 0.5 below HALF_CELL_BELOW
  rows: number // whole cells the specimen occupies in the stack
  fontSize: number
}

// Line heights shorter than this many cells snap to half cells instead of
// whole ones. A whole-cell step is a large share of a short line, so 1 → 2
// cells doubles the leading; half steps halve that jump. Above it, a cell is a
// small enough share that whole cells read as even. The stack still advances
// in whole cells (see `rows`), so every baseline stays on a cell line; only a
// second line of wrapped text would fall on a half-cell line.
const HALF_CELL_BELOW = 4

function snapSpecimenLineHeight(g: GridResult, target: number): number {
  const exact = target / g.cellH
  if (exact < HALF_CELL_BELOW) return Math.max(0.5, Math.round(exact * 2) / 2)
  return snapLineHeight(g, target).cells
}

// Size each specimen from the frame height. The line height snaps to cells
// (see snapSpecimenLineHeight). Font size follows the requested line height
// rather than the snapped one, so fractional percentages still change the type
// when they round to the same number of cells. It is capped at the line height
// so leading never goes below 1.0, where text would overlap the specimen above.
function sizeSpecimens(p: Params, g: GridResult, frameHeight: number): SizedSpecimen[] {
  const snapFont = flag(p.snapFontPx, DEFAULT_PARAMS.snapFontPx)
  return specimensOf(p).map((spec) => {
    const target = frameHeight * spec.heightRatio
    const cells = snapSpecimenLineHeight(g, target)
    const lineHeight = cells * g.cellH
    const raw = Math.min(target * spec.scale, lineHeight)
    // Rounded down where rounding up would pass the cap. At least 1px, so a
    // tiny specimen never rounds to an invalid size of 0.
    const fontSize = snapFont
      ? Math.max(1, Math.min(Math.round(raw), Math.floor(lineHeight + 1e-9)))
      : raw
    return { spec, cells, rows: Math.ceil(cells), fontSize }
  })
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
  asymmetricMargin: false,
  marginRightCells: 3,
  gutterMultiple: 1,
  targetMarginPx: 50,
  targetGutterPx: 20,
  // Both modes default to the same cell-column count, so switching between
  // them does not jump the grid.
  cellColumns: DEFAULT_TARGET_CELL_COLUMNS,
  targetColumns: DEFAULT_TARGET_CELL_COLUMNS,
  cellAspect: DEFAULT_CELL_ASPECT,
  snapRows: true,
  // Off by default: the cell divides the frame exactly and there is no bleed.
  pixelPerfect: false,
  snapTolerancePx: DEFAULT_SNAP_TOLERANCE_PX,
  edgeCull: true,
  edgeCullPct: DEFAULT_EDGE_CULL_PCT,
  aspectTolPct: DEFAULT_ASPECT_TOL_PCT,
  cellDensity: 1,
  showLines: true,
  showSpecimens: true,
  monoFamily: MONO_FONT.family,
  sansFamily: SANS_FONT.family,
  // The reference specimen scale: a 2% mono caption, then sans at 6/12/24%.
  monoSizes: '2',
  sansSizes: '6, 12, 24',
  snapFontPx: false,
  // Leading opens up at small sizes and closes to 1.0 for display sans. Mono is
  // set uppercase at a flat 4% per the design system's mono scale.
  monoLeading: '2: 1.6, 12: 1.25',
  sansLeading: '6: 1.22, 12: 1.09, 24: 1',
  monoTracking: '4',
  sansTracking: '',
  displayMode: 'Screen',
  shownWidthPx: SOCIAL_FEED_PX,
  // A4 read in the hand.
  printWidthMm: 210,
  viewingDistanceCm: 40,
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

let actionBusy = false

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
      // One action at a time: a second press while one is running (a
      // double-click) is ignored rather than queued.
      if (actionBusy) return
      actionBusy = true
      try {
        lastParams = msg.params
        await handleAction(msg.action, lastParams)
      } finally {
        actionBusy = false
      }
      sendActionState()
    }
  } catch (err) {
    figma.notify('⚠ ' + (err as Error).message, { error: true })
    // A failed write can leave the frame in a different state from the one the
    // footer describes, so refresh it.
    sendActionState()
  }
}

// ---------------------------------------------------------------------------
// Params → GridSpec
// ---------------------------------------------------------------------------

// Stored pluginData can be missing a field or hold an unusable value; these
// readers fall back to the default before anything reaches the grid module.

function snapToleranceOf(p: Params): number {
  return typeof p.snapTolerancePx === 'number' && p.snapTolerancePx >= 0
    ? p.snapTolerancePx
    : DEFAULT_PARAMS.snapTolerancePx
}

function aspectTolPctOf(p: Params): number {
  return typeof p.aspectTolPct === 'number' && p.aspectTolPct >= 0
    ? p.aspectTolPct
    : DEFAULT_PARAMS.aspectTolPct
}

function edgeCullPctOf(p: Params): number {
  return typeof p.edgeCullPct === 'number' && p.edgeCullPct >= 0
    ? p.edgeCullPct
    : DEFAULT_PARAMS.edgeCullPct
}

// The requested Manual-mode cell-column count.
function manualColumnsOf(p: Params): number {
  if (typeof p.cellColumns === 'number' && p.cellColumns > 0) {
    return Math.round(p.cellColumns)
  }
  return DEFAULT_PARAMS.cellColumns
}

// Adapts the panel's params to the shared module's spec. Solve targets the
// solver at targetColumns; Manual picks the ladder rung nearest cellColumns.
function gridSpecOf(p: Params, W: number, H: number): GridSpec {
  const base = {
    columns: columnCountOf(p),
    width: W,
    height: H,
    cellAspect: p.cellAspect,
    snapRows: p.snapRows,
    pixelSnap: p.pixelPerfect,
    snapTolerancePx: snapToleranceOf(p),
    aspectTolerancePct: aspectTolPctOf(p),
  }
  if (p.mode === 'Solve') {
    return {
      ...base,
      mode: 'auto',
      targetMarginPx: p.targetMarginPx,
      targetGutterPx: p.targetGutterPx,
      targetCellColumns: p.targetColumns || DEFAULT_PARAMS.targetColumns,
    }
  }
  return {
    ...base,
    mode: 'manual',
    marginCells: marginCellsOf(p),
    marginRightCells: p.asymmetricMargin === true ? marginRightCellsOf(p) : undefined,
    gutterCells: p.gutterMultiple,
    targetCellColumns: manualColumnsOf(p),
  }
}

// ----- palette -------------------------------------------------------------
// Colours come from design-system swatches in the team library, bound as
// COLOR variables. The hex values are fallbacks for files where the library
// isn't enabled, so the plugin still draws something sensible.
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

const SWATCH_BG = 'base/neutral/100'
const SWATCH_TEXT = 'base/green/1200'
const SWATCH_CHAR = 'base/neutral/500'
const SWATCH_LINES = 'base/neutral/400'

// Swatch names are the full path, e.g. `base/neutral/400`. Depending on how the
// tokens were synced, the library may store that as a variable named
// `base/neutral/400` or as `neutral/400` inside a `base` collection, so the
// index holds both spellings.
//
// Built once per plugin session: listing library variables is a network round
// trip, and live reapplies run on every slider change.
let libraryIndex: Promise<Map<string, string>> | null = null
const swatchCache = new Map<string, Promise<Variable | null>>()

async function buildLibraryIndex(): Promise<Map<string, string>> {
  const keys = new Map<string, string>()
  try {
    // Only libraries enabled in the current file are listed.
    const collections =
      await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()
    for (const collection of collections) {
      const vars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
        collection.key,
      )
      for (const v of vars) {
        if (v.resolvedType !== 'COLOR') continue
        const full = `${collection.name}/${v.name}`
        if (!keys.has(full)) keys.set(full, v.key)
        if (!keys.has(v.name)) keys.set(v.name, v.key)
      }
    }
  } catch (err) {
    console.warn(`Library swatches unavailable: ${(err as Error).message}`)
  }
  return keys
}

function findSwatch(swatch: string): Promise<Variable | null> {
  let found = swatchCache.get(swatch)
  if (!found) {
    found = importSwatch(swatch)
    swatchCache.set(swatch, found)
  }
  return found
}

async function importSwatch(swatch: string): Promise<Variable | null> {
  if (!libraryIndex) libraryIndex = buildLibraryIndex()
  const key = (await libraryIndex).get(swatch)
  if (!key) return null
  try {
    return await figma.variables.importVariableByKeyAsync(key)
  } catch (err) {
    console.warn(`Swatch ${swatch} unavailable: ${(err as Error).message}`)
    return null
  }
}

// Figma stores text fills per character, and only setRangeFills keeps a
// variable binding on text; assigning `fills` drops it. An empty node has no
// range to set, so it takes the node-wide fill.
function fillText(node: TextNode, paint: SolidPaint): void {
  const length = node.characters.length
  if (length > 0) node.setRangeFills(0, length, [paint])
  else node.fills = [paint]
}

// A solid paint bound to the swatch, or the literal fallback when the swatch
// can't be found. The paint's literal colour is the variable's value as
// `consumer` resolves it (its mode comes from the node's ancestors). Re-setting
// a text range to a binding it already has keeps the binding but renders the
// paint's literal colour, so a fallback colour there shows on the canvas.
async function swatchPaint(
  swatch: string,
  fallback: RGB,
  consumer: SceneNode,
): Promise<SolidPaint> {
  const variable = await findSwatch(swatch)
  if (!variable) return { type: 'SOLID', color: fallback }
  let color = fallback
  let opacity = 1
  try {
    const { value } = variable.resolveForConsumer(consumer)
    const c = value as RGBA
    color = { r: c.r, g: c.g, b: c.b }
    if (typeof c.a === 'number') opacity = c.a
  } catch (err) {
    console.warn(`Swatch ${swatch} unresolved: ${(err as Error).message}`)
  }
  return figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color, opacity },
    'color',
    variable,
  )
}

// The overlay colors of the plugin's three layout grids. They also identify the
// plugin's grids on a frame, so applying and removing leave any layout grids the
// user made alone.
const GRID_COLOR_COLUMNS = { r: 0.53, g: 0.2, b: 0.92, a: 0.3 }
const GRID_COLOR_CELLS = { r: 0, g: 0.85, b: 0.9, a: 0.3 }

function isOwnLayoutGrid(grid: LayoutGrid): boolean {
  if (grid.pattern === 'GRID') return false
  const c = grid.color
  if (!c) return false
  const same = (o: RGBA) =>
    Math.abs(c.r - o.r) < 0.005 &&
    Math.abs(c.g - o.g) < 0.005 &&
    Math.abs(c.b - o.b) < 0.005 &&
    Math.abs(c.a - o.a) < 0.005
  return same(GRID_COLOR_COLUMNS) || same(GRID_COLOR_CELLS)
}

// The frame's layout grids with the plugin's own replaced by `ours`.
function withOwnLayoutGrids(frame: FrameNode, ours: LayoutGrid[]): LayoutGrid[] {
  return frame.layoutGrids.filter((grid) => !isOwnLayoutGrid(grid)).concat(ours)
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
        color: GRID_COLOR_CELLS,
        visible: true,
      }
    : {
        pattern: 'COLUMNS',
        alignment: 'MIN',
        count: Math.ceil(W / cellStep) + 1,
        sectionSize: cellStep,
        gutterSize: 0,
        offset: (((g.hRemainder / 2) % cellStep) + cellStep) % cellStep,
        color: GRID_COLOR_CELLS,
        visible: true,
      }

  // Equal margins centre the columns. Unequal ones anchor them to a side by its
  // margin instead; Figma rejects negative offsets, so the side with the wider
  // effective margin is used (a pixel snap that rounds u up can push a narrow
  // margin below zero).
  const colColor = GRID_COLOR_COLUMNS
  const columnGrid =
    g.solvedM === g.solvedMR
      ? {
          pattern: 'COLUMNS',
          alignment: 'CENTER',
          count: columns,
          sectionSize: g.columnWidth,
          gutterSize: g.gutterWidth,
          color: colColor,
          visible: true,
        }
      : {
          pattern: 'COLUMNS',
          alignment: g.effectiveMargin >= g.effectiveMarginRight ? 'MIN' : 'MAX',
          count: columns,
          sectionSize: g.columnWidth,
          gutterSize: g.gutterWidth,
          offset: Math.max(0, g.effectiveMargin, g.effectiveMarginRight),
          color: colColor,
          visible: true,
        }

  return [
    columnGrid,
    cellGrid,
    {
      pattern: 'ROWS',
      alignment: 'MIN',
      count: rowCount,
      sectionSize: stepY,
      gutterSize: 0,
      offset: rowOffset,
      color: GRID_COLOR_CELLS,
      visible: true,
    },
  ] as LayoutGrid[]
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

// The right margin in cells, used only when asymmetricMargin is on.
function marginRightCellsOf(p: Params): number {
  if (typeof p.marginRightCells === 'number') {
    return Math.max(0, Math.round(p.marginRightCells))
  }
  return marginCellsOf(p)
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

// The height a new frame would get: taken directly when the aspect is "Custom",
// else derived from the ratio.
function frameHeightOf(p: Params, W: number): number {
  if (p.frameAspect === 'Custom') {
    return Math.round(positiveOr(p.frameHeight, DEFAULT_PARAMS.frameHeight))
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
  // Measure the character the char grid draws, so a proportional face still
  // advances exactly one cell per character.
  probe.characters = CHAR_GRID_GLYPH
  const w1 = probe.width
  probe.characters = CHAR_GRID_GLYPH + CHAR_GRID_GLYPH
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

// Any installed style of the requested family before the fixed preference list,
// preferring a regular-weight name, so a family whose regular is "Book" or
// "Roman" is still used.
async function resolveSansFont(family: string): Promise<FontName> {
  const available = await figma.listAvailableFontsAsync()
  const inFamily = available.filter((f) => f.fontName.family === family)
  const regularish = (style: string) => /^(regular|book|roman|normal|text)$/i.test(style)
  const own =
    inFamily.find((f) => f.fontName.style === 'Regular') ||
    inFamily.find((f) => regularish(f.fontName.style)) ||
    inFamily[0]
  if (own) return own.fontName
  return resolveFont([
    SANS_FONT,
    { family: 'Suisse Intl', style: 'Regular' },
    { family: 'Inter', style: 'Regular' },
  ])
}

// Cached measurements are keyed by the family names typed, but describe the
// faces actually found. They are stale if either face can no longer be loaded
// (the frame was last written on a machine with fonts this one lacks), or if a
// fallback was cached and the requested family is now installed.
async function cacheUsable(
  state: StoredData['state'],
  monoWanted: string,
  sansWanted: string,
): Promise<boolean> {
  const mono = state.fontProbe
  const sans = state.sansProbe
  if (!mono || !state.monoProbe || !sans) return false
  try {
    await figma.loadFontAsync({ family: mono.family, style: mono.style })
    await figma.loadFontAsync({ family: sans.family, style: sans.style })
  } catch {
    return false
  }
  if (mono.family === monoWanted && sans.family === sansWanted) return true
  const available = await figma.listAvailableFontsAsync()
  const installed = (family: string) => available.some((f) => f.fontName.family === family)
  if (mono.family !== monoWanted && installed(monoWanted)) return false
  if (sans.family !== sansWanted && installed(sansWanted)) return false
  return true
}

// Measure the baseline from the bottom of a flat-footed capital's ink bounds.
// Return null when bounds are unavailable so the caller can use the estimate below.
// Cached by font and size so reapplying with unchanged sizes creates no temp nodes.
const baselineOffsetCache = new Map<string, number | null>()
async function measureBaselineOffset(
  font: FontName,
  fontSize: number,
  lineHeight: number,
): Promise<number | null> {
  const key = `${font.family}|${font.style}|${fontSize}|${lineHeight}`
  const cached = baselineOffsetCache.get(key)
  if (cached !== undefined) return cached

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
  baselineOffsetCache.set(key, offset)
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

// The character drawn in every cell of the char grid.
const CHAR_GRID_GLYPH = '.'
const CHAR_GRID_NAME = 'Char Grid'
const GRID_LINES_NAME = 'Grid Lines'
const SPECIMENS_NAME = 'Type Specimens'
const GENERATED_TYPES: Record<string, string> = {
  [CHAR_GRID_NAME]: 'TEXT',
  [GRID_LINES_NAME]: 'FRAME',
  [SPECIMENS_NAME]: 'FRAME',
}

function isInside(node: BaseNode, frame: FrameNode): boolean {
  let current: BaseNode | null = node
  while (current) {
    if (current === frame) return true
    current = current.parent
  }
  return false
}

// Every layer the plugin creates is marked with its role, so the plugin only
// ever reuses or deletes its own layers, never a user's layer that happens to
// share a name. Figma copies plugin data when a frame is duplicated, so a copy's
// layers keep their marks.
const ROLE_KEY = 'dualGridRole'
const SLOT_KEY = 'dualGridSlot'
// The names an older version gave its specimens, e.g. "Sans 12%".
const LEGACY_SPECIMEN_NAME = /^(Mono|Sans) \d+(\.\d+)?%$/
type Role = 'charGrid' | 'gridLines' | 'specimens' | 'lines' | 'specimen'

function roleOf(node: BaseNode): string {
  return 'getPluginData' in node ? node.getPluginData(ROLE_KEY) : ''
}

function mark(node: SceneNode, role: Role): void {
  node.setPluginData(ROLE_KEY, role)
}

// The frame's generated layers carry marks unless an older version made them.
function hasMarkedLayers(frame: FrameNode): boolean {
  return frame.children.some((child) => roleOf(child) !== '')
}

// Reuse the stored layer only if it belongs to this frame: duplicated frames
// retain IDs pointing to the original. Otherwise take the first child marked with
// this role, and delete any other marked duplicates. Layers from an older version
// carry no mark; they are adopted by name and type, but only on a gridded frame
// with no layer marked for this role, so a user's same-named layer is never taken
// over once the frame has been written by this version.
async function claimLayer(
  frame: FrameNode,
  name: string,
  type: 'TEXT' | 'FRAME',
  storedId: string | null | undefined,
  role: Role,
): Promise<SceneNode | null> {
  const marked = frame.children.filter(
    (child) => child.type === type && roleOf(child) === role,
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
  if (!chosen) chosen = marked[0] || null
  // No layer has this role's mark yet, so on a gridded frame any match by name
  // is an older version's layer.
  if (!chosen && getStoredData(frame)) {
    chosen =
      frame.children.find(
        (child) => child.name === name && child.type === type && roleOf(child) === '',
      ) || null
  }

  for (const other of marked) {
    if (other !== chosen) other.remove()
  }
  if (chosen) mark(chosen, role)
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
    'charGrid',
  )) as TextNode | null
  if (!node) {
    node = figma.createText()
    node.name = CHAR_GRID_NAME
    frame.appendChild(node)
    mark(node, 'charGrid')
  }

  const fontName: FontName = { family: probe.family, style: probe.style }
  await figma.loadFontAsync(fontName)
  node.fontName = fontName

  // Share the line grid's cell dimensions and extend past the frame as needed.
  // Stretching letter spacing to fill the frame would misalign the characters.
  const ext = gridExtent(g)
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
  const rowLine = CHAR_GRID_GLYPH.repeat(cols)
  // Avoid rewriting unchanged text: assigning thousands of characters is
  // expensive and resets per-character styling, including bound fills.
  const wanted = new Array(rows).fill(rowLine).join('\n')
  if (node.characters !== wanted) node.characters = wanted

  node.x = ext.startX
  node.y = ext.startY

  fillText(node, await swatchPaint(SWATCH_CHAR, COLOR_CHAR, node))

  return node.id
}

// ---------------------------------------------------------------------------
// Grid drawn as real vector lines
// ---------------------------------------------------------------------------

// One VectorNode holds every line of a layer as a single multi-segment path,
// so a 3× grid costs two nodes instead of several hundred rectangles.
function drawLines(
  parent: FrameNode,
  name: string,
  segs: Segment[],
  paint: SolidPaint,
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
  node.strokes = [paint]
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
    'gridLines',
  )) as FrameNode | null
  if (!container) {
    container = figma.createFrame()
    container.name = GRID_LINES_NAME
    frame.appendChild(container)
    mark(container, 'gridLines')
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
  // diff line counts when the density or params change. Only the plugin's own
  // vectors are removed (unmarked ones are from an older version, which put
  // nothing else here); anything the user adds is kept.
  for (const child of container.children.slice()) {
    const role = roleOf(child)
    if (role === 'lines' || (role === '' && child.type === 'VECTOR')) child.remove()
  }

  // The segments share the char grid's full-bleed extent and cell density, so
  // the drawn lines and the characters line up exactly.
  const d = clampDensity(p.cellDensity)
  const cells = gridLineSegments(g, frame.width, frame.height, {
    density: d,
    edgeCull: flag(p.edgeCull, DEFAULT_PARAMS.edgeCull),
    edgeCullPct: edgeCullPctOf(p),
  })
  // Only the cell grid is drawn — the columns stay a Figma layout grid.
  const paint = await swatchPaint(SWATCH_LINES, COLOR_LINES, container)
  const lines = drawLines(container, `Cell Grid ${d}x`, cells, paint, 1.0)
  if (lines) mark(lines, 'lines')

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
    'specimens',
  )) as FrameNode | null
  if (!container) {
    container = figma.createFrame()
    container.name = SPECIMENS_NAME
    frame.appendChild(container)
    mark(container, 'specimens')
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

  const textPaint = await swatchPaint(SWATCH_TEXT, COLOR_TEXT, container)
  const sized = sizeSpecimens(p, g, frame.height)
  const displayScale = displayScaleOf(p, frame.width)

  // Each specimen's baseline sits on the cell line at the bottom of its own
  // block, so the stack never overlaps and every baseline is on the grid. Only
  // include what fits — dropping the largest keeps everything on canvas instead
  // of hanging the display sizes off the bottom.
  const budget = g.rows - SPECIMEN_START_CELL
  const fitting: SizedSpecimen[] = []
  let used = 0
  for (const item of sized) {
    if (used + item.rows > budget) continue
    used += item.rows
    fitting.push(item)
  }

  // Anchor mono at the top and sans at the bottom. Both stacks use whole-cell
  // offsets to keep their baselines on the grid.
  const monoItems = fitting.filter((i) => i.spec.face === 'mono')
  const sansItems = fitting.filter((i) => i.spec.face !== 'mono')
  const monoEnd = SPECIMEN_START_CELL + monoItems.reduce((sum, i) => sum + i.rows, 0)

  // A baseline is not the bottom of the text — the descender hangs below it. So
  // the last baseline cannot sit on the final cell line, or the node's box spills
  // out of the frame. Reserve the measured descender, rounded up to whole cells,
  // which keeps every baseline on a cell line while the box stays inside.
  async function tailCellsOf(tail: SizedSpecimen | undefined): Promise<number> {
    if (!tail) return 0
    const lineHeight = tail.cells * g.cellH
    const fontSize = tail.fontSize
    const offset = await measureBaselineOffset(sansFont, fontSize, lineHeight)
    const descender =
      lineHeight -
      (offset !== null ? offset : firstBaselineOffset(lineHeight, fontSize, sansProbe))
    // Add the same inset as the mono block. Rounding the descender alone can
    // leave almost no clearance from the frame edge.
    return Math.max(0, Math.ceil(descender / g.cellH - 1e-9)) + SPECIMEN_START_CELL
  }

  // The fit budget cannot include the tail, which depends on which sans size ends
  // up last, so drop the largest sans size until the two stacks no longer overlap.
  let sansCells = 0
  let tailCells = 0
  for (;;) {
    sansCells = sansItems.reduce((sum, i) => sum + i.rows, 0)
    tailCells = await tailCellsOf(sansItems[sansItems.length - 1])
    if (!sansItems.length || g.rows - sansCells - tailCells >= monoEnd) break
    let largest = 0
    sansItems.forEach((item, i) => {
      // >= so a tie goes to the later, larger size: the list is sorted ascending.
      if (item.rows >= sansItems[largest].rows) largest = i
    })
    sansItems.splice(largest, 1)
  }

  // Clamped so a stack too tall for the frame still starts on the grid rather
  // than above it, in which case it clips as it did before.
  const sansStart = Math.max(SPECIMEN_START_CELL, g.rows - sansCells - tailCells)

  // Match specimens by slot and update them in place to preserve edited text and
  // avoid resetting per-character styling during live updates. Specimens from an
  // older version carry no mark and are matched by name instead. Other layers in
  // the container are the user's and are left alone.
  const bySlot = new Map<string, TextNode>()
  const byLegacyName = new Map<string, TextNode>()
  for (const child of container.children) {
    if (child.type !== 'TEXT') continue
    if (roleOf(child) === 'specimen') {
      bySlot.set(child.getPluginData(SLOT_KEY), child as TextNode)
    } else if (roleOf(child) === '' && LEGACY_SPECIMEN_NAME.test(child.name)) {
      byLegacyName.set(child.name, child as TextNode)
    }
  }

  // Reuse the node of that name if there is one, else make it. `characters` is
  // written only on creation, so edited specimen text survives a reapply.
  const place = async (
    { spec, cells: mult, fontSize }: SizedSpecimen,
    baselineCell: number,
  ): Promise<void> => {
    const isMono = spec.face === 'mono'
    const font = isMono ? monoFont : sansFont
    const probe = isMono ? monoProbe : sansProbe
    const lineHeight = mult * g.cellH

    let node = bySlot.get(spec.slot) || byLegacyName.get(spec.name) || null
    if (node) {
      bySlot.delete(spec.slot)
      byLegacyName.delete(spec.name)
      node.name = spec.name
    } else {
      node = figma.createText()
      node.name = spec.name
      container.appendChild(node)
      node.fontName = font
      node.textAlignHorizontal = 'LEFT'
      node.textAlignVertical = 'TOP'
      node.textAutoResize = 'WIDTH_AND_HEIGHT'
      // The mono placeholder names the face actually drawn, which may be a fallback.
      node.characters = isMono ? `${font.family} · 0123456789` : spec.text
    }
    mark(node, 'specimen')
    node.setPluginData(SLOT_KEY, spec.slot)
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
      value:
        spec.trackingPct !== null
          ? spec.trackingPct
          : opticalTrackingPct(fontSize * displayScale),
      unit: 'PERCENT',
    }
    node.textCase = isMono ? 'UPPER' : 'ORIGINAL'
    fillText(node, textPaint)

    const targetBaseline = g.rowOffset + baselineCell * g.cellH
    const measured = await measureBaselineOffset(font, fontSize, lineHeight)
    node.x = g.effectiveMargin
    node.y =
      targetBaseline -
      (measured !== null ? measured : firstBaselineOffset(lineHeight, fontSize, probe))
  }

  let cell = SPECIMEN_START_CELL
  for (const item of monoItems) {
    cell += item.rows
    await place(item, cell)
  }

  cell = sansStart
  for (const item of sansItems) {
    cell += item.rows
    await place(item, cell)
  }

  // Remove the plugin's specimens that are no longer used.
  bySlot.forEach((node) => node.remove())
  byLegacyName.forEach((node) => node.remove())

  return container.id
}

// ---------------------------------------------------------------------------
// Apply / remove / create
// ---------------------------------------------------------------------------

// Returns a note for each family that was replaced by a fallback face, for the
// actions to report. Live reapplies do not report them, to avoid a notice per edit.
async function applyGrids(frame: FrameNode, p: Params): Promise<string[]> {
  const stored = getStoredData(frame)
  const g = computeGrid(gridSpecOf(p, frame.width, frame.height))

  frame.layoutGrids = withOwnLayoutGrids(
    frame,
    buildLayoutGrids(g, columnCountOf(p), p.cellDensity),
  )

  const monoWanted = p.monoFamily || DEFAULT_PARAMS.monoFamily
  const sansWanted = p.sansFamily || DEFAULT_PARAMS.sansFamily
  // Cached probes describe a specific pair of families. Asking for different ones
  // must re-measure, or the char grid keeps the old family's advance width and
  // every character stops being exactly one cell wide.
  const cache =
    stored &&
    (stored.state.probedMono || DEFAULT_PARAMS.monoFamily) === monoWanted &&
    (stored.state.probedSans || DEFAULT_PARAMS.sansFamily) === sansWanted &&
    (await cacheUsable(stored.state, monoWanted, sansWanted))
      ? stored.state
      : null

  const fontProbe = (cache && cache.fontProbe) || (await probeFont(monoWanted))
  // Metrics for the specimen faces: the char grid's mono, and the sans.
  const monoProbe =
    (cache && cache.monoProbe) ||
    (await probeMetrics({ family: fontProbe.family, style: fontProbe.style }))
  const sansProbe =
    (cache && cache.sansProbe) || (await probeMetrics(await resolveSansFont(sansWanted)))
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

  const notes: string[] = []
  if (fontProbe.family !== monoWanted)
    notes.push(`${fontProbe.family} instead of ${monoWanted}`)
  if (sansProbe.family !== sansWanted)
    notes.push(`${sansProbe.family} instead of ${sansWanted}`)
  return notes
}

async function removeGrids(frame: FrameNode): Promise<void> {
  frame.layoutGrids = withOwnLayoutGrids(frame, [])
  // Decided before anything is removed: a frame written by an older version has
  // no marked layers, and its generated layers are found by name and type.
  const legacy = !hasMarkedLayers(frame)

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

  // Then anything of ours still in the frame: marked duplicates left by a
  // previous apply, and on a legacy frame, layers an older version never stored
  // an id for. A user's layer that merely shares a name is kept.
  for (const child of frame.children.slice()) {
    const role = roleOf(child)
    const own = role === 'charGrid' || role === 'gridLines' || role === 'specimens'
    const legacyOwn = legacy && role === '' && GENERATED_TYPES[child.name] === child.type
    if (own || legacyOwn) child.remove()
  }

  clearStoredData(frame)
}

// The width a new frame would get. Empty, zero and negative entries use the
// default rather than producing a 1px frame.
function frameWidthOf(p: Params): number {
  return Math.max(1, Math.round(positiveOr(p.frameWidth, DEFAULT_PARAMS.frameWidth)))
}

async function createFrame(p: Params): Promise<FrameNode> {
  const W = frameWidthOf(p)
  const H = frameHeightOf(p, W)

  const frame = figma.createFrame()
  frame.name = 'Dual Grid Frame'
  frame.resize(W, H)
  frame.fills = [await swatchPaint(SWATCH_BG, COLOR_BG, frame)]

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
    const frame = await createFrame(p)
    let notes: string[]
    try {
      notes = await serialiseApply(() => applyGrids(frame, p))
    } catch (err) {
      // Leave nothing behind: a frame with layout grids but no layers or stored
      // settings is neither gridded nor clean.
      if (!frame.removed) frame.remove()
      throw err
    }
    figma.currentPage.selection = [frame]
    figma.viewport.scrollAndZoomIntoView([frame])
    figma.notify(withNotes('Frame created', notes))
    return
  }

  const frame = selectedFrame()
  if (!frame) {
    figma.notify('Select a single frame first', { error: true })
    return
  }

  if (action === 'apply') {
    const notes = await serialiseApply(() => applyGrids(frame, p))
    figma.notify(withNotes('Grids applied', notes))
  } else {
    // The panel's button can be stale (after an undo, or a collaborator removing
    // the grid), so check the frame really carries grids before touching it.
    if (!getStoredData(frame)) {
      figma.notify('This frame has no grids to remove')
      return
    }
    await serialiseApply(() => removeGrids(frame))
    figma.notify('Grids removed')
  }
}

function withNotes(message: string, notes: string[]): string {
  return notes.length ? `${message} · using ${notes.join(', ')}` : message
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
      // Over the defaults, not the last settings: a frame gridded before a setting
      // existed was made with that setting's default.
      lastParams = { ...DEFAULT_PARAMS, ...stored.params }
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
  const W = frame ? frame.width : frameWidthOf(lastParams)
  const H = frame ? frame.height : frameHeightOf(lastParams, W)
  const g = computeGrid(gridSpecOf(lastParams, W, H))
  const specimenSizes = sizeSpecimens(lastParams, g, H).map((i) => ({
    face: i.spec.face,
    size: i.fontSize,
  }))

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
      // In Solve the grid is the solver's business, so the Manual request is
      // echoed back untouched rather than overwritten with the solved count.
      cellColumns: g.solved ? manualColumnsOf(lastParams) : g.cellColumnsTaken,
      targetMarginPx: lastParams.targetMarginPx,
      targetGutterPx: lastParams.targetGutterPx,
      actualAspect: g.actualAspect,
      density: g.cellsPerGutter,
      gutterCells: g.cellsPerGutter,
      gutterPx: g.gutterWidth,
      marginPx: g.margin,
      effectiveMargin: g.effectiveMargin,
      effectiveMarginRight: g.effectiveMarginRight,
      // The targets the solver actually used, for flagging achieved values.
      targetMarginUsed: Math.max(0, lastParams.targetMarginPx || 0),
      targetGutterUsed: Math.max(1, lastParams.targetGutterPx || 0),
      targetColumnsUsed: Math.max(
        1,
        Math.round(lastParams.targetColumns || DEFAULT_PARAMS.targetColumns),
      ),
      marginRightPx: g.marginRight,
      solvedMR: g.solvedMR,
      hRemainder: g.hRemainder,
      rowOffset: g.rowOffset,
      vRemainder: g.vRemainder,
      offsetX: g.offsetX,
      columnWidth: g.columnWidth,
      // Font size of each requested specimen, smallest first. Sizes that do
      // not fit the frame are still listed; the stack drops them on apply.
      monoFontSizes: specimenSizes.filter((s) => s.face === 'mono').map((s) => s.size),
      sansFontSizes: specimenSizes.filter((s) => s.face === 'sans').map((s) => s.size),
      displayScale: displayScaleOf(lastParams, W),
      // A custom sans tracking curve replaces the optical one, so the display
      // scale then has nothing to act on.
      opticalTracking: !trackingCurveOf(
        lastParams.sansTracking,
        DEFAULT_PARAMS.sansTracking,
      ),
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
// temporal-dead-zone error. Resolves the selection the plugin opened with, so a
// gridded frame selected at launch loads its stored settings.
onSelectionChange()
