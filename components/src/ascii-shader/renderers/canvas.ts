/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { get2dContext, resolveColor } from '../color.js'
import { invariant, type Cell, type Context, type Renderer } from '../types.js'

/**
 * Canvas renderer. Sizes the canvas to the grid (+ padding), renders on a
 * Display P3 context when available, and resolves CSS-variable colors to
 * concrete values (canvas fillStyle can't dereference them). The backing
 * store is sized at devicePixelRatio × settings.supersample.
 */
export function createCanvasRenderer(): Renderer {
  // Cache the applied size so the bitmap is only reallocated when the grid,
  // padding, or scale actually changes.
  let appliedWidth = 0
  let appliedHeight = 0
  let appliedScale = 0
  let boundCanvas: HTMLCanvasElement | null = null
  let boundCtx: CanvasRenderingContext2D | null = null
  // resolveColor does string scans per call — a one-entry cache covers long
  // runs of identically-colored cells.
  let lastRawColor = ''
  let lastResolvedColor = ''
  const resolveCellColor = (color: string) => {
    if (color !== lastRawColor) {
      lastRawColor = color
      lastResolvedColor = resolveColor(color)
    }
    return lastResolvedColor
  }

  function render(context: Context, buffer: Cell[]): void {
    const settings = context.settings
    const canvas = settings.element as HTMLCanvasElement

    invariant(canvas.nodeName === 'CANVAS', 'Canvas renderer requires a <canvas> element')

    if (canvas !== boundCanvas) {
      boundCanvas = canvas
      boundCtx = get2dContext(canvas)
    }
    const ctx = boundCtx
    if (!ctx) {
      console.error('ascii-shader: could not get canvas context')
      return
    }

    const m = context.metrics
    if (
      context.rows <= 0 ||
      context.cols <= 0 ||
      !isFinite(context.rows) ||
      !isFinite(context.cols) ||
      !m.cellWidth ||
      !m.lineHeight ||
      m.cellWidth <= 0 ||
      m.lineHeight <= 0
    ) {
      console.error(
        `ascii-shader: invalid dimensions or metrics: ${context.cols} x ${context.rows}`
      )
      return
    }

    const scale = (globalThis.devicePixelRatio || 1) * (settings.supersample ?? 1)
    const padding = settings.padding || 0
    const width = context.cols * m.cellWidth + padding * 2
    const height = context.rows * m.lineHeight + padding * 2

    if (width !== appliedWidth || height !== appliedHeight || scale !== appliedScale) {
      appliedWidth = width
      appliedHeight = height
      appliedScale = scale
      canvas.width = width * scale
      canvas.height = height * scale
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    if (settings.backgroundColor) {
      ctx.fillStyle = resolveColor(settings.backgroundColor)
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const textColor = resolveColor(settings.color || 'black')
    const baseWeight = String(settings.fontWeight ?? 'normal')

    ctx.save()
    ctx.scale(scale, scale)
    ctx.textBaseline = 'top'

    // Track the active fill color and font so canvas state is only touched
    // when a cell differs from the previous one.
    let currentColor = ''
    let currentWeight = ''
    const setColor = (color: string) => {
      if (color !== currentColor) {
        ctx.fillStyle = color
        currentColor = color
      }
    }
    const setWeight = (weight: string) => {
      if (weight !== currentWeight) {
        ctx.font = `${weight} ${m.fontSize}px ${m.fontFamily}`
        currentWeight = weight
      }
    }

    for (let j = 0; j < context.rows; j++) {
      for (let i = 0; i < context.cols; i++) {
        const cell = buffer[j * context.cols + i]
        const x = i * m.cellWidth + padding
        const y = j * m.lineHeight + padding

        if (cell?.backgroundColor && cell.backgroundColor !== settings.backgroundColor) {
          setColor(resolveCellColor(cell.backgroundColor))
          ctx.fillRect(x, y, m.cellWidth, m.lineHeight)
        }

        const char = cell?.char
        if (!char || char === ' ') continue

        setWeight(cell?.fontWeight != null ? String(cell.fontWeight) : baseWeight)
        setColor(cell?.color ? resolveCellColor(cell.color) : textColor)
        ctx.fillText(char, x, y)
      }
    }

    ctx.restore()
  }

  // Clear the bitmap so a disposed animation doesn't leave its last frame on
  // a reused canvas.
  function dispose() {
    if (boundCanvas && boundCtx) {
      boundCtx.clearRect(0, 0, boundCanvas.width, boundCanvas.height)
    }
  }

  return { render, dispose }
}
