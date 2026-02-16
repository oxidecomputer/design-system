import type { DiffEntry as DiffEntryType } from '../../shared/types'

const statusLabels: Record<string, string> = {
  added: 'Add',
  removed: 'Remove',
  modified: 'Modified',
  unchanged: 'Match',
}

export default function DiffEntry({ entry }: { entry: DiffEntryType }) {
  const isColor = entry.type === 'color'
  const hasBothValues = entry.fileValue && entry.figmaValue

  return (
    <div className={`diff-entry diff-${entry.status}`}>
      <div className="diff-entry-header">
        <span className={`status-badge status-${entry.status}`}>
          {statusLabels[entry.status]}
        </span>
        <span className="diff-entry-name" title={entry.name}>
          {entry.name}
        </span>
        <span className="diff-entry-type">{entry.type}</span>
      </div>
      {(entry.fileValue || entry.figmaValue) && (
        <div className={`diff-entry-values ${hasBothValues ? 'side-by-side' : ''}`}>
          {entry.figmaValue && (
            <div className="diff-value-col">
              <span className="diff-value-label">Figma</span>
              {isColor ? (
                <ColorValue color={entry.figmaValue} />
              ) : (
                <FormattedValue value={entry.figmaValue} />
              )}
            </div>
          )}
          {entry.fileValue && (
            <div className="diff-value-col">
              <span className="diff-value-label">File</span>
              {isColor ? (
                <ColorValue color={entry.fileValue} rawValue={entry.fileRawValue} />
              ) : (
                <FormattedValue value={entry.fileValue} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FormattedValue({ value }: { value: string }) {
  // Try to parse and pretty-print JSON
  try {
    const parsed = JSON.parse(value)
    if (typeof parsed === 'object' && parsed !== null) {
      const entries = Object.entries(parsed)
      return (
        <div className="formatted-json">
          {entries.map(([k, v]) => (
            <div key={k} className="json-row">
              <span className="json-key">{k}</span>
              <span className="json-value">{String(v)}</span>
            </div>
          ))}
        </div>
      )
    }
  } catch {
    // not JSON, fall through
  }

  return <span className="diff-value-text">{value}</span>
}

function ColorValue({ color, rawValue }: { color: string; rawValue?: string }) {
  const showTransform = rawValue && rawValue.toLowerCase() !== color.toLowerCase()
  return (
    <div className="color-value">
      <span className="color-swatch" style={{ backgroundColor: color }} />
      {showTransform && <span className="color-raw">{rawValue}</span>}
      {showTransform && <span className="color-arrow">{'->'}</span>}
      <span className="diff-value-text">{color}</span>
    </div>
  )
}
