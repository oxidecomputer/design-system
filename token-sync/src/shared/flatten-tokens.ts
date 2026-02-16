import type { FlatToken } from './types'

/** Typography fields that map to Figma text style properties. */
const TYPOGRAPHY_FIELDS = [
  'fontFamily',
  'fontWeight',
  'fontSize',
  'lineHeight',
  'letterSpacing',
]

/**
 * Merge token sets and flatten into a resolved flat map.
 *
 * Raw tokens.json has top-level keys for each token set (global, colors, core, main).
 * Tokens reference each other with `{path.to.token}` syntax, and typography
 * sub-values use `$property.name` for same-set references.
 *
 * This function:
 * 1. Merges the specified sets into one namespace
 * 2. Flattens to leaf tokens
 * 3. Resolves all references
 */
export function flattenTokens(
  obj: Record<string, unknown>,
  prefix = '',
): Map<string, FlatToken> {
  const result = new Map<string, FlatToken>()

  for (const [key, val] of Object.entries(obj)) {
    if (val == null || typeof val !== 'object') continue

    const record = val as Record<string, unknown>
    const path = prefix ? `${prefix}.${key}` : key

    if ('value' in record && 'type' in record) {
      let value: string
      if (
        typeof record.value === 'object' &&
        record.value !== null &&
        String(record.type) === 'typography'
      ) {
        // Strip non-Figma fields from typography tokens
        const filtered: Record<string, unknown> = {}
        for (const f of TYPOGRAPHY_FIELDS) {
          if (f in (record.value as Record<string, unknown>)) {
            filtered[f] = (record.value as Record<string, unknown>)[f]
          }
        }
        value = JSON.stringify(filtered)
      } else {
        value =
          typeof record.value === 'object'
            ? JSON.stringify(record.value)
            : String(record.value)
      }

      result.set(path, {
        name: path,
        value,
        type: String(record.type),
        rawValue: record.rawValue ? String(record.rawValue) : undefined,
        description: record.description ? String(record.description) : undefined,
      })
    } else {
      for (const [k, v] of flattenTokens(record, path)) {
        result.set(k, v)
      }
    }
  }

  return result
}

/**
 * Merge token sets from raw tokens.json and resolve all references.
 * Sets are merged in order so later sets can reference earlier ones.
 */
export function mergeAndResolve(
  raw: Record<string, unknown>,
  sets: string[] = ['global', 'colors', 'core', 'main'],
): Record<string, unknown> {
  // Merge specified sets into a single object
  const merged: Record<string, unknown> = {}
  for (const setName of sets) {
    const setData = raw[setName]
    if (setData && typeof setData === 'object') {
      deepMerge(merged, setData as Record<string, unknown>)
    }
  }

  // Resolve all references in place
  resolveRefs(merged, merged)

  return merged
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const [key, val] of Object.entries(source)) {
    if (
      val &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !(
        'value' in (val as Record<string, unknown>) &&
        'type' in (val as Record<string, unknown>)
      )
    ) {
      deepMerge(target[key] as Record<string, unknown>, val as Record<string, unknown>)
    } else {
      target[key] = JSON.parse(JSON.stringify(val))
    }
  }
}

/**
 * Walk the token tree and resolve `{path.to.token}` references and
 * `$property.name` references in typography sub-values.
 */
function resolveRefs(node: Record<string, unknown>, root: Record<string, unknown>): void {
  for (const [key, val] of Object.entries(node)) {
    if (val == null || typeof val !== 'object') continue

    const record = val as Record<string, unknown>

    if ('value' in record && 'type' in record) {
      const rawVal = record.value

      if (typeof rawVal === 'string') {
        const resolved = resolveString(rawVal, root)
        if (resolved !== rawVal) {
          record.rawValue = rawVal
          record.value = resolved
        }
      } else if (typeof rawVal === 'object' && rawVal !== null) {
        // Typography composite value — resolve each sub-value
        const obj = rawVal as Record<string, unknown>
        let changed = false
        for (const [sk, sv] of Object.entries(obj)) {
          if (typeof sv === 'string') {
            const resolved = resolveString(sv, root)
            if (resolved !== sv) {
              obj[sk] = resolved
              changed = true
            }
          }
        }
        if (changed) {
          record.rawValue = JSON.stringify(rawVal)
        }
      }
    } else {
      resolveRefs(record, root)
    }
  }
}

/**
 * Resolve a single string value.
 * - `{path.to.token}` → look up the token's resolved value
 * - `$property.name` → same as `{property.name}`
 * - `rgba({ref}, 0.5)` → resolve the inner reference
 */
function resolveString(str: string, root: Record<string, unknown>, depth = 0): string {
  if (depth > 10) return str

  // Handle $property.name (Tokens Studio shorthand for same-set reference)
  if (str.startsWith('$')) {
    const path = str.slice(1)
    const val = lookupValue(path, root)
    if (val !== undefined)
      return typeof val === 'string' ? resolveString(val, root, depth + 1) : String(val)
  }

  // Handle pure reference: {path.to.token}
  if (str.startsWith('{') && str.endsWith('}')) {
    const path = str.slice(1, -1)
    const val = lookupValue(path, root)
    if (val !== undefined)
      return typeof val === 'string' ? resolveString(val, root, depth + 1) : String(val)
    return str
  }

  // Handle embedded references like: rgba({ref}, 0.5)
  const refPattern = /\{([^}]+)\}/g
  if (refPattern.test(str)) {
    return str.replace(/\{([^}]+)\}/g, (_match, path: string) => {
      const val = lookupValue(path, root)
      if (val !== undefined) {
        const resolved =
          typeof val === 'string' ? resolveString(val, root, depth + 1) : String(val)
        return resolved
      }
      return _match
    })
  }

  return str
}

/** Look up a dot-separated path in the token tree, returning the leaf value. */
function lookupValue(path: string, root: Record<string, unknown>): unknown | undefined {
  const parts = path.split('.')
  let current: unknown = root

  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }

  // If we landed on a token node, return its value
  if (
    current &&
    typeof current === 'object' &&
    'value' in (current as Record<string, unknown>)
  ) {
    return (current as Record<string, unknown>).value
  }

  return undefined
}
