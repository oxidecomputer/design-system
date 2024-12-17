/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import asciidoctor, { Block, Html5Converter, Inline } from '@asciidoctor/core'
import { Content, type DocumentBlock } from '@oxide/react-asciidoc'

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

// prettier-ignore
const QUOTE_TAGS: {[key: string]: [string, string, boolean?]} = {
  "monospaced": ['<code>', '</code>', true],
  "emphasis": ['<em>', '</em>', true],
  "strong": ['<strong>', '</strong>', true],
  "double": ['&#8220;', '&#8221;'],
  "single": ['&#8216;', '&#8217;'],
  "mark": ['<mark>', '</mark>', true],
  "superscript": ['<sup>', '</sup>', true],
  "subscript": ['<sub>', '</sub>', true],
  "unquoted": ['<span>', '</span>', true],
  "asciimath": ['\\$', '\\$'],
  "latexmath": ['\\(', '\\)'],
}

const chop = (str: string) => str.substring(0, str.length - 1)

const convertInlineQuoted = (node: Inline) => {
  const type = node.getType()
  const quoteTag = QUOTE_TAGS[type]
  const [open, close, tag] = quoteTag || ['', '']

  let text = node.getText()

  // Add <wbr> for line breaks with long paths
  // Ignores a / if there's a space before it
  if (type === 'monospaced') {
    text = renderWithBreaks(text)
  }

  const id = node.getId()
  const role = node.getRole()

  const idAttr = id ? `id="${id}"` : ''
  const classAttr = role ? `class="${role}"` : ''
  const attrs = `${idAttr} ${classAttr}`

  if (id || role) {
    if (tag) {
      return `${chop(open)} ${attrs}>${text}${close}`
    } else {
      return `<span ${attrs}>${open}${text}${close}</span>`
    }
  } else {
    return `${open}${text}${close}`
  }
}

function convertInlineCallout(node: Inline): string {
  return `<i class="conum" data-value="${node.getText()}"></i>`
}

const ad = asciidoctor()

class InlineConverter {
  baseConverter: Html5Converter

  constructor() {
    this.baseConverter = new ad.Html5Converter()
  }

  convert(node: Block, transform: string) {
    switch (node.getNodeName()) {
      case 'inline_quoted':
        return convertInlineQuoted(node as unknown as Inline) // We know this is always inline
      case 'inline_callout':
        return convertInlineCallout(node as unknown as Inline) // We know this is always inline
      default:
        break
    }

    return this.baseConverter.convert(node, transform)
  }
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
  InlineConverter,
  useDelegatedReactRouterLinks,
}
