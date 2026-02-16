import { compareTokens } from '../shared/compare'
import { parseCSSTokens } from '../shared/parse-css'
import type { ApplySettings, DiffResult, FlatToken, PluginMessage } from '../shared/types'
import { readFigmaTextStyles, readFigmaVariables } from './read-figma-styles'
import { createVariable, removeVariable, updateVariable } from './write-figma-variables'

let lastFileTokens: Map<string, FlatToken> | null = null
let lastDiffResult: DiffResult | null = null

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

async function runComparison(css: string) {
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

    for (const entry of lastDiffResult.entries) {
      const fileToken = lastFileTokens.get(entry.name)

      if (entry.status === 'modified' && settings.applyModified && fileToken) {
        const ok = await updateVariable(entry.name, fileToken)
        if (ok) modified++
        else failed++
      }

      if (entry.status === 'added' && settings.applyAdded && fileToken) {
        if (fileToken.type === 'typography') continue
        const ok = await createVariable(entry.name, fileToken)
        if (ok) added++
        else failed++
      }

      if (entry.status === 'removed' && settings.applyRemoved) {
        const ok = await removeVariable(entry.name)
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
