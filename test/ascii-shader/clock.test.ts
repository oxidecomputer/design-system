/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, test } from 'vitest'

import { clampFrame, nextFrame } from '../../components/src/ascii-shader/clock'

describe('nextFrame', () => {
  test('advances endlessly when no loop length is set', () => {
    expect(nextFrame(0, undefined, true)).toEqual({ frame: 1, ended: false })
    expect(nextFrame(999, undefined, false)).toEqual({ frame: 1000, ended: false })
  })

  test('wraps at the loop boundary when looping', () => {
    expect(nextFrame(98, 100, true)).toEqual({ frame: 99, ended: false })
    expect(nextFrame(99, 100, true)).toEqual({ frame: 0, ended: false })
  })

  test('ends on the last frame when not looping', () => {
    expect(nextFrame(98, 100, false)).toEqual({ frame: 99, ended: false })
    expect(nextFrame(99, 100, false)).toEqual({ frame: 99, ended: true })
  })

  test('treats a non-positive loop length as endless', () => {
    expect(nextFrame(5, 0, false)).toEqual({ frame: 6, ended: false })
  })

  test('a single-frame loop stays on frame 0', () => {
    expect(nextFrame(0, 1, true)).toEqual({ frame: 0, ended: false })
    expect(nextFrame(0, 1, false)).toEqual({ frame: 0, ended: true })
  })
})

describe('clampFrame', () => {
  test('wraps into [0, frames) when a loop length is set', () => {
    expect(clampFrame(0, 100)).toBe(0)
    expect(clampFrame(100, 100)).toBe(0)
    expect(clampFrame(150, 100)).toBe(50)
    expect(clampFrame(-1, 100)).toBe(99)
  })

  test('clamps at 0 when endless', () => {
    expect(clampFrame(-5, undefined)).toBe(0)
    expect(clampFrame(42, undefined)).toBe(42)
  })

  test('floors fractional frames', () => {
    expect(clampFrame(1.9, 100)).toBe(1)
    expect(clampFrame(2.5, undefined)).toBe(2)
  })
})
