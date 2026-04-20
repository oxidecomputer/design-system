/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useState } from 'react'

import { highlightCode } from '../components/src/asciidoc/util'

type Props = {
  code: string
  lang?: string
}

export function CodeBlock({ code, lang = 'tsx' }: Props) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    highlightCode(code, lang).then((result) => {
      if (cancelled) return
      setHtml(result)
    })
    return () => {
      cancelled = true
    }
  }, [code, lang])

  return (
    <div
      className="text-mono-code [&_pre]:overflow-x-auto [&_pre]:p-4"
      dangerouslySetInnerHTML={{
        __html: html ?? `<pre><code>${escape(code)}</code></pre>`,
      }}
    />
  )
}

function escape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
