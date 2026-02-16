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
  for (const [name, fileToken] of fileTokens) {
    const figmaToken = figmaTokens.get(name)

    if (!figmaToken) {
      entries.push({
        name,
        type: fileToken.type,
        status: 'added',
        fileValue: formatValue(fileToken),
        fileRawValue: rawColorValue(fileToken),
      })
      continue
    }

    // Both exist — compare values
    const match = valuesMatch(fileToken, figmaToken)
    entries.push({
      name,
      type: fileToken.type,
      status: match ? 'unchanged' : 'modified',
      fileValue: formatValue(fileToken),
      fileRawValue: rawColorValue(fileToken),
      figmaValue: formatValue(figmaToken),
    })
  }

  // Check for Figma tokens not in file (removals)
  for (const [name, figmaToken] of figmaTokens) {
    if (!fileTokens.has(name)) {
      entries.push({
        name,
        type: figmaToken.type,
        status: 'removed',
        figmaValue: formatValue(figmaToken),
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
    // Compare only the fields present in the Figma text style
    const fieldsToCompare = [
      'fontFamily',
      'fontWeight',
      'fontSize',
      'lineHeight',
      'letterSpacing',
    ]
    for (const field of fieldsToCompare) {
      if (!(field in figma)) continue
      const a = normalizeTypographyValue(String(file[field] ?? ''))
      const b = normalizeTypographyValue(String(figma[field] ?? ''))
      if (a !== b) return false
    }
    return true
  } catch {
    return fileVal === figmaVal
  }
}

/** Normalize a typography field value: parse numeric part so `.5%` equals `0.5%`. */
function normalizeTypographyValue(val: string): string {
  const match = val.match(/^(-?\d*\.?\d+)(.*)$/)
  if (match) {
    return String(Number(match[1])) + match[2]
  }
  return val
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
