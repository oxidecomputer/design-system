/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export interface Cell {
  char: string
  color?: string
  backgroundColor?: string
  fontWeight?: string | number
}

export interface Metrics {
  aspect: number
  cellWidth: number
  lineHeight: number
  fontFamily: string
  fontSize: number
}

/** Pointer state in cell coordinates. `p` is the previous frame. */
export interface Cursor {
  x: number
  y: number
  pressed: boolean
  p: {
    x: number
    y: number
    pressed: boolean
  }
}

export interface Settings {
  /** Target: <pre> (text renderer) or <canvas> (canvas renderer). */
  element: HTMLElement
  /** Omit to derive from the element's width. */
  cols?: number
  /** Omit to derive from the element's height. */
  rows?: number
  /** Default 30. `0` (or less) is uncapped: a frame every rAF tick. */
  fps?: number
  /** Loop length in frames. Omit for endless. */
  frames?: number
  /** When `frames` is set: wrap to 0 (default) or stop and emit `'ended'`. */
  loop?: boolean
  /** Play once fonts are ready and `boot` has run. Default true. */
  autoplay?: boolean
  /** `'text'` | `'canvas'` | custom. Default: inferred from the element. */
  renderer?: 'text' | 'canvas' | Renderer
  color?: string
  /** Omit for transparent (canvas) / inherited (text). */
  backgroundColor?: string
  fontWeight?: string | number
  /** CSS pixels around the grid. Canvas renderer only. */
  padding?: number
  /** Extra backing-store scale above devicePixelRatio. Canvas only. Default 1. */
  supersample?: number
  /** On `context.settings` for programs to branch on. Default false. */
  reducedMotion?: boolean
}

export type ResolvedSettings = Settings & {
  fps: number
  loop: boolean
  autoplay: boolean
  reducedMotion: boolean
}

/** Frozen per-frame snapshot passed to every program function. */
export interface Context {
  /** Prefer this over `time` for animation. Advances once per rendered frame. */
  frame: number
  /** Accumulated play time in ms. Does not advance while paused. */
  time: number
  cols: number
  rows: number
  metrics: Metrics
  width: number
  height: number
  settings: ResolvedSettings
  runtime: {
    /** Measured render rate; may sit below `settings.fps` under load. */
    fps: number
  }
}

/**
 * `main` runs once per cell per frame; its return replaces the cell's content
 * (a string sets `char` and clears any style from earlier frames).
 *
 * `userData` is `any` on purpose: programs declare their own shape, and
 * `unknown` would force a cast in every hook.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Program {
  settings?: Partial<Omit<Settings, 'element' | 'renderer'>>
  boot?: (context: Context, buffer: Cell[], userData: any) => void
  pre?: (context: Context, cursor: Cursor, buffer: Cell[], userData: any) => void
  main?: (
    pos: { x: number; y: number; index: number },
    context: Context,
    cursor: Cursor,
    buffer: Cell[],
    userData: any,
  ) => Cell | string | undefined
  post?: (context: Context, cursor: Cursor, buffer: Cell[], userData: any) => void
  cleanup?: () => void
  /** pointerMove / pointerDown / pointerUp (also on pointercancel). */
  [key: string]: any
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface Renderer {
  render(context: Context, buffer: Cell[]): void
  dispose?(): void
}

export function invariant(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    throw Error(msg)
  }
}
