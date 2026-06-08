/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Asciidoc, type DocumentBlock } from '@oxide/react-asciidoc'
import { useEffect, useState } from 'react'

import {
  AsciiDocBlocks,
  attrs,
  handleDocument,
  loadAsciidoctor,
} from '../components/src/asciidoc'
import writersGuide from './writers-guide.adoc?raw'

const options = {
  overrides: {
    admonition: AsciiDocBlocks.Admonition,
    table: AsciiDocBlocks.Table,
    section: AsciiDocBlocks.Section,
  },
  customDocument: AsciiDocBlocks.MinimalDocument,
}

export function AsciiDocShowcase() {
  const [document, setDocument] = useState<DocumentBlock | null>(null)

  useEffect(() => {
    let cancelled = false
    const ad = loadAsciidoctor({})
    const adDoc = ad.load(writersGuide, { standalone: false, attributes: attrs })
    handleDocument(adDoc).then((doc) => {
      if (!cancelled) setDocument(doc)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!document) return null

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <Asciidoc document={document} options={options} />
    </div>
  )
}
