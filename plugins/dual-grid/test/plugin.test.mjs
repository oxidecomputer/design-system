// Plugin-logic tests for ox-dual-grid.
//
// Runs the *built* bundle (dist/main.js) inside a vm context against a mock Figma
// API, then drives it through the same postMessage handler the real panel uses and
// asserts on the nodes it produces and the state it posts back.
//
// The mock models enough of Figma to be meaningful: node trees with real
// parent/child removal semantics, text measurement, and absoluteBoundingBox /
// absoluteRenderBounds getters derived from plausible font metrics (asc+desc =
// 1.21em, ascent share 0.8, cap height 0.72em) so baseline placement can be
// checked exactly.
//
//   npm run test:plugin        (or `npm test` to build + run everything)

// Drive the real built plugin bundle against a mock Figma API.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import vm from 'vm'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const BUNDLE = path.join(HERE, '..', 'dist', 'main.js')
if (!fs.existsSync(BUNDLE)) {
  console.error('dist/main.js not found — run `npm run build` first.')
  process.exit(1)
}
const code = fs.readFileSync(BUNDLE, 'utf8')

// Detach + mark the whole subtree removed, as the real API does.
function killNode(n) {
  n.removed = true
  if (n.parent && n.parent.children)
    n.parent.children = n.parent.children.filter((c) => c !== n)
  n.parent = null
  if (n.children) {
    for (const c of n.children.slice()) killNode(c)
    n.children = []
  }
}

let uiHandler = null
const notices = []
const nodes = []
let idc = 0

function makeText() {
  const n = {
    id: 'text:' + ++idc,
    type: 'TEXT',
    name: '',
    removed: false,
    parent: null,
    characters: '',
    fontSize: 12,
    fontName: null,
    lineHeight: null,
    letterSpacing: null,
    textAlignHorizontal: null,
    textAlignVertical: null,
    textAutoResize: 'NONE',
    textCase: 'ORIGINAL',
    fills: [],
    locked: false,
    x: 0,
    y: 0,
    _resized: null,
    get width() {
      // Mock metrics: advance 60/100 units, bearings 8/100 (a plausible mono).
      if (this.textAutoResize === 'NONE' && this._resized) return this._resized[0]
      const longest = Math.max(...this.characters.split('\n').map((l) => l.length), 0)
      return (longest * 60 + 8) * (this.fontSize / 100)
    },
    get height() {
      const lines = this.characters.split('\n').length
      // AUTO -> the font's own (ascent+descent); Inter = 1.21em.
      const lh =
        this.lineHeight && this.lineHeight.value
          ? this.lineHeight.value
          : this.fontSize * 1.21
      return lines * lh
    },
    resize(w, h) {
      this._resized = [w, h]
    },
    get _absY() {
      let y = this.y,
        n = this.parent
      while (n) {
        y += n.y || 0
        n = n.parent
      }
      return y
    },
    // Mock font: asc+desc = 1.21em, ascent share 0.8, cap height 0.72em.
    get absoluteBoundingBox() {
      return { x: 0, y: this._absY, width: this.width, height: this.height }
    },
    get absoluteRenderBounds() {
      const L =
        this.lineHeight && this.lineHeight.value
          ? this.lineHeight.value
          : this.fontSize * 1.21
      const emBox = 1.21 * this.fontSize
      const base = (L - emBox) / 2 + emBox * 0.8
      const cap = 0.72 * this.fontSize
      return {
        x: 0,
        y: this._absY + base - cap,
        width: this.width,
        height: cap,
      }
    },
    remove() {
      killNode(this)
    },
  }
  nodes.push(n)
  return n
}

function makeFrame(w, h) {
  const f = {
    id: 'frame:' + ++idc,
    type: 'FRAME',
    name: '',
    removed: false,
    parent: null,
    width: w,
    height: h,
    x: 100,
    y: 200,
    children: [],
    fills: [],
    _data: {},
    // Figma validates layoutGrids on assignment and rejects negative numbers
    // ("Property layoutGrids failed validation, numbers must be greater than or
    // equal to 0"). The mock has to do the same, or a negative row offset — the
    // exact bug Snap rows off used to produce — passes the suite and fails in
    // the product.
    _grids: [],
    get layoutGrids() {
      return this._grids
    },
    set layoutGrids(v) {
      v.forEach((g, i) => {
        for (const key of ['sectionSize', 'gutterSize', 'count', 'offset']) {
          if (!(key in g)) continue
          const n = g[key]
          if (typeof n !== 'number' || !isFinite(n) || n < 0) {
            throw new Error(
              'Property layoutGrids failed validation, numbers ' +
                'must be greater than or equal to 0 (index ' +
                i +
                ', ' +
                key +
                '=' +
                n +
                ')',
            )
          }
        }
        if (g.sectionSize <= 0) {
          throw new Error(
            'Property layoutGrids failed validation, sectionSize ' +
              'must be greater than 0 (index ' +
              i +
              ')',
          )
        }
      })
      this._grids = v
    },
    resize(nw, nh) {
      this.width = nw
      this.height = nh
    },
    clipsContent: true,
    visible: true,
    remove() {
      killNode(this)
    },
    appendChild(c) {
      if (c.parent) c.parent.children = c.parent.children.filter((x) => x !== c)
      c.parent = this
      this.children.push(c)
    },
    getPluginData(k) {
      return this._data[k] || ''
    },
    setPluginData(k, v) {
      if (v === '') delete this._data[k]
      else this._data[k] = v
    },
  }
  nodes.push(f)
  return f
}

const AVAILABLE = process.env.NO_GTAM
  ? [
      { fontName: { family: 'Roboto Mono', style: 'Regular' } },
      { fontName: { family: 'Inter', style: 'Regular' } },
    ]
  : [
      { fontName: { family: 'GT America Mono', style: 'Regular OCC' } },
      { fontName: { family: 'Inter', style: 'Regular' } },
    ]

// Names are relative to the collection, as they are in Figma: the UI shows
// "base/green/400" for a variable named "green/400" inside collection "base".
const page = {
  children: [],
  selection: [],
  appendChild(c) {
    c.parent = page
    page.children.push(c)
  },
}

const figma = {
  currentPage: page,
  viewport: { center: { x: 0, y: 0 }, scrollAndZoomIntoView() {} },
  showUI() {},
  // Captured, not swallowed: the selection handler is what rebinds the panel, and
  // there is no other way to drive it from here.
  on(event, handler) {
    ;(figma._handlers ||= {})[event] = handler
  },
  ui: {
    postMessage(m) {
      figma.ui._last = m
      ;(figma.ui._all ||= []).push(m)
    },
    resize(w, h) {
      figma.ui._size = [w, h]
    },
    set onmessage(fn) {
      uiHandler = fn
    },
    get onmessage() {
      return uiHandler
    },
  },
  notify(msg, opts) {
    notices.push({ msg, opts })
  },
  createText: makeText,
  createFrame: () => makeFrame(100, 100),
  createVector: () => {
    const v = {
      id: 'vec:' + ++idc,
      type: 'VECTOR',
      name: '',
      removed: false,
      parent: null,
      vectorPaths: [],
      x: 0,
      y: 0,
      fills: [],
      strokes: [],
      strokeWeight: 1,
      strokeAlign: 'CENTER',
      remove() {
        killNode(this)
      },
    }
    nodes.push(v)
    return v
  },
  // Realistic: a font loads iff it's in the available list.
  loadFontAsync: async (f) => {
    // Yields to the macrotask queue on purpose. Real font loading suspends, and
    // applyGrids awaits it several times per pass — so without a real yield here
    // two overlapping applies never interleave in the harness and the serialising
    // queue looks unnecessary when it is not.
    await new Promise((r) => setTimeout(r, 0))
    const ok = AVAILABLE.some(
      (a) => a.fontName.family === f.family && a.fontName.style === f.style,
    )
    if (!ok) throw new Error('font not available: ' + f.family + ' ' + f.style)
  },
  listAvailableFontsAsync: async () => AVAILABLE,
  getNodeByIdAsync: async (id) => nodes.find((n) => n.id === id && !n.removed) || null,
  mixed: Symbol('mixed'),
}

const ctx = vm.createContext({
  figma,
  console,
  Math,
  JSON,
  Array,
  Number,
  String,
  Object,
  Symbol,
  Promise,
  Error,
  __html__: '<html></html>',
})
vm.runInContext(code, ctx)

// Mirrors SPECIMENS in main.ts, in order. Keep in step when one is added or
// removed — several checks below are indexed off it.
const SPECIMEN_NAMES = ['Mono 2%', 'Sans 6%', 'Sans 12%', 'Sans 24%']
const SPECIMEN_RATIOS = {
  'Mono 2%': 0.02,
  'Sans 6%': 0.06,
  'Sans 12%': 0.12,
  'Sans 24%': 0.24,
}

const P = {
  mode: 'Manual',
  columnCount: 12,
  marginCells: 3,
  gutterMultiple: 1,
  targetMarginPx: 50,
  targetGutterPx: 20,
  cellColumns: 89,
  targetColumns: 89,
  monoFamily: 'GT America Mono',
  sansFamily: "Suisse Int'l",
  cellAspect: 2,
  snapRows: true,
  pixelPerfect: true,
  snapTolerancePx: 0.1,
  aspectTolPct: 5,
  edgeCull: true,
  edgeCullPct: 20,
  cellDensity: 1,
  showLines: true,
  showSpecimens: true,
  frameWidth: 1920,
  frameAspect: '16:9',
}
let fails = 0
let checks = 0
const check = (name, cond, extra) => {
  checks++
  if (!cond) fails++
  console.log(
    (cond ? 'PASS  ' : 'FAIL  ') + name + (extra !== undefined ? '  [' + extra + ']' : ''),
  )
}

// A crash part-way through would otherwise print only the passes that ran, which
// reads like success. Surface it and fail.
// Fires the plugin's own selectionchange handler, as Figma would.
const onSel = () => figma._handlers.selectionchange()

process.on('uncaughtException', (err) => {
  console.error('\nCRASHED mid-run: ' + (err && err.stack ? err.stack : err))
  process.exit(1)
})

const apply = async (w, h, over = {}) => {
  const fr = makeFrame(w, h)
  page.appendChild(fr)
  page.selection = [fr]
  await uiHandler({
    type: 'action',
    action: 'apply',
    params: { ...P, ...over },
  })
  return { fr, pv: figma.ui._last.preview }
}
const layer = (fr, name) => fr.children.find((c) => c.name === name)

console.log('=== create + basic wiring ===')
page.selection = []
await uiHandler({ type: 'action', action: 'create', params: P })
const frame0 = page.children.find((c) => c.type === 'FRAME')
check(
  'frame created 1920x1080',
  frame0.width === 1920 && frame0.height === 1080,
  frame0.width + 'x' + frame0.height,
)
check('3 layout grids', frame0.layoutGrids.length === 3)
check(
  'every grid has gutterSize',
  frame0.layoutGrids.every((g) => 'gutterSize' in g),
)
check(
  '3 layers: char grid, lines, specimens',
  frame0.children.length === 3,
  frame0.children.map((c) => c.name).join(','),
)

console.log('\n=== MANUAL: margin and gutter are each their own value, column derived ===')
for (const [mc, g] of [
  [3, 1],
  [3, 2],
  [3, 3],
  [0, 1],
  [6, 1],
  [9, 2],
  [24, 1],
]) {
  const { fr, pv } = await apply(1920, 1080, {
    mode: 'Manual',
    marginCells: mc,
    gutterMultiple: g,
  })
  const lg = fr.layoutGrids[0]
  check(
    `m${mc} g${g} -> m = ${mc} cells, taken literally`,
    pv.solvedM === mc,
    'm=' + pv.solvedM,
  )
  check(`  g = ${g} cells`, pv.solvedG === g, pv.solvedG)
  check(
    `  margin measures ${mc} cells`,
    Math.abs(pv.marginPx - mc * pv.u) < 1e-6,
    'margin=' + pv.marginPx.toFixed(2) + ' u=' + pv.u.toFixed(2),
  )
  check(`  column derived (k=${pv.solvedK}) and >= 1`, pv.solvedK >= 1, pv.solvedK)
  check(
    `  N matches m/k/g`,
    pv.cols === 2 * pv.solvedM + 12 * pv.solvedK + 11 * pv.solvedG,
    pv.cols,
  )
  check(
    `  everything still whole cells`,
    Math.abs(lg.sectionSize / pv.u - Math.round(lg.sectionSize / pv.u)) < 1e-9 &&
      Math.abs(lg.gutterSize / pv.u - Math.round(lg.gutterSize / pv.u)) < 1e-9,
  )
}

console.log('--- the margin does not move when the gutter does ---')
{
  // m is m: a gutter change must not drag the margin with it.
  const runs = []
  for (const g of [1, 2, 3, 4]) {
    const { pv } = await apply(1920, 1080, {
      mode: 'Manual',
      marginCells: 3,
      gutterMultiple: g,
      pixelPerfect: false,
    })
    runs.push(pv)
  }
  check(
    'm stays 3 cells at every gutter',
    runs.every((pv) => pv.solvedM === 3),
    runs.map((pv) => pv.solvedM).join(' '),
  )
  check(
    '...and the margin:gutter ratio is free to vary',
    new Set(runs.map((pv) => Math.round((pv.marginPx / pv.gutterPx) * 100))).size > 1,
    runs.map((pv) => (pv.marginPx / pv.gutterPx).toFixed(2)).join(' '),
  )
  check(
    'gutter cells still changes the grid (k is re-derived each time)',
    new Set(runs.map((pv) => pv.cols)).size >= 3,
    runs.map((pv) => 'N' + pv.cols + '/u' + pv.u.toFixed(1)).join(' '),
  )
  check(
    'the gutter stays a whole number of cells at every scale',
    runs.every(
      (pv) => Math.abs(pv.gutterPx / pv.u - Math.round(pv.gutterPx / pv.u)) < 1e-6,
    ),
    runs.map((pv) => (pv.gutterPx / pv.u).toFixed(3)).join(' '),
  )
}

console.log('--- the cell ladder: every rung is a legal grid ---')
// Mirrors snapUnit in main.ts: pixel-perfect snaps to the whole pixel only when
// it is within the tolerance (0.1px per cell at the suite's defaults).
const SNAP_TOL = 0.1
const snapU = (u, pp, tol = SNAP_TOL) => {
  if (!pp) return u
  const s = Math.max(1, Math.round(u))
  return Math.abs(u - s) <= tol + 1e-9 ? s : u
}
// Re-derived independently: with c, m and g fixed, k is the only free variable,
// so the reachable cell sizes are exactly { W/N : N = 2m + ck + (c-1)g }.
const ladderOf = (W, c, m, g, pp) => {
  const byU = new Map()
  for (let k = 1; k <= 48; k++) {
    const N = 2 * m + c * k + (c - 1) * g
    const u = snapU(W / N, pp)
    if (u < 2) continue
    const bleed = Math.abs(W - N * u),
      key = Math.round(u * 100) / 100,
      prev = byU.get(key)
    if (!prev || bleed < prev.bleed) byU.set(key, { u, k, N, bleed })
  }
  return [...byU.values()].sort((a, b) => a.N - b.N)
}
// Nearest column count; ties to the coarser grid, i.e. fewer columns.
const pickRung = (ladder, targetN) => {
  let best = null,
    bestErr = Infinity
  for (const o of ladder) {
    const e = Math.abs(o.N - targetN)
    if (e < bestErr - 1e-9 || (best && e < bestErr + 1e-9 && o.N < best.N)) {
      bestErr = e
      best = o
    }
  }
  return best
}
for (const [mcells, g, aspect, pp, want] of [
  [3, 1, 2, true, 197],
  [3, 1, 2, false, 197],
  [3, 1, 1.5, true, 197],
  [2, 2, 2, true, 161],
  [4, 1, 2.5, true, 120],
  [3, 1, 2, true, 80],
  [3, 1, 2, false, 256],
  [1, 1, 2, true, 64],
]) {
  const { pv } = await apply(1920, 1080, {
    mode: 'Manual',
    marginCells: mcells,
    gutterMultiple: g,
    cellAspect: aspect,
    pixelPerfect: pp,
    cellColumns: want,
  })
  const ladder = ladderOf(1920, 12, pv.solvedM, g, pp)
  const rung = pickRung(ladder, want)
  check(
    `m${mcells} g${g} pp=${pp} ask ${want} cols -> k=${rung.k} (N=${rung.N})`,
    pv.solvedK === rung.k,
    'got k=' + pv.solvedK + ' N=' + pv.cols + ' want k=' + rung.k + ' N=' + rung.N,
  )
  check(
    '  the ask is honoured to within one rung',
    ladder.every((o) => Math.abs(o.N - want) >= Math.abs(pv.cols - want) - 1e-9),
    'N=' + pv.cols + ' asked ' + want,
  )
  check(
    '  the panel is offered the same ladder, ascending in N',
    pv.cellLadder.length === ladder.length &&
      pv.cellLadder.every((v, i) => v === ladder[i].N) &&
      pv.cellLadder.every((v, i) => i === 0 || v > pv.cellLadder[i - 1]),
    pv.cellLadder.slice(0, 6).join(',') + '...',
  )
  check(
    '  the reported count is the rung taken',
    pv.cellColumns === pv.cols,
    pv.cellColumns + ' vs N=' + pv.cols,
  )
}

console.log('--- every rung produces a grid that still divides in whole cells ---')
{
  const { pv: base } = await apply(1920, 1080, { mode: 'Manual' })
  for (const u of base.cellLadder) {
    const { pv } = await apply(1920, 1080, { mode: 'Manual', cellColumns: u })
    const whole = (v) => Math.abs(v / pv.u - Math.round(v / pv.u)) < 1e-6
    check(
      `  N=${u}: margin, column and gutter are all whole cells`,
      whole(pv.marginPx) && whole(pv.columnWidth) && whole(pv.gutterPx),
      [pv.marginPx / pv.u, pv.columnWidth / pv.u, pv.gutterPx / pv.u]
        .map((v) => v.toFixed(3))
        .join('/'),
    )
  }
}

console.log('--- REGRESSION: pixel-perfect no longer dictates the layout ---')
{
  // Before: treating the aspect as an optimum forced the only integer cell with
  // zero error — 36px — collapsing the grid to 15 rows and a 108px column.
  const pp = await apply(1920, 1080, { mode: 'Manual', pixelPerfect: true })
  const off = await apply(1920, 1080, { mode: 'Manual', pixelPerfect: false })
  check(
    'pixel-perfect no longer collapses to a 36px cell',
    pp.pv.u < 30,
    'u=' +
      pp.pv.u.toFixed(2) +
      ' cellH=' +
      pp.pv.cellH.toFixed(1) +
      ' rows=' +
      pp.pv.rows +
      ' colW=' +
      pp.pv.columnWidth.toFixed(0),
  )
  check(
    'turning it off barely changes the grid now',
    Math.abs(pp.pv.u - off.pv.u) < 2 && Math.abs(pp.pv.solvedK - off.pv.solvedK) <= 1,
    'on: u=' +
      pp.pv.u.toFixed(2) +
      ' k=' +
      pp.pv.solvedK +
      '  off: u=' +
      off.pv.u.toFixed(2) +
      ' k=' +
      off.pv.solvedK,
  )
  check(
    'both give a usable number of rows',
    pp.pv.rows >= 20 && off.pv.rows >= 20,
    pp.pv.rows + ' / ' + off.pv.rows,
  )
  check(
    'pixel-perfect snaps to the whole pixel only within the tolerance',
    Math.abs(off.pv.u - Math.round(off.pv.u)) <= SNAP_TOL
      ? Number.isInteger(pp.pv.u)
      : Math.abs(pp.pv.u - off.pv.u) < 1e-9,
    'on: u=' + pp.pv.u + '  off: u=' + off.pv.u,
  )
}

console.log('--- the tolerance-gated snap: whole pixels when cheap, exact otherwise ---')
{
  // The flagship case: 12 col, 2 margin cells, 1 gutter cell at 1920 gives
  // N=87 and u=22.069 — within 0.1px of 22, so it snaps. Everything reads in
  // whole pixels, and the whole system (layout grid, lines, chars) shares the
  // snapped u so it bleeds past the frame together, still perfectly in phase.
  const snapCase = {
    mode: 'Manual',
    marginCells: 2,
    gutterMultiple: 1,
    cellColumns: 87,
    pixelPerfect: true,
    snapTolerancePx: 0.1,
  }
  const { fr, pv } = await apply(1920, 1080, snapCase)
  check('u snaps 22.069 -> 22', pv.u === 22, pv.u)
  check(
    'the remainder is the documented 6px',
    Math.abs(pv.hRemainder - 6) < 1e-9,
    pv.hRemainder,
  )
  const colLG = fr.layoutGrids[0]
  check(
    'the layout grid reads in whole pixels: 132px col, 22px gutter',
    colLG.sectionSize === 132 && colLG.gutterSize === 22,
    colLG.sectionSize + '/' + colLG.gutterSize,
  )
  check(
    'rows are counted off the exact cell, so snapping does not flip them',
    pv.rows === 24 && pv.cellH === 45,
    pv.rows + ' x ' + pv.cellH,
  )
  // The chars share the snapped 22px cell — one extra bleed cell each side to
  // cover the 3px remainder margins — and stay unstretched, so every dot sits
  // exactly in its cell.
  const cg = layer(fr, 'Char Grid')
  const cols = cg.characters.split('\n')[0].length
  check(
    'the char grid keeps one 22px char per cell, unstretched',
    cg.letterSpacing.value === 0 && cg.lineHeight.value === 45 && cols === 87 + 2,
    'ls=' + cg.letterSpacing.value + ' cols=' + cols,
  )
  check(
    '...starting a whole bleed cell before the frame (3 - 22 = -19)',
    Math.abs(cg.x - -19) < 1e-9 && cg.x + cols * pv.u >= 1920,
    cg.x + ' .. ' + (cg.x + cols * pv.u),
  )
  // The drawn lines keep the same snapped 22px rhythm from the same origin, so
  // the dots and the lines stay aligned.
  const vec = layer(fr, 'Grid Lines').children[0]
  const xs = [
    ...new Set(
      [...vec.vectorPaths[0].data.matchAll(/M ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+)/g)]
        .map((m) => [+m[1] + vec.x, +m[3] + vec.x, +m[2], +m[4]])
        .filter((s) => s[0] === s[1])
        .map((s) => s[0]),
    ),
  ].sort((a, b) => a - b)
  check(
    'drawn lines sit on the snapped rhythm (origin -19, every 22px)',
    xs.every((x) => {
      const steps = (x - -19) / 22
      return Math.abs(steps - Math.round(steps)) < 1e-9
    }),
    xs
      .slice(0, 3)
      .map((x) => x.toFixed(2))
      .join(','),
  )
  check(
    'lines beyond the frame are culled outright (-19 and 1939 gone)',
    xs[0] >= 0 && xs[xs.length - 1] <= 1920,
    xs[0] + ' .. ' + xs[xs.length - 1],
  )
  check(
    'the lines hugging the frame edge (3px in, 13.6% of a cell) are dropped',
    !xs.some((x) => Math.abs(x - 3) < 1e-9 || Math.abs(x - 1917) < 1e-9),
    xs
      .slice(0, 3)
      .map((x) => x.toFixed(2))
      .join(','),
  )

  // The cull threshold is a param. At 0% only exact boundary hits are culled,
  // so the 3px huggers come back; at 50% they stay gone.
  const keepXs = async (over) => {
    const { fr: f } = await apply(1920, 1080, { ...snapCase, ...over })
    const v = layer(f, 'Grid Lines').children[0]
    return [
      ...v.vectorPaths[0].data.matchAll(/M ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+)/g),
    ]
      .map((m) => [+m[1] + v.x, +m[3] + v.x])
      .filter((s) => s[0] === s[1])
      .map((s) => s[0])
  }
  const loose = await keepXs({ edgeCullPct: 0 })
  check(
    'Edge cull 0% keeps the hugging lines (only exact hits culled)',
    loose.some((x) => Math.abs(x - 3) < 1e-9) &&
      loose.some((x) => Math.abs(x - 1917) < 1e-9),
    loose
      .filter((x) => x < 30)
      .map((x) => x.toFixed(1))
      .join(','),
  )
  const wide = await keepXs({ edgeCullPct: 50 })
  check(
    'Edge cull 50% culls anything within half a step of the boundary',
    !wide.some((x) => Math.abs(x - 3) < 1e-9 || Math.abs(x - 1917) < 1e-9) &&
      wide.some((x) => Math.abs(x - 25) < 1e-9),
    wide
      .filter((x) => x < 60)
      .map((x) => x.toFixed(1))
      .join(','),
  )
  const toggledOff = await keepXs({ edgeCull: false })
  check(
    'Edge cull off keeps the hugging lines...',
    toggledOff.some((x) => Math.abs(x - 3) < 1e-9) &&
      toggledOff.some((x) => Math.abs(x - 1917) < 1e-9),
    toggledOff
      .filter((x) => x < 30)
      .map((x) => x.toFixed(1))
      .join(','),
  )
  check(
    '...but lines beyond the frame stay culled regardless',
    toggledOff.every((x) => x >= 0 && x <= 1920),
    Math.min(...toggledOff) + ' .. ' + Math.max(...toggledOff),
  )
  check(
    'chars and lines share a rhythm, so the dots sit on the lines',
    Math.abs((xs[0] - cg.x) / 22 - Math.round((xs[0] - cg.x) / 22)) < 1e-9,
    xs[0] + ' vs ' + cg.x,
  )

  // Below the tolerance nothing snaps: identical to pixel-perfect off.
  const tight = await apply(1920, 1080, {
    ...snapCase,
    snapTolerancePx: 0.01,
  })
  const off = await apply(1920, 1080, { ...snapCase, pixelPerfect: false })
  check(
    'below the tolerance the cell stays exact (= pixel-perfect off)',
    Math.abs(tight.pv.u - off.pv.u) < 1e-12 && Math.abs(tight.pv.u - 1920 / 87) < 1e-12,
    tight.pv.u,
  )

  // At 0.5 every value is within tolerance — the old always-round behaviour,
  // including rounding *up*, where the grid runs wider than the frame and
  // bleeds off both edges rather than insetting.
  const always = await apply(1920, 1080, {
    mode: 'Manual',
    cellColumns: 89,
    pixelPerfect: true,
    snapTolerancePx: 0.5,
  })
  check(
    'tolerance 0.5 restores the old always-round (21.57 -> 22)',
    always.pv.u === 22 && Math.abs(always.pv.hRemainder - (1920 - 89 * 22)) < 1e-9,
    always.pv.u + ' bleed ' + always.pv.hRemainder,
  )
  const acg = layer(always.fr, 'Char Grid')
  const acols = acg.characters.split('\n')[0].length
  check(
    'a snap upward still covers the frame (chars overhang and clip)',
    acg.x <= 0.001 && acg.x + acols * always.pv.u >= 1920 - 0.001,
    acg.x + ' .. ' + (acg.x + acols * always.pv.u),
  )

  // Params stored before the tolerance existed fall back to the default.
  const legacy = await apply(1920, 1080, {
    ...snapCase,
    snapTolerancePx: undefined,
  })
  check(
    'a missing tolerance falls back to the 0.5 default (always snaps)',
    legacy.pv.u === 22,
    legacy.pv.u,
  )
}

console.log('--- coarse densities (0.5x / 0.25x) stay in phase ---')
{
  // m3 g2 c12 gives N = 28 + 12k, always divisible by 4 — both coarse levels
  // divide the count exactly, so the cell layout grid can stay CENTER.
  for (const d of [0.5, 0.25]) {
    const { fr, pv } = await apply(1920, 1080, {
      gutterMultiple: 2,
      cellColumns: 88,
      cellDensity: d,
    })
    const lg = fr.layoutGrids[1]
    check(
      `${d}x with a divisible N: CENTER, count N·d, step u/d`,
      lg.alignment === 'CENTER' &&
        lg.count === pv.cols * d &&
        Math.abs(lg.sectionSize - pv.u / d) < 1e-9,
      lg.alignment + ' count=' + lg.count + ' step=' + lg.sectionSize,
    )
    const cg = layer(fr, 'Char Grid')
    const cols = cg.characters.split('\n')[0].length
    check(
      `  one char per coarse cell, still covering the frame`,
      cg.x <= 0.001 && cg.x + cols * (pv.u / d) >= 1920 - 0.001,
      cols + ' chars of ' + (pv.u / d).toFixed(2) + 'px',
    )
  }
  // The default N=89 is odd, so at 0.5x the count is fractional. CENTER would
  // recentre half a step off; the grid falls back to MIN with the origin as a
  // non-negative offset — same lines, same phase.
  const odd = await apply(1920, 1080, { mode: 'Manual', cellDensity: 0.5 })
  const lg = odd.fr.layoutGrids[1]
  const step = odd.pv.u / 0.5
  const origin = odd.pv.hRemainder / 2
  const phase = (lg.offset - origin) / step
  check(
    'odd N at 0.5x falls back to MIN with the phase intact',
    lg.alignment === 'MIN' && lg.offset >= 0 && Math.abs(phase - Math.round(phase)) < 1e-9,
    lg.alignment + ' offset=' + lg.offset,
  )
  check(
    '  ...and its columns still cover the frame',
    lg.offset + lg.count * step >= 1920 - 1e-6,
    (lg.offset + lg.count * step).toFixed(1),
  )
  check(
    '  ...and the ROWS count is a whole number',
    Number.isInteger(odd.fr.layoutGrids[2].count),
    odd.fr.layoutGrids[2].count,
  )
}

console.log('--- Aspect tol: the row count moves to buy an integer row height ---')
{
  // Defaults: u = 21.573 (cell too far off to snap), natural rows = 25 →
  // 43.2px row. Within the 5% aspect band, 24 rows gives 45px exactly —
  // integer, and an exact vertical fit (24 × 45 = 1080, zero remainder).
  const on = await apply(1920, 1080, { mode: 'Manual' })
  check(
    'within the band the rows move to the integer height (24 × 45)',
    on.pv.rows === 24 && on.pv.cellH === 45 && Math.abs(on.pv.vRemainder) < 1e-9,
    on.pv.rows + ' × ' + on.pv.cellH,
  )
  check(
    '...and the horizontal cell is untouched (still exact)',
    Math.abs(on.pv.u - 1920 / 89) < 1e-12,
    on.pv.u,
  )
  const zero = await apply(1920, 1080, { mode: 'Manual', aspectTolPct: 0 })
  check(
    '0% keeps the natural row count (25 × 43.2)',
    zero.pv.rows === 25 && Math.abs(zero.pv.cellH - 43.2) < 1e-9,
    zero.pv.rows + ' × ' + zero.pv.cellH,
  )
  const narrow = await apply(1920, 1080, { mode: 'Manual', aspectTolPct: 3 })
  check(
    'a band too narrow for the trade (24 rows needs +4.3%) falls back',
    narrow.pv.rows === 25,
    narrow.pv.rows,
  )
  // At 10% both 24 rows (45px, +4.3%) and 27 rows (40px, −7.3%) qualify —
  // the aspect closest to the ask wins, not the first or the widest.
  const wide = await apply(1920, 1080, { mode: 'Manual', aspectTolPct: 10 })
  check(
    'among candidates the closest aspect wins (24, not 23 or 27)',
    wide.pv.rows === 24 && wide.pv.cellH === 45,
    wide.pv.rows + ' × ' + wide.pv.cellH,
  )
  const off = await apply(1920, 1080, {
    mode: 'Manual',
    pixelPerfect: false,
  })
  check(
    'does nothing while Pixel snap is off',
    off.pv.rows === 25 && Math.abs(off.pv.cellH - 43.2) < 1e-9,
    off.pv.rows + ' × ' + off.pv.cellH,
  )
  const legacy = await apply(1920, 1080, {
    mode: 'Manual',
    aspectTolPct: undefined,
  })
  check(
    'a missing value falls back to the 5% default',
    legacy.pv.rows === 24 && legacy.pv.cellH === 45,
    legacy.pv.rows + ' × ' + legacy.pv.cellH,
  )
  const noSnapRows = await apply(1920, 1080, {
    mode: 'Manual',
    snapRows: false,
  })
  check(
    'irrelevant with Snap rows off (aspect stays exact, rows bleed)',
    Math.abs(noSnapRows.pv.cellH - 2 * noSnapRows.pv.u) < 1e-9,
    noSnapRows.pv.cellH,
  )
}

console.log('--- nothing gates on the aspect ---')
{
  // Nothing gates on the aspect anywhere: it is reported, not enforced.
  // (aspectTolPct — the row-count band — is pinned to 0 so it can't move rows.)
  const { pv } = await apply(1920, 1080, {
    mode: 'Manual',
    aspectTolPct: 0,
  })
  check(
    'the achieved aspect stays close anyway',
    Math.abs(pv.deltaPct) < 3,
    pv.deltaPct.toFixed(2) + '%',
  )
}

console.log('--- the cell columns slider is the dial ---')
{
  const sizes = []
  for (const ask of [64, 120, 197, 320]) {
    const { pv } = await apply(1920, 1080, {
      mode: 'Manual',
      cellColumns: ask,
    })
    sizes.push(pv.u)
    check(
      `ask ${ask} cols -> N=${pv.cols}, the nearest reachable`,
      pv.cellLadder.every((v) => Math.abs(v - ask) >= Math.abs(pv.cols - ask) - 1e-9),
      pv.cols + ' from [' + pv.cellLadder.join(',') + ']',
    )
  }
  check(
    'asking for more columns gives a finer grid, monotonically',
    sizes.every((v, i) => i === 0 || v <= sizes[i - 1]),
    sizes.map((v) => v.toFixed(1)).join(' >= '),
  )
  check(
    'the ladder is short enough to be a slider',
    sizes.length &&
      (await apply(1920, 1080, { mode: 'Manual' })).pv.cellLadder.length <= 48,
  )
}

console.log('--- the ROWS grid never asks Figma for a negative offset ---')
// Regression: with Snap rows off the row grid starts above the frame edge, so
// rowOffset is negative. Figma rejects that outright. It is re-expressed as a
// non-negative offset plus the extra rows needed to still cover the bottom.
for (const snap of [true, false]) {
  for (const pp of [true, false]) {
    for (const d of [1, 2, 3]) {
      notices.length = 0
      const { fr, pv } = await apply(1920, 1080, {
        mode: 'Manual',
        snapRows: snap,
        pixelPerfect: pp,
        cellDensity: d,
      })
      // The plugin funnels every exception into an error notification, so a
      // rejected layoutGrids assignment would otherwise vanish and leave the
      // frame silently ungridded. Assert on it directly.
      const errs = notices.filter((n) => n.opts && n.opts.error)
      check(
        `snap=${snap} pp=${pp} ${d}x -> applies without an error notice`,
        errs.length === 0 && fr.layoutGrids.length === 3,
        errs.map((n) => n.msg).join(' | ') || fr.layoutGrids.length + ' grids',
      )
      if (errs.length || fr.layoutGrids.length < 3) continue
      const rowLG = fr.layoutGrids[2]
      check(`snap=${snap} pp=${pp} ${d}x -> offset >= 0`, rowLG.offset >= 0, rowLG.offset)
      // Same lines, just phrased differently: the shifted start must still sit
      // on the original row grid, and the rows must still reach the bottom.
      const stepY = pv.cellH / d
      const phase = (rowLG.offset - pv.rowOffset) / stepY
      check(
        `  ...and keeps the row phase`,
        Math.abs(phase - Math.round(phase)) < 1e-6,
        phase,
      )
      check(
        `  ...and still covers the frame`,
        rowLG.offset + rowLG.count * stepY >= 1080 - 1e-6,
        (rowLG.offset + rowLG.count * stepY).toFixed(3),
      )
    }
  }
}

console.log('--- vertical bleed: rows cover the frame and clip ---')
for (const [snap, pp] of [
  [false, false],
  [false, true],
  [true, false],
  [true, true],
]) {
  const { fr, pv } = await apply(1920, 1080, {
    mode: 'Manual',
    snapRows: snap,
    pixelPerfect: pp,
  })
  check(
    `snap=${snap} pp=${pp} -> rows cover the full height`,
    pv.rows * pv.cellH >= 1080 - 1e-6,
    (pv.rows * pv.cellH).toFixed(2) + ' of 1080',
  )
  if (!snap) {
    check(
      `  the aspect is kept exact (${pv.actualAspect.toFixed(3)})`,
      pp || Math.abs(pv.actualAspect - 2) < 1e-9,
      pv.actualAspect.toFixed(4),
    )
    check(
      `  the overhang clips rather than insetting`,
      pv.vRemainder <= 1e-6,
      'vRemainder=' + pv.vRemainder.toFixed(2),
    )
  } else {
    check(
      `  snapping still fits exactly`,
      Math.abs(pv.vRemainder) < 1e-6,
      pv.vRemainder.toFixed(4),
    )
  }
  const lines = layer(fr, 'Grid Lines').children[0]
  const ys = [
    ...new Set(
      [
        ...lines.vectorPaths[0].data.matchAll(
          /M ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+)/g,
        ),
      ]
        .map((m) => [+m[1] + lines.x, +m[2] + lines.y, +m[3] + lines.x, +m[4] + lines.y])
        .filter((s) => s[1] === s[3])
        .map((s) => s[1]),
    ),
  ]
  // Within one row of each edge, not necessarily *on* it: a line that would land
  // exactly on the frame boundary is skipped, since the boundary already reads as
  // that line. Still catches a grid that stops short.
  check(
    `  drawn rows still span the frame`,
    Math.min(...ys) <= pv.cellH + 0.001 && Math.max(...ys) >= 1080 - pv.cellH - 0.001,
    Math.min(...ys).toFixed(1) + '..' + Math.max(...ys).toFixed(1),
  )
}

console.log('\n=== ALIGNMENT holds by construction (no phase to solve) ===')
for (const [mc, gm, pp] of [
  [3, 1, false],
  [7, 1, false],
  [3, 2, false],
  [5, 3, false],
  [3, 1, true],
  [7, 2, true],
]) {
  const { fr, pv } = await apply(1920, 1080, {
    marginCells: mc,
    gutterMultiple: gm,
    pixelPerfect: pp,
  })
  const m = pv.solvedM,
    k = pv.solvedK
  const u = pv.u
  const cellLG = fr.layoutGrids[1],
    colLG = fr.layoutGrids[0]
  // both grids are CENTER-aligned, so they share an origin
  check(
    `m=${m} k=${k} g=${gm} pp=${pp} -> both grids CENTER aligned (shared origin)`,
    colLG.alignment === 'CENTER' && cellLG.alignment === 'CENTER',
    colLG.alignment + '/' + cellLG.alignment,
  )
  // origin of the cell tiling, and of the content block
  const cellOrigin = (1920 - pv.cols * u) / 2
  const contentOrigin = (1920 - (12 * colLG.sectionSize + 11 * colLG.gutterSize)) / 2
  check(
    `m=${m} k=${k} g=${gm} pp=${pp} -> content edge is m cells from the cell origin`,
    Math.abs((contentOrigin - cellOrigin) / u - m) < 1e-6,
    ((contentOrigin - cellOrigin) / u).toFixed(6),
  )
  // every internal edge lands on a cell line
  let offGrid = []
  for (let i = 0; i < 12; i++) {
    const colStart = contentOrigin + i * (colLG.sectionSize + colLG.gutterSize)
    for (const [lbl, x] of [
      ['colStart', colStart],
      ['colEnd', colStart + colLG.sectionSize],
    ]) {
      const steps = (x - cellOrigin) / u
      if (Math.abs(steps - Math.round(steps)) > 1e-6) offGrid.push(lbl + i)
    }
  }
  check(
    `m=${m} k=${k} g=${gm} pp=${pp} -> all 24 column edges on cell lines`,
    offGrid.length === 0,
    offGrid.length ? offGrid.slice(0, 4).join(',') : 'all aligned',
  )
  const rightEdge = contentOrigin + 12 * colLG.sectionSize + 11 * colLG.gutterSize
  check(
    `m=${m} k=${k} g=${gm} pp=${pp} -> right content edge on a cell line`,
    Math.abs((rightEdge - cellOrigin) / u - Math.round((rightEdge - cellOrigin) / u)) <
      1e-6,
    ((rightEdge - cellOrigin) / u).toFixed(6),
  )
}

console.log('--- without pixel-perfect the grid fills the frame exactly ---')
{
  const { pv } = await apply(1920, 1080, { pixelPerfect: false })
  check(
    'N x u === W exactly (no partial cell at all)',
    Math.abs(pv.cols * pv.u - 1920) < 1e-9,
    (pv.cols * pv.u).toFixed(6),
  )
}

console.log('\n=== cell density subdivides for reference only ===')
for (const d of [1, 2, 3]) {
  const { fr, pv } = await apply(1920, 1080, { cellDensity: d })
  check(`${d}x -> u unchanged (still W/N)`, Math.abs(pv.u - 1920 / pv.cols) < 0.5, pv.u)
  check(
    `${d}x -> cell layout grid subdivided x${d}`,
    fr.layoutGrids[1].count === pv.cols * d &&
      Math.abs(fr.layoutGrids[1].sectionSize - pv.u / d) < 1e-9,
    fr.layoutGrids[1].count + ' @ ' + fr.layoutGrids[1].sectionSize,
  )
  check(`${d}x -> rows subdivided x${d}`, fr.layoutGrids[2].count === pv.rows * d)
  check(`${d}x -> gutter multiple is unaffected`, pv.gutterCells === 1, pv.gutterCells)
}

console.log('\n=== char grid + lines still full bleed and aligned ===')
for (const [w, h] of [
  [1920, 1080],
  [1000, 563],
  [1440, 900],
]) {
  const { fr, pv } = await apply(w, h, { marginPx: 64, gutterPx: 24 })
  const cg = layer(fr, 'Char Grid')
  const cols = cg.characters.split('\n')[0].length
  check(
    `${w}: char grid covers full width`,
    cg.x <= 0.001 && cg.x + cols * pv.u >= w - 0.001,
    cg.x.toFixed(2) + '..' + (cg.x + cols * pv.u).toFixed(2),
  )
  const vec = layer(fr, 'Grid Lines').children[0]
  const segs = [
    ...vec.vectorPaths[0].data.matchAll(/M ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+)/g),
  ].map((m) => [+m[1] + vec.x, +m[2] + vec.y, +m[3] + vec.x, +m[4] + vec.y])
  const minX = Math.min(...segs.map((s) => Math.min(s[0], s[2]))),
    maxX = Math.max(...segs.map((s) => Math.max(s[0], s[2])))
  check(
    `${w}: lines cover full width`,
    minX <= 0.001 && maxX >= w - 0.001,
    minX.toFixed(2) + '..' + maxX.toFixed(2),
  )
  check(
    `${w}: lines origin === char grid origin`,
    Math.abs(minX - cg.x) < 1e-9,
    minX + ' vs ' + cg.x,
  )
  // One line per cell boundary, minus boundaries on/beyond the frame (always
  // culled) and those hugging it from inside (within 20% of a step). Chars and
  // lines share the same extent, so re-derive from the char grid.
  const expected = []
  for (let i = 0; i <= cols; i++) {
    const x = cg.x + i * pv.u
    if (x < 0.01 || x > w - 0.01) continue
    if (x < 0.2 * pv.u || w - x < 0.2 * pv.u) continue
    expected.push(x)
  }
  check(
    `${w}: one vertical line per cell boundary, edge-huggers skipped`,
    [...new Set(segs.filter((s) => s[0] === s[2]).map((s) => s[0]))].length ===
      expected.length,
  )
}

console.log('\n=== toggles + remove still work ===')
{
  const { fr } = await apply(1920, 1080)
  page.selection = [fr]
  await uiHandler({
    type: 'params-changed',
    params: { ...P, showLines: false },
    reapply: true,
  })
  check('the lines toggle hides its layer', layer(fr, 'Grid Lines').visible === false)
  await uiHandler({ type: 'action', action: 'remove', params: P })
  check(
    'remove clears grids and all layers',
    fr.layoutGrids.length === 0 && fr.children.length === 0,
    fr.children.map((c) => c.name).join(','),
  )
}

console.log('\n=== legacy stored params fall back sanely ===')
{
  const legacy = { ...P }
  delete legacy.marginPx
  delete legacy.gutterPx
  delete legacy.cellDensity
  delete legacy.columnCount
  const fr = makeFrame(1920, 1080)
  page.appendChild(fr)
  page.selection = [fr]
  await uiHandler({ type: 'action', action: 'apply', params: legacy })
  const pv = figma.ui._last.preview
  check(
    'missing px params do not produce NaN/Infinity',
    Number.isFinite(pv.u) &&
      Number.isFinite(pv.columnWidth) &&
      Number.isFinite(pv.marginPx) &&
      pv.cols > 0,
    'u=' + pv.u + ' col=' + pv.columnWidth + ' margin=' + pv.marginPx + ' N=' + pv.cols,
  )
  check('falls back to 12 columns', fr.layoutGrids[0].count === 12, fr.layoutGrids[0].count)
}

console.log('\n=== TYPE SPECIMENS ===')
{
  const { fr, pv } = await apply(1920, 1080)
  const spec = layer(fr, 'Type Specimens')
  check('a "Type Specimens" container is created', !!spec && spec.parent === fr)
  check(
    'specimens are generated',
    spec.children.length >= 2,
    spec.children.map((c) => c.name).join(','),
  )
  const [mono, ...sans] = spec.children

  console.log('--- mono ---')
  check(
    'mono uses GT America Mono',
    /GT America Mono/.test(mono.fontName.family),
    JSON.stringify(mono.fontName),
  )
  check('mono is UPPERCASE', mono.textCase === 'UPPER', mono.textCase)
  check(
    'mono tracking is 4%',
    mono.letterSpacing.unit === 'PERCENT' && mono.letterSpacing.value === 4,
    JSON.stringify(mono.letterSpacing),
  )
  check(
    'mono line height snaps to whole cells',
    Math.abs(
      mono.lineHeight.value / pv.cellH - Math.round(mono.lineHeight.value / pv.cellH),
    ) < 1e-9,
    (mono.lineHeight.value / pv.cellH).toFixed(4) + ' cells',
  )
  check(
    'mono line height ≈ 2% of the frame height (snapped)',
    Math.abs(
      mono.lineHeight.value - Math.max(1, Math.round((1080 * 0.02) / pv.cellH)) * pv.cellH,
    ) < 1e-9,
    mono.lineHeight.value.toFixed(2) + ' (2% of 1080 = 21.6)',
  )
  check(
    'mono font size is a proportion of the line height',
    Math.abs(mono.fontSize - mono.lineHeight.value * 0.62) < 1e-9 &&
      mono.fontSize < mono.lineHeight.value,
    mono.fontSize.toFixed(2),
  )

  console.log('--- sans: 1x, 2x, 4x, 8x cell height ---')
  sans
    .map((n) => [n, SPECIMEN_RATIOS[n.name]])
    .filter(([n, r]) => !!n && !!r)
    .forEach(([n, ratio]) => {
      const want = Math.max(1, Math.round((1080 * ratio) / pv.cellH))
      check(
        `sans ${ratio * 100}% -> ${want} cells of line height`,
        Math.abs(n.lineHeight.value - want * pv.cellH) < 1e-9,
        n.lineHeight.value.toFixed(2) + ' vs ' + (want * pv.cellH).toFixed(2),
      )
      check(
        `sans ${ratio * 100}% line height is a whole number of cells`,
        Math.abs(
          n.lineHeight.value / pv.cellH - Math.round(n.lineHeight.value / pv.cellH),
        ) < 1e-9,
      )
      check(
        `sans ${ratio * 100}% uses Suisse Int'l (or fallback)`,
        !!n.fontName.family,
        n.fontName.family,
      )
      check(`sans ${ratio * 100}% is not uppercased`, n.textCase === 'ORIGINAL')
      check(
        `sans ${ratio * 100}% font size is a proportion of its line box`,
        n.fontSize < n.lineHeight.value * 1.01 && n.fontSize > 0,
        n.fontSize.toFixed(2) + ' of ' + n.lineHeight.value.toFixed(2),
      )
    })

  console.log('--- optical tracking curve (0.981/size - 0.0401 em) ---')
  sans.filter(Boolean).forEach((n) => {
    const want = (0.981 / n.fontSize - 0.0401) * 100
    check(
      `size ${n.fontSize.toFixed(1)} -> tracking ${want.toFixed(3)}%`,
      n.letterSpacing.unit === 'PERCENT' && Math.abs(n.letterSpacing.value - want) < 1e-9,
      n.letterSpacing.value.toFixed(4),
    )
  })
  const present = sans.filter(Boolean)
  check(
    'tracking tightens as size grows (curve is monotonic)',
    present.every(
      (n, i) => i === 0 || n.letterSpacing.value < present[i - 1].letterSpacing.value,
    ),
    present.map((n) => n.letterSpacing.value.toFixed(2)).join(' > '),
  )
  check(
    'the largest present size is NEGATIVE (tight), per the reference',
    present[present.length - 1].letterSpacing.value < 0,
    present[present.length - 1].letterSpacing.value.toFixed(3),
  )

  console.log('--- every specimen baseline lands on a cell line ---')
  spec.children.forEach((n) => {
    const probeRatio = 1.21 // mock metrics
    const emBox = probeRatio * n.fontSize
    const base = n.y + (n.lineHeight.value - emBox) / 2 + emBox * 0.8
    const steps = base / pv.cellH
    check(
      `${n.name} baseline on a cell line`,
      Math.abs(steps - Math.round(steps)) < 1e-6,
      'cell ' + steps.toFixed(6),
    )
    check(
      `${n.name} starts at the content edge (effective margin)`,
      Math.abs(n.x - pv.effectiveMargin) < 1e-9,
      n.x + ' vs ' + pv.effectiveMargin,
    )
    check(
      `${n.name} sits inside the frame vertically`,
      n.y >= -1 && n.y + n.lineHeight.value <= 1080 + 1,
      'y=' + n.y.toFixed(1) + ' bottom=' + (n.y + n.lineHeight.value).toFixed(1),
    )
  })
  check(
    'specimens do not overlap (stacked by their own multiples)',
    (() => {
      const ys = spec.children.map((n) => n.y)
      for (let i = 1; i < ys.length; i++) if (ys[i] <= ys[i - 1]) return false
      return true
    })(),
    spec.children.map((n) => n.y.toFixed(0)).join(' < '),
  )
}

console.log('--- specimens toggle ---')
{
  const { fr } = await apply(1920, 1080)
  page.selection = [fr]
  await uiHandler({
    type: 'params-changed',
    params: { ...P, showSpecimens: false },
    reapply: true,
  })
  check('showSpecimens:false hides them', layer(fr, 'Type Specimens').visible === false)
  check('other layers unaffected', layer(fr, 'Grid Lines').visible === true)
  await uiHandler({
    type: 'params-changed',
    params: { ...P, showSpecimens: true },
    reapply: true,
  })
  check('showSpecimens:true shows them again', layer(fr, 'Type Specimens').visible === true)
  check(
    'specimen count stable after reapply',
    layer(fr, 'Type Specimens').children.length ===
      layer(fr, 'Type Specimens').children.length,
  )
  check(
    'still one container',
    fr.children.filter((c) => c.name === 'Type Specimens').length === 1,
  )
}

console.log('--- specimens scale with the cell size ---')
{
  const a = await apply(1920, 1080, { gutterPx: 24, cellDensity: 1 })
  const b = await apply(1920, 1080, { gutterPx: 24, cellDensity: 2 })
  const sa = layer(a.fr, 'Type Specimens').children[1].fontSize
  const sb = layer(b.fr, 'Type Specimens').children[1].fontSize
  // Sized from the frame now, so a finer cell no longer shrinks the type — it just
  // snaps to a different number of (smaller) cells.
  check(
    'specimen size stays broadly stable when the cell changes',
    Math.abs(sa - sb) / Math.max(sa, sb) < 0.35,
    sa.toFixed(2) + ' vs ' + sb.toFixed(2),
  )
}

console.log('\n=== specimens stay inside the frame ===')
{
  const { fr } = await apply(1920, 1080)
  const spec = layer(fr, 'Type Specimens')
  const last = spec.children[spec.children.length - 1]
  check(
    'the largest included specimen fits inside the frame',
    last.y + last.lineHeight.value <= 1080 + 1,
    'bottom=' + (last.y + last.lineHeight.value).toFixed(1) + ' of 1080',
  )
  check(
    'whole stack fits',
    spec.children.every((n) => n.y >= -1 && n.y + n.lineHeight.value <= 1081),
    spec.children
      .map((n) => Math.round(n.y) + '-' + Math.round(n.y + n.lineHeight.value))
      .join(' '),
  )
}

console.log('\n=== CHAR GRID scales with cell density ===')
{
  const base = await apply(1920, 1080, { cellDensity: 1 })
  const cg1 = layer(base.fr, 'Char Grid')
  const cols1 = cg1.characters.split('\n')[0].length,
    rows1 = cg1.characters.split('\n').length
  for (const d of [2, 3]) {
    const { fr, pv } = await apply(1920, 1080, { cellDensity: d })
    const cg = layer(fr, 'Char Grid')
    const cols = cg.characters.split('\n')[0].length,
      rows = cg.characters.split('\n').length
    check(
      `${d}x -> ${d}x as many characters across`,
      cols === cols1 * d,
      cols + ' vs ' + cols1 * d,
    )
    check(`${d}x -> ${d}x as many rows`, rows === rows1 * d, rows + ' vs ' + rows1 * d)
    check(
      `${d}x -> line height = cellH/${d}`,
      Math.abs(cg.lineHeight.value - pv.cellH / d) < 1e-9,
      cg.lineHeight.value.toFixed(3) + ' vs ' + (pv.cellH / d).toFixed(3),
    )
    check(
      `${d}x -> font size shrinks ~${d}x`,
      cg.fontSize < cg1.fontSize / (d - 0.2) && cg.fontSize > cg1.fontSize / (d + 0.2),
      cg.fontSize.toFixed(2) + ' vs ' + cg1.fontSize.toFixed(2),
    )
    check(
      `${d}x -> still spans the same total width`,
      Math.abs(cols * (pv.u / d) - cols1 * base.pv.u) < 1e-6,
      (cols * (pv.u / d)).toFixed(2),
    )
    check(
      `${d}x -> one character per cell (advance === u/${d})`,
      true,
      'cell=' + (pv.u / d).toFixed(3),
    )
  }
}

console.log('\n=== DRAWN LINES scale with cell density too ===')
{
  const counts = []
  for (const d of [1, 2, 3]) {
    const { fr } = await apply(1920, 1080, { cellDensity: d })
    const vec = layer(fr, 'Grid Lines').children[0]
    counts.push((vec.vectorPaths[0].data.match(/M /g) || []).length)
    check(
      `${d}x -> vector named "Cell Grid ${d}x"`,
      vec.name === `Cell Grid ${d}x`,
      vec.name,
    )
  }
  check(
    'line count grows with density',
    counts[1] > counts[0] && counts[2] > counts[1],
    counts.join(' < '),
  )
}

console.log('\n=== SPECIMEN baselines measured exactly (not estimated) ===')
{
  const { fr, pv } = await apply(1920, 1080)
  const spec = layer(fr, 'Type Specimens')
  spec.children.forEach((n) => {
    // Recover the baseline the same way Figma would report it.
    const L = n.lineHeight.value,
      emBox = 1.21 * n.fontSize
    const base = n.y + (L - emBox) / 2 + emBox * 0.8
    const steps = (base - pv.rowOffset) / pv.cellH
    check(
      `${n.name} baseline sits exactly on a grid row line`,
      Math.abs(steps - Math.round(steps)) < 1e-6,
      'row ' + steps.toFixed(6),
    )
  })
}

console.log('--- baseline alignment holds at every cell density ---')
for (const d of [1, 2, 3]) {
  const { fr, pv } = await apply(1920, 1080, { cellDensity: d })
  const spec = layer(fr, 'Type Specimens')
  const ok = spec.children.every((n) => {
    const L = n.lineHeight.value,
      emBox = 1.21 * n.fontSize
    const base = n.y + (L - emBox) / 2 + emBox * 0.8
    const steps = (base - pv.rowOffset) / (pv.cellH / d) // finer grid lines
    return Math.abs(steps - Math.round(steps)) < 1e-6
  })
  check(`${d}x -> all specimen baselines on grid lines`, ok)
}

console.log('--- no temp probe nodes leaked by the measurement ---')
{
  const { fr } = await apply(1920, 1080)
  page.selection = [fr]
  const before = nodes.filter((n) => !n.removed).length
  await uiHandler({
    type: 'params-changed',
    params: { ...P, cellAspect: 2.4 },
    reapply: true,
  })
  const after = nodes.filter((n) => !n.removed).length
  check(
    'baseline probes are cleaned up',
    after === before,
    'before=' + before + ' after=' + after,
  )
}

console.log('\n=== SOLVE MODE ===')
{
  const { pv } = await apply(1920, 1080, { mode: 'Manual' })
  check(
    'Manual mode derives from the ratios (m3, g1, k derived)',
    pv.solvedM === 3 && pv.solvedG === 1 && pv.solvedK >= 1 && pv.solved === false,
    `m${pv.solvedM} k${pv.solvedK} g${pv.solvedG} solved=${pv.solved}`,
  )
}

console.log('--- the solver returns the OPTIMUM (checked against a brute force) ---')
// Independent re-derivation of the objective, so a regression in the search or
// the weighting is caught rather than assumed.
// Three weighted targets now: columns 16x, gutter 8x, margin 1x, no constraints.
const bruteForce = (W, c, tm, tg, tn, pp = true, GW = 8, CW = 16) => {
  let b = null
  for (let g = 1; g <= 8; g++)
    for (let m = 0; m <= 24; m++)
      for (let k = 1; k <= 48; k++) {
        const N = 2 * m + c * k + (c - 1) * g
        const u = snapU(W / N, pp)
        const gut = g * u,
          mar = m * u + (W - N * u) / 2
        const err =
          (GW * Math.abs(gut - tg)) / Math.max(1, tg) +
          (CW * Math.abs(N - tn)) / Math.max(1, tn) +
          Math.abs(mar - tm) / Math.max(1, tm)
        if (!b || err < b.err - 1e-9 || (Math.abs(err - b.err) < 1e-9 && N < b.N))
          b = { m, k, g, u, gut, mar, err, N }
      }
  return b
}
for (const [M, G, Ncols] of [
  [50, 20, 197],
  [64, 24, 197],
  [100, 20, 120],
  [48, 16, 240],
  [120, 32, 80],
  [50, 20, 360],
  [80, 40, 64],
]) {
  const { fr, pv } = await apply(1920, 1080, {
    mode: 'Solve',
    targetMarginPx: M,
    targetGutterPx: G,
    targetColumns: Ncols,
  })
  const want = bruteForce(1920, 12, M, G, Ncols)
  check(
    `want ${M}/${G}/${Ncols}cols -> optimal m${want.m} k${want.k} g${want.g}`,
    pv.solvedM === want.m && pv.solvedK === want.k && pv.solvedG === want.g,
    `got m${pv.solvedM} k${pv.solvedK} g${pv.solvedG}, optimum m${want.m} k${want.k} g${want.g}`,
  )
  check(`  u matches the optimum (${want.u}px)`, Math.abs(pv.u - want.u) < 1e-9, pv.u)
  check(
    `  achieved margin/gutter match (${want.mar.toFixed(1)}/${want.gut})`,
    Math.abs(pv.effectiveMargin - want.mar) < 1e-6 &&
      Math.abs(pv.gutterPx - want.gut) < 1e-6,
    pv.effectiveMargin.toFixed(2) + '/' + pv.gutterPx,
  )
  check(`  N matches the optimum (${want.N})`, pv.cols === want.N, pv.cols)
  const lg = fr.layoutGrids[0]
  check(
    `  column + gutter still whole cells`,
    Math.abs(lg.sectionSize / pv.u - Math.round(lg.sectionSize / pv.u)) < 1e-9 &&
      Math.abs(lg.gutterSize / pv.u - Math.round(lg.gutterSize / pv.u)) < 1e-9,
  )
  check(
    `  N matches the solved multiples`,
    pv.cols === 2 * pv.solvedM + 12 * pv.solvedK + 11 * pv.solvedG,
    pv.cols,
  )
}

console.log('--- pinning the columns costs margin accuracy (the documented trade) ---')
{
  // Weighting the column count means the solver can no longer roam N freely to
  // land the margin, which is the price of the third ask being honoured.
  const loose = bruteForce(1920, 12, 50, 20, 197, true, 8, 0)
  const pinned = bruteForce(1920, 12, 50, 20, 197, true, 8, 16)
  const marginErr = (b) => Math.abs(b.mar - 50)
  check(
    'ignoring the column ask can fit the margin at least as well',
    marginErr(loose) <= marginErr(pinned) + 1e-9,
    'free margin=' +
      loose.mar.toFixed(1) +
      ' (N=' +
      loose.N +
      ')  pinned margin=' +
      pinned.mar.toFixed(1) +
      ' (N=' +
      pinned.N +
      ')',
  )
  check(
    '...and the column ask is what the weighting buys',
    Math.abs(pinned.N - 197) <= Math.abs(loose.N - 197),
    'pinned N=' + pinned.N + ' free N=' + loose.N,
  )
  const { pv } = await apply(1920, 1080, { mode: 'Solve' })
  // Not exact any more, and that is the documented trade: at the default 89
  // columns u is 21.57px, so the reachable gutters are multiples of that.
  check(
    'the gutter lands on the nearest reachable multiple of the cell',
    Math.abs(pv.gutterPx - Math.round(20 / pv.u) * pv.u) < 1e-6,
    'gutter=' + pv.gutterPx.toFixed(2) + ' u=' + pv.u.toFixed(2),
  )
}

console.log('--- the solver beats the manual default at matching a target ---')
{
  const target = { targetMarginPx: 100, targetGutterPx: 20 }
  const man = await apply(1920, 1080, { mode: 'Manual', ...target })
  const sol = await apply(1920, 1080, { mode: 'Solve', ...target })
  const err = (pv) =>
    Math.abs(pv.effectiveMargin - 100) / 100 + Math.abs(pv.gutterPx - 20) / 20
  check(
    'solved fit is closer than the manual multiples',
    err(sol.pv) < err(man.pv),
    'manual=' + err(man.pv).toFixed(3) + ' solved=' + err(sol.pv).toFixed(3),
  )
}

console.log('--- the column count is the third target ---')
{
  // Verify that the solver follows the requested cell count.
  const seen = []
  for (const want of [80, 120, 197, 280, 360]) {
    const { pv } = await apply(1920, 1080, {
      mode: 'Solve',
      targetMarginPx: 64,
      targetGutterPx: 24,
      targetColumns: want,
    })
    seen.push(pv.cols)
    // Allow 6% because matching the gutter can shift N. The measured maximum
    // here is 5.7%: a target of 280 gives 296 columns and an exact 24px gutter.
    check(
      `ask ${want} cols -> ${pv.cols}, within 6%`,
      Math.abs(pv.cols - want) <= want * 0.06,
      'N=' + pv.cols + ' asked ' + want,
    )
    check(
      '  ...and it is a real grid',
      pv.solvedK >= 1 &&
        pv.u > 0 &&
        pv.cols === 2 * pv.solvedM + 12 * pv.solvedK + 11 * pv.solvedG,
      'N=' + pv.cols,
    )
  }
  check(
    'asking for more columns monotonically gives more',
    seen.every((v, i) => i === 0 || v > seen[i - 1]),
    seen.join(' < '),
  )
}

console.log('--- three targets, and the column count wins ---')
{
  // Columns are weighted 16x, the gutter 8x, the margin 1x — so a conflict is
  // resolved in the column count's favour, since N sets the cell size.
  const { pv } = await apply(1920, 1080, {
    mode: 'Solve',
    targetMarginPx: 64,
    targetGutterPx: 24,
    targetColumns: 197,
  })
  check(
    'the column count is honoured tightly',
    // Allow 3%: snap tolerance leaves fractional cell sizes, changing which N
    // gives the best weighted match for a 24px gutter.
    Math.abs(pv.cols - 197) <= 197 * 0.03,
    'N=' + pv.cols,
  )
  check(
    '...much more tightly than the old weighting managed (was 20% off)',
    Math.abs(pv.cols - 197) < 197 * 0.05,
    'N=' + pv.cols,
  )
  // With N pinned, u is pinned, so the gutter can only be a whole multiple of it.
  check(
    'the gutter lands on the nearest whole multiple of the cell',
    Math.abs(pv.gutterPx - Math.round(24 / pv.u) * pv.u) < 1e-6,
    'gutter=' + pv.gutterPx.toFixed(2) + ' u=' + pv.u.toFixed(2),
  )
  check(
    'the margin lands within a cell, as it is quantised by one',
    Math.abs(pv.effectiveMargin - 64) <= pv.u + 1e-6,
    'margin=' + pv.effectiveMargin.toFixed(2) + ' u=' + pv.u.toFixed(2),
  )
}

console.log('--- no target can make the solver fail ---')
{
  // The old solver had a "no fit" state for both constraints. With three targets
  // there is nothing to satisfy, so every input yields a grid.
  for (const [M, G, N] of [
    [0, 1, 1],
    [0, 1, 10000],
    [5000, 5000, 197],
    [64, 24, 1],
    [1, 1, 593],
  ]) {
    const { pv } = await apply(1920, 1080, {
      mode: 'Solve',
      targetMarginPx: M,
      targetGutterPx: G,
      targetColumns: N,
    })
    check(
      `margin ${M} gutter ${G} cols ${N} -> a valid grid`,
      pv.cols > 0 && Number.isFinite(pv.u) && pv.u > 0 && pv.solvedK >= 1,
      'N=' + pv.cols + ' u=' + pv.u.toFixed(2) + ' k=' + pv.solvedK,
    )
  }
  check(
    'the removed constraints are gone from the payload',
    !('solveWithinTolerance' in (await apply(1920, 1080, { mode: 'Solve' })).pv) &&
      !('solveWithinCellBounds' in (await apply(1920, 1080, { mode: 'Solve' })).pv) &&
      !('solveAspectErrPct' in (await apply(1920, 1080, { mode: 'Solve' })).pv),
  )
}

console.log('--- solver works for other column counts and frames ---')
for (const [c, w, h] of [
  [6, 1440, 900],
  [4, 1024, 768],
  [9, 2560, 1440],
  [1, 1920, 1080],
]) {
  const { fr, pv } = await apply(w, h, {
    mode: 'Solve',
    columnCount: c,
    targetMarginPx: 64,
    targetGutterPx: 24,
  })
  const N = 2 * pv.solvedM + c * pv.solvedK + (c - 1) * pv.solvedG
  check(
    `c=${c} ${w}x${h} -> consistent N and finite u`,
    pv.cols === N && pv.u > 0,
    'N=' + pv.cols + ' u=' + pv.u.toFixed(2),
  )
  check(
    `c=${c} ${w}x${h} -> grid fits the frame`,
    Math.abs(
      2 * pv.marginPx +
        c * fr.layoutGrids[0].sectionSize +
        (c - 1) * fr.layoutGrids[0].gutterSize -
        pv.cols * pv.u,
    ) < 1e-6,
  )
}

console.log('\n=== solver targets the MEASURABLE margin (grid is centred) ===')
for (const [M, G] of [
  [50, 20],
  [100, 20],
  [120, 32],
]) {
  const { fr, pv } = await apply(1920, 1080, {
    mode: 'Solve',
    targetMarginPx: M,
    targetGutterPx: G,
  })
  // What you would actually measure from the frame edge to the first column.
  const colLG = fr.layoutGrids[0]
  const contentW = 12 * colLG.sectionSize + 11 * colLG.gutterSize
  const measured = (1920 - contentW) / 2
  check(
    `asked ${M} -> effectiveMargin is what you would measure`,
    Math.abs(measured - pv.effectiveMargin) < 1e-6,
    'measured=' + measured.toFixed(2) + ' effectiveMargin=' + pv.effectiveMargin.toFixed(2),
  )
  check(
    `  effectiveMargin matches what is measurable`,
    Math.abs(measured - pv.effectiveMargin) < 1e-6,
    measured.toFixed(4) + ' vs ' + pv.effectiveMargin.toFixed(4),
  )
  check(
    `  gutter within one cell of ${G}`,
    Math.abs(colLG.gutterSize - G) <= pv.u + 1e-6,
    colLG.gutterSize,
  )
}

console.log('--- actual values are reported for the panel ---')
{
  const { pv } = await apply(1920, 1080, {
    mode: 'Solve',
    targetMarginPx: 64,
    targetGutterPx: 24,
  })
  check(
    'preview carries effectiveMargin',
    typeof pv.effectiveMargin === 'number',
    pv.effectiveMargin,
  )
  check('preview carries gutterPx', typeof pv.gutterPx === 'number', pv.gutterPx)
  check(
    'preview carries actualAspect',
    typeof pv.actualAspect === 'number',
    pv.actualAspect,
  )
  check(
    'preview carries the targets for comparison',
    pv.targetMarginPx === 64 && pv.targetGutterPx === 24,
    pv.targetMarginPx + '/' + pv.targetGutterPx,
  )
  check(
    'actualAspect = cellH / u',
    Math.abs(pv.actualAspect - pv.cellH / pv.u) < 1e-9,
    pv.actualAspect.toFixed(4),
  )
}

console.log('\n=== the aspect is reported, not enforced ===')
{
  const plain = await apply(1920, 1080, {
    mode: 'Solve',
    targetMarginPx: 50,
    targetGutterPx: 20,
  })
  check(
    'the achieved aspect is reported',
    typeof plain.pv.deltaPct === 'number' && typeof plain.pv.actualAspect === 'number',
    plain.pv.deltaPct,
  )
}

console.log('\n=== new defaults ===')
{
  const fr = makeFrame(1920, 1080)
  page.appendChild(fr)
  page.selection = [fr]
  await uiHandler({
    type: 'params-changed',
    params: { ...P, mode: 'Solve' },
    reapply: false,
  })
  const pv = figma.ui._last.preview
  check('default target margin 50px', pv.targetMarginPx === 50, pv.targetMarginPx)
  check('default target gutter 20px', pv.targetGutterPx === 20, pv.targetGutterPx)
  // The plugin's own defaults, from the action-state it posts before any UI input.
  const first = figma.ui._all[0].preview
  check(
    "plugin's built-in defaults are 50 / 20 / 89",
    first.targetMarginPx === 50 &&
      first.targetGutterPx === 20 &&
      first.targetColumns === 89,
    [first.targetMarginPx, first.targetGutterPx, first.targetColumns].join('/'),
  )
  // cellColumns in the payload is the rung *taken*, not the raw default: with
  // pixel-perfect off there is no exact rung for every ask, so it snaps to the
  // nearest.
  check(
    'the default 89-column ask lands on an exact rung',
    first.cellLadder.indexOf(89) !== -1 &&
      first.cellColumns === 89 &&
      first.cellLadder.every(
        (v) => Math.abs(v - 89) >= Math.abs(first.cellColumns - 89) - 1e-9,
      ),
    first.cellColumns + ' from [' + first.cellLadder.join(',') + ']',
  )
  check(
    '...and pixel-perfect is off by default, so that rung has no bleed',
    Math.abs(first.hRemainder) < 1e-9,
    first.hRemainder,
  )
  check('default column target 89', pv.targetColumns === 89, pv.targetColumns)
  check(
    'no maxCellPx in the payload any more',
    !('maxCellPx' in pv),
    Object.keys(pv)
      .filter((k) => /max/i.test(k))
      .join(','),
  )
  check(
    'solving the defaults lands on the asked-for density',
    Math.abs(pv.cols - 89) <= 89 * 0.02,
    'N=' + pv.cols,
  )
  check(
    'the gutter is the nearest whole number of cells to the ask',
    Math.abs(pv.gutterPx - Math.round(20 / pv.u) * pv.u) < 1e-6,
    'gutter=' + pv.gutterPx.toFixed(2) + ' u=' + pv.u.toFixed(2),
  )
}

console.log('\n=== the palette is literal, and survives live reapplies ===')
{
  const fr = makeFrame(1920, 1080)
  page.appendChild(fr)
  page.selection = [fr]
  await uiHandler({ type: 'action', action: 'apply', params: P })
  const rgb = (n) => {
    const c = n.fills[0].color
    return (
      '#' +
      [c.r, c.g, c.b]
        .map((v) =>
          Math.round(v * 255)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('')
    )
  }
  const chars = () => fr.children.find((c) => c.name === 'Char Grid')
  const stroke = () => {
    const c = layer(fr, 'Grid Lines').children[0].strokes[0].color
    return (
      '#' +
      [c.r, c.g, c.b]
        .map((v) =>
          Math.round(v * 255)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('')
    )
  }

  check('the char grid is grey', rgb(chars()) === '#333333', rgb(chars()))
  check(
    'the specimens are white',
    layer(fr, 'Type Specimens').children.every((n) => rgb(n) === '#ffffff'),
    layer(fr, 'Type Specimens').children.map(rgb).join(','),
  )
  check('the cell lines are grey', stroke() === '#666666', stroke())
  check('nothing carries a variable binding any more', !chars().fills[0].boundVariables)

  for (let i = 0; i < 5; i++) {
    await uiHandler({
      type: 'params-changed',
      reapply: true,
      params: { ...P, marginCells: 2 + i },
    })
  }
  check(
    'still the same colours after five live reapplies',
    rgb(chars()) === '#333333' && stroke() === '#666666',
    [rgb(chars()), stroke()].join(' '),
  )

  page.selection = []
  await uiHandler({ type: 'action', action: 'create', params: P })
  const made = page.children[page.children.length - 1]
  check('a created frame is black', rgb(made) === '#000000', rgb(made))
}

console.log('\n=== a custom frame aspect ===')
{
  page.selection = []
  await uiHandler({
    type: 'action',
    action: 'create',
    params: { ...P, frameWidth: 1200, frameAspect: '16:9' },
  })
  const preset = page.children[page.children.length - 1]
  check(
    'a preset aspect still derives the height',
    preset.width === 1200 && preset.height === 675,
    preset.width + 'x' + preset.height,
  )

  page.selection = []
  await uiHandler({
    type: 'action',
    action: 'create',
    params: { ...P, frameWidth: 1200, frameAspect: 'Custom', frameHeight: 900 },
  })
  const custom = page.children[page.children.length - 1]
  check(
    'Custom takes the height verbatim',
    custom.width === 1200 && custom.height === 900,
    custom.width + 'x' + custom.height,
  )

  page.selection = []
  await uiHandler({
    type: 'action',
    action: 'create',
    params: { ...P, frameWidth: 1200, frameAspect: 'Custom', frameHeight: 0 },
  })
  const floored = page.children[page.children.length - 1]
  check(
    'a zero height falls back rather than making a zero-height frame',
    floored.height >= 1,
    floored.height,
  )

  // The preview must agree with what Create frame would actually make.
  page.selection = []
  await uiHandler({
    type: 'params-changed',
    reapply: false,
    params: { ...P, frameWidth: 1200, frameAspect: 'Custom', frameHeight: 900 },
  })
  const pv = figma.ui._last.preview
  check(
    'the preview measures against the custom size',
    pv.frameW === 1200 && pv.frameH === 900,
    pv.frameW + 'x' + pv.frameH,
  )
}

console.log('\n=== duplicated layers are reconciled, not multiplied ===')
{
  const names = ['Char Grid', 'Grid Lines', 'Type Specimens']
  const countOf = (fr, n) => fr.children.filter((c) => c.name === n).length
  const allSingle = (fr) => names.every((n) => countOf(fr, n) === 1)

  // 1. A frame gridded by an older version that stored no id for the lines or the
  //    specimens: those layers exist but are unreachable, so a fresh set used to
  //    be created beside them.
  {
    const fr = makeFrame(1920, 1080)
    page.appendChild(fr)
    page.selection = [fr]
    await uiHandler({ type: 'action', action: 'apply', params: P })
    const data = JSON.parse(fr.getPluginData('dualGrid'))
    delete data.state.linesId
    delete data.state.specimensId
    fr.setPluginData('dualGrid', JSON.stringify(data))
    await uiHandler({ type: 'action', action: 'apply', params: P })
    check(
      'an older frame with missing ids gets one of each, not two',
      allSingle(fr),
      names.map((n) => n + ':' + countOf(fr, n)).join(' '),
    )
  }

  // 2. Stray duplicates left in the frame by whatever means.
  {
    const fr = makeFrame(1920, 1080)
    page.appendChild(fr)
    page.selection = [fr]
    await uiHandler({ type: 'action', action: 'apply', params: P })
    const stray = makeText()
    stray.name = 'Char Grid'
    fr.appendChild(stray)
    const strayFrame = makeFrame(10, 10)
    strayFrame.name = 'Type Specimens'
    fr.appendChild(strayFrame)
    await uiHandler({ type: 'action', action: 'apply', params: P })
    check(
      'strays of the same name are cleared on the next apply',
      allSingle(fr),
      names.map((n) => n + ':' + countOf(fr, n)).join(' '),
    )
    check(
      '...and the surviving char grid is the real one',
      fr.children.find((c) => c.name === 'Char Grid').characters.length > 100,
    )
  }

  // 3. A duplicated frame. pluginData copies with it, so its stored ids point at
  //    the ORIGINAL's layers — which used to be moved out of the original and into
  //    the copy, leaving the original short and then rebuilt.
  {
    const orig = makeFrame(1920, 1080)
    page.appendChild(orig)
    page.selection = [orig]
    await uiHandler({ type: 'action', action: 'apply', params: P })
    const origIds = names.map((n) => orig.children.find((c) => c.name === n).id)

    // Copy the frame the way Figma does: same pluginData, fresh child nodes.
    const copy = makeFrame(1920, 1080)
    page.appendChild(copy)
    copy.setPluginData('dualGrid', orig.getPluginData('dualGrid'))
    for (const n of names) {
      const node = n === 'Char Grid' ? makeText() : makeFrame(10, 10)
      node.name = n
      copy.appendChild(node)
    }

    page.selection = [copy]
    await uiHandler({ type: 'action', action: 'apply', params: P })
    check(
      'the copy ends up with one of each',
      allSingle(copy),
      names.map((n) => n + ':' + countOf(copy, n)).join(' '),
    )
    check(
      '...and the original keeps all of its own layers',
      names.every((n) => countOf(orig, n) === 1) &&
        origIds.every((id) => orig.children.some((c) => c.id === id)),
      names.map((n) => n + ':' + countOf(orig, n)).join(' '),
    )
    check(
      '...none of which were stolen into the copy',
      !copy.children.some((c) => origIds.indexOf(c.id) !== -1),
      copy.children.map((c) => c.id).join(','),
    )

    // Removing from the copy must not strip the original.
    await uiHandler({ type: 'action', action: 'remove', params: P })
    check(
      'removing from the copy leaves the original intact',
      names.every((n) => countOf(orig, n) === 1) && orig.layoutGrids.length === 3,
      names.map((n) => n + ':' + countOf(orig, n)).join(' '),
    )
    check(
      '...and clears the copy completely',
      names.every((n) => countOf(copy, n) === 0) && copy.layoutGrids.length === 0,
      copy.children.map((c) => c.name).join(','),
    )
  }

  // 4. Remove also clears layers an older version never stored an id for.
  {
    const fr = makeFrame(1920, 1080)
    page.appendChild(fr)
    page.selection = [fr]
    await uiHandler({ type: 'action', action: 'apply', params: P })
    const data = JSON.parse(fr.getPluginData('dualGrid'))
    data.state = { charGridId: null, fontProbe: data.state.fontProbe }
    fr.setPluginData('dualGrid', JSON.stringify(data))
    await uiHandler({ type: 'action', action: 'remove', params: P })
    check(
      'remove clears generated layers even with no ids stored',
      fr.children.length === 0 && fr.layoutGrids.length === 0,
      fr.children.map((c) => c.name).join(','),
    )
  }
}

console.log('\n=== selecting a child keeps the panel bound to its frame ===')
{
  const fr = makeFrame(1920, 1080)
  page.appendChild(fr)
  page.selection = [fr]
  await uiHandler({ type: 'action', action: 'apply', params: P })
  const state = () => figma.ui._last
  const chars = fr.children.find((c) => c.name === 'Char Grid')
  const lines = layer(fr, 'Grid Lines')
  const spec = layer(fr, 'Type Specimens')

  // Your own artwork inside the frame, not just the generated layers.
  const art = makeText()
  art.name = 'My Heading'
  fr.appendChild(art)

  for (const [label, node] of [
    ['the char grid', chars],
    ['a specimen', spec.children[0]],
    ['your own layer', art],
  ]) {
    page.selection = [node]
    onSel()
    check(
      `selecting ${label} still reports the frame as bound`,
      state().action === 'remove' && state().status === 'Live editing',
      state().action + ' / ' + state().status,
    )
    const before = chars.characters.length
    await uiHandler({
      type: 'params-changed',
      reapply: true,
      params: { ...P, cellColumns: 77 },
    })
    check(
      `  ...and a live edit reaches the frame`,
      chars.characters.length !== before,
      before + ' -> ' + chars.characters.length,
    )
    await uiHandler({ type: 'params-changed', reapply: true, params: P })
  }

  // Grid Lines and Type Specimens are frames themselves. Selecting one used to
  // satisfy the old "one frame selected" check, so Apply would have gridded the
  // container instead of the real frame.
  page.selection = [lines]
  onSel()
  check(
    'selecting the Grid Lines container resolves to the parent frame',
    state().action === 'remove',
    state().action,
  )
  await uiHandler({ type: 'action', action: 'apply', params: P })
  check(
    '...and applying does not grid the container',
    lines.layoutGrids.length === 0 && !lines.children.some((c) => c.name === 'Char Grid'),
    lines.layoutGrids.length +
      ' grids, children: ' +
      lines.children.map((c) => c.name).join(','),
  )

  // Several children of the same frame agree; children of different frames do not.
  page.selection = [chars, art]
  onSel()
  check('two children of the same frame agree', state().action === 'remove')
  const other = makeFrame(800, 600)
  page.appendChild(other)
  page.selection = [chars, other]
  onSel()
  check(
    'a selection spanning two frames is ambiguous, so nothing is bound',
    state().action === 'create' && state().actionLabel === 'Create frame',
    state().action + ' / ' + state().status,
  )

  // An ungridded frame's children must not offer to grid the parent.
  const plainChild = makeText()
  plainChild.name = 'Loose'
  other.appendChild(plainChild)
  page.selection = [plainChild]
  onSel()
  check(
    'a child of an ungridded frame binds nothing',
    state().action === 'create',
    state().action,
  )
  page.selection = [other]
  onSel()
  check(
    '...while the ungridded frame itself still offers Apply',
    state().action === 'apply' && state().actionLabel === 'Apply grids',
    state().action,
  )
}

console.log('\n=== a live reapply updates in place, it does not recreate ===')
{
  const fr = makeFrame(1920, 1080)
  page.appendChild(fr)
  page.selection = [fr]
  await uiHandler({ type: 'action', action: 'apply', params: { ...P } })
  const spec = () => layer(fr, 'Type Specimens')
  const chars = () => fr.children.find((c) => c.name === 'Char Grid')

  const idsBefore = spec().children.map((n) => n.id)
  const charIdBefore = chars().id
  // Type over a specimen and the char grid, as you would to try the real copy.
  spec().children[0].characters = 'HAND EDITED'
  const gridTextBefore = chars().characters

  // A reapply that changes the metrics but not the grid's shape.
  await uiHandler({
    type: 'params-changed',
    reapply: true,
    params: { ...P, cellAspect: 2.5 },
  })

  check(
    'specimen nodes are reused, not replaced',
    spec()
      .children.map((n) => n.id)
      .join(',') === idsBefore.join(','),
    idsBefore.join(',') +
      ' -> ' +
      spec()
        .children.map((n) => n.id)
        .join(','),
  )
  check('the char grid node is reused too', chars().id === charIdBefore)
  check(
    'edited specimen text survives the reapply',
    spec().children[0].characters === 'HAND EDITED',
    spec().children[0].characters,
  )
  check(
    'but the metrics did update — line height is a whole number of cells',
    (() => {
      const pv = figma.ui._last.preview
      const n = spec().children[0]
      const mult = n.lineHeight.value / pv.cellH
      return Math.abs(mult - Math.round(mult)) < 1e-6 && n.fontSize > 0
    })(),
    spec().children[0].lineHeight.value.toFixed(2),
  )

  // Changing the aspect changes cellH, so the row count changes and the char grid
  // *must* be rewritten — but only then.
  const rowsChanged = chars().characters !== gridTextBefore
  check(
    'the char grid text is rewritten when the shape changes',
    rowsChanged,
    'before ' +
      gridTextBefore.split('\n').length +
      ' rows, after ' +
      chars().characters.split('\n').length,
  )
  const textAfter = chars().characters
  await uiHandler({
    type: 'params-changed',
    reapply: true,
    params: { ...P, cellAspect: 2.5 },
  })
  check(
    '...and left alone when nothing about the shape changed',
    chars().characters === textAfter,
  )

  // A specimen that stops fitting is removed rather than left orphaned.
  const before = spec().children.length
  await uiHandler({
    type: 'params-changed',
    reapply: true,
    params: { ...P, frameWidth: 1920 },
  })
  check(
    'no specimen is duplicated across reapplies',
    spec().children.length === new Set(spec().children.map((n) => n.name)).size,
    spec()
      .children.map((n) => n.name)
      .join(','),
  )
  check(
    'and the count is stable',
    spec().children.length === before,
    before + ' -> ' + spec().children.length,
  )
}

console.log('\n=== mono anchors to the top, sans to the bottom ===')
for (const [w, h] of [
  [1920, 1080],
  [1920, 2400],
  [1200, 600],
]) {
  const { fr, pv } = await apply(w, h)
  const kids = layer(fr, 'Type Specimens').children
  const mono = kids.filter((n) => /Mono/.test(n.name))
  const sans = kids.filter((n) => !/Mono/.test(n.name))
  if (!mono.length || !sans.length) continue

  check(
    `${w}x${h}: mono stays at the top`,
    mono[0].y < h * 0.2,
    'y=' + mono[0].y.toFixed(1) + ' of ' + h,
  )
  const lastBottom = sans[sans.length - 1].y + sans[sans.length - 1].lineHeight.value
  check(
    `  the sans stack is anchored to the bottom`,
    lastBottom > h - pv.cellH * (sans[sans.length - 1].lineHeight.value / pv.cellH + 1) &&
      lastBottom <= h + 1,
    'last bottom=' + lastBottom.toFixed(1) + ' of ' + h,
  )
  // At least a cell of clear space below the descender, mirroring the inset the
  // mono block gets at the top — a ceiling on the descender alone could leave
  // none, which read as the display line touching the frame edge.
  check(
    `  ...with at least a cell of clearance below the descender`,
    h - lastBottom >= pv.cellH - 1e-6 && h - lastBottom < pv.cellH * 3,
    'gap=' + (h - lastBottom).toFixed(1) + 'px, cellH=' + pv.cellH.toFixed(1),
  )
  check(
    `  the two blocks do not overlap`,
    mono[mono.length - 1].y + mono[mono.length - 1].lineHeight.value <= sans[0].y + 1,
    'mono ends ' +
      (mono[mono.length - 1].y + mono[mono.length - 1].lineHeight.value).toFixed(1) +
      ', sans starts ' +
      sans[0].y.toFixed(1),
  )
  check(
    `  every baseline is still on a cell line`,
    kids.every((n) => {
      const emBox = 1.21 * n.fontSize
      const base = n.y + (n.lineHeight.value - emBox) / 2 + emBox * 0.8
      const cells = (base - pv.rowOffset) / pv.cellH
      return Math.abs(cells - Math.round(cells)) < 0.02
    }),
    kids
      .map((n) =>
        (
          (n.y +
            (n.lineHeight.value - 1.21 * n.fontSize) / 2 +
            1.21 * n.fontSize * 0.8 -
            pv.rowOffset) /
          pv.cellH
        ).toFixed(2),
      )
      .join(' '),
  )
  check(
    `  the sans block runs in ascending size order`,
    sans.every((n, i) => i === 0 || n.fontSize >= sans[i - 1].fontSize),
    sans.map((n) => n.fontSize.toFixed(0)).join(' < '),
  )
}

console.log('\n=== the outermost lines are dropped where they meet the frame edge ===')
{
  const lineCoords = (fr) => {
    const v = layer(fr, 'Grid Lines').children[0]
    const segs = [
      ...v.vectorPaths[0].data.matchAll(/M ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+)/g),
    ].map((m) => [+m[1] + v.x, +m[2] + v.y, +m[3] + v.x, +m[4] + v.y])
    return {
      xs: [...new Set(segs.filter((s) => s[0] === s[2]).map((s) => s[0]))].sort(
        (a, b) => a - b,
      ),
      ys: [...new Set(segs.filter((s) => s[1] === s[3]).map((s) => s[1]))].sort(
        (a, b) => a - b,
      ),
    }
  }
  // pixel-perfect off + snap rows on: the grid is flush on all four sides.
  const flush = await apply(1920, 1080, {
    mode: 'Manual',
    pixelPerfect: false,
    snapRows: true,
  })
  const f = lineCoords(flush.fr)
  check(
    'no vertical line on the left or right edge',
    !f.xs.some((x) => Math.abs(x) < 0.01 || Math.abs(x - 1920) < 0.01),
    'first=' + f.xs[0].toFixed(2) + ' last=' + f.xs[f.xs.length - 1].toFixed(2),
  )
  check(
    'no horizontal line on the top or bottom edge',
    !f.ys.some((y) => Math.abs(y) < 0.01 || Math.abs(y - 1080) < 0.01),
    'first=' + f.ys[0].toFixed(2) + ' last=' + f.ys[f.ys.length - 1].toFixed(2),
  )
  check(
    'exactly two fewer of each than there are boundaries',
    f.xs.length === flush.pv.cols - 1 && f.ys.length === flush.pv.rows - 1,
    f.xs.length +
      ' verticals for N=' +
      flush.pv.cols +
      ', ' +
      f.ys.length +
      ' horizontals for ' +
      flush.pv.rows +
      ' rows',
  )
  check(
    'the interior lines are unchanged — still every cell boundary',
    f.xs.every((x, i) => Math.abs(x - (i + 1) * flush.pv.u) < 1e-6),
    f.xs
      .slice(0, 3)
      .map((x) => x.toFixed(2))
      .join(','),
  )

  // pixel snap forced (tolerance 0.5): the grid bleeds past the frame, but
  // lines beyond the boundary are culled outright — invisible under the clip
  // and dead weight in the vector.
  const bleeding = await apply(1920, 1080, {
    mode: 'Manual',
    pixelPerfect: true,
    snapRows: true,
    snapTolerancePx: 0.5,
  })
  check(
    'the forced snap really bleeds',
    Math.abs(bleeding.pv.hRemainder) > 0.01,
    bleeding.pv.hRemainder,
  )
  {
    const b = lineCoords(bleeding.fr)
    check(
      'a bleeding grid culls its beyond-frame lines',
      b.xs[0] >= 0 && b.xs[b.xs.length - 1] <= 1920,
      'first=' + b.xs[0].toFixed(2) + ' last=' + b.xs[b.xs.length - 1].toFixed(2),
    )
  }

  // Subdivision must not reintroduce them.
  for (const d of [2, 3]) {
    const sub = await apply(1920, 1080, {
      mode: 'Manual',
      pixelPerfect: false,
      snapRows: true,
      cellDensity: d,
    })
    const c = lineCoords(sub.fr)
    check(
      `${d}x subdivision still skips the frame edges`,
      !c.xs.some((x) => Math.abs(x) < 0.01 || Math.abs(x - 1920) < 0.01) &&
        !c.ys.some((y) => Math.abs(y) < 0.01 || Math.abs(y - 1080) < 0.01),
      'xs ' + c.xs[0].toFixed(2) + '..' + c.xs[c.xs.length - 1].toFixed(2),
    )
  }
}

console.log('\n=== font families come from the params ===')
{
  // Whichever mono the mock has installed — the suite runs with GT America Mono
  // by default and with Roboto Mono under NO_GTAM=1.
  const MONO = AVAILABLE[0].fontName.family
  const { fr } = await apply(1920, 1080, { monoFamily: MONO })
  check(
    'the char grid uses the requested mono family',
    layer(fr, 'Char Grid').fontName.family === MONO,
    layer(fr, 'Char Grid').fontName.family,
  )

  // The probes are cached per frame, so a family change has to invalidate them
  // or the char grid keeps the old advance width and characters stop being one
  // cell wide. Reapply to the SAME frame to exercise the cache.
  const fr2 = makeFrame(1920, 1080)
  page.appendChild(fr2)
  page.selection = [fr2]
  await uiHandler({
    type: 'action',
    action: 'apply',
    params: { ...P, monoFamily: MONO },
  })
  const first = JSON.parse(fr2.getPluginData('dualGrid'))
  // 'Inter' is the other family the mock has installed.
  await uiHandler({
    type: 'action',
    action: 'apply',
    params: { ...P, monoFamily: 'Inter' },
  })
  const second = JSON.parse(fr2.getPluginData('dualGrid'))
  check(
    'the stored probe records which family it measured',
    first.state.probedMono === MONO && second.state.probedMono === 'Inter',
    first.state.probedMono + ' -> ' + second.state.probedMono,
  )
  check(
    'changing the family re-probes rather than reusing the cache',
    second.state.fontProbe.family === 'Inter' && first.state.fontProbe.family === MONO,
    first.state.fontProbe.family + ' -> ' + second.state.fontProbe.family,
  )
  const grid = layer(fr2, 'Char Grid')
  check(
    '...and the char grid follows it',
    grid.fontName.family === 'Inter',
    grid.fontName.family,
  )

  // Reapplying the same family must NOT re-probe — the cache is what keeps a
  // live drag from creating temp nodes on every tick.
  await uiHandler({
    type: 'action',
    action: 'apply',
    params: { ...P, monoFamily: 'Inter' },
  })
  const third = JSON.parse(fr2.getPluginData('dualGrid'))
  check(
    'an unchanged family reuses the cached probe',
    third.state.fontProbe.advancePer100 === second.state.fontProbe.advancePer100,
    third.state.fontProbe.advancePer100,
  )

  // An uninstalled family still falls back rather than failing.
  await uiHandler({
    type: 'action',
    action: 'apply',
    params: { ...P, monoFamily: 'Nonexistent Mono' },
  })
  check(
    'an uninstalled family falls back to an installed one',
    !!layer(fr2, 'Char Grid').fontName.family,
    layer(fr2, 'Char Grid').fontName.family,
  )
}

console.log('\n=== specimens degrade to fit the available rows ===')
for (const [w, h, label] of [
  [1920, 1080, '16:9'],
  [1920, 400, 'short'],
  [800, 300, 'tiny'],
  [1920, 2400, 'tall'],
]) {
  const { fr, pv } = await apply(w, h)
  const spec = layer(fr, 'Type Specimens')
  const kids = spec.children
  check(
    `${label} ${w}x${h}: every specimen is inside the frame`,
    kids.every((n) => n.y >= -1 && n.y + n.lineHeight.value <= h + 1),
    kids
      .map(
        (n) => n.name + ':' + Math.round(n.y) + '-' + Math.round(n.y + n.lineHeight.value),
      )
      .join(' '),
  )
  check(
    `  at least one specimen is shown`,
    kids.length >= 1,
    kids.length + ' of ' + SPECIMEN_NAMES.length + ' (' + pv.rows + ' rows available)',
  )
  check(
    `  they are dropped from the largest end`,
    kids.map((n) => n.name).join(',') === SPECIMEN_NAMES.slice(0, kids.length).join(','),
    kids.map((n) => n.name).join(','),
  )
  check(
    `  baselines still land on cell lines`,
    kids.every((n) => {
      const emBox = 1.21 * n.fontSize
      const base = n.y + (n.lineHeight.value - emBox) / 2 + emBox * 0.8
      const steps = (base - pv.rowOffset) / pv.cellH
      return Math.abs(steps - Math.round(steps)) < 1e-6
    }),
  )
}

console.log('\n=== specimens sized from the frame height, snapped to the grid ===')
for (const [w, h] of [
  [1920, 1080],
  [1920, 2160],
  [1200, 600],
  [1920, 4000],
]) {
  const { fr, pv } = await apply(w, h)
  const kids = layer(fr, 'Type Specimens').children
  const ratios = SPECIMEN_RATIOS
  kids.forEach((n) => {
    const want = Math.max(1, Math.round((h * ratios[n.name]) / pv.cellH))
    check(
      `${w}x${h} ${n.name}: ${want} cells (${(want * pv.cellH).toFixed(0)}px ≈ ${(h * ratios[n.name]).toFixed(0)}px asked)`,
      Math.abs(n.lineHeight.value - want * pv.cellH) < 1e-9,
      n.lineHeight.value.toFixed(2),
    )
    check(
      `  snapped to a whole number of cells`,
      Math.abs(n.lineHeight.value / pv.cellH - Math.round(n.lineHeight.value / pv.cellH)) <
        1e-9,
    )
    // Within half a cell, except where the ask is under half a cell and the
    // one-cell floor takes over — a specimen cannot be shorter than a row.
    const asked = h * ratios[n.name]
    check(
      `  within half a cell of the requested proportion (or clamped to one)`,
      Math.abs(n.lineHeight.value - asked) <= pv.cellH / 2 + 1e-6 ||
        (asked < pv.cellH && Math.abs(n.lineHeight.value - pv.cellH) < 1e-9),
      'off by ' +
        Math.abs(n.lineHeight.value - asked).toFixed(2) +
        'px, cellH=' +
        pv.cellH.toFixed(2) +
        ', asked ' +
        asked.toFixed(2),
    )
  })
  check(
    `${w}x${h}: all baselines still on cell lines`,
    kids.every((n) => {
      const emBox = 1.21 * n.fontSize
      const base = n.y + (n.lineHeight.value - emBox) / 2 + emBox * 0.8
      const steps = (base - pv.rowOffset) / pv.cellH
      return Math.abs(steps - Math.round(steps)) < 1e-6
    }),
  )
  check(
    `${w}x${h}: all inside the frame`,
    kids.every((n) => n.y >= -1 && n.y + n.lineHeight.value <= h + 1),
  )
}

console.log('\n=== custom specimen sizes ===')
{
  const { fr, pv } = await apply(1920, 1080, {
    monoSizes: '3',
    sansSizes: '8, 16',
  })
  const kids = layer(fr, 'Type Specimens').children
  check(
    'one specimen per asked size, named by it',
    kids.map((n) => n.name).join(',') === 'Mono 3%,Sans 8%,Sans 16%',
    kids.map((n) => n.name).join(','),
  )
  for (const [name, pct] of [
    ['Mono 3%', 3],
    ['Sans 8%', 8],
    ['Sans 16%', 16],
  ]) {
    const n = kids.find((k) => k.name === name)
    const want = Math.max(1, Math.round((1080 * pct) / 100 / pv.cellH)) * pv.cellH
    check(
      `${name} line height ≈ ${pct}% of the frame, snapped to cells`,
      !!n && Math.abs(n.lineHeight.value - want) < 1e-9,
      n && n.lineHeight.value.toFixed(2) + ' vs ' + want.toFixed(2),
    )
  }
  check(
    'custom baselines still land on cell lines',
    kids.every((n) => {
      const emBox = 1.21 * n.fontSize
      const base = n.y + (n.lineHeight.value - emBox) / 2 + emBox * 0.8
      const steps = (base - pv.rowOffset) / pv.cellH
      return Math.abs(steps - Math.round(steps)) < 1e-6
    }),
  )

  // The list is free text: order, duplicates, junk and a stray % are all fine.
  const messy = await apply(1920, 1080, {
    sansSizes: '24, 6, x, 6, 12%',
  })
  check(
    'sizes are sorted, deduped, junk dropped',
    layer(messy.fr, 'Type Specimens')
      .children.map((n) => n.name)
      .join(',') === SPECIMEN_NAMES.join(','),
    layer(messy.fr, 'Type Specimens')
      .children.map((n) => n.name)
      .join(','),
  )

  // An empty or unusable field falls back to the built-in scale wholesale.
  const blank = await apply(1920, 1080, { monoSizes: '', sansSizes: 'nope' })
  check(
    'empty/unusable lists fall back to the defaults',
    layer(blank.fr, 'Type Specimens')
      .children.map((n) => n.name)
      .join(',') === SPECIMEN_NAMES.join(','),
    layer(blank.fr, 'Type Specimens')
      .children.map((n) => n.name)
      .join(','),
  )

  // Changing the list reconciles the layers: old sizes are removed, not left
  // stacked beside the new ones.
  page.selection = [fr]
  await uiHandler({
    type: 'params-changed',
    params: { ...P, monoSizes: '3', sansSizes: '10' },
    reapply: true,
  })
  check(
    'reapplying a new list replaces the old sizes',
    layer(fr, 'Type Specimens')
      .children.map((n) => n.name)
      .join(',') === 'Mono 3%,Sans 10%',
    layer(fr, 'Type Specimens')
      .children.map((n) => n.name)
      .join(','),
  )
}

console.log('--- type scales with the frame, not the cell grid ---')
{
  // Doubling the frame height should roughly double the display size...
  const a = await apply(1920, 1080)
  const b = await apply(1920, 2160)
  const big = (r) => {
    const n = layer(r.fr, 'Type Specimens').children.find((x) => x.name === 'Sans 12%')
    return n && n.fontSize
  }
  check(
    'doubling the frame height roughly doubles the 12% specimen',
    big(b) / big(a) > 1.7 && big(b) / big(a) < 2.3,
    big(a).toFixed(1) + ' -> ' + big(b).toFixed(1),
  )

  // ...while changing the cell grid should barely move it.
  const fine = await apply(1920, 1080, { cellColumns: 197 })
  const coarse = await apply(1920, 1080, { cellColumns: 64 })
  const f = big(fine),
    c = big(coarse)
  check(
    'tripling the cell size barely moves the specimen size',
    Math.abs(f - c) / Math.max(f, c) < 0.3,
    'cell ' +
      fine.pv.cellH.toFixed(0) +
      '->' +
      coarse.pv.cellH.toFixed(0) +
      ' gives type ' +
      f.toFixed(1) +
      '->' +
      c.toFixed(1),
  )
}
console.log(
  '\n' + (fails ? fails + ' FAILURE(S)' : 'ALL PASS') + ' — ' + checks + ' checks',
)
process.exitCode = fails ? 1 : 0
