/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  Content,
  inlineHtml,
  parse,
  type DocumentBlock,
  type InlineOverrides,
} from '@oxide/react-asciidoc'

import Admonition from './Admonition'
import Section from './Section'
import Table from './Table'
import {
  DesktopOutline,
  SmallScreenOutline,
  useActiveSectionTracking,
  useIntersectionObserver,
} from './TableOfContents'
import { useDelegatedReactRouterLinks } from './use-delegated-links'
import { attrs, handleDocument, highlight, loadAsciidoctor } from './util'

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

/**
 * Adds word break opportunities (<wbr/>) after slashes in text, except within HTML tags.
 * This function is used to improve line breaks for long paths or URLs in rendered content.
 * *
 * renderWithBreaks('/path/to/long/file.txt')
 * '/<wbr/>path/<wbr/>to/<wbr/>long/<wbr/>file.txt'
 */
export const renderWithBreaks = (text: string): string => {
  return text
    .split(/(<[^>]*>)/g)
    .map((segment) => {
      // if the segment is an HTML tag, leave it unchanged
      if (segment.startsWith('<') && segment.endsWith('>')) {
        return segment
      }
      // replace slashes that are not surrounded by spaces
      return segment.replace(/(?:^|(?<=\S))\/(?=\S)/g, '/<wbr/>')
    })
    .join('')
}

/**
 * Inline-level overrides for the renderer. Pass these to `<Asciidoc>` as
 * `options.inlineOverrides` to apply our customisations to inline content:
 *
 *   <Asciidoc document={doc} options={{ overrides: AsciiDocBlocks, inlineOverrides }} />
 *
 * The only customisation today is inserting `<wbr/>` break opportunities into
 * inline monospaced (`code`) spans so long paths and URLs wrap nicely. Every
 * other quoted subtype is rendered exactly as the renderer would by default —
 * we round-trip the node through `inlineHtml` (the renderer's own serialiser)
 * and `parse` it back into React elements, so there's no risk of drifting from
 * the stock output.
 */
export const inlineOverrides: InlineOverrides = {
  quoted: ({ node }) => {
    let { __html } = inlineHtml([node])
    if (node.subtype === 'monospaced') {
      __html = renderWithBreaks(__html)
    }
    return <>{parse(__html)}</>
  },
}

export {
  AsciiDocBlocks,
  handleDocument,
  highlight,
  loadAsciidoctor,
  attrs,
  DesktopOutline,
  SmallScreenOutline,
  useActiveSectionTracking,
  useIntersectionObserver,
  useDelegatedReactRouterLinks,
}
