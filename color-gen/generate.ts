/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { writeFileSync } from 'fs'
import { resolve } from 'path'

import { backgrounds, buildCSS, generateColor, palette } from './lib'

const comparisonBg = backgrounds.dark
const generated = palette.colors.map((c) => generateColor(c, palette, comparisonBg))
const css = buildCSS(generated)
const cssPath = resolve(import.meta.dirname!, 'color-gen.css')
writeFileSync(cssPath, css, 'utf-8')
console.log(`Written to ${cssPath}`)
