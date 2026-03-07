import { colorsMatch, parseColor, rgbToHex } from './oklch'
import type { DiffEntry, DiffResult, FlatToken } from './types'

/**
 * Compare file tokens against Figma tokens.
 * - "added": in file, not in Figma
 * - "removed": in Figma, not in file
 * - "modified": in both, but values differ
 * - "unchanged": in both, values match
 */
export function compareTokens(
  fileTokens: Map<string, FlatToken>,
  figmaTokens: Map<string, FlatToken>,
): DiffResult {
  const entries: DiffEntry[] = []

  // Check all file tokens against Figma
  for (const [key, fileToken] of fileTokens) {
    const figmaToken = figmaTokens.get(key)

    if (!figmaToken) {
      entries.push({
        name: fileToken.name,
        type: fileToken.type,
        status: 'added',
        fileValue: formatValue(fileToken),
        fileRawValue: rawColorValue(fileToken),
        mode: fileToken.mode,
      })
      continue
    }

    // Both exist — compare values
    const match = valuesMatch(fileToken, figmaToken)
    entries.push({
      name: fileToken.name,
      type: fileToken.type,
      status: match ? 'unchanged' : 'modified',
      fileValue: formatValue(fileToken),
      fileRawValue: rawColorValue(fileToken),
      figmaValue: formatValue(figmaToken),
      mode: fileToken.mode,
    })
  }

  // Check for Figma tokens not in file (removals)
  for (const [key, figmaToken] of figmaTokens) {
    if (!fileTokens.has(key)) {
      entries.push({
        name: figmaToken.name,
        type: figmaToken.type,
        status: 'removed',
        figmaValue: formatValue(figmaToken),
        mode: figmaToken.mode,
      })
    }
  }

  // Sort alphabetically by name with numeric segment ordering
  entries.sort((a, b) => naturalCompare(a.name, b.name))

  const counts = {
    added: 0,
    removed: 0,
    modified: 0,
    unchanged: 0,
    total: entries.length,
  }
  for (const e of entries) {
    counts[e.status]++
  }

  return { entries, counts }
}

function valuesMatch(file: FlatToken, figma: FlatToken): boolean {
  // If either side is an alias, compare alias paths — a different reference
  // means modified even if the resolved color is the same.
  if (file.rawValue || figma.rawValue) {
    return file.rawValue === figma.rawValue
  }

  // Color comparison via sRGB with tolerance
  if (file.type === 'color' || figma.type === 'color') {
    const fileRgb = parseColor(file.value)
    const figmaRgb = parseColor(figma.value)
    if (fileRgb && figmaRgb) {
      return colorsMatch(fileRgb, figmaRgb)
    }
  }

  // Typography comparison: compare only the fields Figma exposes,
  // with numeric normalization (file has numbers, Figma has strings)
  if (file.type === 'typography' || figma.type === 'typography') {
    return typographyMatch(file.value, figma.value)
  }

  // Numeric comparison (handles borderRadius "4" vs FLOAT 4)
  const fileNum = Number(file.value)
  const figmaNum = Number(figma.value)
  if (!isNaN(fileNum) && !isNaN(figmaNum)) {
    return fileNum === figmaNum
  }

  // String comparison for everything else
  return file.value === figma.value
}

/** Compare typography tokens by the fields Figma text styles expose. */
function typographyMatch(fileVal: string, figmaVal: string): boolean {
  try {
    const file = JSON.parse(fileVal)
    const figma = JSON.parse(figmaVal)

    // fontFamily: direct string compare
    if (file.fontFamily && figma.fontFamily) {
      if (file.fontFamily !== figma.fontFamily) return false
    }

    // fontWeight: CSS uses numbers ("400"), Figma uses style names ("Regular OCC")
    if (file.fontWeight && figma.fontWeight) {
      const fileNum = cssWeightToNumber(file.fontWeight)
      const figmaNum = cssWeightToNumber(figma.fontWeight)
      if (fileNum !== figmaNum) return false
    }

    // fontSize, lineHeight, letterSpacing: CSS may use rem, Figma uses px numbers
    for (const field of ['fontSize', 'lineHeight', 'letterSpacing'] as const) {
      const a = file[field]
      const b = figma[field]
      if (a === undefined || b === undefined) continue
      if (Math.abs(toPixels(String(a)) - toPixels(String(b))) > 0.1) return false
    }

    return true
  } catch {
    return fileVal === figmaVal
  }
}

/** Map CSS font-weight values or Figma style names to numeric weights. */
const WEIGHT_MAP: Record<string, number> = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  normal: 400,
  medium: 500,
  semibold: 600,
  semi: 500,
  bold: 700,
  extrabold: 800,
  black: 900,
}

function cssWeightToNumber(val: string): number {
  const num = Number(val)
  if (!isNaN(num)) return num
  // Figma style names like "Regular OCC" — take first word, lowercase
  const firstWord = val.split(/\s+/)[0].toLowerCase()
  return WEIGHT_MAP[firstWord] ?? -1
}

/** Convert a CSS length value to pixels. Handles rem, px, and plain numbers. */
function toPixels(val: string): number {
  if (val === 'auto') return -1
  const remMatch = val.match(/^([\d.]+)rem$/)
  if (remMatch) return Math.round(parseFloat(remMatch[1]) * 16 * 100) / 100
  const pxMatch = val.match(/^([\d.]+)px$/)
  if (pxMatch) return parseFloat(pxMatch[1])
  const num = parseFloat(val)
  return isNaN(num) ? -1 : num
}

/** Compare strings with numeric segments sorted by value (e.g. 200 < 1300). */
function naturalCompare(a: string, b: string): number {
  const aParts = a.split('.')
  const bParts = b.split('.')
  const len = Math.max(aParts.length, bParts.length)
  for (let i = 0; i < len; i++) {
    const ap = aParts[i] ?? ''
    const bp = bParts[i] ?? ''
    const aNum = Number(ap)
    const bNum = Number(bp)
    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) return aNum - bNum
    } else {
      const cmp = ap.localeCompare(bp)
      if (cmp !== 0) return cmp
    }
  }
  return 0
}

function formatValue(token: FlatToken): string {
  if (token.type === 'color') {
    const rgb = parseColor(token.value)
    if (rgb) return rgbToHex(rgb)
  }
  return token.value
}

/** Return the original oklch() string for color tokens, if it differs from the formatted hex. */
function rawColorValue(token: FlatToken): string | undefined {
  if (token.type !== 'color') return undefined
  // Show the oklch source value so users can see the transformation
  return token.value
}
