/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Link16Icon } from '@/icons/react'
import { type AdocTypes, Content, getRole } from '@oxide/react-asciidoc'
import cn from 'classnames'
import parse from 'html-react-parser'
import { createElement } from 'react'

const Section = ({ node }: { node: AdocTypes.Section }) => {
  const docAttrs = node.getDocument().getAttributes()
  const level = node.getLevel()
  let title: JSX.Element | string = ''

  let sectNum = node.getSectionNumeral()
  sectNum = sectNum === '.' ? '' : sectNum

  const sectNumLevels = docAttrs['sectnumlevels'] ? parseInt(docAttrs['sectnumlevels']) : 3

  if (node.getCaption()) {
    title = node.getCaptionedTitle()
  } else if (node.isNumbered() && level <= sectNumLevels) {
    if (level < 2 && node.getDocument().getDoctype() === 'book') {
      const sectionName = node.getSectionName()
      if (sectionName === 'chapter') {
        const signifier = docAttrs['chapter-signifier']
        title = `${signifier || ''} ${sectNum} ${node.getTitle()}`
      } else if (sectionName === 'part') {
        const signifier = docAttrs['part-signifier']
        title = `${signifier || ''} ${sectNum} ${node.getTitle()}`
      } else {
        title = node.getTitle() || ''
      }
    } else {
      title = node.getTitle() || ''
    }
  } else {
    title = node.getTitle() || ''
  }

  title = (
    <>
      <a className="anchor" id={node.getId() || ''} aria-hidden />
      <a className="link group" href={`#${node.getId()}`}>
        {parse(title)}
        <Link16Icon className="text-accent-secondary hidden group-hover:inline-block ml-2" />
      </a>
    </>
  )

  if (level === 0) {
    return (
      <>
        <h1 className={cn('sect0', getRole(node))} data-sectnum={sectNum}>
          {title}
        </h1>
        <Content blocks={node.getBlocks()} />
      </>
    )
  } else {
    return (
      <div className={cn(`sect${level}`, getRole(node))}>
        {createElement(`h${level + 1}`, { 'data-sectnum': sectNum }, title)}
        <div className="sectionbody">
          <Content blocks={node.getBlocks()} />
        </div>
      </div>
    )
  }
}

export default Section
