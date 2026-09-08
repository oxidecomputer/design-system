/*
 * This Source Code Form is subject to the terms of the Apache License,
 * v. 2.0. If a copy of the license was not distributed with this file, you can
 * obtain one at https://github.com/ertdfgcvb/play.core/blob/master/LICENSE.
 *
 * Modified from https://github.com/ertdfgcvb/play.core
 * Copyright ertdfgcvb (Andreas Gysin)
 */

/** Measures the actual render rate over 1s windows. */
export class FPSMeter {
  private frames = 0
  private ptime = 0
  fps = 0

  update(time: number): number {
    if (this.ptime === 0) {
      // Baseline here; measuring from 0 would divide by total page uptime.
      this.ptime = time
      return this.fps
    }
    this.frames++
    if (time >= this.ptime + 1000) {
      this.fps = (this.frames * 1000) / (time - this.ptime)
      this.ptime = time
      this.frames = 0
    }
    return this.fps
  }
}
