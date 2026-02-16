export interface FlatToken {
  name: string
  value: string
  type: string
  rawValue?: string
  description?: string
}

export type DiffStatus = 'added' | 'removed' | 'modified' | 'unchanged'

export interface DiffEntry {
  name: string
  type: string
  status: DiffStatus
  fileValue?: string
  fileRawValue?: string
  figmaValue?: string
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

export interface ApplySettings {
  applyModified: boolean
  applyAdded: boolean
  applyRemoved: boolean
}

export type PluginMessage =
  | { type: 'COMPARE_RESULT'; data: DiffResult }
  | { type: 'COMPARE_WITH_CSS'; css: string }
  | { type: 'LOADING' }
  | { type: 'APPLYING' }
  | { type: 'ERROR'; message: string }
  | { type: 'REFRESH' }
  | { type: 'APPLY'; settings: ApplySettings }
  | { type: 'APPLY_RESULT'; summary: string }
