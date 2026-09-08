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

// No pointer (used by renderFrame / export).
const EMPTY_CURSOR: Cursor = {
  x: 0,
  y: 0,
  pressed: false,
  p: { x: 0, y: 0, pressed: false },
}

const MAX_CELLS = 10_000_000

export type AnimationEvent = 'boot' | 'frame' | 'play' | 'pause' | 'ended'

export interface AsciiAnimation {
  /** No-op if already playing. */
  play(): void
  /** Stop advancing. Current frame stays on screen. */
  pause(): void
  /** Toggle, or force a state with `playing`. */
  toggle(playing?: boolean): void
  /**
   * Jump to a frame and render it, including while paused. Wraps into
   * [0, frames) when a loop length is set.
   */
  seek(frame: number): void
  /** Seek relative to the current frame. */
  step(delta?: number): void
  /**
   * Render a frame synchronously with no cursor. For export; requires `ready`.
   */
  renderFrame(frame: number): void
  readonly playing: boolean
  readonly frame: number
  /** Resolves after fonts are ready and `boot` has run. */
  readonly ready: Promise<void>
  /**
   * Patch settings at runtime. fps/frames/loop/cols/rows/colors take effect
   * on the next render; undefined values are ignored.
   */
  updateSettings(patch: Partial<Omit<Settings, 'element' | 'renderer'>>): void
  /** Subscribe; returns unsubscribe. */
  on(event: AnimationEvent, handler: (frame: number) => void): () => void
  getBuffer(): Cell[]
  getMetrics(): Metrics | null
  getSettings(): Readonly<ResolvedSettings>
  /** Replace the userData passed to program hooks from the next render. */
  setUserData(data: unknown): void
  /** Current buffer as newline-separated plain text. */
  text(): string
  /** Cancel the loop, remove listeners, release the renderer. */
  dispose(): void
}

/**
 * Run `program` against `settings.element`. `userData` is passed to every
 * program hook (the place for per-instance state).
 *
 * Settings precedence: defaults < runSettings < program.settings.
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

  // `{...{fps: undefined}}` would clobber the default and make the interval NaN.
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
  // Seek / settings change: render without advancing the frame.
  let needsRender = false
  let rafId: number | null = null
  let warnedInvalidGrid = false

  const eventQueue: string[] = []
  const listeners = new Map<AnimationEvent, Set<(frame: number) => void>>()

  // Client coords; converted to element-relative in sampleCursor (at most one
  // layout read per frame, not per event).
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
    // Coalesce moves: same sampled cursor within a frame.
    if (eventQueue[eventQueue.length - 1] !== 'pointerMove') {
      eventQueue.push('pointerMove')
    }
  }
  const handlePointerDown = () => {
    pointer.pressed = true
    eventQueue.push('pointerDown')
  }
  // Window, not element: a press ending outside would leave pressed stuck.
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

  element.style.fontStretch = 'normal'

  const ready = waitForFonts().then(() => {
    if (disposed) return
    metrics = calcMetrics(element, settings.fontWeight)
    const context = snapshot()
    normalizeBuffer(context)
    if (typeof program.boot === 'function') {
      program.boot(context, buffer, userData)
    }
    // First frame now, so paused / autoplay:false mounts still show frame 0.
    needsRender = false
    render(EMPTY_CURSOR)
    emit('boot')
    emit('frame')
    if (playing) {
      // play() before boot: its rAF tick bailed at the metrics guard without
      // rescheduling.
      lastTick = performance.now()
      schedule()
    } else if (settings.autoplay) {
      play()
    }
  })

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
        // Fall through only for a pending seek render; no frame advanced.
        if (!needsRender) return
      } else {
        // Beat time only (not elapsed % interval, which lastTick already kept).
        // Cap 1s so a backgrounded tab doesn't jump.
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

  // Measure the element only when cols/rows aren't both pinned.
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
      // Canvas is sized to grid + padding; subtract it or the derived grid
      // grows by a cell each frame once padding exceeds a cell.
      const pad = element.nodeName === 'CANVAS' ? 2 * (settings.padding || 0) : 0
      c = settings.cols || Math.floor((rect.width - pad) / m.cellWidth)
      r = settings.rows || Math.floor((rect.height - pad) / m.lineHeight)
      width = rect.width
      height = rect.height
    }

    // Hidden elements measure 0; programs can request huge grids.
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
          // In-place merge; renderers clone if they need a snapshot.
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

    while (eventQueue.length > 0) {
      const type = eventQueue.shift()
      if (type && typeof program[type] === 'function') {
        program[type](context, cursor, buffer, userData)
      }
    }
  }

  function play() {
    if (playing || disposed) return
    playing = true
    // Re-baseline: current frame is already on screen; don't count paused time.
    lastTick = performance.now()
    schedule()
    emit('play')
  }

  function pause() {
    if (!playing) return
    playing = false
    emit('pause')
    // In-flight rAF self-terminates: advancing requires `playing`.
  }

  function toggle(force?: boolean) {
    const target = force ?? !playing
    if (target) play()
    else pause()
  }

  function seek(target: number) {
    frame = clampFrame(target, settings.frames)
    needsRender = true
    // Re-baseline while playing so a due tick doesn't skip the seeked frame.
    if (playing) lastTick = performance.now()
    if (metrics) schedule()
    // If still booting, boot renders this frame.
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
  // Throw at the call site, not as an unhandled rejection of `ready`.
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
