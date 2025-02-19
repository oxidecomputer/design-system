/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Link16Icon } from '@/icons/react'
import { Content, type SectionBlock, parse } from '@oxide/react-asciidoc'
import cn from 'classnames'
import { type JSX, createElement } from 'react'

// We need to remove anchors from the section title (and table of contents) because having
// an anchor within an anchor causes a client/server render mismatch
export const stripAnchors = (str: string) => str.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')

const Section = ({ node }: { node: SectionBlock }) => {
  const level = node.level
  let title: JSX.Element | string = ''

  let sectNum = node.num
  sectNum = sectNum && sectNum[0] === '.' ? '' : sectNum

  title = (
    <>
      <span className="anchor" id={node.id || ''} aria-hidden="true" />
      <a className="link group" href={`#${node.id}`}>
        {parse(stripAnchors(node.title))}
        <Link16Icon className="ml-2 hidden text-accent-secondary group-hover:inline-block" />
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
  } else {
    return (
      <div className={cn(`sect${level}`, node.role)}>
        {createElement(`h${level + 1}`, { 'data-sectnum': sectNum }, title)}
        <div className="sectionbody">
          <Content blocks={node.blocks} />
        </div>
      </div>
    )
  }
}

export default Section
