/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, test } from 'vitest'

import { getColoredRows, getContent } from '../src/buffer-text.js'
import type { Cell } from '../src/types.js'

const cells = (chars: string, color?: string): Cell[] =>
  chars.split('').map((char) => (color ? { char, color } : { char }))

describe('getContent', () => {
  test('lays the buffer out as a cols × rows grid', () => {
    const buffer = cells('abcdef')
    expect(getContent(buffer, 3, 2)).toBe('abc\ndef')
  })

  test('pads missing and empty cells with spaces', () => {
    const buffer: Cell[] = [{ char: 'a' }, { char: '' }]
    expect(getContent(buffer, 2, 2)).toBe('a \n  ')
  })
})

describe('getColoredRows', () => {
  test('groups runs of same-colored cells per row', () => {
    const buffer = [...cells('ab', 'red'), ...cells('cd', 'blue')]
    expect(getColoredRows(buffer, 4, 1, 'black')).toEqual([
      [
        { text: 'ab', color: 'red' },
        { text: 'cd', color: 'blue' },
      ],
    ])
  })

  test('uses the default color for cells without one and pads short rows', () => {
    const buffer: Cell[] = [{ char: 'x' }]
    expect(getColoredRows(buffer, 3, 1, 'green')).toEqual([
      [{ text: 'x  ', color: 'green' }],
    ])
  })
})
