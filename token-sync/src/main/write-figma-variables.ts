import { parseColor } from '../shared/oklch'
import type { FlatToken } from '../shared/types'

/**
 * Update an existing Figma variable's value to match the file token.
 * If the token references another variable, sets an alias instead of a raw value.
 */
export async function updateVariable(name: string, fileToken: FlatToken): Promise<boolean> {
  const variable = await findVariableByName(name)
  if (!variable) return false

  const modeId = Object.keys(variable.valuesByMode)[0]
  if (!modeId) return false

  // Try to set as alias if the token references another variable
  const alias = await resolveAlias(fileToken)
  if (alias) {
    variable.setValueForMode(modeId, alias)
    return true
  }

  const newValue = tokenToFigmaValue(fileToken, variable.resolvedType)
  if (newValue === null) return false

  variable.setValueForMode(modeId, newValue)
  return true
}

/**
 * Create a new Figma variable from a file token.
 * Determines the correct collection based on the token name prefix.
 */
export async function createVariable(name: string, fileToken: FlatToken): Promise<boolean> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync()

  // Determine which collection this token belongs to based on name prefix
  const collection = findCollectionForToken(name, collections)
  if (!collection) {
    console.log(`No collection found for token: ${name}`)
    return false
  }

  const resolvedType = tokenTypeToFigmaType(fileToken)
  if (!resolvedType) return false

  const figmaName = name.replace(/\./g, '/')
  const variable = figma.variables.createVariable(figmaName, collection, resolvedType)

  const modeId = collection.modes[0]?.modeId
  if (!modeId) return false

  // Try to set as alias if the token references another variable
  const alias = await resolveAlias(fileToken)
  if (alias) {
    variable.setValueForMode(modeId, alias)
    return true
  }

  const value = tokenToFigmaValue(fileToken, resolvedType)
  if (value === null) return false

  variable.setValueForMode(modeId, value)
  return true
}

/**
 * Remove a Figma variable by name.
 */
export async function removeVariable(name: string): Promise<boolean> {
  const variable = await findVariableByName(name)
  if (!variable) return false

  variable.remove()
  return true
}

async function findVariableByName(name: string): Promise<Variable | null> {
  const figmaName = name.replace(/\./g, '/')
  const variables = await figma.variables.getLocalVariablesAsync()
  return variables.find((v) => v.name === figmaName) ?? null
}

function findCollectionForToken(
  name: string,
  collections: VariableCollection[],
): VariableCollection | null {
  // Map token name prefixes to collection names
  const prefixMap: Record<string, string> = {
    'border-radius': 'global',
    fontFamilies: 'global',
    textDecoration: 'global',
    base: 'colors',
    theme: 'core',
    // Everything else (surface, content, stroke, chart) goes to "main"
  }

  for (const [prefix, collectionName] of Object.entries(prefixMap)) {
    if (name.startsWith(prefix)) {
      return collections.find((c) => c.name === collectionName) ?? null
    }
  }

  // Default to "main" collection
  return collections.find((c) => c.name === 'main') ?? null
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
async function resolveAlias(token: FlatToken): Promise<VariableAlias | null> {
  if (!token.rawValue) return null

  // Match a pure reference: {path.to.token}
  const match = token.rawValue.match(/^\{([^}]+)\}$/)
  if (!match) return null

  const refPath = match[1]
  const refFigmaName = refPath.replace(/\./g, '/')
  const variables = await figma.variables.getLocalVariablesAsync()
  const target = variables.find((v) => v.name === refFigmaName)
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
