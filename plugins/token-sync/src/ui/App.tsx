import { useCallback, useEffect, useRef, useState } from 'react'

import type { ApplySettings, DiffResult, DiffStatus, PluginMessage } from '../shared/types'
import DiffList from './components/DiffList'

const CSS_URL = (branch: string, file: string) =>
  `https://raw.githubusercontent.com/oxidecomputer/design-system/${encodeURIComponent(branch)}/styles/${file}`

type State =
  | { status: 'idle'; data?: undefined }
  | { status: 'loading'; data?: DiffResult }
  | { status: 'applying'; data: DiffResult }
  | { status: 'error'; message: string; data?: DiffResult }
  | { status: 'ready'; data: DiffResult; applyResult?: string }

const App = () => {
  const [state, setState] = useState<State>({ status: 'idle' })
  const [branch, setBranch] = useState('master')
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [filter, setFilter] = useState<DiffStatus | 'all'>('all')
  const [settings, setSettings] = useState<ApplySettings>({
    applyModified: true,
    applyAdded: true,
    applyRemoved: false,
  })
  const branchRef = useRef(branch)
  branchRef.current = branch

  const fetchAndCompare = useCallback(async (branchName: string) => {
    setFetchError(null)
    setState((prev) => ({
      status: 'loading',
      data:
        prev.status === 'ready' || prev.status === 'loading' || prev.status === 'error'
          ? prev.data
          : undefined,
    }))
    try {
      const files = ['main.css', 'dark.css', 'light.css'] as const
      const responses = await Promise.all(files.map((f) => fetch(CSS_URL(branchName, f))))
      for (let i = 0; i < responses.length; i++) {
        const res = responses[i]
        if (!res.ok) {
          const msg =
            res.status === 404
              ? `File "${files[i]}" not found on branch "${branchName}"`
              : `Failed to fetch ${files[i]} (${res.status})`
          setFetchError(msg)
          setState((prev) => ({
            status: 'error',
            data: prev.data,
            message: msg,
          }))
          return
        }
      }
      const [mainCss, darkCss, lightCss] = await Promise.all(responses.map((r) => r.text()))
      parent.postMessage(
        {
          pluginMessage: {
            type: 'COMPARE_WITH_CSS',
            css: { main: mainCss, dark: darkCss, light: lightCss },
          },
        },
        '*',
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setFetchError(msg)
      setState((prev) =>
        prev.data
          ? { status: 'ready' as const, data: prev.data, message: msg }
          : { status: 'error' as const, message: msg },
      )
    }
  }, [])

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data.pluginMessage as PluginMessage
      if (!msg) return

      switch (msg.type) {
        case 'LOADING':
          setState((prev) => ({ status: 'loading', data: prev.data }))
          break
        case 'APPLYING':
          setState((prev) => ({ status: 'applying', data: prev.data! }))
          break
        case 'COMPARE_RESULT':
          setFetchError(null)
          setState((prev) => ({
            status: 'ready',
            data: msg.data,
            applyResult: prev.status === 'ready' ? prev.applyResult : undefined,
          }))
          break
        case 'APPLY_RESULT':
          setState((prev) =>
            prev.status === 'ready' ? { ...prev, applyResult: msg.summary } : prev,
          )
          break
        case 'REFRESH':
          fetchAndCompare(branchRef.current)
          break
        case 'ERROR':
          setState((prev) =>
            prev.data
              ? { status: 'ready' as const, data: prev.data, message: msg.message }
              : { status: 'error' as const, message: msg.message },
          )
          break
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [fetchAndCompare])

  // Fetch on initial load
  useEffect(() => {
    fetchAndCompare(branch)
  }, [])

  const refresh = () => {
    fetchAndCompare(branch)
  }

  const apply = () => {
    parent.postMessage({ pluginMessage: { type: 'APPLY', settings } }, '*')
  }

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAndCompare(branch)
  }

  const data = state.data
  const isLoading = state.status === 'idle' || (state.status === 'loading' && !data)

  if (isLoading) {
    return (
      <div className="center">
        <p>Comparing tokens...</p>
      </div>
    )
  }

  if (state.status === 'applying') {
    return (
      <div className="center">
        <p>Applying changes...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="app">
        <form className="branch-bar" onSubmit={handleBranchSubmit}>
          <label className="branch-label" htmlFor="branch-input">
            Branch
          </label>
          <input
            id="branch-input"
            className="branch-input"
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="master"
          />
          <button className="btn" type="submit">
            Fetch
          </button>
          {fetchError && <span className="branch-error">{fetchError}</span>}
        </form>
        <div className="center">
          <p className="error-text">{fetchError || 'No data'}</p>
        </div>
      </div>
    )
  }

  const { counts } = data
  const hasChanges =
    (settings.applyModified && counts.modified > 0) ||
    (settings.applyAdded && counts.added > 0) ||
    (settings.applyRemoved && counts.removed > 0)

  return (
    <div className="app">
      <form className="branch-bar" onSubmit={handleBranchSubmit}>
        <label className="branch-label" htmlFor="branch-input">
          Branch
        </label>
        <input
          id="branch-input"
          className="branch-input"
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder="main"
        />
        <button className="btn" type="submit">
          Fetch
        </button>
        {fetchError && <span className="branch-error">{fetchError}</span>}
      </form>
      <DiffList
        entries={data.entries}
        counts={data.counts}
        filter={filter}
        onFilterChange={setFilter}
        onRefresh={refresh}
      />
      <div className="apply-footer">
        {state.status === 'ready' && state.applyResult && (
          <div className="apply-result">{state.applyResult}</div>
        )}
        <div className="apply-controls">
          <label className="apply-checkbox">
            <input
              type="checkbox"
              checked={settings.applyModified}
              onChange={(e) =>
                setSettings({ ...settings, applyModified: e.target.checked })
              }
            />
            Modified
          </label>
          <label className="apply-checkbox">
            <input
              type="checkbox"
              checked={settings.applyAdded}
              onChange={(e) => setSettings({ ...settings, applyAdded: e.target.checked })}
            />
            Added
          </label>
          <label className="apply-checkbox apply-checkbox-danger">
            <input
              type="checkbox"
              checked={settings.applyRemoved}
              onChange={(e) => setSettings({ ...settings, applyRemoved: e.target.checked })}
            />
            Removed
          </label>
          <button className="btn btn-apply" onClick={apply} disabled={!hasChanges}>
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
