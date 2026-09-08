/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/** A single character cell in the grid. */
export interface Cell {
  char: string
  color?: string
  backgroundColor?: string
  fontWeight?: string | number
}

/** Measured font metrics for the target element's monospaced font. */
export interface Metrics {
  aspect: number
  cellWidth: number
  lineHeight: number
  fontFamily: string
  fontSize: number
}

/** Pointer state in cell coordinates, with the previous frame's state in `p`. */
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
  /** Target element: a <pre> (text renderer) or <canvas> (canvas renderer). */
  element: HTMLElement
  /** Grid columns. Omit to derive from the element's width. */
  cols?: number
  /** Grid rows. Omit to derive from the element's height. */
  rows?: number
  /** Target frames per second. Default 30. */
  fps?: number
  /** Loop length in frames. Omit for an endless animation. */
  frames?: number
  /** When `frames` is set: wrap back to 0 (true, default) or stop ('ended'). */
  loop?: boolean
  /** Start playing once fonts are ready and the program has booted. Default true. */
  autoplay?: boolean
  /** 'text' | 'canvas' | custom Renderer. Default: inferred from the element. */
  renderer?: 'text' | 'canvas' | Renderer
  /** Default text color. Cells without an explicit color use this. */
  color?: string
  /** Background color. Omit for transparent (canvas) / inherited (text). */
  backgroundColor?: string
  /** Default font weight. */
  fontWeight?: string | number
  /** Padding in CSS pixels around the grid (canvas renderer only). */
  padding?: number
  /** Extra backing-store resolution above devicePixelRatio (canvas only). Default 1. */
  supersample?: number
  /** Exposed on context.settings for programs to branch on. Default false. */
  reducedMotion?: boolean
}

/** Settings after defaults have been applied. */
export type ResolvedSettings = Settings & {
  fps: number
  loop: boolean
  autoplay: boolean
  reducedMotion: boolean
}

/** Per-frame snapshot passed to every program function. Frozen. */
export interface Context {
  /** Current frame index. Deterministic — prefer this over `time` for animation. */
  frame: number
  /** Accumulated play time in ms. Pauses while paused. */
  time: number
  cols: number
  rows: number
  metrics: Metrics
  width: number
  height: number
  settings: ResolvedSettings
  runtime: {
    /** Measured render rate (may be below settings.fps under load). */
    fps: number
  }
}

/**
 * A program is a plain object (usually an imported module) with optional
 * lifecycle functions. `main` runs once per cell per frame; its return value
 * is merged into the cell (a string sets `char`).
 *
 * `userData` is deliberately `any` (not `unknown`): programs declare their own
 * userData shape and `unknown` would force a cast in every hook.
 */
/* oxlint-disable typescript/no-explicit-any */
export interface Program {
  settings?: Partial<Omit<Settings, 'element' | 'renderer'>>
  boot?: (context: Context, buffer: Cell[], userData: any) => void
  pre?: (context: Context, cursor: Cursor, buffer: Cell[], userData: any) => void
  main?: (
    pos: { x: number; y: number; index: number },
    context: Context,
    cursor: Cursor,
    buffer: Cell[],
    userData: any
  ) => Cell | string | undefined
  post?: (context: Context, cursor: Cursor, buffer: Cell[], userData: any) => void
  cleanup?: () => void
  /** Pointer event handlers: pointerMove, pointerDown, pointerUp. */
  [key: string]: any
}
/* oxlint-enable typescript/no-explicit-any */

/** Draws the cell buffer to the target element. */
export interface Renderer {
  render(context: Context, buffer: Cell[]): void
  dispose?(): void
}

export function invariant(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    throw Error(msg)
  }
}
