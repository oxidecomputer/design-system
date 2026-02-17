import { compareTokens } from '../shared/compare'
import { modeForBaseToken, parseCSSTokens } from '../shared/parse-css'
import type {
  ApplySettings,
  CSSFiles,
  DiffEntry,
  DiffResult,
  FlatToken,
  PluginMessage,
} from '../shared/types'
import { COLLECTION_PREFIX_MAP, tokenKey } from '../shared/types'
import { readFigmaTextStyles, readFigmaVariables } from './read-figma-styles'
import {
  createVariable,
  initCache,
  removeTextStyle,
  removeVariable,
  updateTextStyle,
  updateVariable,
} from './write-figma-variables'

let lastFileTokens: Map<string, FlatToken> | null = null
let lastDiffResult: DiffResult | null = null

/** Count how deep an alias chain goes (e.g. surface → theme → base = depth 2). */
function aliasDepth(rawValue: string, tokens: Map<string, FlatToken>): number {
  let depth = 0
  let current = rawValue
  const seen = new Set<string>()
  while (depth < 10) {
    const match = current.match(/^\{([^}]+)\}$/)
    if (!match) break
    const refName = match[1]
    if (seen.has(refName)) break
    seen.add(refName)
    depth++
    // Try all possible mode keys for the referenced token
    const refToken =
      tokens.get(tokenKey(refName, modeForBaseToken(refName))) ??
      tokens.get(tokenKey(refName, 'dark')) ??
      tokens.get(tokenKey(refName, 'light'))
    if (!refToken?.rawValue) break
    current = refToken.rawValue
  }
  return depth
}

export default function () {
  figma.showUI(__html__, { width: 800, height: 700, themeColors: true })

  figma.ui.onmessage = (msg: PluginMessage) => {
    if (msg.type === 'COMPARE_WITH_CSS') {
      runComparison(msg.css)
    }
    if (msg.type === 'APPLY') {
      applyChanges(msg.settings)
    }
  }
}

async function runComparison(css: CSSFiles) {
  const send = (msg: PluginMessage) => figma.ui.postMessage(msg)

  send({ type: 'LOADING' })

  try {
    const fileTokens = parseCSSTokens(css)
    const variables = await readFigmaVariables()
    const textStyles = await readFigmaTextStyles()
    const figmaTokens = new Map([...variables, ...textStyles])

    console.log(
      `Token sync: ${fileTokens.size} file tokens, ${figmaTokens.size} Figma tokens (${variables.size} vars, ${textStyles.size} text styles)`,
    )

    const result = compareTokens(fileTokens, figmaTokens)

    console.log(
      `Diff: ${result.counts.modified} modified, ${result.counts.added} added, ${result.counts.removed} removed, ${result.counts.unchanged} unchanged`,
    )

    lastFileTokens = fileTokens
    lastDiffResult = result

    send({ type: 'COMPARE_RESULT', data: result })
  } catch (err) {
    send({
      type: 'ERROR',
      message: err instanceof Error ? err.message : String(err),
    })
  }
}

function collectionNameForToken(name: string): string {
  for (const [prefix, cn] of Object.entries(COLLECTION_PREFIX_MAP)) {
    if (name.startsWith(prefix)) return cn
  }
  return 'main'
}

/**
 * Ensure that all needed collections exist with correctly named modes.
 *
 * Creates missing collections, renames the default first mode to "Dark",
 * and adds a "Light" mode to the 'main' collection.
 */
async function ensureCollectionsAndModes(entries: DiffEntry[]): Promise<void> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync()
  const byName = new Map(collections.map((c) => [c.name, c]))

  // Determine which collections are needed
  const neededCollections = new Set<string>()
  let needsLight = false
  for (const entry of entries) {
    if (entry.status === 'removed') continue
    neededCollections.add(collectionNameForToken(entry.name))
    if (entry.mode === 'light') needsLight = true
  }

  // Create missing collections
  for (const name of neededCollections) {
    if (!byName.has(name)) {
      const col = figma.variables.createVariableCollection(name)
      byName.set(name, col)
      console.log(`Created collection "${name}"`)
    }
  }

  // Set up modes on 'main' collection only (dark + light)
  const main = byName.get('main')
  if (main) {
    const existingModes = new Map(main.modes.map((m) => [m.name.toLowerCase(), m.modeId]))

    if (!existingModes.has('dark') && main.modes.length > 0) {
      const firstMode = main.modes[0]
      main.renameMode(firstMode.modeId, 'Dark')
      console.log(`Renamed mode "${firstMode.name}" to "Dark" on "main"`)
    }

    if (needsLight && !existingModes.has('light')) {
      main.addMode('Light')
      console.log(`Created "Light" mode on "main"`)
    }
  }
}

async function applyChanges(settings: ApplySettings) {
  const send = (msg: PluginMessage) => figma.ui.postMessage(msg)

  if (!lastFileTokens || !lastDiffResult) {
    send({ type: 'ERROR', message: 'No comparison data. Refresh first.' })
    return
  }

  send({ type: 'APPLYING' })

  try {
    let modified = 0
    let added = 0
    let removed = 0
    let failed = 0

    // Create missing collections and set up modes before applying
    await ensureCollectionsAndModes(lastDiffResult.entries)

    // Cache all variables and collections for fast lookups during apply
    await initCache()

    // Sort entries so dependencies are created before the tokens that reference them.
    // Tokens without aliases first, then by alias depth (base → theme → semantic).
    const sortedEntries = [...lastDiffResult.entries].sort((a, b) => {
      const aKey = tokenKey(a.name, a.mode)
      const bKey = tokenKey(b.name, b.mode)
      const aAlias = lastFileTokens!.get(aKey)?.rawValue
      const bAlias = lastFileTokens!.get(bKey)?.rawValue
      const aDepth = aAlias ? aliasDepth(aAlias, lastFileTokens!) : 0
      const bDepth = bAlias ? aliasDepth(bAlias, lastFileTokens!) : 0
      return aDepth - bDepth
    })

    for (const entry of sortedEntries) {
      const key = tokenKey(entry.name, entry.mode)
      const fileToken = lastFileTokens.get(key)
      const isTypography = entry.type === 'typography'

      if (entry.status === 'modified' && settings.applyModified && fileToken) {
        const ok = isTypography
          ? await updateTextStyle(entry.name, fileToken)
          : await updateVariable(entry.name, fileToken)
        if (ok) modified++
        else failed++
      }

      if (entry.status === 'added' && settings.applyAdded && fileToken) {
        // Typography styles can't be auto-created yet
        if (isTypography) continue
        const ok = await createVariable(entry.name, fileToken)
        if (ok) added++
        else failed++
      }

      if (entry.status === 'removed' && settings.applyRemoved) {
        const ok = isTypography
          ? await removeTextStyle(entry.name)
          : await removeVariable(entry.name, entry.mode)
        if (ok) removed++
        else failed++
      }
    }

    const parts: string[] = []
    if (modified > 0) parts.push(`${modified} updated`)
    if (added > 0) parts.push(`${added} created`)
    if (removed > 0) parts.push(`${removed} removed`)
    if (failed > 0) parts.push(`${failed} failed`)
    const summary = parts.length > 0 ? parts.join(', ') : 'No changes applied'

    console.log(`Apply result: ${summary}`)
    send({ type: 'APPLY_RESULT', summary })

    // Signal UI to re-fetch and re-compare
    send({ type: 'REFRESH' })
  } catch (err) {
    send({
      type: 'ERROR',
      message: err instanceof Error ? err.message : String(err),
    })
  }
}
