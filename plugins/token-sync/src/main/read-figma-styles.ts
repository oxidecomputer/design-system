import type { FlatToken } from '../shared/types'
import { tokenKey } from '../shared/types'

/**
 * Read all local variables from the Figma file and return as flat tokens.
 * Variable names use "/" separators — we convert to "." for matching.
 *
 * Variable types:
 *   COLOR  → {r,g,b,a} stored as "rgba(r, g, b, a)" (sRGB 0-1 floats)
 *   FLOAT  → number stored as string
 *   STRING → string value
 *   BOOLEAN → "true"/"false"
 */
export async function readFigmaVariables(): Promise<Map<string, FlatToken>> {
  const variables = await figma.variables.getLocalVariablesAsync()
  const collections = await figma.variables.getLocalVariableCollectionsAsync()
  const result = new Map<string, FlatToken>()

  // Build a map of collectionId → ordered mode info
  const collectionModes = new Map<string, { modeId: string; mode: string | undefined }[]>()
  for (const col of collections) {
    const modes = col.modes.map((m) => ({
      modeId: m.modeId,
      mode: m.name.toLowerCase(),
    }))
    collectionModes.set(col.id, modes)
  }

  for (const variable of variables) {
    const name = variable.name.replace(/\//g, '.')
    const modes = collectionModes.get(variable.variableCollectionId)
    if (!modes) continue

    for (const { modeId, mode } of modes) {
      const rawValue = variable.valuesByMode[modeId]
      if (rawValue === undefined) continue

      // If the value is an alias, resolve it but also record the alias path
      if (
        typeof rawValue === 'object' &&
        rawValue !== null &&
        'type' in rawValue &&
        rawValue.type === 'VARIABLE_ALIAS'
      ) {
        const aliasTarget = await figma.variables.getVariableByIdAsync(
          (rawValue as VariableAlias).id,
        )
        const aliasPath = aliasTarget
          ? `{${aliasTarget.name.replace(/\//g, '.')}}`
          : undefined

        const resolved = await resolveVariableAlias(rawValue as VariableAlias, modeId)
        if (!resolved) continue
        const { value, type } = formatVariableValue(resolved.value, variable.resolvedType)
        result.set(tokenKey(name, mode), { name, value, type, rawValue: aliasPath, mode })
        continue
      }

      const { value, type } = formatVariableValue(rawValue, variable.resolvedType)
      result.set(tokenKey(name, mode), { name, value, type, mode })
    }
  }

  return result
}

async function resolveVariableAlias(
  alias: VariableAlias,
  modeId: string,
  depth = 0,
): Promise<{ value: VariableValue } | null> {
  if (depth > 10) return null // prevent infinite loops
  const target = await figma.variables.getVariableByIdAsync(alias.id)
  if (!target) return null
  const targetValue = target.valuesByMode[modeId] ?? Object.values(target.valuesByMode)[0]
  if (
    targetValue &&
    typeof targetValue === 'object' &&
    'type' in targetValue &&
    (targetValue as VariableAlias).type === 'VARIABLE_ALIAS'
  ) {
    return resolveVariableAlias(targetValue as VariableAlias, modeId, depth + 1)
  }
  return { value: targetValue }
}

function formatVariableValue(
  rawValue: VariableValue,
  resolvedType: VariableResolvedDataType,
): { value: string; type: string } {
  switch (resolvedType) {
    case 'COLOR': {
      const c = rawValue as RGB | RGBA
      const a = 'a' in c ? c.a : 1
      return {
        value: `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`,
        type: 'color',
      }
    }
    case 'FLOAT':
      return { value: String(rawValue), type: 'number' }
    case 'STRING':
      return { value: String(rawValue), type: 'string' }
    case 'BOOLEAN':
      return { value: String(rawValue), type: 'boolean' }
    default:
      return { value: String(rawValue), type: 'unknown' }
  }
}

/**
 * Read all local text styles from the Figma file and return as flat tokens.
 */
export async function readFigmaTextStyles(): Promise<Map<string, FlatToken>> {
  const styles = await figma.getLocalTextStylesAsync()
  const result = new Map<string, FlatToken>()

  for (const style of styles) {
    const name = style.name.replace(/\//g, '.')

    const value = JSON.stringify({
      fontFamily: style.fontName.family,
      fontWeight: style.fontName.style,
      fontSize: String(style.fontSize),
      lineHeight:
        style.lineHeight.unit === 'AUTO'
          ? 'auto'
          : style.lineHeight.unit === 'PIXELS'
            ? String(style.lineHeight.value)
            : `${style.lineHeight.value}%`,
      letterSpacing:
        style.letterSpacing.unit === 'PIXELS'
          ? String(style.letterSpacing.value)
          : `${style.letterSpacing.value}%`,
    })

    result.set(name, {
      name,
      value,
      type: 'typography',
    })
  }

  return result
}
