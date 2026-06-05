/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Link16Icon } from '@/icons/react'
import { Content, parse, RenderInline, type SectionBlock } from '@oxide/react-asciidoc'
import cn from 'classnames'
import { createElement, type JSX } from 'react'

const Section = ({ node }: { node: SectionBlock }) => {
  const level = node.level
  let title: JSX.Element | string = ''

  let sectNum = node.num
  sectNum = sectNum && sectNum[0] === '.' ? '' : sectNum

  // Captioned titles (appendices, etc.) arrive as an HTML string; everything
  // else comes from the inline AST. The title carries no self-link, so wrapping
  // it in our own `<a>` below doesn't nest anchors.
  const titleContent = node.hasCaption ? (
    parse(node.title)
  ) : (
    <RenderInline nodes={node.titleInlines} />
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
