import type { FlatToken } from '../shared/types'

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
  const result = new Map<string, FlatToken>()

  for (const variable of variables) {
    const name = variable.name.replace(/\//g, '.')
    // Get the value from the first (and likely only) mode
    const modeIds = Object.keys(variable.valuesByMode)
    if (modeIds.length === 0) continue
    const rawValue = variable.valuesByMode[modeIds[0]]

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

      const resolved = await resolveVariableAlias(rawValue as VariableAlias, modeIds[0])
      if (!resolved) continue
      const { value, type } = formatVariableValue(resolved.value, variable.resolvedType)
      result.set(name, { name, value, type, rawValue: aliasPath })
      continue
    }

    const { value, type } = formatVariableValue(rawValue, variable.resolvedType)
    result.set(name, { name, value, type })
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

type VariableValue = RGBA | number | string | boolean | VariableAlias

function formatVariableValue(
  rawValue: VariableValue,
  resolvedType: VariableResolvedDataType,
): { value: string; type: string } {
  switch (resolvedType) {
    case 'COLOR': {
      const c = rawValue as RGBA
      return {
        value: `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`,
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
