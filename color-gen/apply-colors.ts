/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * Generates colours from the palette config and writes them to both
 * color-gen.css and tokens.json in a single step.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

import { backgrounds, buildCSS, generateColor, palette } from './lib'

const dir = import.meta.dirname!

// ---------------------------------------------------------------------------
// 1. Generate
// ---------------------------------------------------------------------------

const comparisonBg = backgrounds.dark
const generated = palette.colors.map((c) => generateColor(c, palette, comparisonBg))
const css = buildCSS(generated)
const cssPath = resolve(dir, 'color-gen.css')
writeFileSync(cssPath, css, 'utf-8')
console.log(`Written CSS to ${cssPath}`)

// ---------------------------------------------------------------------------
// 2. Apply to tokens.json
// ---------------------------------------------------------------------------

const tokensPath = resolve(dir, '..', 'styles', 'src', 'tokens.json')

// Parse CSS custom properties: --color-{name}-{step}: {value};
const varPattern = /--color-(\w+)-(\d+):\s*([^;]+);/g

const updates = new Map<string, Map<string, string>>()
for (const match of css.matchAll(varPattern)) {
  const [, name, step, value] = match
  if (!updates.has(name)) updates.set(name, new Map())
  updates.get(name)!.set(step, value.trim())
}

if (updates.size === 0) {
  console.error('No colour variables found in generated CSS')
  process.exit(1)
}

// Load and update tokens.json
const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'))
const base = tokens.colors?.base

if (!base) {
  console.error('Could not find colors.base in tokens.json')
  process.exit(1)
}

let changed = 0
for (const [name, steps] of updates) {
  if (!base[name]) {
    console.warn(`Skipping unknown colour "${name}" — not found in tokens.json`)
    continue
  }
  for (const [step, value] of steps) {
    if (!base[name][step]) {
      base[name][step] = { value, type: 'color' }
      console.log(`  ${name}.${step}: (new) ${value}`)
      changed++
      continue
    }
    const old = base[name][step].value
    if (old !== value) {
      base[name][step].value = value
      console.log(`  ${name}.${step}: ${old} -> ${value}`)
      changed++
    }
  }
}

if (changed === 0) {
  console.log('No changes — tokens.json already matches generated colours')
} else {
  writeFileSync(tokensPath, JSON.stringify(tokens, null, 2) + '\n', 'utf-8')
  console.log(`\nUpdated ${changed} colour(s) in tokens.json`)
}
