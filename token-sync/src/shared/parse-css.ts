import type { CSSFiles, FlatToken } from './types'
import { COLLECTION_PREFIX_MAP, tokenKey } from './types'

/**
 * Parse CSS custom properties from multiple CSS files into a flat token map.
 *
 * Handles the naming differences between CSS vars and Figma variables:
 * - CSS `--color-*` → Figma `base/*`
 * - CSS `--radius-*` → Figma `border-radius/*`
 * - CSS `--content-accent` → Figma `content/accent/default` (default suffix restoration)
 *
 * Files map to modes:
 * - `main` → base tokens (no mode) — colors, theme mappings, radius, typography
 * - `dark` → "dark" mode — semantic tokens (surface, content, stroke)
 * - `light` → "light" mode — semantic tokens (surface, content, stroke)
 *
 * Map keys use `tokenKey(name, mode)` — plain name for base, `dark:name`, `light:name`.
 */
export function parseCSSTokens(css: CSSFiles): Map<string, FlatToken> {
  const result = new Map<string, FlatToken>()

  // Parse base tokens from main.css — mode matches collection name in Figma
  const themeBlock = extractBlock(css.main, /@theme inline\s*\{/)
  if (themeBlock) {
    parseBaseTokens(themeBlock, result)
  }

  // Parse dark mode semantic tokens
  const darkBlock = extractBlock(css.dark, /:root\s*\{/)
  if (darkBlock) {
    parsePropsInto(darkBlock, 'dark', result)
  }

  // Parse light mode semantic tokens
  const lightBlock = extractBlock(css.light, /\[data-theme="light"\]\s*\{/)
  if (lightBlock) {
    parsePropsInto(lightBlock, 'light', result)
  }

  // Resolve var() references within each mode.
  // Mode refs fall through to base (no mode) for palette lookups.
  resolveReferences(result)

  // Parse @utility text-* blocks for typography tokens (mode-independent)
  parseTypographyUtilities(css.main, result)

  return result
}

/** Extract the content between `{` and its matching `}` for a block. */
function extractBlock(css: string, startPattern: RegExp): string | null {
  const match = css.match(startPattern)
  if (!match) return null
  const start = css.indexOf('{', match.index!)
  if (start === -1) return null
  let depth = 1
  let i = start + 1
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') depth--
    i++
  }
  return css.slice(start + 1, i - 1)
}

export function modeForBaseToken(name: string): string {
  for (const [prefix, mode] of Object.entries(COLLECTION_PREFIX_MAP)) {
    if (name.startsWith(prefix)) return mode
  }
  return 'global'
}

/**
 * Parse base tokens from @theme inline, assigning each token a mode
 * that matches its Figma collection name (colors, core, global).
 */
function parseBaseTokens(block: string, result: Map<string, FlatToken>): void {
  const propRegex = /--([a-zA-Z0-9-]+):\s*([^;]+);/g
  for (const match of block.matchAll(propRegex)) {
    const cssName = match[1]
    const rawCssValue = match[2].trim()

    if (isThemeUtilityVar(cssName)) continue

    const name = cssNameToFigmaName(cssName)
    const token = parseValue(name, rawCssValue)
    if (token) {
      const mode = modeForBaseToken(name)
      token.mode = mode
      result.set(tokenKey(name, mode), token)
    }
  }
}

/** Parse `--name: value;` declarations from a CSS block into the result map. */
function parsePropsInto(
  block: string,
  mode: string | undefined,
  result: Map<string, FlatToken>,
): void {
  const propRegex = /--([a-zA-Z0-9-]+):\s*([^;]+);/g
  for (const match of block.matchAll(propRegex)) {
    const cssName = match[1]
    const rawCssValue = match[2].trim()

    if (isThemeUtilityVar(cssName)) continue

    const name = cssNameToFigmaName(cssName)
    const token = parseValue(name, rawCssValue)
    if (token) {
      token.mode = mode
      result.set(tokenKey(name, mode), token)
    }
  }
}

/**
 * Resolve var() references to actual color values for comparison/display.
 * Handles chains like surface-accent → theme-accent-200 → color-blue-200 → oklch(...)
 * Looks up in same mode first, then tries the target token's base mode (core, colors, global).
 */
function resolveReferences(result: Map<string, FlatToken>): void {
  for (const [, token] of result) {
    if (!token.rawValue) continue
    let resolved = token
    let depth = 0
    while (resolved.rawValue && depth < 10) {
      const refName = resolved.rawValue.slice(1, -1) // strip { }
      // Look up in same mode first, then try the ref's base mode
      const refToken =
        result.get(tokenKey(refName, resolved.mode)) ??
        result.get(tokenKey(refName, modeForBaseToken(refName)))
      if (!refToken) break
      resolved = refToken
      depth++
    }
    if (resolved !== token) {
      token.value = resolved.value
    }
  }
}

/**
 * Convert a CSS custom property name to its Figma variable name.
 *
 * Figma variables use `/` as separator (converted to `.` for matching).
 * The CSS build process made these transformations that we reverse here:
 * - `base.*` → `color-*` (we reverse: `color-*` → `base.*`)
 * - `border-radius/*` → `radius-*` (we reverse: `radius-*` → `border-radius.*`)
 * - `*-default` was stripped when 3+ segments (we restore it)
 */
function cssNameToFigmaName(cssName: string): string {
  // --radius-sm → border-radius.sm
  if (cssName.startsWith('radius-')) {
    return 'border-radius.' + cssName.slice('radius-'.length)
  }

  // --color-neutral-0 → base.neutral.0
  if (cssName.startsWith('color-')) {
    return 'base.' + cssName.slice('color-'.length).replace(/-/g, '.')
  }

  // For semantic tokens (surface-*, content-*, stroke-*, theme-*),
  // parse structurally to preserve hyphenated sub-categories like accent-alt
  return parseSemanticName(cssName)
}

/**
 * Parse a semantic CSS var name into its Figma variable path.
 *
 * Figma variables are structured as `prefix/sub-category/qualifier`
 * where sub-categories like `accent-alt` keep their hyphens.
 *
 * The old build also stripped `-default` from 3+ segment names, so
 * `surface/accent/default` became `--surface-accent` in CSS. We restore it.
 */
const SEMANTIC_PREFIXES = ['surface', 'content', 'stroke', 'theme']

// Ordered longest-first so `accent-alt` matches before `accent`
const SUB_CATEGORIES = [
  'accent-alt',
  'accent',
  'destructive',
  'inverse',
  'success',
  'error',
  'notice',
  'info',
]

function parseSemanticName(cssName: string): string {
  for (const prefix of SEMANTIC_PREFIXES) {
    if (!cssName.startsWith(prefix + '-')) continue
    const rest = cssName.slice(prefix.length + 1) // e.g. "accent-alt-secondary"

    for (const sub of SUB_CATEGORIES) {
      if (rest === sub) {
        // e.g. "content-accent" → "content.accent.default"
        return `${prefix}.${sub}.default`
      }
      if (rest.startsWith(sub + '-')) {
        // e.g. "content-accent-alt-secondary" → "content.accent-alt.secondary"
        const qualifier = rest.slice(sub.length + 1).replace(/-/g, '.')
        return `${prefix}.${sub}.${qualifier}`
      }
    }

    // No sub-category match — simple two-part name like "surface-default"
    return `${prefix}.${rest.replace(/-/g, '.')}`
  }

  // Not a semantic token — plain hyphen-to-dot conversion
  return cssName.replace(/-/g, '.')
}

/** Variables that are Tailwind @theme utilities rather than design tokens */
function isThemeUtilityVar(name: string): boolean {
  if (name.startsWith('background-color-')) return true
  if (name.startsWith('text-color-')) return true
  if (name.startsWith('border-color-')) return true
  if (name.startsWith('ring-color-')) return true
  if (name.startsWith('outline-color-')) return true
  if (name.startsWith('fill-color-')) return true
  if (name.startsWith('stroke-color-')) return true
  if (name === 'font-sans' || name === 'font-mono') return true
  return false
}

function parseValue(name: string, value: string): FlatToken | null {
  // var() reference
  const varMatch = value.match(/^var\(--([^)]+)\)$/)
  if (varMatch) {
    const refCssName = varMatch[1]
    const refName = cssNameToFigmaName(refCssName)
    return {
      name,
      value,
      type: 'color',
      rawValue: `{${refName}}`,
    }
  }

  // oklch() color value (with or without alpha)
  if (value.startsWith('oklch(')) {
    return { name, value, type: 'color' }
  }

  // rem value (border radius) → convert to px for Figma (FLOAT)
  const remMatch = value.match(/^([\d.]+)rem$/)
  if (remMatch) {
    const px = parseFloat(remMatch[1]) * 16
    return { name, value: String(px), type: 'borderRadius' }
  }

  return null
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

const FONT_FAMILIES: Record<string, string> = {
  'var(--font-mono)': 'GT America Mono',
  'var(--font-sans)': "Suisse Int'l",
}

const WEIGHT_NAMES: Record<string, string> = {
  '400': 'regular',
  '500': 'semi',
}

/**
 * Parse `@utility text-*` blocks into typography FlatTokens.
 *
 * Uses `/* @figma path *​/` comment decorators when present to get the exact
 * Figma text style name. Falls back to heuristic name reconstruction when
 * no decorator is found (e.g. when fetching from an older branch).
 */
function parseTypographyUtilities(css: string, result: Map<string, FlatToken>): void {
  // Match @utility blocks optionally preceded by a @figma comment
  const regex = /(?:\/\* @figma (.+?) \*\/\s*)?@utility text-([a-zA-Z0-9-]+)\s*\{([^}]+)\}/g

  for (const match of css.matchAll(regex)) {
    const figmaPath = match[1] // e.g. "mono/regular/xs" (undefined if no decorator)
    const utilityName = match[2] // e.g. "mono-xs" or "sans-semi-sm"
    const body = match[3]

    const props: Record<string, string> = {}
    const propRegex = /([\w-]+):\s*([^;]+);/g
    for (const pm of body.matchAll(propRegex)) {
      props[pm[1]] = pm[2].trim()
    }

    // Determine Figma name: use decorator if present, otherwise reconstruct
    let figmaName: string
    if (figmaPath) {
      figmaName = figmaPath.replace(/\//g, '.')
    } else {
      const fontWeight = props['font-weight'] ?? '400'
      const weightName = WEIGHT_NAMES[fontWeight]
      if (weightName && !utilityName.includes(weightName)) {
        const parts = utilityName.split('-')
        const family = parts[0]
        const size = parts.slice(1).join('-')
        figmaName = `${family}.${weightName}.${size}`
      } else {
        figmaName = utilityName.replace(/-/g, '.')
      }
    }

    const fontFamily = FONT_FAMILIES[props['font-family']] ?? props['font-family'] ?? ''
    const fontWeight = props['font-weight'] ?? '400'
    const fontSize = props['font-size'] ?? ''
    const lineHeight = props['line-height'] ?? ''
    const letterSpacing = props['letter-spacing'] ?? ''

    const value = JSON.stringify({
      fontFamily,
      fontWeight,
      fontSize,
      lineHeight,
      letterSpacing,
    })

    result.set(figmaName, { name: figmaName, value, type: 'typography' })
  }
}
