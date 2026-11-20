/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
export { createAnimation, type AsciiAnimation, type AnimationEvent } from './animation.js'
export { createTextRenderer } from './renderers/text.js'
export { createCanvasRenderer } from './renderers/canvas.js'
export { calcMetrics, waitForFonts } from './metrics.js'
export { nextFrame, clampFrame } from './clock.js'
export { FPSMeter } from './fps.js'
export { resolveColor, clearResolvedColorCache, get2dContext } from './color.js'
export { getContent, getColoredRows, type ColoredSegment } from './buffer-text.js'
export {
  type Cell,
  type Context,
  type Cursor,
  type Metrics,
  type Program,
  type Renderer,
  type ResolvedSettings,
  type Settings,
} from './types.js'
