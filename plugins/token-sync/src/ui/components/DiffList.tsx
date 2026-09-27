import type { DiffEntry as DiffEntryType, DiffResult, DiffStatus } from '../../shared/types'
import { tokenKey } from '../../shared/types'
import DiffEntry from './DiffEntry'

const TABS: { label: string; filter: DiffStatus | 'all' }[] = [
  { label: 'All', filter: 'all' },
  { label: 'Modified', filter: 'modified' },
  { label: 'Added', filter: 'added' },
  { label: 'Removed', filter: 'removed' },
  { label: 'Unchanged', filter: 'unchanged' },
]

export default function DiffList({
  entries,
  counts,
  filter,
  onFilterChange,
  onRefresh,
}: {
  entries: DiffEntryType[]
  counts: DiffResult['counts']
  filter: DiffStatus | 'all'
  onFilterChange: (filter: DiffStatus | 'all') => void
  onRefresh: () => void
}) {
  const filtered = filter === 'all' ? entries : entries.filter((e) => e.status === filter)

  return (
    <div className="diff-list">
      <div className="diff-tabs">
        {TABS.map((tab) => {
          const count = tab.filter === 'all' ? counts.total : counts[tab.filter]
          return (
            <button
              key={tab.filter}
              className={`diff-tab ${filter === tab.filter ? 'active' : ''}`}
              onClick={() => onFilterChange(tab.filter)}
            >
              {tab.label}
              {count > 0 && (
                <span className={`tab-badge tab-badge-${tab.filter}`}>{count}</span>
              )}
            </button>
          )
        })}
        <button className="btn btn-refresh" onClick={onRefresh} title="Re-compare">
          Refresh
        </button>
      </div>
      <div className="diff-entries">
        {filtered.length === 0 ? (
          <div className="diff-empty">No tokens in this category</div>
        ) : (
          filtered.map((entry) => (
            <DiffEntry key={tokenKey(entry.name, entry.mode)} entry={entry} />
          ))
        )}
      </div>
    </div>
  )
}
