/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * Reads color-gen.css and applies matching colour values into tokens.json.
 *
 * CSS vars like `--color-green-800: oklch(...)` are matched to
 * `colors.base.green.800.value` in tokens.json.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const dir = import.meta.dirname!
const cssPath = resolve(dir, 'color-gen.css')
const tokensPath = resolve(dir, '..', 'styles', 'src', 'tokens.json')

// Parse CSS custom properties: --color-{name}-{step}: {value};
const css = readFileSync(cssPath, 'utf-8')
const varPattern = /--color-(\w+)-(\d+):\s*([^;]+);/g

const updates = new Map<string, Map<string, string>>()
for (const match of css.matchAll(varPattern)) {
  const [, name, step, value] = match
  if (!updates.has(name)) updates.set(name, new Map())
  updates.get(name)!.set(step, value.trim())
}

if (updates.size === 0) {
  console.error('No colour variables found in color-gen.css')
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
      console.warn(`Skipping ${name}.${step} — not found in tokens.json`)
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
  console.log('No changes — tokens.json already matches color-gen.css')
} else {
  writeFileSync(tokensPath, JSON.stringify(tokens, null, 2) + '\n', 'utf-8')
  console.log(`\nUpdated ${changed} colour(s) in tokens.json`)
}
