/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, test } from 'vitest'

import { FPSMeter } from '../src/fps.js'

describe('FPSMeter', () => {
  test('reports 0 until the first full window has elapsed', () => {
    const meter = new FPSMeter()
    expect(meter.update(500)).toBe(0)
    expect(meter.update(516)).toBe(0)
    expect(meter.fps).toBe(0)
  })

  test('measures the rate over a 1s window', () => {
    const meter = new FPSMeter()
    meter.update(500) // baseline
    for (let t = 600; t <= 1500; t += 100) meter.update(t)
    expect(meter.fps).toBe(10)
  })

  test('baselines against the first timestamp, not page uptime', () => {
    const meter = new FPSMeter()
    // First update on a long-lived page must not divide by total uptime.
    meter.update(100_000)
    for (let t = 100_050; t <= 101_000; t += 50) meter.update(t)
    expect(meter.fps).toBe(20)
  })

  test('starts a fresh window after reporting', () => {
    const meter = new FPSMeter()
    meter.update(500)
    for (let t = 600; t <= 1500; t += 100) meter.update(t)
    expect(meter.fps).toBe(10)
    // Second window at half the rate.
    for (let t = 1700; t <= 2500; t += 200) meter.update(t)
    expect(meter.fps).toBe(5)
  })
})
