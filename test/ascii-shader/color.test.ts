// @vitest-environment jsdom
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { afterEach, describe, expect, test } from 'vitest'

import { clearResolvedColorCache, cssColorValue, resolveColor } from '../src/color.js'

afterEach(() => {
  clearResolvedColorCache()
})

describe('cssColorValue', () => {
  test('wraps bare custom property names in var()', () => {
    expect(cssColorValue('--accent')).toBe('var(--accent)')
    expect(cssColorValue('  --accent  ')).toBe('var(--accent)')
  })

  test('passes plain colors through (trimmed)', () => {
    expect(cssColorValue('red')).toBe('red')
    expect(cssColorValue(' #48d597 ')).toBe('#48d597')
    expect(cssColorValue('var(--x)')).toBe('var(--x)')
  })
})

describe('resolveColor', () => {
  test('returns plain colors untouched without probing the DOM', () => {
    expect(resolveColor('red')).toBe('red')
    expect(resolveColor('#48d597')).toBe('#48d597')
    expect(resolveColor('oklch(0.7 0.1 160)')).toBe('oklch(0.7 0.1 160)')
  })

  test('returns falsy input as-is', () => {
    expect(resolveColor('')).toBe('')
  })

  test('normalizes a bare custom property to its var() form when unresolvable', () => {
    // jsdom computes no styles for the probe, so resolution fails — the
    // contract is that unresolvable values come back in usable var() form.
    expect(resolveColor('--does-not-exist')).toBe('var(--does-not-exist)')
  })

  test('does not leave probe elements in the document', () => {
    resolveColor('var(--probe-cleanup-check)')
    expect(document.querySelectorAll('span').length).toBe(0)
  })
})
