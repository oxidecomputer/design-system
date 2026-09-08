/*
 * This Source Code Form is subject to the terms of the Apache License,
 * v. 2.0. If a copy of the license was not distributed with this file, you can
 * obtain one at https://github.com/ertdfgcvb/play.core/blob/master/LICENSE.
 *
 * Modified from https://github.com/ertdfgcvb/play.core
 * Copyright ertdfgcvb (Andreas Gysin)
 */
import { getContent } from './buffer-text.js'
import { clampFrame, nextFrame } from './clock.js'
import { FPSMeter } from './fps.js'
import { calcMetrics, waitForFonts } from './metrics.js'
import { createCanvasRenderer } from './renderers/canvas.js'
import { createTextRenderer } from './renderers/text.js'
import type {
  Cell,
  Context,
  Cursor,
  Metrics,
  Program,
  Renderer,
  ResolvedSettings,
  Settings,
} from './types.js'

const defaultSettings = {
  fps: 30,
  loop: true,
  autoplay: true,
  reducedMotion: false,
}

const EMPTY_CELL = ' '

// A neutral cursor used when there is no pointer interaction
// (e.g. during automatic frame exports).
const EMPTY_CURSOR: Cursor = {
  x: 0,
  y: 0,
  pressed: false,
  p: { x: 0, y: 0, pressed: false },
}

// Keep the buffer allocation sane if a program computes wild dimensions.
const MAX_CELLS = 10_000_000

export type AnimationEvent = 'boot' | 'frame' | 'play' | 'pause' | 'ended'

export interface AsciiAnimation {
  /** Start playing. No-op while already playing. */
  play(): void
  /** Stop advancing frames. The current frame stays on screen. */
  pause(): void
  /** Toggle, or force a specific state with `playing`. */
  toggle(playing?: boolean): void
  /**
   * Jump to a frame and render it (works while paused — the render bypasses
   * the fps gate). Wraps into [0, frames) when a loop length is set.
   */
  seek(frame: number): void
  /** Seek relative to the current frame. */
  step(delta?: number): void
  /**
   * Render a frame synchronously (no requestAnimationFrame) so the buffer
   * can be read right after. No cursor is supplied — meant for exports,
   * snapshots, and headless sampling. Requires `ready` to have resolved.
   */
  renderFrame(frame: number): void
  readonly playing: boolean
  readonly frame: number
  /** Resolves after fonts are ready and the program has booted. */
  readonly ready: Promise<void>
  /**
   * Patch settings at runtime. fps/frames/loop/cols/rows/colors take effect
   * on the next render; undefined values are ignored.
   */
  updateSettings(patch: Partial<Omit<Settings, 'element' | 'renderer'>>): void
  /** Subscribe to an event; returns an unsubscribe function. */
  on(event: AnimationEvent, handler: (frame: number) => void): () => void
  getBuffer(): Cell[]
  getMetrics(): Metrics | null
  getSettings(): Readonly<ResolvedSettings>
  /** Replace the userData object passed to program functions from the next render. */
  setUserData(data: unknown): void
  /** The current buffer as newline-separated plain text. */
  text(): string
  /** Stop the loop, remove listeners, and release the renderer. */
  dispose(): void
}

/**
 * Program runner. Takes a program object (usually an imported module) and
 * settings (at minimum `element`). An optional userData object is passed as
 * the last parameter to all program functions — the supported place for
 * feeding external state into a program.
 *
 * Settings precedence: defaults < runSettings < program.settings.
 *
 * Frames are the unit of time: the frame counter advances once per rendered
 * frame (never while paused), so playback is deterministic and exportable.
 */
export function createAnimation(
  program: Program,
  runSettings: Settings,
  initialUserData: unknown = {}
): AsciiAnimation {
  let userData = initialUserData
  const element = runSettings.element
  if (!element) {
    throw new Error('ascii-shader: settings.element is required')
  }

  // Spreads copy explicitly-undefined keys (which would clobber the defaults —
  // e.g. `fps: undefined` making the frame interval NaN), so strip them first.
  const settings: ResolvedSettings = {
    ...defaultSettings,
    ...stripUndefined(runSettings),
    ...stripUndefined(program.settings),
    element,
  }

  const renderer = resolveRenderer(settings)
  const fpsMeter = new FPSMeter()

  let buffer: Cell[] = []
  let metrics: Metrics | null = null
  let cols = 0
  let rows = 0

  let disposed = false
  let playing = false
  let frame = 0
  let playTime = 0
  let interval = 1000 / settings.fps
  let lastTick = 0
  // Set when something other than normal playback needs a redraw (seek,
  // settings change). Renders bypass the fps gate but never advance the frame.
  let needsRender = false
  let rafId: number | null = null
  let warnedInvalidGrid = false

  const eventQueue: string[] = []
  const listeners = new Map<AnimationEvent, Set<(frame: number) => void>>()

  // -- Pointer ----------------------------------------------------------------

  // Raw client coordinates are stored here and translated to element-relative
  // ones in sampleCursor — one layout read per rendered frame at most, instead
  // of one per pointer event (input can fire far above the frame rate).
  const pointer = {
    x: 0,
    y: 0,
    clientX: 0,
    clientY: 0,
    moved: false,
    pressed: false,
    px: 0,
    py: 0,
    ppressed: false,
  }

  const handlePointerMove = (e: PointerEvent) => {
    pointer.clientX = e.clientX
    pointer.clientY = e.clientY
    pointer.moved = true
    // Coalesce: events queue up while paused, and multiple moves within one
    // frame would dispatch with the same sampled cursor anyway.
    if (eventQueue[eventQueue.length - 1] !== 'pointerMove') {
      eventQueue.push('pointerMove')
    }
  }
  const handlePointerDown = () => {
    pointer.pressed = true
    eventQueue.push('pointerDown')
  }
  // pointerup listens on the window so a press that ends outside the element
  // doesn't leave `pressed` stuck true.
  const handlePointerUp = () => {
    if (!pointer.pressed) return
    pointer.pressed = false
    eventQueue.push('pointerUp')
  }

  const pointerUpTarget: EventTarget = typeof window !== 'undefined' ? window : element

  element.addEventListener('pointermove', handlePointerMove)
  element.addEventListener('pointerdown', handlePointerDown)
  pointerUpTarget.addEventListener('pointerup', handlePointerUp)

  const removePointerListeners = () => {
    element.removeEventListener('pointermove', handlePointerMove)
    element.removeEventListener('pointerdown', handlePointerDown)
    pointerUpTarget.removeEventListener('pointerup', handlePointerUp)
  }

  // -- Boot -------------------------------------------------------------------

  element.style.fontStretch = 'normal'

  const ready = waitForFonts().then(() => {
    if (disposed) return
    metrics = calcMetrics(element, settings.fontWeight)
    const context = snapshot()
    normalizeBuffer(context)
    if (typeof program.boot === 'function') {
      program.boot(context, buffer, userData)
    }
    // Draw the first (possibly seeked) frame immediately so paused
    // animations still show something.
    needsRender = false
    render(EMPTY_CURSOR)
    emit('boot')
    emit('frame')
    if (playing) {
      // play() was called before boot completed; its rAF tick bailed at the
      // metrics guard without rescheduling, so restart the chain here.
      lastTick = performance.now()
      schedule()
    } else if (settings.autoplay) {
      play()
    }
  })

  // -- Loop -------------------------------------------------------------------

  function schedule() {
    if (rafId === null && !disposed) rafId = requestAnimationFrame(loop)
  }

  function unschedule() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function loop(t: number) {
    rafId = null
    if (disposed || !metrics) return

    const elapsed = t - lastTick
    const due = playing && elapsed >= interval

    if (!due && !needsRender) {
      if (playing) schedule()
      return
    }

    if (due) {
      lastTick = t - (elapsed % interval) // keep the beat, absorb drift

      const next = nextFrame(frame, settings.frames, settings.loop)
      if (next.ended) {
        playing = false
        emit('pause')
        emit('ended')
        // Fall through only for a pending seek render; time/fps stay
        // untouched since no frame advanced on this tick.
        if (!needsRender) return
      } else {
        // Accumulate only the beat time this tick consumed — the remainder
        // stays in lastTick and is counted by the next tick, so including it
        // here would double-count it. The cap keeps a backgrounded tab from
        // producing a giant jump on return.
        playTime += Math.min(elapsed - (elapsed % interval), 1000)
        fpsMeter.update(t)
        frame = next.frame
      }
    }

    needsRender = false
    render(sampleCursor())
    emit('frame')

    if (playing) schedule()
  }

  function sampleCursor(): Cursor {
    const m = metrics!
    if (pointer.moved) {
      const rect = element.getBoundingClientRect()
      pointer.x = pointer.clientX - rect.left
      pointer.y = pointer.clientY - rect.top
      pointer.moved = false
    }
    const cursor = {
      x: pointer.x / m.cellWidth,
      y: pointer.y / m.lineHeight,
      pressed: pointer.pressed,
      p: {
        x: pointer.px / m.cellWidth,
        y: pointer.py / m.lineHeight,
        pressed: pointer.ppressed,
      },
    }
    pointer.px = pointer.x
    pointer.py = pointer.y
    pointer.ppressed = pointer.pressed
    return cursor
  }

  // -- Rendering --------------------------------------------------------------

  // Build the frozen per-frame context. The element is only measured when the
  // grid isn't fully pinned by settings.
  function snapshot(): Context {
    const m = metrics!
    let width: number
    let height: number
    let c: number
    let r: number

    if (settings.cols && settings.rows) {
      c = settings.cols
      r = settings.rows
      width = c * m.cellWidth
      height = r * m.lineHeight
    } else {
      const rect = element.getBoundingClientRect()
      // The canvas renderer sizes its element to the grid *plus* padding;
      // subtract it when measuring, or the derived grid grows by a cell each
      // frame once the padding exceeds a cell.
      const pad = element.nodeName === 'CANVAS' ? 2 * (settings.padding || 0) : 0
      c = settings.cols || Math.floor((rect.width - pad) / m.cellWidth)
      r = settings.rows || Math.floor((rect.height - pad) / m.lineHeight)
      width = rect.width
      height = rect.height
    }

    // Clamp bad grids (hidden elements measure 0, programs can request wild
    // dimensions) so nothing downstream sees non-finite or unallocatable
    // values.
    if (!(c > 0 && isFinite(c)) || !(r > 0 && isFinite(r)) || c * r > MAX_CELLS) {
      if (!warnedInvalidGrid) {
        console.error(`ascii-shader: invalid buffer dimensions: ${c} x ${r}`)
        warnedInvalidGrid = true
      }
      if (!(c > 0 && isFinite(c))) c = 1
      if (!(r > 0 && isFinite(r))) r = 1
      if (c > MAX_CELLS) c = MAX_CELLS
      if (c * r > MAX_CELLS) r = Math.max(1, Math.floor(MAX_CELLS / c))
    }
    c = Math.floor(c)
    r = Math.floor(r)

    return Object.freeze({
      frame,
      time: playTime,
      cols: c,
      rows: r,
      metrics: m,
      width,
      height,
      settings,
      runtime: Object.freeze({ fps: fpsMeter.fps }),
    })
  }

  // (Re)allocate the cell buffer when the grid size changes.
  function normalizeBuffer(context: Context) {
    if (cols === context.cols && rows === context.rows && buffer.length > 0) return

    cols = context.cols
    rows = context.rows

    // snapshot() guarantees 0 < cols * rows <= MAX_CELLS.
    const length = cols * rows
    buffer.length = length
    for (let i = 0; i < length; i++) {
      buffer[i] = { char: EMPTY_CELL }
    }
  }

  // Run pre()/main()/post() over the buffer and hand it to the renderer.
  function render(cursor: Cursor) {
    const context = snapshot()
    normalizeBuffer(context)

    if (typeof program.pre === 'function') {
      program.pre(context, cursor, buffer, userData)
    }

    if (typeof program.main === 'function') {
      for (let j = 0; j < context.rows; j++) {
        const offs = j * context.cols
        for (let i = 0; i < context.cols; i++) {
          const idx = i + offs
          const cell = buffer[idx]
          const out = program.main(
            { x: i, y: j, index: idx },
            context,
            cursor,
            buffer,
            userData
          )
          // Merge in place: cells are cloned by renderers where needed, and
          // this avoids two object allocations per cell per frame.
          if (typeof out === 'object' && out !== null) {
            Object.assign(cell, out)
          } else {
            cell.char = out as string
          }
          if (!cell.char) cell.char = EMPTY_CELL
        }
      }
    }

    if (typeof program.post === 'function') {
      program.post(context, cursor, buffer, userData)
    }

    renderer.render(context, buffer)

    // Queued pointer events, dispatched to same-named program functions
    while (eventQueue.length > 0) {
      const type = eventQueue.shift()
      if (type && typeof program[type] === 'function') {
        program[type](context, cursor, buffer, userData)
      }
    }
  }

  // -- Playback control -------------------------------------------------------

  function play() {
    if (playing || disposed) return
    playing = true
    // Re-baseline the beat so the first advance happens one interval from
    // now (the current frame is already on screen), and a long pause doesn't
    // count as elapsed time.
    lastTick = performance.now()
    schedule()
    emit('play')
  }

  function pause() {
    if (!playing) return
    playing = false
    emit('pause')
    // Any in-flight rAF self-terminates: advancing requires `playing`.
  }

  function toggle(force?: boolean) {
    const target = force ?? !playing
    if (target) play()
    else pause()
  }

  function seek(target: number) {
    frame = clampFrame(target, settings.frames)
    needsRender = true
    // Re-baseline the beat while playing so a due tick doesn't advance past
    // the seeked frame before it ever renders.
    if (playing) lastTick = performance.now()
    if (metrics) schedule()
    // Before boot the seeked frame is retained and rendered by boot.
  }

  function step(delta = 1) {
    seek(frame + delta)
  }

  function renderFrame(target: number) {
    if (!metrics) return
    frame = clampFrame(target, settings.frames)
    render(EMPTY_CURSOR)
  }

  function updateSettings(patch: Partial<Omit<Settings, 'element' | 'renderer'>>) {
    for (const [key, value] of Object.entries(patch)) {
      if (value !== undefined) {
        ;(settings as unknown as Record<string, unknown>)[key] = value
      }
    }
    interval = 1000 / settings.fps
    if (settings.frames !== undefined) {
      frame = clampFrame(frame, settings.frames)
    }
    needsRender = true
    if (metrics) schedule()
  }

  // -- Events -----------------------------------------------------------------

  function emit(event: AnimationEvent) {
    const handlers = listeners.get(event)
    if (!handlers) return
    for (const handler of handlers) handler(frame)
  }

  function on(event: AnimationEvent, handler: (frame: number) => void) {
    let handlers = listeners.get(event)
    if (!handlers) {
      handlers = new Set()
      listeners.set(event, handlers)
    }
    handlers.add(handler)
    return () => {
      handlers.delete(handler)
    }
  }

  // -- Teardown ---------------------------------------------------------------

  function dispose() {
    if (disposed) return
    disposed = true
    playing = false
    unschedule()
    removePointerListeners()
    renderer.dispose?.()
    if (typeof program.cleanup === 'function') {
      program.cleanup()
    }
    buffer = []
    listeners.clear()
  }

  return {
    play,
    pause,
    toggle,
    seek,
    step,
    renderFrame,
    get playing() {
      return playing
    },
    get frame() {
      return frame
    },
    ready,
    updateSettings,
    on,
    getBuffer: () => buffer,
    getMetrics: () => metrics,
    getSettings: () => settings,
    setUserData: (data: unknown) => {
      userData = data
    },
    text: () => getContent(buffer, cols, rows),
    dispose,
  }
}

function resolveRenderer(settings: ResolvedSettings): Renderer {
  const r = settings.renderer
  if (r && typeof r === 'object') return r
  const kind = r ?? (settings.element.nodeName === 'CANVAS' ? 'canvas' : 'text')
  // Validate here so a mismatch throws at the call site instead of surfacing
  // as an unhandled rejection of `ready` during the boot render.
  if (kind === 'canvas' && settings.element.nodeName !== 'CANVAS') {
    throw new Error('ascii-shader: renderer "canvas" requires a <canvas> element')
  }
  return kind === 'canvas' ? createCanvasRenderer() : createTextRenderer()
}

function stripUndefined<T extends object>(obj: T | undefined): Partial<T> {
  const out: Record<string, unknown> = {}
  if (obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) out[key] = value
    }
  }
  return out as Partial<T>
}
