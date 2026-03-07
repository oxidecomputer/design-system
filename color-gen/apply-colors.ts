/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * Generates colours from the palette config and applies them directly
 * to the CSS files in styles/.
 *
 * - Updates the --color-* variables in main.css
 * - Writes minimal accent override files ({color}.css)
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

import {
  backgrounds,
  generateColor,
  generateNeutral,
  neutralPalette,
  palette,
  STEPS,
} from './lib'

const stylesDir = resolve(import.meta.dirname!, '..', 'styles')

// ---------------------------------------------------------------------------
// 1. Generate colours
// ---------------------------------------------------------------------------

const comparisonBg = backgrounds.dark
const generated = palette.colors.map((c) => generateColor(c, palette, comparisonBg))
generated.push(generateNeutral(neutralPalette, comparisonBg))

// ---------------------------------------------------------------------------
// 2. Update --color-* vars in main.css
// ---------------------------------------------------------------------------

const mainCssPath = resolve(stylesDir, 'main.css')
let mainCss = readFileSync(mainCssPath, 'utf-8')

const colorVarMap = new Map<string, string>()
for (const color of generated) {
  for (const step of color.steps) {
    colorVarMap.set(`--color-${color.name}-${step.step}`, step.oklch)
  }
}

let updated = 0
mainCss = mainCss.replace(
  /^([ \t]*)(--color-\w+-\d+):\s*[^;]+;/gm,
  (_match, indent, varName) => {
    const newValue = colorVarMap.get(varName)
    if (newValue) {
      updated++
      return `${indent}${varName}: ${newValue};`
    }
    return _match
  },
)

writeFileSync(mainCssPath, mainCss, 'utf-8')
console.log(`Updated ${updated} colour variable(s) in main.css`)

// ---------------------------------------------------------------------------
// 3. Write accent override CSS files
// ---------------------------------------------------------------------------

for (const { name } of palette.colors) {
  const vars = STEPS.map(
    (step) => `  --theme-accent-${step}: var(--color-${name}-${step});`,
  ).join('\n')

  const filePath = resolve(stylesDir, `${name}.css`)
  writeFileSync(filePath, `.${name}-theme {\n${vars}\n}\n`, 'utf-8')
  console.log(`Written ${filePath}`)
}
