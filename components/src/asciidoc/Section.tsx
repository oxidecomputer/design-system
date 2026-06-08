/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Link16Icon } from '@/icons/react'
import {
  Content,
  inlineHtml,
  parse,
  RenderInline,
  type Inline,
  type SectionBlock,
} from '@oxide/react-asciidoc'
import cn from 'classnames'
import { createElement, type JSX } from 'react'

/** Remove `<a>` open/close tags from an HTML string, keeping their contents. */
const dropAnchorTags = <T extends string | undefined>(html: T): T =>
  (html?.includes('<a') ? html.replace(/<(?:a\b[^>]*|\/a)>/g, '') : html) as T

/**
 * Strip links out of inline title content. The heading is wrapped in a self-link
 * `<a>` below, so any anchor in the title — an inline link, a cross-reference, a
 * footnote marker — would nest an `<a>` inside an `<a>`: invalid HTML that breaks
 * hydration. Unwrap inline links to their text, and render the stock footnote
 * marker with its `<a>` removed (which also drops any hover a footnote override
 * would otherwise add).
 */
const stripLinks = (nodes: Inline.InlineNode[]): Inline.InlineNode[] =>
  nodes.flatMap((node): Inline.InlineNode[] => {
    if (node.type === 'anchor') return stripLinks(node.text)
    if (node.type === 'footnote')
      return [{ type: 'text', text: dropAnchorTags(inlineHtml([node]).__html), raw: true }]
    return [node]
  })

const Section = ({ node }: { node: SectionBlock }) => {
  const level = node.level
  let title: JSX.Element | string = ''

  let sectNum = node.num
  sectNum = sectNum && sectNum[0] === '.' ? '' : sectNum

  // Captioned titles (appendices, etc.) arrive as an HTML string; everything
  // else comes from the inline AST. Either way, strip any links from the title
  // so they don't nest inside the self-link `<a>` we wrap it in below.
  const titleContent = node.hasCaption ? (
    parse(dropAnchorTags(node.title))
  ) : (
    <RenderInline nodes={node.titleInlines && stripLinks(node.titleInlines)} />
  )

  title = (
    <>
      <span className="anchor" id={node.id || ''} aria-hidden="true" />
      <a className="link group" href={`#${node.id}`}>
        {titleContent}
        <Link16Icon className="text-accent-secondary ml-2 hidden group-hover:inline-block" />
      </a>
    </>
  )

  if (level === 0) {
    return (
      <>
        <h1 className={cn('sect0', node.role)} data-sectnum={sectNum}>
          {title}
        </h1>
        <Content blocks={node.blocks} />
      </>
    )
  } else if (level === 1) {
    return (
      <div className={cn('sect1', node.role)}>
        {createElement('h2', { 'data-sectnum': sectNum }, title)}
        <div className="sectionbody">
          <Content blocks={node.blocks} />
        </div>
      </div>
    )
  } else {
    return (
      <div className={cn(`sect${level}`, node.role)}>
        {createElement(`h${level + 1}`, { 'data-sectnum': sectNum }, title)}
        <Content blocks={node.blocks} />
      </div>
    )
  }
}

export default Section
