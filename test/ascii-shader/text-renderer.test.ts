// @vitest-environment jsdom
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { beforeEach, describe, expect, test } from 'vitest'

import { createTextRenderer } from '../../components/src/ascii-shader/renderers/text'
import type {
  Cell,
  Context,
  ResolvedSettings,
} from '../../components/src/ascii-shader/types'

let element: HTMLPreElement

beforeEach(() => {
  element = document.createElement('pre')
  document.body.appendChild(element)
})

function makeContext(
  cols: number,
  rows: number,
  settings: Partial<ResolvedSettings> = {},
): Context {
  return Object.freeze({
    frame: 0,
    time: 0,
    cols,
    rows,
    metrics: {
      aspect: 0.5,
      cellWidth: 8,
      lineHeight: 16,
      fontFamily: 'monospace',
      fontSize: 14,
    },
    width: cols * 8,
    height: rows * 16,
    settings: {
      element,
      fps: 30,
      loop: true,
      autoplay: true,
      reducedMotion: false,
      ...settings,
    },
    runtime: Object.freeze({ fps: 0 }),
  })
}

const cells = (chars: string, style: Partial<Cell> = {}): Cell[] =>
  chars.split('').map((char) => ({ char, ...style }))

describe('createTextRenderer', () => {
  test('renders one block span per row with the buffer text', () => {
    const renderer = createTextRenderer()
    renderer.render(makeContext(3, 2), cells('abcdef'))

    expect(element.children.length).toBe(2)
    expect(element.children[0].textContent).toBe('abc')
    expect(element.children[1].textContent).toBe('def')
    expect((element.children[0] as HTMLElement).style.display).toBe('block')
  })

  test('clears pre-existing element content so stray nodes cannot shift rows', () => {
    element.textContent = 'placeholder'
    const renderer = createTextRenderer()
    renderer.render(makeContext(2, 1), cells('ok'))

    expect(element.childNodes.length).toBe(1)
    expect(element.textContent).toBe('ok')
  })

  test('escapes markup-significant characters', () => {
    const renderer = createTextRenderer()
    renderer.render(makeContext(3, 1), cells('<&>'))

    expect(element.children[0].innerHTML).toContain('&lt;&amp;&gt;')
    expect(element.textContent).toBe('<&>')
  })

  test('escapes multi-character cell strings too', () => {
    const renderer = createTextRenderer()
    renderer.render(makeContext(1, 1), [{ char: '<b>' }])

    expect(element.textContent).toBe('<b>')
    expect(element.querySelector('b')).toBeNull()
  })

  test('renders empty/missing chars as spaces', () => {
    const renderer = createTextRenderer()
    renderer.render(makeContext(2, 1), [{ char: '' }, { char: 'x' }])

    expect(element.textContent).toBe(' x')
  })

  test('coalesces same-styled runs into a single span', () => {
    const renderer = createTextRenderer()
    const buffer = [...cells('aa', { color: 'red' }), ...cells('bb', { color: 'blue' })]
    renderer.render(makeContext(4, 1), buffer)

    const spans = element.children[0].querySelectorAll('span')
    expect(spans.length).toBe(2)
    expect(spans[0].textContent).toBe('aa')
    expect(spans[0].style.color).toBe('red')
    expect(spans[1].textContent).toBe('bb')
    expect(spans[1].style.color).toBe('blue')
  })

  test('elides styles matching the settings defaults and applies them to the element', () => {
    const renderer = createTextRenderer()
    const buffer = [...cells('aa', { color: 'red' }), ...cells('b!', { color: 'lime' })]
    renderer.render(makeContext(4, 1, { color: 'red', backgroundColor: 'black' }), buffer)

    expect(element.style.color).toBe('red')
    expect(element.style.background).toBe('black')
    const spans = element.children[0].querySelectorAll('span')
    expect(spans.length).toBe(2)
    // Default-colored run is a bare span; only the lime run carries a style.
    expect(spans[0].getAttribute('style')).toBeNull()
    expect(spans[1].style.color).toBe('lime')
  })

  test('converts bare custom property colors to var() references', () => {
    const renderer = createTextRenderer()
    renderer.render(makeContext(1, 1), [{ char: 'x', color: '--accent' }])

    const span = element.children[0].querySelector('span')!
    expect(span.getAttribute('style')).toContain('color:var(--accent)')
  })

  test('skips unchanged rows on subsequent renders', () => {
    const renderer = createTextRenderer()
    const buffer = cells('abcd')
    renderer.render(makeContext(2, 2), buffer)

    // Plant sentinels: a skipped row keeps them, an updated row rewrites them.
    element.children[0].innerHTML = 'ROW0'
    element.children[1].innerHTML = 'ROW1'

    buffer[3] = { char: 'X' }
    renderer.render(makeContext(2, 2), buffer)

    expect(element.children[0].innerHTML).toBe('ROW0') // untouched
    expect(element.children[1].textContent).toBe('cX') // re-rendered
  })

  test('does not diff against live buffer references (in-place mutation is detected)', () => {
    const renderer = createTextRenderer()
    const buffer = cells('ab')
    renderer.render(makeContext(2, 1), buffer)

    // The engine mutates cells in place between frames.
    buffer[0].char = 'Z'
    renderer.render(makeContext(2, 1), buffer)

    expect(element.textContent).toBe('Zb')
  })

  test('adjusts the row count when the grid changes', () => {
    const renderer = createTextRenderer()
    renderer.render(makeContext(2, 3), cells('abcdef'))
    expect(element.children.length).toBe(3)

    renderer.render(makeContext(3, 2), cells('abcdef'))
    expect(element.children.length).toBe(2)
    expect(element.textContent).toBe('abcdef')
  })

  test('dispose clears the element and back buffer', () => {
    const renderer = createTextRenderer()
    renderer.render(makeContext(2, 1), cells('ab'))
    renderer.dispose?.()

    expect(element.innerHTML).toBe('')
  })

  test('dispose removes the base colors it applied to the element', () => {
    // Regression: switching from a program with colors to one without left
    // the old inline color/background on the <pre> —
    // the new renderer never overwrites styles its settings don't define.
    const renderer = createTextRenderer()
    renderer.render(
      makeContext(2, 1, { color: 'white', backgroundColor: 'black' }),
      cells('ab'),
    )
    expect(element.style.color).toBe('white')
    expect(element.style.background).toBe('black')

    renderer.dispose?.()
    expect(element.style.color).toBe('')
    expect(element.style.background).toBe('')

    // A fresh colorless renderer on the same element stays unstyled.
    const next = createTextRenderer()
    next.render(makeContext(2, 1), cells('cd'))
    expect(element.style.color).toBe('')
    expect(element.style.background).toBe('')
  })
  test('patches rows in place: run spans and text nodes are reused across frames', () => {
    const renderer = createTextRenderer()
    const buffer = [...cells('aa', { color: 'red' }), ...cells('bb', { color: 'blue' })]
    renderer.render(makeContext(4, 1), buffer)
    const [s0, s1] = element.children[0].querySelectorAll('span')
    const t0 = s0.firstChild

    buffer[0].char = 'X'
    buffer[3].color = 'green'
    renderer.render(makeContext(4, 1), buffer)

    const spans = element.children[0].querySelectorAll('span')
    expect(spans.length).toBe(3)
    expect(spans[0]).toBe(s0)
    expect(spans[0].firstChild).toBe(t0)
    expect(spans[1]).toBe(s1)
    expect(element.textContent).toBe('Xabb')
    expect(spans[1].style.color).toBe('blue')
    expect(spans[2].style.color).toBe('green')
  })

  test('a row of unstyled cells is a single text node', () => {
    const renderer = createTextRenderer()
    renderer.render(makeContext(3, 1, { color: 'red' }), cells('abc'))

    const row = element.children[0]
    expect(row.childNodes.length).toBe(1)
    expect(row.firstChild?.nodeType).toBe(Node.TEXT_NODE)
    expect(row.textContent).toBe('abc')
  })

  test('rows switch cleanly between plain and styled', () => {
    const renderer = createTextRenderer()
    const buffer = cells('abc')
    renderer.render(makeContext(3, 1), buffer)

    buffer[1].color = 'red'
    renderer.render(makeContext(3, 1), buffer)
    const row = element.children[0]
    expect([...row.childNodes].map((n) => n.nodeName)).toEqual(['#text', 'SPAN', 'SPAN'])
    expect(row.textContent).toBe('abc')

    buffer[0].color = 'blue'
    renderer.render(makeContext(3, 1), buffer)
    expect([...row.childNodes].map((n) => n.nodeName)).toEqual(['SPAN', 'SPAN', 'SPAN'])
    expect(row.textContent).toBe('abc')
    buffer[0].color = undefined

    buffer[1].color = undefined
    renderer.render(makeContext(3, 1), buffer)
    expect(row.childNodes.length).toBe(1)
    expect(row.firstChild?.nodeType).toBe(Node.TEXT_NODE)
    expect(row.textContent).toBe('abc')
  })

  test('removes a run style once the run returns to the default', () => {
    const renderer = createTextRenderer()
    const buffer = [...cells('a', { color: 'red' }), ...cells('b', { color: 'blue' })]
    renderer.render(makeContext(2, 1, { color: 'red' }), buffer)
    let spans = element.children[0].querySelectorAll('span')
    expect(spans[0].getAttribute('style')).toBeNull()

    buffer[1].color = 'red'
    renderer.render(makeContext(2, 1, { color: 'red' }), buffer)
    spans = element.children[0].querySelectorAll('span')
    expect(spans.length).toBe(1)
    expect(spans[0].getAttribute('style')).toBeNull()
    expect(element.textContent).toBe('ab')
  })

  test('produces the same markup the innerHTML renderer did', () => {
    const renderer = createTextRenderer()
    const buffer: Cell[] = [
      { char: 'a' },
      { char: '<' },
      { char: 'b', color: 'red' },
      { char: 'c', color: 'white' },
      { char: 'd' },
    ]
    renderer.render(makeContext(5, 1, { color: 'white' }), buffer)
    expect(element.children[0].innerHTML).toBe(
      'a&lt;<span style="color:red;">b</span><span>c</span><span>d</span>',
    )
  })
})
