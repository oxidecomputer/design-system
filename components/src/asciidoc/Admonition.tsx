/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Error12Icon, Info12Icon, Warning12Icon } from '@/icons/react'
import { Content, RenderInline, type AdmonitionBlock } from '@oxide/react-asciidoc'
import cn from 'classnames'

import { titleCase } from '../utils'

const themeForAdmonition: Record<string, string> = {
  note: 'green-theme',
  caution: 'yellow-theme',
  important: 'yellow-theme',
  warning: 'red-theme',
  tip: 'purple-theme',
}

const Admonition = ({ node }: { node: AdmonitionBlock }) => {
  const attrs = node.attributes
  const theme = themeForAdmonition[attrs.name] || ''

  let icon
  if (attrs.name === 'caution') {
    icon = <Error12Icon />
  } else if (attrs.name === 'warning') {
    icon = <Warning12Icon />
  } else {
    icon = <Info12Icon />
  }

  return (
    <div
      id={node.id || undefined}
      className={cn('admonitionblock', attrs.name, theme, node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <div className="admonition-icon">{icon}</div>
      <div className="admonition-content content">
        <div>{titleCase(attrs.name.toString())}</div>
        <div>
          {node.titleInlines && (
            <div className="admonition-title">
              <RenderInline nodes={node.titleInlines} />
            </div>
          )}
          {/* Simple (single-paragraph) admonitions carry their content as an
              inline AST; multi-block admonitions render their child blocks. */}
          {node.inlines && <RenderInline nodes={node.inlines} />}
          <Content blocks={node.blocks} />
        </div>
      </div>
    </div>
  )
}

export default Admonition
