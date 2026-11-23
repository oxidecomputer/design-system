/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Cell } from './types'

/**
 * Format a flat cell buffer into newline-separated text laid out as a
 * `cols` × `rows` grid. Empty cells render as a single space, so every line
 * is exactly `cols` characters wide (including trailing spaces).
 */
export const getContent = (buffer: Cell[], cols: number, rows: number): string => {
  const lines: string[] = []
  for (let j = 0; j < rows; j++) {
    let line = ''
    for (let i = 0; i < cols; i++) {
      line += buffer[j * cols + i]?.char || ' '
    }
    lines.push(line)
  }
  return lines.join('\n')
}

/** A run of same-colored characters within a single row. */
export interface ColoredSegment {
  text: string
  color: string
}

/**
 * Group a flat cell buffer into per-row runs of same-colored text (e.g. for
 * SVG export). Cells without a color get `defaultColor`; rows are padded to
 * `cols` with spaces, matching `getContent`.
 */
export const getColoredRows = (
  buffer: Cell[],
  cols: number,
  rows: number,
  defaultColor: string,
): ColoredSegment[][] => {
  const result: ColoredSegment[][] = []

  for (let r = 0; r < rows; r++) {
    const segments: ColoredSegment[] = []

    for (let c = 0; c < cols; c++) {
      const cell = buffer[r * cols + c]
      const char = cell?.char || ' '
      const color = cell?.color || defaultColor

      const last = segments[segments.length - 1]
      if (last && last.color === color) last.text += char
      else segments.push({ text: char, color })
    }

    result.push(segments)
  }

  return result
}
