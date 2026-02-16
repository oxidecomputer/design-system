import type { FlatToken } from './types'

/**
 * Parse CSS custom properties from a CSS string into a flat token map.
 *
 * Extracts all `--name: value;` declarations and determines types:
 * - oklch(...) or var(--color-*) → color
 * - var(--theme-*) → color (semantic alias)
 * - var(--font-*) → string
 *
 * For `var()` references, the rawValue records the reference path
 * (converting `--kebab-name` to `dot.name`) so the Figma plugin can
 * set variable aliases.
 */
export function parseCSSTokens(css: string): Map<string, FlatToken> {
  const result = new Map<string, FlatToken>()

  // Match all custom property declarations: --name: value;
  const propRegex = /--([a-zA-Z0-9-]+):\s*([^;]+);/g

  for (const match of css.matchAll(propRegex)) {
    const cssName = match[1] // e.g. "surface-default" or "color-neutral-0"
    const rawCssValue = match[2].trim()

    // Skip Tailwind theme vars (font-sans, font-mono, radius-*, background-color-*, etc.)
    // We only want the design token variables
    if (isThemeUtilityVar(cssName)) continue

    // CSS uses --color-* but Figma variables use base/* for color palette vars
    const dotName = cssName.replace(/-/g, '.')
    const name = dotName.replace(/^color\./, 'base.')
    const token = parseValue(name, rawCssValue)
    if (token) {
      result.set(name, token)
    }
  }

  return result
}

/** Variables that are Tailwind @theme utilities rather than design tokens */
function isThemeUtilityVar(name: string): boolean {
  // These are Tailwind theme mappings, not actual tokens
  if (name.startsWith('background-color-')) return true
  if (name.startsWith('text-color-')) return true
  if (name.startsWith('border-color-')) return true
  if (name.startsWith('ring-color-')) return true
  if (name.startsWith('outline-color-')) return true
  if (name.startsWith('fill-color-')) return true
  if (name.startsWith('stroke-color-')) return true
  // Font family and radius are Tailwind theme vars
  if (name === 'font-sans' || name === 'font-mono') return true
  if (name.startsWith('radius-')) return true
  return false
}

function parseValue(name: string, value: string): FlatToken | null {
  // var() reference
  const varMatch = value.match(/^var\(--([^)]+)\)$/)
  if (varMatch) {
    const refCssName = varMatch[1]
    const refDotName = refCssName.replace(/-/g, '.')
    // Map color.* → base.* to match Figma variable names
    const refName = refDotName.replace(/^color\./, 'base.')
    const type = inferType(name, refCssName)
    return {
      name,
      value, // keep as-is for display
      type,
      rawValue: `{${refName}}`,
    }
  }

  // oklch() color value (with or without alpha)
  if (value.startsWith('oklch(')) {
    return { name, value, type: 'color' }
  }

  // Anything else we don't track (we only sync color variables)
  return null
}

function inferType(name: string, _refName: string): string {
  // All vars we parse from the design system CSS are colors
  return 'color'
}
