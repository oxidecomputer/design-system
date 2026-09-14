// Panel tests for ox-dual-grid's ui.html.
//
// Loads the panel in jsdom with scripts enabled, stubs the browser APIs Figma
// would provide, and captures parent.postMessage to assert on what the UI sends.
//
// Synthetic events bypass hit-testing, so jsdom can toggle controls that CSS
// makes unclickable. Switch tests also check size and pointer-events styles.
//
//   npm run test:ui

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { JSDOM } from 'jsdom'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const html = fs.readFileSync(path.join(HERE, '..', 'ui.html'), 'utf8')

const errors = []
const sent = []

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true, // provides requestAnimationFrame
  beforeParse(window) {
    window.ResizeObserver = class {
      observe() {}
      disconnect() {}
    }
    // capture postMessage traffic to the "plugin"
    window.parent = {
      postMessage: (m) => sent.push(m.pluginMessage),
    }
    window.addEventListener('error', (e) => errors.push('window error: ' + e.message))
    // jsdom has no layout engine; fake a height so reportHeight() posts.
    window.Element.prototype.getBoundingClientRect = function () {
      return {
        height: this.id === 'plugin-root' ? 412 : 20,
        width: 280,
        top: 0,
        left: 0,
        right: 280,
        bottom: 412,
      }
    }
  },
})
const w = dom.window
const doc = w.document
const $ = (id) => doc.getElementById(id)

// Delivers a message to the panel exactly as the plugin would.
const send = (m) =>
  dom.window.dispatchEvent(
    new dom.window.MessageEvent('message', { data: { pluginMessage: m } }),
  )

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
const reapplies = () =>
  sent.filter((x) => x.type === 'params-changed' && x.reapply === true)
const previews = () =>
  sent.filter((x) => x.type === 'params-changed' && x.reapply === false)
// Ends an interaction the way a pointer release or a blur does.
// Settles on a macrotask (see the capture listener in ui.html), so callers await.
const getSentParams = () => {
  sent.length = 0
  $('columnCount')
    .querySelector('input[type=range]')
    .dispatchEvent(new w.Event('input', { bubbles: true }))
  return sent.filter((x) => x.type === 'params-changed')[0].params
}
const commit = async (el) => {
  el.dispatchEvent(new w.Event('change', { bubbles: true }))
  await sleep(5)
}

setTimeout(async () => {
  try {
    console.log('=== construction ===')
    check('no script errors', errors.length === 0, errors.join('; '))
    check(
      'localStorage shim works',
      (w.localStorage.setItem('a', '1'), w.localStorage.getItem('a') === '1'),
    )

    console.log('\n=== component tree built ===')
    check(
      'fig-group headers rendered',
      [...doc.querySelectorAll('.fig-group-header')]
        .map((e) => e.textContent.trim())
        .join('|') === 'Grid|Advanced|Frame',
      [...doc.querySelectorAll('.fig-group-header')]
        .map((e) => e.textContent.trim())
        .join('|'),
    )
    check(
      '29 fig-field labels',
      doc.querySelectorAll('.fig-field-label').length === 29,
      doc.querySelectorAll('.fig-field-label').length,
    )
    check(
      '5 sliders (columns, margin, gutter cells, cell columns, aspect)',
      doc.querySelectorAll('fig-slider input[type=range]').length === 5,
      doc.querySelectorAll('fig-slider input[type=range]').length,
    )
    check(
      '5 switches',
      doc.querySelectorAll('fig-switch input[type=checkbox]').length === 5,
      doc.querySelectorAll('fig-switch input[type=checkbox]').length,
    )
    check(
      '8 number inputs: 3 solver targets + snap/aspect tol. + edge cull + frame width/height',
      doc.querySelectorAll('fig-input-number input').length === 8,
      doc.querySelectorAll('fig-input-number input').length,
    )

    console.log('--- snapping sliders are not falsely editable ---')
    // Both step through a fixed list, so typing only ever snapped to the nearest
    // legal entry — an input implied a freedom that was not there.
    for (const id of ['columnCount', 'cellColumns']) {
      check(id + ' has no editable field', !$(id).querySelector('input[type=number]'))
      const out = $(id).querySelector('.fig-slider-value')
      check(
        '  ...it shows its value as text instead',
        !!out && out.textContent === String($(id).value),
        out && out.textContent,
      )
    }
    for (const id of ['marginCells', 'gutterMultiple', 'cellAspect']) {
      check(
        id + ' keeps its editable field (every value in range is legal)',
        !!$(id).querySelector('input[type=number]') &&
          !$(id).querySelector('.fig-slider-value'),
      )
    }
    check(
      'specimens switch present + on',
      $('showSpecimens') && $('showSpecimens').checked === true,
    )

    console.log('\n=== Manual: margin and gutter are separate; no column control ===')
    check('the column multiple slider is gone', !$('columnMultiple'))
    check(
      'margin defaults to 3 cells, whole steps, up to 24',
      $('marginCells').value === 3 &&
        $('marginCells').querySelector('input[type=range]').step === '1' &&
        $('marginCells').querySelector('input[type=range]').max === '24',
      $('marginCells').value +
        ' step ' +
        $('marginCells').querySelector('input[type=range]').step,
    )
    check(
      'gutter cells slider 1..6 default 1',
      $('gutterMultiple').value === 1 &&
        $('gutterMultiple').querySelector('input[type=range]').max === '6',
      $('gutterMultiple').value,
    )
    check(
      'both labelled in cells, neither relative to the other',
      ![...doc.querySelectorAll('.fig-field-label')].some((e) =>
        /×gut/.test(e.textContent),
      ) &&
        [...doc.querySelectorAll('.fig-field-label')].some((e) =>
          /Margin cells/.test(e.textContent),
        ) &&
        [...doc.querySelectorAll('.fig-field-label')].some((e) =>
          /Gutter cells/.test(e.textContent),
        ),
      [...doc.querySelectorAll('.fig-field-label')].map((e) => e.textContent).join('|'),
    )

    console.log('--- each slider posts a distinct value (responsive) ---')
    for (const [id, v] of [
      ['marginCells', 7],
      ['gutterMultiple', 4],
    ]) {
      sent.length = 0
      const r = $(id).querySelector('input[type=range]')
      r.value = String(v)
      r.dispatchEvent(new w.Event('input', { bubbles: true }))
      check(
        id + ' -> ' + v + ' posts a preview at once',
        previews().some((m) => m.params[id] === v),
        JSON.stringify(sent.map((x) => [x.params && x.params[id], x.reapply])),
      )
      check('  ...and no document write yet', reapplies().length === 0, reapplies().length)
      await commit(r)
      check(
        '  ...which lands on commit',
        reapplies().some((m) => m.params[id] === v),
        reapplies().length,
      )
    }

    console.log('\n=== Mode: Manual vs Solve ===')
    check('density dropdown is gone', !$('density'))
    check(
      'mode dropdown has exactly Manual + Solve',
      [...$('mode').querySelectorAll('option')].map((o) => o.textContent).join(',') ===
        'Manual,Solve',
      $('mode').value,
    )
    check('defaults to Manual', $('mode').value === 'Manual')

    const visible = (id) => !$(id).closest('fig-field').hidden
    check(
      'Manual shows the margin + gutter sliders',
      visible('marginCells') && visible('gutterMultiple'),
    )
    check(
      'Manual hides the px targets (Solve-only)',
      !visible('targetMarginPx') && !visible('targetGutterPx'),
    )
    // The column count is asked for directly in both modes. (aspectTolPct,
    // the row-height band, is a different control.)
    check('Manual shows the cell columns slider', visible('cellColumns'))

    sent.length = 0
    $('mode').querySelector('select').value = 'Solve'
    $('mode')
      .querySelector('select')
      .dispatchEvent(new w.Event('change', { bubbles: true }))
    check(
      'switching to Solve posts mode=Solve and reapplies',
      sent.some((x) => x.type === 'params-changed' && x.params.mode === 'Solve'),
      JSON.stringify(
        sent.filter((x) => x.type === 'params-changed').map((x) => x.params.mode),
      ),
    )
    check(
      'Solve shows the target inputs',
      visible('targetMarginPx') && visible('targetGutterPx') && visible('targetColumns'),
    )
    check('Solve hides the cell columns slider', !visible('cellColumns'))
    check('...and offers the column count as its third target', visible('targetColumns'))
    check('no Cell max control any more', !$('maxCellPx'))
    check(
      'solver defaults: margin 50, gutter 20, columns 89',
      $('targetMarginPx').value === 50 &&
        $('targetGutterPx').value === 20 &&
        $('targetColumns').value === 89,
      [$('targetMarginPx').value, $('targetGutterPx').value, $('targetColumns').value].join(
        '/',
      ),
    )
    check(
      'Solve hides the margin + gutter sliders',
      !visible('marginCells') && !visible('gutterMultiple'),
    )
    check(
      'shared controls stay visible in both modes',
      visible('columnCount') && visible('cellAspect') && visible('cellDensity'),
    )

    console.log('--- solver inputs post numbers ---')
    ;[
      ['targetMarginPx', 96],
      ['targetGutterPx', 32],
      ['targetColumns', 240],
    ].forEach(([id, v]) => {
      sent.length = 0
      const inp = $(id).querySelector('input')
      inp.value = String(v)
      inp.dispatchEvent(new w.Event('input', { bubbles: true }))
      const m = sent.find((x) => x.type === 'params-changed')
      check(
        id + ' -> ' + v,
        m && m.params[id] === v && m.reapply === false,
        JSON.stringify(m && m.params[id]),
      )
    })
    check(
      'units shown: px, px, cols',
      $('targetMarginPx').querySelector('.fig-units').textContent === 'px' &&
        $('targetGutterPx').querySelector('.fig-units').textContent === 'px' &&
        $('targetColumns').querySelector('.fig-units').textContent === 'cols',
    )

    console.log('--- achieved values render inside the field ---')
    const pvSolve = {
      source: 'selection',
      frameW: 1920,
      frameH: 1080,
      columns: 12,
      cols: 229,
      rows: 60,
      u: 8,
      cellH: 16,
      gridW: 1832,
      gridH: 960,
      deltaPct: -0.7,
      warn: false,
      density: 1,
      gutterCells: 3,
      gutterPx: 24,
      marginPx: 64,
      effectiveMargin: 60,
      columnWidth: 120,
      columnCells: 15,
      contentWidth: 1792,
      actualAspect: 1.985,
      mode: 'Solve',
      solved: true,
      solvedM: 8,
      solvedK: 15,
      solvedG: 3,
      solveWithinTolerance: true,
      solveWithinCellBounds: true,
      solveAspectErrPct: 0.32,
      targetMarginPx: 64,
      targetGutterPx: 24,
      targetColumns: 229,
    }
    send({
      type: 'action-state',
      status: 'Live editing',
      preview: pvSolve,
    })
    const unitsOf = (id) => $(id).querySelector('.fig-units').textContent
    check(
      'margin field reads "(60) px" beside the 64 target',
      unitsOf('targetMarginPx') === '(60) px',
      unitsOf('targetMarginPx'),
    )
    // Order-independent: earlier tests edit this field, so set it explicitly.
    $('targetMarginPx').value = 64
    send({
      type: 'action-state',
      status: '',
      preview: pvSolve,
    })
    check(
      'the input still holds only the target number',
      $('targetMarginPx').querySelector('input').value === '64',
      $('targetMarginPx').querySelector('input').value,
    )
    check(
      '...and .value returns the target, not the annotation',
      $('targetMarginPx').value === 64,
      $('targetMarginPx').value,
    )
    check(
      'gutter field reads "(24) px"',
      unitsOf('targetGutterPx') === '(24) px',
      unitsOf('targetGutterPx'),
    )
    check(
      'the column target shows the achieved count',
      unitsOf('targetColumns') === '(229) cols',
      unitsOf('targetColumns'),
    )
    check(
      'fields get has-actual so the text has room',
      $('targetMarginPx').classList.contains('has-actual') &&
        $('targetColumns').classList.contains('has-actual'),
    )
    check(
      'a within-tolerance margin (60 vs 64, u=8) is not flagged',
      !$('targetMarginPx').querySelector('.actual.warn'),
      unitsOf('targetMarginPx'),
    )
    check(
      'an exact gutter is not flagged',
      !$('targetGutterPx').querySelector('.actual.warn'),
    )

    send({
      type: 'action-state',
      status: '',
      preview: Object.assign({}, pvSolve, {
        effectiveMargin: 30,
        gutterPx: 19,
        solveWithinTolerance: false,
        solveAspectErrPct: 9,
      }),
    })
    check(
      'a margin more than a cell off IS flagged',
      !!$('targetMarginPx').querySelector('.actual.warn'),
      unitsOf('targetMarginPx'),
    )
    check(
      'an inexact gutter IS flagged',
      !!$('targetGutterPx').querySelector('.actual.warn'),
      unitsOf('targetGutterPx'),
    )
    check(
      'an exactly-met column target is not flagged',
      !$('targetColumns').querySelector('.actual.warn'),
      unitsOf('targetColumns'),
    )
    send({
      type: 'action-state',
      status: '',
      preview: Object.assign({}, pvSolve, { cols: 180 }),
    })
    check(
      'a column count more than 2% off the ask IS flagged',
      !!$('targetColumns').querySelector('.actual.warn'),
      unitsOf('targetColumns'),
    )
    check(
      'frameWidth keeps a plain unit (no actual)',
      $('frameWidth').querySelector('.fig-units').textContent === 'px' &&
        !$('frameWidth').classList.contains('has-actual'),
      $('frameWidth').querySelector('.fig-units').textContent,
    )
    check(
      'editing still works with the annotation present',
      (() => {
        const inp = $('targetMarginPx').querySelector('input')
        inp.value = '80'
        inp.dispatchEvent(new w.Event('input', { bubbles: true }))
        return $('targetMarginPx').value === 80
      })(),
      $('targetMarginPx').value,
    )

    console.log('--- the derived cells row is visible in BOTH modes ---')
    check(
      'Cells row has no data-mode (always shown)',
      !$('preview-solved').closest('fig-field').hasAttribute('data-mode'),
    )
    console.log('--- solved values row ---')
    send({
      type: 'action-state',
      status: 'Live editing',
      preview: {
        source: 'selection',
        frameW: 1920,
        frameH: 1080,
        columns: 12,
        cols: 229,
        rows: 60,
        u: 8,
        cellH: 16,
        gridW: 1832,
        gridH: 960,
        deltaPct: 0,
        warn: false,
        density: 1,
        gutterCells: 3,
        gutterPx: 24,
        marginPx: 64,
        effectiveMargin: 64,
        columnWidth: 120,
        columnCells: 15,
        contentWidth: 1792,
        mode: 'Solve',
        solved: true,
        solvedM: 8,
        solvedK: 15,
        solvedG: 3,
        solveWithinTolerance: true,
        solveAspectErrPct: 0.32,
        targetMarginPx: 64,
        targetGutterPx: 24,
      },
    })
    check(
      'solved row shows m/k/g',
      /m8 k15 g3/.test($('preview-solved').textContent),
      $('preview-solved').textContent,
    )
    check(
      'solved row reports the aspect deviation, unflagged',
      /aspect Δ/.test($('preview-solved').textContent) &&
        !$('preview-solved').querySelector('.warn'),
      $('preview-solved').textContent,
    )
    // There is no tolerance to fail any more; the row flags a drifted aspect on the
    // same >1% rule as Cell w×h.
    send({
      type: 'action-state',
      status: '',
      preview: {
        source: 'selection',
        frameW: 1920,
        frameH: 1080,
        columns: 12,
        cols: 229,
        rows: 60,
        u: 8,
        cellH: 16,
        gridW: 1832,
        gridH: 960,
        deltaPct: 7.4,
        warn: true,
        density: 1,
        gutterCells: 3,
        gutterPx: 24,
        marginPx: 64,
        effectiveMargin: 64,
        columnWidth: 120,
        columnCells: 15,
        contentWidth: 1792,
        mode: 'Solve',
        solved: true,
        solvedM: 8,
        solvedK: 15,
        solvedG: 3,
        targetMarginPx: 64,
        targetGutterPx: 24,
        targetColumns: 229,
      },
    })
    check(
      'a drifted aspect is flagged red',
      !!$('preview-solved').querySelector('.warn') &&
        /aspect Δ 7.4%/.test($('preview-solved').textContent),
      $('preview-solved').textContent,
    )

    $('mode').querySelector('select').value = 'Manual'
    $('mode')
      .querySelector('select')
      .dispatchEvent(new w.Event('change', { bubbles: true }))

    console.log('--- the cell ladder drives the slider stops ---')
    const pvLadder = (extra) =>
      Object.assign(
        {
          source: 'selection',
          frameW: 1920,
          frameH: 1080,
          columns: 12,
          cols: 197,
          rows: 54,
          u: 10,
          cellH: 20,
          gridW: 1970,
          gridH: 1080,
          deltaPct: 0,
          warn: false,
          density: 1,
          gutterCells: 1,
          gutterPx: 10,
          marginPx: 30,
          effectiveMargin: 5,
          columnWidth: 150,
          columnCells: 15,
          contentWidth: 1910,
          actualAspect: 2,
          mode: 'Manual',
          solved: false,
          solvedM: 3,
          solvedK: 15,
          solvedG: 1,
          solveWithinTolerance: true,
          solveWithinCellBounds: true,
          solveAspectErrPct: 0,
          hRemainder: -50,
          cellLadder: [29, 41, 53, 65, 77, 89, 101, 113, 125, 137, 149, 161, 173, 185, 197],
          cellColumns: 197,
        },
        extra || {},
      )
    const stateOf = (extra) => ({
      type: 'action-state',
      status: 'Live editing',
      preview: pvLadder(extra),
    })
    send(stateOf())
    const cs = $('cellColumns')
    check(
      'slider adopts the ladder as its stops',
      cs.querySelector('input[type=range]').max === '14',
      cs.querySelector('input[type=range]').max,
    )
    check('and lands on the reported column count', cs.value === 197, cs.value)
    sent.length = 0
    ;(() => {
      const r = cs.querySelector('input[type=range]')
      r.value = '13'
      r.dispatchEvent(new w.Event('input', { bubbles: true }))
    })()
    check(
      'dragging one stop down posts the next legal count (185)',
      sent.some((x) => x.type === 'params-changed' && x.params.cellColumns === 185),
      JSON.stringify(
        sent.filter((x) => x.type === 'params-changed').map((x) => x.params.cellColumns),
      ),
    )
    check(
      'every stop is a legal count — no rejects to report',
      [...Array(15).keys()].every((i) => {
        const r = cs.querySelector('input[type=range]')
        r.value = String(i)
        r.dispatchEvent(new w.Event('input', { bubbles: true }))
        return pvLadder().cellLadder.indexOf(cs.value) === i
      }),
    )

    console.log('--- a rebuilt ladder re-snaps by count, not by index ---')
    send(stateOf({ cellColumns: 161 }))
    check('sits on 161 columns', cs.value === 161, cs.value)
    // A different ladder, as a bigger gutter or margin would produce: 161 is gone.
    send(stateOf({ cellLadder: [40, 80, 160, 240, 320], cellColumns: 160, u: 12 }))
    check(
      're-snaps 161 to the nearest surviving rung (160), not to index 3',
      cs.value === 160,
      cs.value,
    )
    check(
      'the rebuilt list is the one in force',
      cs.querySelector('input[type=range]').max === '4',
      cs.querySelector('input[type=range]').max,
    )
    check(
      'rebuilding the ladder posts nothing (not a user edit)',
      ((sent.length = 0),
      send(stateOf({ cellLadder: [100, 200, 300], cellColumns: 200, u: 9.6 })),
      sent.filter((x) => x.type === 'params-changed').length === 0),
    )

    console.log('--- bleed is surfaced beside the cell ---')
    send(stateOf({ hRemainder: -50, u: 10 }))
    check(
      '50px of bleed is shown and flagged (> one cell)',
      /50px bleed/.test($('preview-cell').textContent) &&
        !!$('preview-cell').querySelector('.warn'),
      $('preview-cell').textContent,
    )
    send(stateOf({ hRemainder: -2, u: 14, cellColumns: 137 }))
    check(
      '2px of bleed is shown, unflagged',
      /2px bleed/.test($('preview-cell').textContent) &&
        !$('preview-cell').querySelector('.warn'),
      $('preview-cell').textContent,
    )
    send(stateOf({ hRemainder: 0, u: 12, cellColumns: 161 }))
    check(
      'an exact fit says nothing about bleed',
      !/bleed/.test($('preview-cell').textContent),
      $('preview-cell').textContent,
    )

    console.log('\n=== cell density ===')
    check(
      'cellDensity dropdown 0.25x/0.5x/1x/2x/3x',
      [...$('cellDensity').querySelectorAll('option')]
        .map((o) => o.textContent)
        .join(',') === '0.25x,0.5x,1x,2x,3x',
    )
    check(
      'labelled "Cell density"',
      [...doc.querySelectorAll('.fig-field-label')].some(
        (e) => e.textContent === 'Cell density',
      ),
      [...doc.querySelectorAll('.fig-field-label')].map((e) => e.textContent).join('|'),
    )
    sent.length = 0
    $('cellDensity').querySelector('select').value = '2x'
    $('cellDensity')
      .querySelector('select')
      .dispatchEvent(new w.Event('change', { bubbles: true }))
    const dm = sent.find((x) => x.type === 'params-changed')
    check(
      '"2x" posts cellDensity=2',
      dm && dm.params.cellDensity === 2,
      JSON.stringify(dm && dm.params.cellDensity),
    )
    await sleep(5)
    check(
      '...and a dropdown commits immediately (native change)',
      reapplies().some((x) => x.params.cellDensity === 2),
      reapplies().length,
    )
    sent.length = 0
    $('cellDensity').querySelector('select').value = '0.25x'
    $('cellDensity')
      .querySelector('select')
      .dispatchEvent(new w.Event('change', { bubbles: true }))
    const dq = sent.find((x) => x.type === 'params-changed')
    check(
      '"0.25x" posts cellDensity=0.25 (parseFloat, not parseInt)',
      dq && dq.params.cellDensity === 0.25,
      JSON.stringify(dq && dq.params.cellDensity),
    )
    $('cellDensity').querySelector('select').value = '1x'
    $('cellDensity')
      .querySelector('select')
      .dispatchEvent(new w.Event('change', { bubbles: true }))
    await sleep(5)

    console.log('\n=== columns slider unchanged ===')
    const cc = $('columnCount'),
      ccRange = cc.querySelector('input[type=range]')
    const seen = []
    for (let i = 0; i <= 6; i++) {
      ccRange.value = String(i)
      ccRange.dispatchEvent(new w.Event('input', { bubbles: true }))
      seen.push(cc.value)
    }
    check('still steps 1,2,3,4,6,9,12', seen.join(',') === '1,2,3,4,6,9,12', seen.join(','))

    console.log('\n=== preview rows ===')
    send({
      type: 'action-state',
      status: 'Live editing',
      preview: {
        source: 'selection',
        frameW: 1920,
        frameH: 1080,
        columns: 12,
        cols: 80,
        rows: 23,
        u: 24,
        cellH: 46.96,
        gridW: 1920,
        gridH: 1080,
        deltaPct: -2.2,
        warn: true,
        density: 1,
        gutterCells: 1,
        gutterPx: 24,
        marginPx: 66,
        effectiveMargin: 47,
        hRemainder: -38,
        columnWidth: 132,
        columnCells: 6,
        contentWidth: 1826,
      },
    })
    check(
      'grid size row shows columns + cells, and not the frame size',
      /12 col/.test($('preview-size').textContent) &&
        /80\s*×\s*23/.test($('preview-size').textContent) &&
        !/px/.test($('preview-size').textContent),
      $('preview-size').textContent,
    )
    check(
      'column row reports derived px for col/gutter/margin',
      /132px col/.test($('preview-column').textContent) &&
        /24px gut/.test($('preview-column').textContent) &&
        /66px marg/.test($('preview-column').textContent),
      $('preview-column').textContent,
    )
    send({
      type: 'action-state',
      status: '',
      preview: {
        source: 'selection',
        frameW: 1920,
        frameH: 1080,
        columns: 12,
        cols: 96,
        rows: 27,
        u: 20,
        cellH: 40,
        gridW: 1920,
        gridH: 1080,
        deltaPct: 0,
        warn: false,
        density: 1,
        gutterCells: 1,
        gutterPx: 20,
        marginPx: 250,
        effectiveMargin: 250,
        hRemainder: 0,
        columnWidth: 100,
        columnCells: 5,
        contentWidth: 1420,
      },
    })
    check(
      'preview updates on the next message',
      /100px col/.test($('preview-column').textContent),
      $('preview-column').textContent,
    )

    console.log('\n=== restore + legacy fallback ===')
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
        cellColumns: 161,
        cellAspect: 3,
        snapRows: false,
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
        frameWidth: 2560,
        frameAspect: '4:3',
      },
    })
    check('mode restored', $('mode').value === 'Solve', $('mode').value)
    check(
      'solver targets restored',
      $('targetMarginPx').value === 80 &&
        $('targetGutterPx').value === 16 &&
        $('targetColumns').value === 240,
      [$('targetMarginPx').value, $('targetGutterPx').value, $('targetColumns').value].join(
        '/',
      ),
    )
    check(
      'all params restored',
      $('columnCount').value === 6 &&
        $('marginCells').value === 4 &&
        $('gutterMultiple').value === 3 &&
        $('snapTolerancePx').value === 0.25 &&
        $('aspectTolPct').value === 8 &&
        $('edgeCull').checked === false &&
        $('edgeCullPct').value === 35 &&
        $('cellDensity').value === '2x' &&
        $('showLines').checked === false &&
        $('monoSizes').value === '3' &&
        $('sansSizes').value === '5, 10, 20',
      [
        $('columnCount').value,
        $('marginCells').value,
        $('gutterMultiple').value,
        $('cellDensity').value,
      ].join(','),
    )
    check(
      'restore posts nothing',
      sent.filter((x) => x.type === 'params-changed').length === 0,
    )
    check(
      'restoring Pixel snap on reveals the tolerance field',
      !$('snapTolerancePx').closest('fig-field').hidden,
    )
    check(
      'restoring Edge cull off hides the cull tolerance field',
      $('edgeCullPct').closest('fig-field').hidden,
    )
    send({ type: 'params-change', params: {} })
    check(
      'legacy/empty params fall back to Manual',
      $('mode').value === 'Manual',
      $('mode').value,
    )
    check(
      'legacy/empty params restore the solver defaults 50/20/89',
      $('targetMarginPx').value === 50 &&
        $('targetGutterPx').value === 20 &&
        $('targetColumns').value === 89,
      [$('targetMarginPx').value, $('targetGutterPx').value, $('targetColumns').value].join(
        '/',
      ),
    )
    check(
      'legacy/empty params fall back to the 0.5px snap tolerance',
      $('snapTolerancePx').value === 0.5,
      $('snapTolerancePx').value,
    )
    check(
      'legacy/empty params fall back to the 20% edge cull, turned on',
      $('edgeCull').checked === true &&
        $('edgeCullPct').value === 20 &&
        !$('edgeCullPct').closest('fig-field').hidden,
      $('edgeCullPct').value,
    )
    check(
      'legacy/empty params fall back to the 5% aspect tolerance',
      $('aspectTolPct').value === 5,
      $('aspectTolPct').value,
    )
    check(
      'legacy/empty params fall back to the built-in specimen sizes',
      $('monoSizes').value === '2' && $('sansSizes').value === '6, 12, 24',
      [$('monoSizes').value, $('sansSizes').value].join(' / '),
    )
    check(
      'legacy/empty multiples fall back',
      $('marginCells').value === 3 &&
        $('gutterMultiple').value === 1 &&
        $('cellDensity').value === '1x' &&
        $('columnCount').value === 12,
      [
        $('marginCells').value,
        $('gutterMultiple').value,
        $('cellDensity').value,
        $('columnCount').value,
      ].join(','),
    )

    check(
      '...and falling back to Pixel snap off hides it again',
      $('snapTolerancePx').closest('fig-field').hidden,
    )

    console.log('\n=== switches still clickable (regression guard) ===')
    ;['snapRows', 'pixelPerfect', 'edgeCull', 'showLines', 'showSpecimens'].forEach(
      (id) => {
        const host = $(id),
          before = host.checked
        host
          .querySelector('input')
          .dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
        check('click toggles ' + id, host.checked === !before)
        host
          .querySelector('input')
          .dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
      },
    )

    console.log('\n=== Snap/Aspect tol. appear only while Pixel snap is on ===')
    {
      const vis = (id) => !$(id).closest('fig-field').hidden
      check(
        'hidden while Pixel snap is off',
        !vis('snapTolerancePx') && !vis('aspectTolPct'),
      )
      $('pixelPerfect')
        .querySelector('input')
        .dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
      check(
        'turning Pixel snap on reveals both',
        $('pixelPerfect').checked === true && vis('snapTolerancePx') && vis('aspectTolPct'),
      )
      $('pixelPerfect')
        .querySelector('input')
        .dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
      check(
        'turning it back off hides them again',
        !vis('snapTolerancePx') && !vis('aspectTolPct'),
      )

      check('Cull tol. visible while Edge cull is on', vis('edgeCullPct'))
      $('edgeCull')
        .querySelector('input')
        .dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
      check(
        'turning Edge cull off hides Cull tol.',
        $('edgeCull').checked === false && !vis('edgeCullPct'),
      )
      $('edgeCull')
        .querySelector('input')
        .dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
      check('...and back on reveals it', vis('edgeCullPct'))
    }

    console.log('\n=== reapply is debounced, not fired per tick ===')
    {
      // The regression this exists for: FigSlider emits on the native `input`
      // event, so an undebounced drag would post one full document write per
      // tick — a dozen per drag, each its own Figma undo step.
      sent.length = 0
      const r = $('marginCells').querySelector('input[type=range]')
      for (let i = 0; i < 10; i++) {
        r.value = String(i)
        r.dispatchEvent(new w.Event('input', { bubbles: true }))
      }
      check('a 10-step drag posts 10 previews', previews().length === 10, previews().length)
      check(
        '...and zero document writes while dragging',
        reapplies().length === 0,
        reapplies().length,
      )
      await commit(r)
      check(
        '...collapsing to exactly one write on release',
        reapplies().length === 1,
        reapplies().length,
      )
      check(
        '...carrying the final value',
        reapplies()[0].params.marginCells === 9,
        reapplies()[0].params.marginCells,
      )

      // Typing never fires a native `change` until blur, so the debounce is what
      // has to catch it.
      sent.length = 0
      const inp = $('frameWidth').querySelector('input')
      for (const v of ['1', '19', '192', '1920']) {
        inp.value = v
        inp.dispatchEvent(new w.Event('input', { bubbles: true }))
      }
      check(
        'typing 4 characters writes nothing immediately',
        reapplies().length === 0,
        reapplies().length,
      )
      await sleep(DEBOUNCE_WAIT)
      // frameWidth is deliberately preview-only, so nothing should arrive at all.
      check(
        'frameWidth never reapplies, debounce or not',
        reapplies().length === 0,
        reapplies().length,
      )

      sent.length = 0
      const g = $('gutterMultiple').querySelector('input[type=range]')
      g.value = '5'
      g.dispatchEvent(new w.Event('input', { bubbles: true }))
      check(
        'a grid param alone writes nothing yet',
        reapplies().length === 0,
        reapplies().length,
      )
      await sleep(DEBOUNCE_WAIT)
      check(
        '...and exactly one write after the debounce elapses',
        reapplies().length === 1,
        reapplies().length,
      )
    }

    console.log('\n=== font families are editable ===')
    {
      check(
        'both inputs exist, defaulting to the house fonts',
        $('monoFamily').value === 'GT America Mono' &&
          $('sansFamily').value === "Suisse Int'l",
        $('monoFamily').value + ' / ' + $('sansFamily').value,
      )
      const adv = [...doc.querySelectorAll('fig-group')].find(
        (g) => g.getAttribute('name') === 'Advanced',
      )
      check(
        '...inside the Advanced group',
        adv.contains($('monoFamily')) && adv.contains($('sansFamily')),
      )
      sent.length = 0
      const inp = $('monoFamily').querySelector('input')
      inp.value = 'IBM Plex Mono'
      inp.dispatchEvent(new w.Event('input', { bubbles: true }))
      check(
        'editing posts the new family',
        previews().some((m) => m.params.monoFamily === 'IBM Plex Mono'),
        JSON.stringify(sent.map((x) => x.params && x.params.monoFamily)),
      )
      check(
        '...and reapplies, since the char grid metrics depend on it',
        (await commit(inp),
        reapplies().some((m) => m.params.monoFamily === 'IBM Plex Mono')),
        reapplies().length,
      )
      send({
        type: 'params-change',
        params: { monoFamily: 'Roboto Mono', sansFamily: 'Inter' },
      })
      check(
        'restored from stored params',
        $('monoFamily').value === 'Roboto Mono' && $('sansFamily').value === 'Inter',
        $('monoFamily').value + ' / ' + $('sansFamily').value,
      )
      send({ type: 'params-change', params: {} })
      check(
        'absent params fall back to the house fonts',
        $('monoFamily').value === 'GT America Mono' &&
          $('sansFamily').value === "Suisse Int'l",
        $('monoFamily').value,
      )
    }

    console.log('\n=== the Frame group: custom aspect, and mirroring a selection ===')
    {
      const stateFor = (extra) => ({
        type: 'action-state',
        status: '',
        preview: Object.assign(
          {
            source: 'new frame',
            frameW: 1920,
            frameH: 1080,
            columns: 12,
            cols: 89,
            rows: 25,
            u: 21.57,
            cellH: 43.15,
            gridW: 1920,
            gridH: 1080,
            deltaPct: 0,
            warn: false,
            density: 1,
            gutterCells: 1,
            gutterPx: 21.57,
            marginPx: 64.7,
            effectiveMargin: 64.7,
            columnWidth: 129.4,
            columnCells: 6,
            contentWidth: 1790,
            mode: 'Manual',
            solved: false,
            solvedM: 3,
            solvedK: 6,
            solvedG: 1,
            hRemainder: 0,
            actualAspect: 2,
            targetMarginPx: 50,
            targetGutterPx: 20,
            targetColumns: 89,
            cellLadder: [29, 41, 53, 65, 77, 89, 101],
            cellColumns: 89,
          },
          extra,
        ),
      })

      // Earlier sections leave a selection mirrored; start from nothing selected.
      send(stateFor({}))
      check(
        'Custom is offered as an aspect',
        [...$('frameAspect').querySelectorAll('option')]
          .map((o) => o.textContent)
          .join(',') === '16:9,4:3,1:1,9:16,Custom',
        [...$('frameAspect').querySelectorAll('option')]
          .map((o) => o.textContent)
          .join(','),
      )
      check(
        'the aspect comes before the width in the DOM',
        $('frameAspect')
          .closest('fig-field')
          .compareDocumentPosition($('frameWidth').closest('fig-field')) &
          w.Node.DOCUMENT_POSITION_FOLLOWING,
      )
      check('height is hidden for a preset aspect', $('frameHeightField').hidden)

      sent.length = 0
      $('frameAspect').querySelector('select').value = 'Custom'
      $('frameAspect')
        .querySelector('select')
        .dispatchEvent(new w.Event('change', { bubbles: true }))
      await sleep(5)
      check('choosing Custom reveals the height field', !$('frameHeightField').hidden)
      check(
        '...and posts the aspect without reapplying',
        previews().some((m) => m.params.frameAspect === 'Custom') &&
          reapplies().length === 0,
        JSON.stringify(sent.map((x) => [x.type, x.reapply])),
      )
      const h = $('frameHeight').querySelector('input')
      h.value = '700'
      h.dispatchEvent(new w.Event('input', { bubbles: true }))
      await sleep(5)
      check(
        'the height posts as its own param',
        previews().some((m) => m.params.frameHeight === 700),
        JSON.stringify(previews().map((m) => m.params.frameHeight)),
      )

      console.log('--- selecting a frame makes the group read-only ---')
      send(stateFor({ source: 'selection', frameW: 1600, frameH: 900 }))
      check(
        "the fields show the selected frame's real size",
        $('frameWidth').value === 1600 && $('frameHeight').value === 900,
        $('frameWidth').value + 'x' + $('frameHeight').value,
      )
      check(
        '...and all three are disabled',
        $('frameWidth').disabled && $('frameHeight').disabled && $('frameAspect').disabled,
      )
      check(
        '...the height is shown even though the aspect is a preset',
        !$('frameHeightField').hidden,
      )
      check(
        'a 1600x900 frame reads as its matching preset',
        $('frameAspect').value === '16:9',
        $('frameAspect').value,
      )
      send(stateFor({ source: 'selection', frameW: 1000, frameH: 777 }))
      check(
        'a size matching no preset reads as Custom',
        $('frameAspect').value === 'Custom',
        $('frameAspect').value,
      )

      sent.length = 0
      check(
        'the mirrored values are not posted as settings',
        (() => {
          const m = getSentParams()
          return (
            m.frameWidth === 1920 && m.frameHeight === 700 && m.frameAspect === 'Custom'
          )
        })(),
        JSON.stringify(getSentParams()),
      )

      console.log('--- deselecting restores what the user set ---')
      send(stateFor({}))
      check(
        "the user's own width and height come back",
        $('frameWidth').value === 1920 && $('frameHeight').value === 700,
        $('frameWidth').value + 'x' + $('frameHeight').value,
      )
      check(
        '...the aspect too',
        $('frameAspect').value === 'Custom',
        $('frameAspect').value,
      )
      check(
        '...and the fields are editable again',
        !$('frameWidth').disabled &&
          !$('frameHeight').disabled &&
          !$('frameAspect').disabled,
      )
    }

    console.log('\n=== Advanced group is a real disclosure ===')
    {
      const adv = [...doc.querySelectorAll('fig-group')].find(
        (g) => g.getAttribute('name') === 'Advanced',
      )
      check('the Advanced group exists', !!adv)
      check('collapsed by default', adv.hasAttribute('collapsed'))
      const header = adv.querySelector('.fig-group-header')
      check(
        'its header is a button, not a div',
        header.tagName === 'BUTTON',
        header.tagName,
      )
      check(
        '...with type=button so it cannot submit',
        header.type === 'button',
        header.type,
      )
      check(
        '...and announces its state',
        header.getAttribute('aria-expanded') === 'false',
        header.getAttribute('aria-expanded'),
      )
      check(
        'it holds the seven lesser-used controls',
        [
          'edgeCull',
          'edgeCullPct',
          'cellAspect',
          'cellDensity',
          'showLines',
          'showSpecimens',
        ].every((id) => adv.contains($(id))) && adv.contains($('preview-solved')),
        [
          'edgeCull',
          'edgeCullPct',
          'cellAspect',
          'cellDensity',
          'showLines',
          'showSpecimens',
        ]
          .filter((id) => !adv.contains($(id)))
          .join(','),
      )
      check(
        'the primary controls stayed out of it',
        [
          'mode',
          'columnCount',
          'marginCells',
          'gutterMultiple',
          'cellColumns',
          'snapRows',
          'pixelPerfect',
          'snapTolerancePx',
          'aspectTolPct',
        ].every((id) => !adv.contains($(id))),
      )
      sent.length = 0
      header.dispatchEvent(new w.Event('click', { bubbles: true }))
      check('clicking expands it', !adv.hasAttribute('collapsed'))
      check('...updates aria-expanded', header.getAttribute('aria-expanded') === 'true')
      await sleep(30) // reportHeight defers to requestAnimationFrame
      check(
        '...and re-reports the height, since the panel is measured',
        sent.some((x) => x.type === 'resize'),
        JSON.stringify(sent.map((x) => x.type)),
      )
      check(
        '...without touching the document',
        reapplies().length === 0,
        reapplies().length,
      )
      header.dispatchEvent(new w.Event('click', { bubbles: true }))
      check('clicking again collapses it', adv.hasAttribute('collapsed'))
      // Leave it open: the switch-click checks below need a reachable control.
      header.dispatchEvent(new w.Event('click', { bubbles: true }))
    }

    console.log('\n=== Copy Mitos config ===')
    {
      const copyButton = $('copy-mitos')
      check('the copy button exists in the footer', !!copyButton)
      check(
        '...as a secondary non-submit button',
        copyButton.type === 'button' && copyButton.classList.contains('secondary'),
      )

      // jsdom has no execCommand; stub it to capture what would be copied.
      let copied = null
      doc.execCommand = (cmd) => {
        if (cmd !== 'copy') return false
        copied = doc.querySelector('textarea.clipboard-stage').value
        return true
      }

      // A grid the plugin could really produce: 1920×1080, 96 cells across,
      // 25 rows. The expected numbers below are re-derived from Mitos's own
      // formulas (dimension-utils.ts: CHAR_WIDTH 7.45, FONT_SIZE 12) rather
      // than hard-coded from the implementation.
      const pvMitos = Object.assign({}, pvSolve, {
        frameW: 1920,
        frameH: 1080,
        cols: 96,
        rows: 25,
      })
      send({ type: 'action-state', status: '', preview: pvMitos })
      copyButton.dispatchEvent(new w.Event('click', { bubbles: true }))

      check('clicking copies something', copied !== null)
      check(
        'the staging textarea is removed afterwards',
        !doc.querySelector('textarea.clipboard-stage'),
      )
      check(
        'the button confirms, then offers to copy again',
        /Copied/.test(copyButton.textContent),
        copyButton.textContent,
      )
      await sleep(1700)
      check(
        '...label resets after the confirmation',
        copyButton.textContent.trim() === 'Copy config',
        copyButton.textContent,
      )

      const cfg = JSON.parse(copied)
      check(
        "the payload is tagged for Mitos's paste handler",
        cfg.mitos === 'grid-config' && cfg.version === 1,
        copied.slice(0, 60),
      )
      check(
        'columns and rows mirror the previewed cell grid',
        cfg.output.columns === 96 && cfg.output.rows === 25,
        JSON.stringify(cfg.output),
      )
      check('image aspect override is disabled', cfg.output.useImageAspectRatio === false)
      check('padding is zero (the grid runs full bleed)', cfg.export.padding === 0)
      // Independent derivation: the line height that makes one Mitos character
      // cell the same shape as one grid cell.
      const CHAR_W = 7.45
      const FONT_S = 12
      const wantLh = (1080 * 96 * CHAR_W) / (1920 * 25 * FONT_S)
      check(
        'line height matches the cell shape to 4 decimals',
        Math.abs(cfg.export.lineHeight - wantLh) <= 0.00005,
        cfg.export.lineHeight + ' vs ' + wantLh,
      )
      check(
        'export size is the frame size',
        cfg.export.width === 1920 && cfg.export.height === 1080,
        JSON.stringify(cfg.export),
      )
      // The round trip that makes the export size stick in Mitos: it rederives
      // height = width × (rows·FONT_SIZE·lineHeight)/(cols·CHAR_WIDTH).
      const derivedH = Math.round(
        1920 * ((25 * FONT_S * cfg.export.lineHeight) / (96 * CHAR_W)),
      )
      check(
        "Mitos's derive-height-from-width lands back on the frame height",
        derivedH === 1080,
        derivedH,
      )
      // And its locked-aspect sync must not move the pasted row count.
      const syncedRows = Math.round(
        (96 * CHAR_W) / (cfg.output.aspectRatio * FONT_S * cfg.export.lineHeight),
      )
      check("Mitos's aspect-lock sync keeps the pasted rows", syncedRows === 25, syncedRows)

      // A failed copy must say so rather than claim success.
      doc.execCommand = () => false
      copyButton.dispatchEvent(new w.Event('click', { bubbles: true }))
      check(
        'a refused copy reports failure',
        /failed/i.test(copyButton.textContent),
        copyButton.textContent,
      )
      await sleep(1700) // let the label reset before the error check below
      delete doc.execCommand
    }

    console.log('\n=== final error check ===')
    check('no script errors', errors.length === 0, errors.join('; '))
  } catch (err) {
    // Without this a mid-run crash prints only the passes that happened to run,
    // which reads like success. It cost a real regression once already.
    failures++
    console.error('\nCRASHED mid-run: ' + (err && err.stack ? err.stack : err))
  }

  console.log(
    '\n' + (failures ? failures + ' FAILURE(S)' : 'ALL PASS') + ' — ' + checks + ' checks',
  )
  process.exitCode = failures ? 1 : 0
}, 150)
