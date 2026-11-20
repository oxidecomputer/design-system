/*
 * This Source Code Form is subject to the terms of the Apache License,
 * v. 2.0. If a copy of the license was not distributed with this file, you can
 * obtain one at https://github.com/ertdfgcvb/play.core/blob/master/LICENSE.
 *
 * Modified from https://github.com/ertdfgcvb/play.core
 * Copyright ertdfgcvb (Andreas Gysin)
 */
import { cssColorValue } from '../color'
import type { Cell, Context, Renderer } from '../types'

/**
 * DOM text renderer: one block-level <span> per row inside the target element
 * (usually a <pre>), so the output is real, selectable, searchable text that
 * inherits font and sizing from CSS.
 *
 * Work avoidance, in order: rows whose cells are unchanged since the last
 * frame are skipped entirely (back-buffer diff); within a dirty row,
 * consecutive same-styled cells coalesce into one run (a leading run with no
 * style set is a bare Text node, later runs are spans); styles equal to the
 * settings defaults are elided so the common case is a bare <span>.
 *
 * Rows are patched in place, never rebuilt with innerHTML: run spans and their
 * Text nodes are reused slot by slot, a span's style attribute is written only
 * when that slot's style changed, and text goes through Text.data. That skips
 * the HTML parser, the style recalc of freshly created elements, and the DOM
 * node churn (garbage) of re-parsing every dirty row every frame — and cell
 * content can never become markup, so nothing needs escaping.
 */
export function createTextRenderer(): Renderer {
  const backBuffer: Cell[] = []
  let cols: number, rows: number
  let element: HTMLElement | null = null
  let appliedColor = ''
  let appliedBackground = ''
  // The style key each run span was last written with. Keyed on the node, not
  // the slot, so a span replaced from outside is simply rewritten.
  let spanStyles = new WeakMap<Element, string>()

  function render(context: Context, buffer: Cell[]): void {
    const settings = context.settings
    if (element !== settings.element) {
      if (element) release(element)
      element = settings.element
      // A stray non-element child (placeholder text, whitespace, comments)
      // would shift every row's index.
      element.textContent = ''
      backBuffer.length = 0
    }

    // Cells matching the settings defaults are elided to bare spans, so the
    // defaults go on the element itself.
    const baseColor = settings.color ? cssColorValue(settings.color) : ''
    if (baseColor !== appliedColor) {
      appliedColor = baseColor
      element.style.color = baseColor
    }
    const baseBackground = settings.backgroundColor
      ? cssColorValue(settings.backgroundColor)
      : ''
    if (baseBackground !== appliedBackground) {
      appliedBackground = baseBackground
      element.style.background = baseBackground
    }

    if (context.rows !== rows || context.cols !== cols) {
      cols = context.cols
      rows = context.rows
      backBuffer.length = 0
    }

    while (element.childElementCount < rows) {
      const span = document.createElement('span')
      span.style.display = 'block'
      element.appendChild(span)
    }
    while (element.childElementCount > rows) {
      const lastChild = element.lastElementChild
      if (lastChild) element.removeChild(lastChild)
    }

    const defaultColor = settings.color
    const defaultBackground = settings.backgroundColor
    const defaultWeight = settings.fontWeight

    // children, not childNodes: only elements count as rows.
    let row = element.firstElementChild as HTMLElement
    for (let j = 0; j < rows; j++, row = row.nextElementSibling as HTMLElement) {
      const offs = j * cols

      let rowNeedsUpdate = false
      for (let i = 0; i < cols; i++) {
        const idx = i + offs
        const newCell = buffer[idx]
        const oldCell = backBuffer[idx]
        if (!isSameCell(newCell, oldCell)) {
          rowNeedsUpdate = true
          // Copy values, never the reference: the engine mutates cells in
          // place, so a stored reference would make old === new.
          if (oldCell) {
            oldCell.char = newCell.char
            oldCell.color = newCell.color
            oldCell.backgroundColor = newCell.backgroundColor
            oldCell.fontWeight = newCell.fontWeight
          } else {
            backBuffer[idx] = {
              char: newCell.char,
              color: newCell.color,
              backgroundColor: newCell.backgroundColor,
              fontWeight: newCell.fontWeight,
            }
          }
        }
      }

      if (rowNeedsUpdate) {
        renderRow(row, buffer, offs, defaultColor, defaultBackground, defaultWeight)
      }
    }
  }

  /**
   * Patch one row to: an optional leading Text node (the run of cells with no
   * style set at all), then one span per run. This is exactly the markup the
   * innerHTML renderer produced — kept deliberately, since Chromium positions
   * glyphs differently (sub-pixel) when the same text is split differently
   * across nodes. Runs break on the raw cell style, not the elided one, for
   * the same reason.
   */
  function renderRow(
    row: HTMLElement,
    buffer: Cell[],
    offs: number,
    defaultColor: string | undefined,
    defaultBackground: string | undefined,
    defaultWeight: string | number | undefined,
  ) {
    let node = row.firstChild
    let i = 0
    while (i < cols) {
      const head = buffer[i + offs]
      let text = head.char || ' '
      const start = i
      i++
      while (i < cols) {
        const cell = buffer[i + offs]
        if (
          cell.color !== head.color ||
          cell.backgroundColor !== head.backgroundColor ||
          cell.fontWeight !== head.fontWeight
        ) {
          break
        }
        text += cell.char || ' '
        i++
      }

      const bare =
        start === 0 &&
        head.color === undefined &&
        head.backgroundColor === undefined &&
        head.fontWeight === undefined

      if (bare) {
        if (node && node.nodeType === Node.TEXT_NODE) {
          if ((node as Text).data !== text) (node as Text).data = text
        } else {
          row.insertBefore(document.createTextNode(text), node)
          continue
        }
        node = node.nextSibling
        continue
      }

      // Anything but a span here (a leading Text node the row no longer has,
      // or outside edits) is dropped.
      while (node && node.nodeName !== 'SPAN') {
        const next = node.nextSibling
        row.removeChild(node)
        node = next
      }
      let span = node as HTMLElement | null
      if (!span) {
        span = document.createElement('span')
        row.appendChild(span)
      }
      const css = runStyle(
        head.color === defaultColor ? undefined : head.color,
        head.backgroundColor === defaultBackground ? undefined : head.backgroundColor,
        head.fontWeight === defaultWeight ? undefined : head.fontWeight,
      )
      if (spanStyles.get(span) !== css) {
        if (css) span.setAttribute('style', css)
        else span.removeAttribute('style')
        spanStyles.set(span, css)
      }
      setNodeText(span, text)
      node = span.nextSibling
    }
    // Fewer runs than last time.
    while (node) {
      const next = node.nextSibling
      row.removeChild(node)
      node = next
    }
  }

  function release(el: HTMLElement) {
    el.textContent = ''
    // A later animation reusing this element would otherwise inherit the
    // base colors, since it only writes colors its own settings define.
    if (appliedColor) el.style.color = ''
    if (appliedBackground) el.style.background = ''
  }

  function dispose() {
    if (element) release(element)
    element = null
    appliedColor = ''
    appliedBackground = ''
    spanStyles = new WeakMap()
    backBuffer.length = 0
  }

  return { render, dispose }
}

/** Make `el`'s content exactly one Text node holding `text`. */
function setNodeText(el: HTMLElement, text: string): void {
  const node = el.firstChild
  if (node && node.nodeType === Node.TEXT_NODE && node === el.lastChild) {
    if ((node as Text).data !== text) (node as Text).data = text
  } else {
    el.textContent = text
  }
}

function runStyle(
  color: string | undefined,
  background: string | undefined,
  weight: string | number | undefined,
): string {
  let css = ''
  if (color) css += `color:${cssColorValue(color)};`
  if (background) css += `background:${cssColorValue(background)};`
  if (weight) css += `font-weight:${weight};`
  return css
}

function isSameCell(cellA: Cell, cellB: Cell | undefined): boolean {
  return (
    cellB !== undefined &&
    cellA.char === cellB.char &&
    cellA.fontWeight === cellB.fontWeight &&
    cellA.color === cellB.color &&
    cellA.backgroundColor === cellB.backgroundColor
  )
}
