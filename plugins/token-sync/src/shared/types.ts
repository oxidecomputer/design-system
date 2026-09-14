export interface FlatToken {
  name: string
  value: string
  type: string
  rawValue?: string
  description?: string
  mode?: string
}

export function tokenKey(name: string, mode?: string): string {
  return mode ? `${mode}:${name}` : name
}

export type DiffStatus = 'added' | 'removed' | 'modified' | 'unchanged'

export interface DiffEntry {
  name: string
  type: string
  status: DiffStatus
  fileValue?: string
  fileRawValue?: string
  figmaValue?: string
  mode?: string
}

export interface DiffResult {
  entries: DiffEntry[]
  counts: {
    added: number
    removed: number
    modified: number
    unchanged: number
    total: number
  }
}

export interface CSSFiles {
  main: string
  dark: string
  light: string
}

export interface ApplySettings {
  applyModified: boolean
  applyAdded: boolean
  applyRemoved: boolean
}

/** Map token name prefixes to their Figma collection names. */
export const COLLECTION_PREFIX_MAP: Record<string, string> = {
  'border-radius': 'global',
  fontFamilies: 'global',
  textDecoration: 'global',
  base: 'colors',
  theme: 'core',
}

export type PluginMessage =
  | { type: 'COMPARE_RESULT'; data: DiffResult }
  | { type: 'COMPARE_WITH_CSS'; css: CSSFiles }
  | { type: 'LOADING' }
  | { type: 'APPLYING' }
  | { type: 'ERROR'; message: string }
  | { type: 'REFRESH' }
  | { type: 'APPLY'; settings: ApplySettings }
  | { type: 'APPLY_RESULT'; summary: string }
