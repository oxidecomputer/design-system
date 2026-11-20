/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { get2dContext, resolveColor } from '../color'
import { invariant, type Cell, type Context, type Metrics, type Renderer } from '../types'

/**
 * Canvas renderer. Sizes the canvas to the grid (+ padding), renders on a
 * Display P3 context when available, and resolves CSS-variable colors to
 * concrete values (canvas fillStyle can't dereference them). The backing
 * store is sized at devicePixelRatio × settings.supersample.
 */
export function createCanvasRenderer(): Renderer {
  // Reallocate the bitmap only when the size or scale changes.
  let appliedWidth = 0
  let appliedHeight = 0
  let appliedScale = 0
  let boundCanvas: HTMLCanvasElement | null = null
  let boundCtx: CanvasRenderingContext2D | null = null
  // Baseline offset within a line, recomputed when the metrics change.
  let baselineFor: Metrics | null = null
  let baseline: number | null = null
  // One-entry cache: resolveColor scans strings, and same-colored runs are
  // the common case.
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
        `ascii-shader: invalid dimensions or metrics: ${context.cols} x ${context.rows}`,
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

    if (baselineFor !== m) {
      baselineFor = m
      ctx.font = `${baseWeight} ${m.fontSize}px ${m.fontFamily}`
      baseline = centeredBaseline(ctx, m.lineHeight)
    }
    // Same vertical placement as the DOM: the font box centered in the line.
    ctx.textBaseline = baseline === null ? 'middle' : 'alphabetic'
    const baselineY = baseline ?? m.lineHeight / 2

    // Touch fillStyle/font only when they change between cells.
    // Cell backgrounds snap to whole pixels on the x axis (rows already are),
    // so adjacent fills meet without hairline seams.
    const bgWidth = Math.ceil(m.cellWidth)

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
          ctx.fillRect(Math.round(x), y, bgWidth, m.lineHeight)
        }

        const char = cell?.char
        if (!char || char === ' ') continue

        setWeight(cell?.fontWeight != null ? String(cell.fontWeight) : baseWeight)
        setColor(cell?.color ? resolveCellColor(cell.color) : textColor)
        ctx.fillText(char, x, y + baselineY)
      }
    }

    ctx.restore()
  }

  // Don't leave the last frame on a reused canvas.
  function dispose() {
    if (boundCanvas && boundCtx) {
      boundCtx.clearRect(0, 0, boundCanvas.width, boundCanvas.height)
    }
  }

  return { render, dispose }
}

/**
 * Alphabetic baseline that centers the font's ascent + descent box in the
 * line, as CSS does; null where font bounding-box metrics are unsupported.
 */
function centeredBaseline(
  ctx: CanvasRenderingContext2D,
  lineHeight: number,
): number | null {
  const tm = ctx.measureText('X')
  const ascent = tm.fontBoundingBoxAscent
  const descent = tm.fontBoundingBoxDescent
  if (!(ascent >= 0 && descent >= 0)) return null
  return (lineHeight - ascent - descent) / 2 + ascent
}
