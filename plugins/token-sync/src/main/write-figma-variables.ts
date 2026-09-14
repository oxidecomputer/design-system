import { parseColor } from '../shared/oklch'
import { COLLECTION_PREFIX_MAP } from '../shared/types'
import type { FlatToken } from '../shared/types'

// Cached lookups — call initCache() before any write operations
let _variables: Variable[] = []
let _collections: VariableCollection[] = []
let _variablesByName: Map<string, Variable> = new Map()

export async function initCache(): Promise<void> {
  _variables = await figma.variables.getLocalVariablesAsync()
  _collections = await figma.variables.getLocalVariableCollectionsAsync()
  _variablesByName = new Map()
  for (const v of _variables) {
    _variablesByName.set(v.name, v)
  }
}

/**
 * Update an existing Figma variable's value to match the file token.
 * If the token references another variable, sets an alias instead of a raw value.
 * Writes to the correct mode based on the token's `mode` field.
 */
export async function updateVariable(name: string, fileToken: FlatToken): Promise<boolean> {
  const variable = findVariableByName(name)
  if (!variable) {
    console.error(`Variable not found: ${name}`)
    return false
  }

  const modeId = findModeId(variable, fileToken.mode)
  if (!modeId) {
    console.error(`Mode "${fileToken.mode}" not found for variable: ${name}`)
    return false
  }

  // Try to set as alias if the token references another variable
  const alias = resolveAlias(fileToken)
  if (alias) {
    try {
      variable.setValueForMode(modeId, alias)
      return true
    } catch (err) {
      console.error(`Failed to set alias for ${name}:`, err)
      return false
    }
  }

  const newValue = tokenToFigmaValue(fileToken, variable.resolvedType)
  if (newValue === null) {
    console.error(`Failed to convert value for ${name}: ${fileToken.value}`)
    return false
  }

  try {
    variable.setValueForMode(modeId, newValue)
    return true
  } catch (err) {
    console.error(`Failed to set value for ${name}:`, err)
    return false
  }
}

/**
 * Create a new Figma variable from a file token.
 * Determines the correct collection based on the token name prefix.
 * Writes to the correct mode based on the token's `mode` field.
 */
export async function createVariable(name: string, fileToken: FlatToken): Promise<boolean> {
  const collection = findCollectionForToken(name, _collections)

  const resolvedType = tokenTypeToFigmaType(fileToken)
  if (!resolvedType) {
    console.error(`Unknown token type for ${name}: ${fileToken.type}`)
    return false
  }

  const figmaName = name.replace(/\./g, '/')

  // Find the target mode
  let modeId: string | undefined
  if (fileToken.mode) {
    const found = collection.modes.find((m) => m.name.toLowerCase() === fileToken.mode)
    modeId = found?.modeId
  } else {
    modeId = collection.modes[0]?.modeId
  }
  if (!modeId) {
    console.error(`Mode "${fileToken.mode}" not found in collection "${collection.name}"`)
    return false
  }

  try {
    const variable = figma.variables.createVariable(figmaName, collection, resolvedType)

    // Try to set as alias if the token references another variable
    const alias = resolveAlias(fileToken)
    if (alias) {
      variable.setValueForMode(modeId, alias)
    } else {
      const value = tokenToFigmaValue(fileToken, resolvedType)
      if (value === null) {
        console.error(
          `Failed to convert value for new variable ${name}: ${fileToken.value}`,
        )
        return false
      }
      variable.setValueForMode(modeId, value)
    }

    // Add to cache so subsequent alias lookups can find it
    _variables.push(variable)
    _variablesByName.set(variable.name, variable)

    return true
  } catch (err) {
    console.error(`Failed to create variable ${name}:`, err)
    return false
  }
}

/**
 * Remove a Figma variable by name.
 * If mode is specified, only removes if the variable exists in that mode's collection.
 */
export async function removeVariable(name: string, mode?: string): Promise<boolean> {
  const variable = findVariableByName(name)
  if (!variable) return false

  if (mode) {
    const modeId = findModeId(variable, mode)
    if (!modeId) return false
  }

  try {
    variable.remove()
    return true
  } catch (err) {
    console.error(`Failed to remove variable ${name}:`, err)
    return false
  }
}

/**
 * Remove a Figma text style by name.
 */
export async function removeTextStyle(name: string): Promise<boolean> {
  const style = await findTextStyleByName(name)
  if (!style) return false
  try {
    style.remove()
    return true
  } catch (err) {
    console.error(`Failed to remove text style ${name}:`, err)
    return false
  }
}

/**
 * Update an existing Figma text style to match the file token.
 */
export async function updateTextStyle(
  name: string,
  fileToken: FlatToken,
): Promise<boolean> {
  const style = await findTextStyleByName(name)
  if (!style) return false

  try {
    await figma.loadFontAsync(style.fontName)
    applyTypographyProps(style, JSON.parse(fileToken.value))
    return true
  } catch (err) {
    console.error(`Failed to update text style ${name}:`, err)
    return false
  }
}

/**
 * Create a new Figma text style from a file token.
 * Borrows the FontName from an existing style with the same family and weight
 * so the font family string is an exact match for what Figma expects.
 */
export async function createTextStyle(
  name: string,
  fileToken: FlatToken,
): Promise<boolean> {
  try {
    const props = JSON.parse(fileToken.value)
    const figmaName = name.replace(/\./g, '/')

    const fontName = await findFontName(props.fontFamily, props.fontWeight)
    if (!fontName) {
      console.error(
        `No reference font found for ${name} (${props.fontFamily} ${props.fontWeight})`,
      )
      return false
    }

    await figma.loadFontAsync(fontName)
    const style = figma.createTextStyle()
    style.name = figmaName
    style.fontName = fontName
    applyTypographyProps(style, props)
    return true
  } catch (err) {
    console.error(`Failed to create text style ${name}:`, err)
    return false
  }
}

/** Apply parsed typography props to a TextStyle node, respecting CSS units. */
function applyTypographyProps(style: TextStyle, props: Record<string, string>): void {
  if (props.fontSize) {
    const px = parseCssLength(props.fontSize)
    if (px !== null) style.fontSize = px.value
  }
  if (props.lineHeight) {
    const parsed = parseCssLengthWithUnit(props.lineHeight)
    if (parsed) {
      style.lineHeight =
        parsed.unit === 'AUTO'
          ? { unit: 'AUTO' }
          : { value: parsed.value, unit: parsed.unit }
    }
  }
  if (props.letterSpacing !== undefined) {
    const parsed = parseCssLengthWithUnit(props.letterSpacing)
    if (parsed && parsed.unit !== 'AUTO') {
      style.letterSpacing = { value: parsed.value, unit: parsed.unit }
    }
  }
}

type CssLength = { value: number; unit: 'PIXELS' | 'PERCENT' } | { unit: 'AUTO' }

/**
 * Parse a CSS length value to a Figma-compatible unit+value pair.
 *
 * rem  → PIXELS (×16)
 * px   → PIXELS
 * em   → PERCENT (×100, since 1em = 100% of font-size — matches how Figma
 *         stores and reads back em-derived letter-spacing)
 * %    → PERCENT
 * auto → AUTO
 */
function parseCssLengthWithUnit(val: string): CssLength | null {
  const s = String(val).trim()
  if (s === 'auto') return { unit: 'AUTO' }
  const remMatch = s.match(/^(-?[\d.]+)rem$/)
  if (remMatch) return { value: parseFloat(remMatch[1]) * 16, unit: 'PIXELS' }
  const pxMatch = s.match(/^(-?[\d.]+)px$/)
  if (pxMatch) return { value: parseFloat(pxMatch[1]), unit: 'PIXELS' }
  const emMatch = s.match(/^(-?[\d.]+)em$/)
  if (emMatch) return { value: parseFloat(emMatch[1]) * 100, unit: 'PERCENT' }
  const pctMatch = s.match(/^(-?[\d.]+)%$/)
  if (pctMatch) return { value: parseFloat(pctMatch[1]), unit: 'PERCENT' }
  const num = parseFloat(s)
  if (!isNaN(num)) return { value: num, unit: 'PIXELS' }
  return null
}

/** Parse a CSS length to pixels only (for font-size). */
function parseCssLength(val: string): { value: number } | null {
  const parsed = parseCssLengthWithUnit(val)
  if (!parsed || parsed.unit === 'AUTO') return null
  if (parsed.unit === 'PIXELS') return { value: parsed.value }
  return null
}

const WEIGHT_TO_FONT_STYLE: Record<string, string[]> = {
  '400': ['Regular', 'Regular OCC', 'Book'],
  '500': ['Medium', 'Medium OCC', 'Semi'],
}

/**
 * Find a Figma FontName by borrowing from an existing text style that matches
 * the target family and weight. This avoids hard-coding the exact style string
 * (e.g. "Regular OCC" vs "Regular") which varies per typeface.
 */
async function findFontName(
  cssFamily: string,
  cssWeight: string,
): Promise<FontName | null> {
  const styles = await figma.getLocalTextStylesAsync()
  const targetWeight = Number(cssWeight)

  for (const style of styles) {
    // Match family loosely — CSS has "Suisse Int'l", Figma may have "Suisse Int'l OCC"
    if (!style.fontName.family.startsWith(cssFamily.replace(/'/g, "'"))) continue
    const w = weightFromStyleName(style.fontName.style)
    if (w === targetWeight) return style.fontName
  }

  // Fallback: try loading the canonical style names for the weight
  const candidates = WEIGHT_TO_FONT_STYLE[cssWeight] ?? ['Regular']
  for (const styleName of candidates) {
    try {
      const fontName = { family: cssFamily, style: styleName }
      await figma.loadFontAsync(fontName)
      return fontName
    } catch {
      // try next candidate
    }
  }

  return null
}

const WEIGHT_MAP: Record<string, number> = {
  regular: 400,
  book: 400,
  normal: 400,
  medium: 500,
  semi: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
}

function weightFromStyleName(styleName: string): number {
  const firstWord = styleName.split(/\s+/)[0].toLowerCase()
  return WEIGHT_MAP[firstWord] ?? -1
}

async function findTextStyleByName(name: string): Promise<TextStyle | null> {
  const figmaName = name.replace(/\./g, '/')
  const styles = await figma.getLocalTextStylesAsync()
  return styles.find((s) => s.name === figmaName) ?? null
}

function findVariableByName(name: string): Variable | null {
  const figmaName = name.replace(/\./g, '/')
  return _variablesByName.get(figmaName) ?? null
}

/**
 * Find the modeId for a variable given a mode name.
 * If mode is undefined, returns the first (default) mode.
 * Otherwise finds the mode by name (case-insensitive).
 */
function findModeId(variable: Variable, mode: string | undefined): string | null {
  const collection = _collections.find((c) => c.id === variable.variableCollectionId)
  if (!collection) return null

  if (!mode) {
    return collection.modes[0]?.modeId ?? null
  }

  // Try exact mode name match first
  const found = collection.modes.find((m) => m.name.toLowerCase() === mode)
  if (found) return found.modeId

  // Single-mode collections: use the only mode regardless of name
  if (collection.modes.length === 1) {
    return collection.modes[0].modeId
  }

  return null
}

function findCollectionForToken(
  name: string,
  collections: VariableCollection[],
): VariableCollection {
  let collectionName = 'main'
  for (const [prefix, cn] of Object.entries(COLLECTION_PREFIX_MAP)) {
    if (name.startsWith(prefix)) {
      collectionName = cn
      break
    }
  }

  let collection = collections.find((c) => c.name === collectionName)
  if (!collection) {
    collection = figma.variables.createVariableCollection(collectionName)
    collections.push(collection)
  }
  return collection
}

function tokenTypeToFigmaType(token: FlatToken): VariableResolvedDataType | null {
  switch (token.type) {
    case 'color':
      return 'COLOR'
    case 'number':
    case 'borderRadius':
      return 'FLOAT'
    case 'string':
    case 'fontFamilies':
      return 'STRING'
    case 'boolean':
      return 'BOOLEAN'
    default:
      return null
  }
}

/**
 * If a token has a rawValue like `{base.neutral.200}`, find the corresponding
 * Figma variable and return a VariableAlias. Returns null if the reference
 * can't be resolved to an existing variable.
 */
function resolveAlias(token: FlatToken): VariableAlias | null {
  if (!token.rawValue) return null

  const match = token.rawValue.match(/^\{([^}]+)\}$/)
  if (!match) return null

  const refPath = match[1]
  const refFigmaName = refPath.replace(/\./g, '/')

  // Try exact match first, then strip known prefixes
  // CSS uses "base/green/200" but Figma variable may be "green/200"
  let target = _variablesByName.get(refFigmaName)
  if (!target) {
    const stripped = refFigmaName.replace(/^base\//, '')
    target = _variablesByName.get(stripped)
  }
  if (!target) return null

  return figma.variables.createVariableAlias(target)
}

function tokenToFigmaValue(
  token: FlatToken,
  resolvedType: VariableResolvedDataType,
): VariableValue | null {
  switch (resolvedType) {
    case 'COLOR': {
      const rgb = parseColor(token.value)
      if (!rgb) return null
      return { r: rgb.r, g: rgb.g, b: rgb.b, a: rgb.a }
    }
    case 'FLOAT':
      return Number(token.value)
    case 'STRING':
      return token.value
    case 'BOOLEAN':
      return token.value === 'true'
    default:
      return null
  }
}
