/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * Pure playback stepping logic, kept free of DOM/rAF concerns so it can be
 * unit tested. The engine renders a frame first and advances afterwards, so
 * `nextFrame` answers: after displaying `frame`, what comes next?
 */

/** Advance one frame within an optional loop of `frames` length. */
export function nextFrame(
  frame: number,
  frames: number | undefined,
  loop: boolean
): { frame: number; ended: boolean } {
  if (frames === undefined || frames <= 0) return { frame: frame + 1, ended: false }
  if (frame < frames - 1) return { frame: frame + 1, ended: false }
  return loop ? { frame: 0, ended: false } : { frame, ended: true }
}

/**
 * Normalize a seek target: floor it, and wrap into [0, frames) when a loop
 * length is set (so seek(-1) lands on the last frame), otherwise clamp at 0.
 */
export function clampFrame(frame: number, frames: number | undefined): number {
  const f = Math.floor(frame)
  if (frames === undefined || frames <= 0) return Math.max(0, f)
  return ((f % frames) + frames) % frames
}
