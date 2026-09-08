/*
 * This Source Code Form is subject to the terms of the Apache License,
 * v. 2.0. If a copy of the license was not distributed with this file, you can
 * obtain one at https://github.com/ertdfgcvb/play.core/blob/master/LICENSE.
 *
 * Modified from https://github.com/ertdfgcvb/play.core
 * Copyright ertdfgcvb (Andreas Gysin)
 */
import { cssColorValue } from '../color.js'
import type { Cell, Context, Renderer } from '../types.js'

/**
 * DOM text renderer: one block-level <span> per row inside the target element
 * (usually a <pre>), so the output is real, selectable, searchable text that
 * inherits font and sizing from CSS.
 *
 * Work avoidance, in order: rows whose cells are unchanged since the last
 * frame are skipped entirely (back-buffer diff); within a dirty row,
 * consecutive same-styled cells coalesce into one span; styles equal to the
 * settings defaults are elided so the common case is a bare <span>.
 */
export function createTextRenderer(): Renderer {
  const backBuffer: Cell[] = []
  let cols: number, rows: number
  let element: HTMLElement | null = null
  let appliedColor = ''
  let appliedBackground = ''

  function render(context: Context, buffer: Cell[]): void {
    if (element !== context.settings.element) {
      element = context.settings.element
      // The renderer owns the element's children. Drop any pre-existing
      // content (placeholder text, whitespace, comments) — a stray non-element
      // node would shift every row's index.
      element.textContent = ''
      backBuffer.length = 0
    }

    // Apply the settings defaults to the element so cells matching them
    // (which are elided to bare spans) show the intended colors, matching the
    // canvas renderer.
    const baseColor = context.settings.color ? cssColorValue(context.settings.color) : ''
    if (baseColor !== appliedColor) {
      appliedColor = baseColor
      element.style.color = baseColor
    }
    const baseBackground = context.settings.backgroundColor
      ? cssColorValue(context.settings.backgroundColor)
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

    // Match the row-span count to the grid.
    while (element.childElementCount < rows) {
      const span = document.createElement('span')
      span.style.display = 'block'
      element.appendChild(span)
    }
    while (element.childElementCount > rows) {
      const lastChild = element.lastElementChild
      if (lastChild) element.removeChild(lastChild)
    }

    // Rows are written as one innerHTML string each — measurably faster than
    // building spans via createElement.
    for (let j = 0; j < rows; j++) {
      const offs = j * cols

      let rowNeedsUpdate = false
      for (let i = 0; i < cols; i++) {
        const idx = i + offs
        const newCell = buffer[idx]
        const oldCell = backBuffer[idx]
        if (!isSameCell(newCell, oldCell)) {
          rowNeedsUpdate = true
          // Copy field values (never store a reference — the engine mutates
          // the same buffer cells in place across frames, which would make
          // old === new and kill the diff), reusing the existing object.
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

      if (rowNeedsUpdate === false) continue

      let html = ''
      let prevCell: Cell = { char: '' }
      let tagIsOpen = false

      for (let i = 0; i < cols; i++) {
        const currCell = buffer[i + offs]

        // A style change starts a new span; same-styled runs share one.
        if (!isSameCellStyle(currCell, prevCell)) {
          if (tagIsOpen) html += '</span>'

          const c = currCell.color === context.settings.color ? null : currCell.color
          const b =
            currCell.backgroundColor === context.settings.backgroundColor
              ? null
              : currCell.backgroundColor
          const w =
            currCell.fontWeight === context.settings.fontWeight ? null : currCell.fontWeight

          let css = ''
          if (c) css += `color:${cssColorValue(c)};`
          if (b) css += `background:${cssColorValue(b)};`
          if (w) css += `font-weight:${w};`
          if (css) css = ` style="${css}"`
          html += `<span${css}>`
          tagIsOpen = true
        }
        html += escapeChar(currCell.char)
        prevCell = currCell
      }
      if (tagIsOpen) {
        html += '</span>'
      }

      // Write the row (children, not childNodes — only elements count as rows)
      const childNode = element.children[j] as HTMLSpanElement
      childNode.innerHTML = html
    }
  }

  function dispose() {
    if (element) {
      element.innerHTML = ''
      // Remove the base colors applied from settings — a later animation
      // reusing this element (with different or no colors) would otherwise
      // inherit them, since it only writes colors its own settings define.
      if (appliedColor) element.style.color = ''
      if (appliedBackground) element.style.background = ''
    }
    appliedColor = ''
    appliedBackground = ''
    backBuffer.length = 0
  }

  return { render, dispose }
}

const ESCAPE_RE = /[&<>]/g
const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' }

// Cells usually hold single characters but the type allows any string; keep
// markup-significant characters from corrupting the row's innerHTML (or
// injecting live markup from untrusted cell content).
function escapeChar(char: string | undefined): string {
  if (!char) return ' '
  if (char === '&') return '&amp;'
  if (char === '<') return '&lt;'
  if (char === '>') return '&gt;'
  if (char.length === 1) return char
  return char.replace(ESCAPE_RE, (c) => ESCAPES[c])
}

function isSameCell(cellA: Cell | undefined, cellB: Cell | undefined): boolean {
  if (typeof cellA !== 'object' || cellA === null) return false
  if (typeof cellB !== 'object' || cellB === null) return false
  return cellA.char === cellB.char && isSameCellStyle(cellA, cellB)
}

function isSameCellStyle(cellA: Cell, cellB: Cell): boolean {
  if (cellA?.fontWeight !== cellB?.fontWeight) return false
  if (cellA?.color !== cellB?.color) return false
  if (cellA?.backgroundColor !== cellB?.backgroundColor) return false
  return true
}
