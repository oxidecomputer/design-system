/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { detectType, load, mount, type Mounted } from 'pele/lazy'
import { memo, useEffect, useId, useRef, useState } from 'react'

import { decorateEdges } from './edges'
import { applyRoles, inferRoles } from './roles'

// right-angle edges with rounded corners; per-diagram frontmatter still wins
const config = { flowchart: { curve: 'step' } }

// `highlighted` is Shiki output for the source view, e.g. a listing node's `content`
export const Mermaid = memo(function Mermaid({
  content,
  highlighted,
}: {
  content: string
  highlighted?: string
}) {
  const [showSource, setShowSource] = useState(false)
  const idPrefix = `mermaid-${useId().replace(/:/g, '_')}-`
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current || showSource) return
    const el = ref.current
    let mounted: Mounted | undefined
    let cancelled = false
    // mount only after load so a stale effect can't clear a newer mount
    load(detectType(content)).then(() => {
      if (cancelled) return
      const roles = inferRoles(content, config)
      mounted = mount(el, content, {
        idPrefix,
        config,
        fontSize: 14,
        onRender: () => {
          applyRoles(el, roles)
          decorateEdges(el)
        },
      })
    })
    return () => {
      cancelled = true
      mounted?.destroy()
    }
  }, [content, idPrefix, showSource])

  return (
    <>
      <button
        className="text-mono-xs text-tertiary absolute top-2 right-2"
        onClick={() => setShowSource(!showSource)}
      >
        {showSource ? 'Hide' : 'Show'} Source <span className="text-quaternary">|</span>{' '}
        Mermaid
      </button>
      {!showSource ? (
        <code ref={ref} className="pele-container block w-full" />
      ) : highlighted ? (
        <code
          className="language-mermaid"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      ) : (
        <code>{content}</code>
      )}
    </>
  )
})
