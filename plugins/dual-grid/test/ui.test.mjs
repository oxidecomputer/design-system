// Panel tests for the dual-grid plugin's built panel, dist/ui.html.
//
// Loads the panel (FigUI3 inlined) in jsdom with scripts enabled, stubs the
// browser APIs Figma would provide, and captures parent.postMessage to assert
// on what the panel sends. Controls are driven through FigUI3's own inner
// elements — the range input inside a slider, the select inside a dropdown —
// so the tests cover the path a click or a drag takes.
//
// Synthetic events bypass hit-testing, so these can't tell whether a control
// is clickable on screen. Check that in Chrome.
//
//   npm run test:ui        (npm test builds first)

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { JSDOM } from 'jsdom'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const html = fs.readFileSync(path.join(HERE, '..', 'dist', 'ui.html'), 'utf8')

const errors = []
const sent = []

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true, // provides requestAnimationFrame
  beforeParse(window) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.parent = {
      postMessage: (m) => sent.push(m.pluginMessage),
    }
    window.addEventListener('error', (e) => errors.push('window error: ' + e.message))
    // jsdom has no layout engine; fake a height so reportHeight() posts.
    window.Element.prototype.getBoundingClientRect = function () {
      return { height: this.id === 'plugin-root' ? 412 : 20, width: 280, top: 0, left: 0 }
    }
  },
})
const w = dom.window
const doc = w.document
const $ = (id) => doc.getElementById(id)

let checks = 0
let failures = 0
function check(name, cond, extra) {
  checks++
  if (!cond) failures++
  console.log(
    (cond ? 'PASS  ' : 'FAIL  ') + name + (extra !== undefined ? '  [' + extra + ']' : ''),
  )
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
// Longer than the panel's REAPPLY_DEBOUNCE_MS, so a pending reapply has fired.
const DEBOUNCE_WAIT = 260

// Delivers a message to the panel exactly as the plugin would.
const send = (m) =>
  w.dispatchEvent(new w.MessageEvent('message', { data: { pluginMessage: m } }))

const changes = () => sent.filter((x) => x.type === 'params-changed')
const reapplies = () => changes().filter((x) => x.reapply === true)
const lastParams = () => {
  const all = changes()
  return all.length ? all[all.length - 1].params : null
}
const visible = (id) => !$(id).closest('[hidden]')
const labelText = (id) =>
  $(id).closest('fig-field').querySelector(':scope > label').textContent

// ----- driving FigUI3 controls through their own inner elements ------------
const fire = (el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }))

// Drags a slider to a value, then releases it.
async function slide(id, value) {
  const range = $(id).querySelector('input[type=range]')
  range.value = String(value)
  fire(range, 'input')
  fire(range, 'change')
  await sleep(5)
}
// Types a value into a number or text field, then commits it.
async function type(id, value) {
  const input = $(id).querySelector('input')
  input.focus()
  input.value = String(value)
  fire(input, 'input')
  fire(input, 'change')
  input.blur()
  await sleep(5)
}
// Picks an option in a dropdown.
async function pick(id, value) {
  const select = $(id).querySelector('select')
  select.value = String(value)
  fire(select, 'input')
  fire(select, 'change')
  await sleep(5)
}
// Clicks a switch.
async function flip(id) {
  $(id).querySelector('input[type=checkbox]').click()
  await sleep(5)
}
// Clicks a segment of a segmented control.
async function segment(id, value) {
  $(id)
    .querySelector('fig-segment[value="' + value + '"]')
    .click()
  await sleep(5)
}

// A preview the plugin could send: a 1920×1080 frame in Solve.
const pvSolve = {
  source: 'selection',
  frameW: 1920,
  frameH: 1080,
  columns: 12,
  cols: 229,
  rows: 60,
  u: 8,
  cellH: 16,
  deltaPct: -0.7,
  warn: false,
  gutterPx: 24,
  marginPx: 64,
  effectiveMargin: 60,
  columnWidth: 120,
  mode: 'Solve',
  solvedM: 8,
  solvedK: 15,
  solvedG: 3,
  targetMarginPx: 64,
  targetGutterPx: 24,
  targetColumns: 229,
  displayScale: 1,
  specimens: [],
}
const preview = (extra, msg) =>
  send(
    Object.assign(
      { type: 'action-state', action: 'remove', actionLabel: 'Remove grids', live: true },
      msg,
      { preview: Object.assign({}, pvSolve, extra) },
    ),
  )

setTimeout(async () => {
  try {
    console.log('=== construction ===')
    check('no script errors', errors.length === 0, errors.join('; '))
    check(
      'localStorage shim works',
      (w.localStorage.setItem('a', '1'), w.localStorage.getItem('a') === '1'),
    )
    const groups = (sel) =>
      [...doc.querySelectorAll(sel)].map((g) => g.getAttribute('name')).join('|')
    check(
      'top-level groups are Grid, Advanced, Type and Frame',
      groups('fig-content > fig-group') === 'Grid|Advanced|Type|Frame',
      groups('fig-content > fig-group'),
    )
    check(
      'sub-sections are nested groups: Result, Cells, Lines, Mono, Sans, Viewing',
      groups('fig-group fig-group') === 'Result|Cells|Lines|Mono|Sans|Viewing',
      groups('fig-group fig-group'),
    )
    check(
      'Advanced and Type are collapsible and start closed; Grid and Frame are not',
      ['Advanced', 'Type'].every((n) => {
        const g = doc.querySelector('fig-group[name="' + n + '"]')
        return g.hasAttribute('collapsible') && g.open === false
      }) &&
        ['Grid', 'Frame'].every(
          (n) =>
            !doc.querySelector('fig-content > fig-group[name="' + n + '"][collapsible]'),
        ),
    )
    const nestedIds = [
      'marginRightCells',
      'snapTolerancePx',
      'aspectTolPct',
      'edgeCullPct',
      'snapFontPx',
      'textStyles',
      'shownWidthPx',
      'printWidthMm',
      'viewingDistanceCm',
    ]
    check(
      'fields that depend on the one above are nested under it, and only those',
      nestedIds.every((id) => $(id).closest('fig-field').hasAttribute('nested')) &&
        doc.querySelectorAll('fig-field[nested]').length === nestedIds.length,
      doc.querySelectorAll('fig-field[nested]').length,
    )
    check(
      'every field has a label',
      [...doc.querySelectorAll('fig-field')].every((f) =>
        f.querySelector(':scope > label'),
      ),
    )
    check(
      'the controls are the FigUI3 ones',
      $('mode').localName === 'fig-segmented-control' &&
        $('columnCount').localName === 'fig-dropdown' &&
        $('cellColumns').localName === 'fig-dropdown' &&
        $('marginCells').localName === 'fig-slider' &&
        $('targetMarginPx').localName === 'fig-input-number' &&
        $('snapRows').localName === 'fig-switch' &&
        $('action-primary').localName === 'fig-button',
    )

    console.log('\n=== Mode: Manual vs Solve ===')
    check('Manual is the default', $('mode').value === 'Manual', $('mode').value)
    const manualOnly = ['marginCells', 'gutterMultiple', 'cellColumns']
    const solveOnly = ['targetMarginPx', 'targetGutterPx', 'targetColumns']
    check(
      'Manual shows the cell-count controls and hides the pixel targets',
      manualOnly.every(visible) && !solveOnly.some(visible),
    )
    sent.length = 0
    await segment('mode', 'Solve')
    check(
      'clicking Solve swaps them',
      solveOnly.every(visible) && !manualOnly.some(visible),
    )
    check(
      '...and posts the mode',
      lastParams() && lastParams().mode === 'Solve',
      lastParams() && lastParams().mode,
    )
    check(
      '...and writes it to the frame',
      reapplies().some((m) => m.params.mode === 'Solve'),
    )
    await segment('mode', 'Manual')

    console.log('\n=== controls post numbers ===')
    sent.length = 0
    await slide('marginCells', 5)
    check('a slider posts its value as a number', lastParams().marginCells === 5)
    check('...and releasing it writes to the frame', reapplies().length >= 1)
    await pick('columnCount', '6')
    check('the column dropdown posts a number', lastParams().columnCount === 6)
    await segment('mode', 'Solve')
    await type('targetMarginPx', '80')
    check(
      'a number field posts a number',
      lastParams().targetMarginPx === 80,
      JSON.stringify(lastParams().targetMarginPx),
    )
    await segment('mode', 'Manual')
    await slide('marginCells', 3)
    await pick('columnCount', '12')

    console.log('\n=== asymmetric margin ===')
    check('the right margin is hidden by default', !visible('marginRightCells'))
    await slide('marginCells', 4)
    sent.length = 0
    await flip('asymmetricMargin')
    check('turning it on shows the right margin', visible('marginRightCells'))
    check(
      '...starting where the left one is, so the grid does not move',
      lastParams().marginRightCells === 4 && lastParams().asymmetricMargin === true,
      JSON.stringify([lastParams().marginRightCells, lastParams().asymmetricMargin]),
    )
    check(
      '...and the first margin reads as the left side',
      labelText('marginCells') === 'Left margin',
    )
    await segment('mode', 'Solve')
    check('Solve hides the right margin', !visible('marginRightCells'))
    await segment('mode', 'Manual')
    await flip('asymmetricMargin')
    check(
      'turning it off hides it and restores the label',
      !visible('marginRightCells') && labelText('marginCells') === 'Margin cells',
    )
    await slide('marginCells', 3)

    console.log('\n=== dependent fields appear with their switch ===')
    check('the tolerances are hidden while Pixel snap is off', !visible('snapTolerancePx'))
    await flip('pixelPerfect')
    check(
      'turning Pixel snap on shows both tolerances',
      visible('snapTolerancePx') && visible('aspectTolPct'),
    )
    await flip('pixelPerfect')
    check('Cull tol. shows while Edge cull is on', visible('edgeCullPct'))
    await flip('edgeCull')
    check('...and hides when it is off', !visible('edgeCullPct'))
    await flip('edgeCull')
    const shown = () =>
      ['shownWidthPx', 'printWidthMm', 'viewingDistanceCm'].filter(visible).join(',')
    check('Screen asks for no viewing details', shown() === '', shown())
    await pick('displayMode', 'Custom')
    check('Custom asks for the shown width', shown() === 'shownWidthPx', shown())
    await pick('displayMode', 'Print')
    check(
      'Print asks for the width and distance',
      shown() === 'printWidthMm,viewingDistanceCm',
      shown(),
    )
    await pick('displayMode', 'Screen')

    console.log('\n=== writes are debounced ===')
    {
      sent.length = 0
      const range = $('gutterMultiple').querySelector('input[type=range]')
      for (const v of [2, 3, 4, 5]) {
        range.value = String(v)
        fire(range, 'input')
      }
      check(
        'each step of a drag previews',
        changes().filter((m) => !m.reapply).length === 4,
        changes().filter((m) => !m.reapply).length,
      )
      check('...without writing to the frame yet', reapplies().length === 0)
      await sleep(DEBOUNCE_WAIT)
      check(
        'one write follows once the drag pauses',
        reapplies().length === 1 && reapplies()[0].params.gutterMultiple === 5,
        reapplies().length,
      )
      sent.length = 0
      range.value = '1'
      fire(range, 'input')
      fire(range, 'change')
      check(
        'releasing writes straight away',
        reapplies().length === 1 && reapplies()[0].params.gutterMultiple === 1,
      )
      await sleep(DEBOUNCE_WAIT)
      check(
        '...and nothing more after the pause',
        reapplies().length === 1,
        reapplies().length,
      )
    }

    console.log('\n=== the cell column choices follow the plugin ===')
    {
      const options = () =>
        [...$('cellColumns').querySelectorAll(':scope > option')]
          .map((o) => o.value)
          .join(',')
      preview({ mode: 'Manual', cellLadder: [64, 77, 89, 101], cellColumns: 89 })
      check(
        'the dropdown lists the reachable counts',
        options() === '64,77,89,101',
        options(),
      )
      check(
        '...and shows the count in use',
        $('cellColumns').value === '89' &&
          $('cellColumns').querySelector('select').value === '89',
        $('cellColumns').value,
      )
      check(
        "...keeping the dropdown's own select",
        $('cellColumns').querySelectorAll(':scope > select').length === 1,
      )
      sent.length = 0
      await pick('cellColumns', '101')
      check('picking one posts it', lastParams().cellColumns === 101)
      // The plugin may only reach 97 now; the request stays 101 so a change and
      // its reverse return to the same grid.
      preview({ mode: 'Manual', cellLadder: [73, 85, 97], cellColumns: 97 })
      check(
        'a new ladder re-selects the nearest count',
        options() === '73,85,97' && $('cellColumns').value === '97',
        options() + ' / ' + $('cellColumns').value,
      )
      sent.length = 0
      await slide('marginCells', 4)
      check(
        '...while the panel keeps asking for the count requested',
        lastParams().cellColumns === 101,
        lastParams().cellColumns,
      )
      preview({ mode: 'Manual', cellLadder: [], cellColumns: 120 })
      check(
        'with nothing reachable it offers the count used',
        options() === '120',
        options(),
      )
      await slide('marginCells', 3)
    }

    console.log('\n=== result readouts ===')
    {
      const text = (id) => $(id).textContent.replace(/\s+/g, ' ').trim()
      preview({ mode: 'Manual' })
      check(
        'grid size lists columns and cells',
        text('preview-size') === '12 col · 229 × 60 cells',
        text('preview-size'),
      )
      check(
        'cell size and aspect error',
        text('preview-cell') === '8 × 16px (-0.7%)',
        text('preview-cell'),
      )
      check(
        'column, gutter and margin as drawn',
        text('preview-column') === '120px col · 24px gut · 60px marg',
        text('preview-column'),
      )
      check(
        'the cell multiples',
        text('preview-solved') === 'm8 k15 g3 aspect Δ 0.7%',
        text('preview-solved'),
      )
      preview({ mode: 'Manual', hRemainder: 12 })
      check(
        'a pixel-snap bleed is shown, and flagged past a cell',
        /12px bleed/.test(text('preview-cell')) &&
          $('preview-cell').querySelectorAll('.warn').length === 1,
        text('preview-cell'),
      )
      preview({ mode: 'Manual', effectiveMarginRight: 72 })
      check(
        'unequal margins show both',
        /60\/72px marg/.test(text('preview-column')),
        text('preview-column'),
      )
      preview({ mode: 'Manual', columns: 1 })
      check(
        'one column has no gutter',
        !/gut/.test(text('preview-column')),
        text('preview-column'),
      )

      const warned = (id) =>
        [...$(id).querySelectorAll('.warn')].map((e) => e.textContent).join('|')
      preview({ mode: 'Solve', effectiveMargin: 40, targetMarginPx: 64 })
      check(
        'in Solve, a margin more than a cell off its target is flagged',
        /marg/.test(warned('preview-column')),
        warned('preview-column'),
      )
      preview({ mode: 'Solve', gutterPx: 16, targetGutterPx: 24 })
      check(
        '...a gutter more than half a cell off',
        /gut/.test(warned('preview-column')),
        warned('preview-column'),
      )
      preview({ mode: 'Solve', cols: 200, targetColumns: 229 })
      check(
        '...and a cell count more than 2% off',
        /200/.test(warned('preview-size')),
        warned('preview-size'),
      )
      preview({ mode: 'Solve' })
      check(
        'on target, nothing is flagged',
        warned('preview-column') === '' && warned('preview-size') === '',
      )
      preview({ mode: 'Manual', effectiveMargin: 40, targetMarginPx: 64 })
      check('Manual has no targets to miss', warned('preview-column') === '')
    }

    console.log("\n=== restoring a frame's settings ===")
    {
      sent.length = 0
      send({
        type: 'params-change',
        params: {
          mode: 'Solve',
          columnCount: 6,
          marginCells: 4,
          gutterMultiple: 3,
          targetMarginPx: 80,
          targetGutterPx: 16,
          targetColumns: 240,
          cellAspect: 2.5,
          pixelPerfect: true,
          snapTolerancePx: 0.25,
          aspectTolPct: 8,
          edgeCull: false,
          edgeCullPct: 35,
          cellDensity: 2,
          showLines: false,
          showSpecimens: false,
          monoSizes: '3',
          sansSizes: '5, 10, 20',
          monoFamily: 'Roboto Mono',
          displayMode: 'Custom',
          shownWidthPx: 720,
        },
      })
      check(
        'controls take the stored values',
        $('mode').value === 'Solve' &&
          $('columnCount').value === '6' &&
          $('marginCells').value === '4' &&
          $('gutterMultiple').value === '3' &&
          $('cellAspect').value === '2.5' &&
          $('cellDensity').value === '2x' &&
          $('pixelPerfect').checked &&
          !$('edgeCull').checked &&
          !$('showLines').checked &&
          $('monoFamily').value === 'Roboto Mono' &&
          $('displayMode').value === 'Custom',
        [
          $('mode').value,
          $('columnCount').value,
          $('marginCells').value,
          $('cellDensity').value,
        ].join(','),
      )
      check(
        'number fields show them too',
        Number($('targetMarginPx').value) === 80 &&
          Number($('snapTolerancePx').value) === 0.25 &&
          Number($('shownWidthPx').value) === 720,
        [
          $('targetMarginPx').value,
          $('snapTolerancePx').value,
          $('shownWidthPx').value,
        ].join(','),
      )
      check('restoring posts nothing', changes().length === 0, changes().length)
      check(
        'visibility follows the restored values',
        solveOnly.every(visible) &&
          visible('snapTolerancePx') &&
          !visible('edgeCullPct') &&
          !$('shownWidthField').hidden &&
          $('typeBody').hidden,
      )
      await slide('cellAspect', 2.5)
      const p = lastParams()
      check(
        'and the panel sends them back unchanged',
        p.mode === 'Solve' &&
          p.columnCount === 6 &&
          p.targetMarginPx === 80 &&
          p.targetColumns === 240 &&
          p.cellDensity === 2 &&
          p.monoSizes === '3' &&
          p.sansSizes === '5, 10, 20' &&
          p.shownWidthPx === 720,
        JSON.stringify(p),
      )

      send({ type: 'params-change', params: {} })
      sent.length = 0
      await slide('cellAspect', 2)
      const d = lastParams()
      check(
        'missing settings fall back to the defaults',
        d.mode === 'Manual' &&
          d.columnCount === 12 &&
          d.marginCells === 3 &&
          d.gutterMultiple === 1 &&
          d.targetMarginPx === 50 &&
          d.targetGutterPx === 20 &&
          d.targetColumns === 89 &&
          d.snapTolerancePx === 0.5 &&
          d.aspectTolPct === 5 &&
          d.edgeCull === true &&
          d.edgeCullPct === 20 &&
          d.cellDensity === 1 &&
          d.monoSizes === '2' &&
          d.sansSizes === '6, 12, 24' &&
          d.monoFamily === 'GT America Mono' &&
          d.sansFamily === "Suisse Int'l" &&
          d.displayMode === 'Screen',
        JSON.stringify(d),
      )
    }

    console.log('\n=== text styles ===')
    check('Text styles starts off', $('textStyles').checked === false)
    sent.length = 0
    await flip('textStyles')
    check(
      'turning it on writes it to the frame',
      reapplies().some((m) => m.params.textStyles === true),
    )
    send({ type: 'params-change', params: { textStyles: true } })
    check("a frame's saved setting is restored", $('textStyles').checked === true)
    send({ type: 'params-change', params: {} })
    check('...and an absent one is off', $('textStyles').checked === false)

    console.log('\n=== font families ===')
    sent.length = 0
    await type('monoFamily', 'IBM Plex Mono')
    check(
      'editing a family posts it and writes it',
      reapplies().some((m) => m.params.monoFamily === 'IBM Plex Mono'),
    )
    await type('monoFamily', 'GT America Mono')

    console.log('\n=== the Frame group ===')
    {
      const own = () => changes().pop().params
      preview({ source: 'new frame', mode: 'Manual' }, { action: 'create', live: false })
      check('Height is hidden for a preset aspect', !visible('frameHeight'))
      sent.length = 0
      await pick('frameAspect', 'Custom')
      check('Custom shows the height', visible('frameHeight'))
      check(
        '...starting from the height the preset gave',
        own().frameAspect === 'Custom' && own().frameHeight === 1080,
        JSON.stringify([own().frameAspect, own().frameHeight]),
      )
      check('frame edits never write to a frame', reapplies().length === 0)
      await type('frameWidth', '2000')
      check('the width posts as a number', own().frameWidth === 2000, own().frameWidth)

      preview({ source: 'selection', frameW: 1080, frameH: 1350 })
      check(
        'selecting a frame shows its size, read only',
        $('frameWidth').getAttribute('value') === '1080' &&
          $('frameHeight').getAttribute('value') === '1350' &&
          $('frameWidth').hasAttribute('disabled') &&
          $('frameAspect').hasAttribute('disabled') &&
          visible('frameHeight'),
        [
          $('frameWidth').getAttribute('value'),
          $('frameHeight').getAttribute('value'),
        ].join('×'),
      )
      sent.length = 0
      await slide('cellAspect', 2.1)
      check(
        "...without replacing the user's own size",
        own().frameWidth === 2000 && own().frameAspect === 'Custom',
        JSON.stringify([own().frameWidth, own().frameAspect]),
      )
      preview({ source: 'new frame', mode: 'Manual' }, { action: 'create', live: false })
      check(
        'deselecting restores what the user set, editable again',
        $('frameWidth').getAttribute('value') === '2000' &&
          !$('frameWidth').hasAttribute('disabled') &&
          $('frameAspect').value === 'Custom',
      )
      await pick('frameAspect', '16:9')
      await type('frameWidth', '1920')
      await slide('cellAspect', 2)
    }

    console.log('\n=== collapsible groups ===')
    {
      const adv = doc.querySelector('fig-group[name="Advanced"]')
      const header = adv.querySelector(':scope > fig-header h3')
      check(
        'the header is a keyboard-reachable button',
        !!header && header.getAttribute('role') === 'button',
      )
      sent.length = 0
      header.click()
      check('clicking it opens the group', adv.open === true)
      await sleep(30)
      check(
        '...and re-reports the height, since the panel is measured',
        sent.some((m) => m.type === 'resize'),
      )
      check('...without touching the document', reapplies().length === 0)
      header.click()
      check('clicking again closes it', adv.open === false)
    }

    console.log('\n=== Copy config ===')
    {
      let copied = null
      doc.execCommand = (cmd) => {
        if (cmd !== 'copy') return false
        copied = doc.querySelector('textarea.clipboard-stage').value
        return true
      }
      // 1920×1080, 96 cells across, 25 rows. The expected numbers are
      // re-derived from Mitos's own formulas (CHAR_WIDTH 7.45, FONT_SIZE 12).
      preview({ frameW: 1920, frameH: 1080, cols: 96, rows: 25 })
      $('copy-mitos').click()
      check('clicking copies the config', copied !== null)
      check(
        'the staging textarea is removed',
        !doc.querySelector('textarea.clipboard-stage'),
      )
      check('the button confirms', $('copy-mitos').textContent === 'Copied')
      const cfg = JSON.parse(copied)
      const lh = (1080 * 96 * 7.45) / (1920 * 25 * 12)
      check(
        'the payload describes the previewed grid',
        cfg.mitos === 'grid-config' &&
          cfg.output.columns === 96 &&
          cfg.output.rows === 25 &&
          Math.abs(cfg.export.lineHeight - lh) < 1e-4 &&
          cfg.export.padding === 0 &&
          cfg.export.width === 1920 &&
          cfg.export.height === 1080,
        copied.slice(0, 80),
      )
      check(
        "its aspect is the frame's",
        Math.abs(cfg.output.aspectRatio - 1920 / 1080) < 1e-3,
        cfg.output.aspectRatio,
      )
      doc.execCommand = () => false
      $('copy-mitos').click()
      check('a refused copy says so', $('copy-mitos').textContent === 'Copy failed')
      await sleep(1700)
      check('the label resets', $('copy-mitos').textContent === 'Copy config')
      delete doc.execCommand
    }

    console.log('\n=== type scales ===')
    {
      send({ type: 'params-change', params: {} })
      check(
        'defaults: mono one step at 2%, sans 6–24% in 3 steps',
        $('monoSizeMin').getAttribute('value') === '2' &&
          $('monoSteps').value === '1' &&
          $('sansSizeMin').getAttribute('value') === '6' &&
          $('sansSizeMax').getAttribute('value') === '24' &&
          $('sansSteps').value === '3',
      )
      check(
        'one step hides the second size, and says Size',
        $('monoSizeRange').classList.contains('single') &&
          !$('sansSizeRange').classList.contains('single') &&
          labelText('monoSizeRange') === 'Size' &&
          labelText('sansSizeRange') === 'Sizes',
      )
      check(
        'each end names itself for assistive tech',
        $('sansSizeMax').getAttribute('aria-label') ===
          'Sans largest size, % of frame height',
      )
      sent.length = 0
      await slide('sansSteps', 5)
      check(
        'more steps fill in equal ratios between the ends',
        lastParams().sansSizes === '6, 8.5, 12, 17, 24',
        lastParams().sansSizes,
      )
      await type('sansSizeMax', '48')
      await slide('sansSteps', 4)
      check(
        'changing an end rescales the steps between',
        lastParams().sansSizes === '6, 12, 24, 48',
        lastParams().sansSizes,
      )
      await type('sansSizeMax', '24')
      await slide('sansSteps', 3)

      check(
        'leading and tracking have no settings: both follow the design system',
        !doc.querySelector('[id*="Leading"], [id*="Tracking"], fig-easing-curve'),
      )

      // A stored list that isn't an equal-ratio scale is passed back untouched
      // until the scale is edited.
      send({
        type: 'params-change',
        params: { sansSizes: '5, 7, 20' },
      })
      check(
        'a stored list sets the ends and step count',
        $('sansSizeMin').getAttribute('value') === '5' &&
          $('sansSizeMax').getAttribute('value') === '20' &&
          $('sansSteps').value === '3',
      )
      sent.length = 0
      await slide('cellAspect', 2.2)
      check(
        '...and is sent back unchanged',
        lastParams().sansSizes === '5, 7, 20',
        lastParams().sansSizes,
      )
      await slide('sansSteps', 3)
      check(
        '...until a scale control is edited',
        lastParams().sansSizes === '5, 10, 20',
        lastParams().sansSizes,
      )
      await slide('cellAspect', 2)

      const row = (face, pct, size, cells, leading, tracking) => ({
        face,
        pct,
        size,
        cells,
        leading,
        tracking,
      })
      preview({
        specimens: [
          row('mono', 2, 13.5, 0.5, 1.6, 4),
          row('sans', 6, 53.1, 3, 1.22, -2.25),
          row('sans', 7, 61.2, 3, 1.06, -2.5),
          row('sans', 24, 259.2, 12, 1, -3.63),
        ],
      })
      const cells = (face) =>
        [...$(face + 'Specs').children]
          .filter((e) => !e.classList.contains('head'))
          .map((e) => e.textContent)
      check(
        'the table shows each step as set',
        cells('sans').slice(0, 5).join('|') === '6%|53.1px|3|1.22|-2.2%' &&
          cells('mono').join('|') === '2%|13.5px|0.5|1.60|4%',
        cells('sans').slice(0, 5).join('|') + ' / ' + cells('mono').join('|'),
      )
      const clash = $('sansSpecs').querySelectorAll('.warn')
      check(
        'a step on the same line height as the one before is flagged',
        clash.length === 1 && clash[0].textContent === '3',
        clash.length,
      )

      await flip('showSpecimens')
      check('turning specimens off hides the type settings', $('typeBody').hidden)
      await flip('showSpecimens')
      check('...and on shows them again', !$('typeBody').hidden)
      send({ type: 'params-change', params: {} })
    }

    console.log('\n=== display scale readout ===')
    {
      const read = () => $('preview-display').textContent.replace(/\s+/g, ' ').trim()
      const sans = (pct, size) => ({
        face: 'sans',
        pct,
        size,
        cells: 1,
        leading: 1,
        tracking: 0,
      })
      preview({ specimens: [sans(6, 64.8), sans(12, 129.6)], displayScale: 0.5 })
      check(
        'it lists the sans sizes as seen, and the scale',
        read() === '32 · 65 px · ×0.5',
        read(),
      )
      preview({ specimens: [], displayScale: 0.5 })
      check('with no sans sizes it reads as a dash', read() === '—', read())
    }

    console.log('\n=== the action button ===')
    {
      const actions = () => sent.filter((m) => m.type === 'action')
      preview(
        { source: 'new frame', mode: 'Manual' },
        { action: 'create', actionLabel: 'Create frame', live: false },
      )
      await sleep(450)
      check(
        'it is labelled by the plugin',
        $('action-primary').textContent === 'Create frame',
      )
      check('...and primary', $('action-primary').getAttribute('variant') === 'primary')
      sent.length = 0
      $('action-status').click()
      check('clicking the status does nothing', actions().length === 0)
      $('action-primary').click()
      $('action-primary').click()
      check('a double-click posts one action', actions().length === 1, actions().length)
      check(
        '...and the button is busy, not disabled, while it runs',
        $('action-primary').getAttribute('aria-busy') === 'true' &&
          !$('action-primary').hasAttribute('disabled'),
      )
      preview(
        {},
        {
          action: 'remove',
          actionLabel: 'Remove grids',
          actionDanger: true,
          status: 'Live editing',
        },
      )
      check(
        '...and not busy once the plugin replies',
        !$('action-primary').hasAttribute('aria-busy'),
      )
      check(
        'Remove grids drops the primary emphasis',
        $('action-primary').getAttribute('variant') === 'secondary',
      )
      check('the status shows beside it', $('action-status').textContent === 'Live editing')
      sent.length = 0
      $('action-primary').click()
      check('a click just after the button relabels is ignored', actions().length === 0)
      await sleep(450)
      $('action-primary').click()
      check(
        '...but a deliberate click after that runs',
        actions().length === 1 && actions()[0].action === 'remove',
      )
      preview({}, { action: 'remove', actionLabel: 'Remove grids', actionDanger: true })
    }

    console.log('\n=== grid controls show only while live editing ===')
    {
      // jsdom's cascade gets this wrong once FigUI3's stylesheet is loaded (it
      // reports Type as shown), so the panel's own hiding rule is matched
      // directly. Chrome shows only Frame, as intended.
      const rule = [...doc.querySelectorAll('style')]
        .flatMap((st) => [...st.sheet.cssRules])
        .find((r) => r.selectorText && r.selectorText.includes(':not([data-live])'))
      const hidden = (el) => !!rule && el.matches(rule.selectorText)
      const group = (n) => doc.querySelector('fig-content > fig-group[name="' + n + '"]')
      preview({ source: 'new frame' }, { action: 'create', live: false })
      check(
        'with no gridded frame only Frame and Create show',
        ['Grid', 'Advanced', 'Type'].every((n) => hidden(group(n))) &&
          !hidden(group('Frame')) &&
          hidden($('copy-mitos')) &&
          !hidden($('action-primary')),
        ['Grid', 'Advanced', 'Type', 'Frame'].map((n) => hidden(group(n))).join(','),
      )
      preview({}, { live: true })
      check(
        'live editing shows them all',
        ['Grid', 'Advanced', 'Type', 'Frame'].every((n) => !hidden(group(n))) &&
          !hidden($('copy-mitos')),
      )
    }

    console.log('\n=== final error check ===')
    check('no script errors', errors.length === 0, errors.join('; '))
  } catch (e) {
    failures++
    console.log('CRASHED mid-run: ' + (e && e.stack ? e.stack : e))
  }
  console.log(
    '\n' + (failures ? failures + ' FAILURE(S)' : 'ALL PASS') + ' — ' + checks + ' checks',
  )
  process.exit(failures ? 1 : 0)
}, 100)
