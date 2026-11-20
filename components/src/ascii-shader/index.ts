/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
export { createAnimation, type AsciiAnimation, type AnimationEvent } from './animation'
export { createTextRenderer } from './renderers/text'
export { createCanvasRenderer } from './renderers/canvas'
export { calcMetrics, waitForFonts } from './metrics'
export { nextFrame, clampFrame } from './clock'
export { FPSMeter } from './fps'
export { resolveColor, clearResolvedColorCache, get2dContext } from './color'
export { getContent, getColoredRows, type ColoredSegment } from './buffer-text'
export {
  type Cell,
  type Context,
  type Cursor,
  type Metrics,
  type Program,
  type Renderer,
  type ResolvedSettings,
  type Settings,
} from './types'
