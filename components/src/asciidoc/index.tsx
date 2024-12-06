/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Content, type DocumentBlock } from '@oxide/react-asciidoc'

import Admonition from './Admonition'
import Section from './Section'
import Table from './Table'
import { handleDocument, highlight, loadAsciidoctor } from './util'

const MinimalDocument = ({ document }: { document: DocumentBlock }) => (
  <div id="content" className="asciidoc-body w-full">
    <Content blocks={document.blocks} />
  </div>
)

const AsciiDocBlocks = {
  Admonition,
  Table,
  Section,
  MinimalDocument,
}

export { AsciiDocBlocks, handleDocument, highlight, loadAsciidoctor }
