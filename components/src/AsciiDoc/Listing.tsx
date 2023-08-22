/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  type AdocTypes,
  CaptionedTitle,
  getLineNumber,
  useGetContent,
} from '@oxide/react-asciidoc'
import cn from 'classnames'
import hljs from 'highlight.js'
import { decode } from 'html-entities'

const Listing = ({ node }: { node: AdocTypes.Block }) => {
  const document = node.getDocument()
  const attrs = node.getAttributes()
  const nowrap = node.isOption('nowrap') || !document.hasAttribute('prewrap')
  const content = useGetContent(node)
  const decodedContent = decode(content) || content // unescape the html entities

  if (node.getStyle() === 'source') {
    const lang = attrs.language

    return (
      <div className="listingblock" {...getLineNumber(node)}>
        <CaptionedTitle node={node} />
        <div className="content">
          <pre className={cn('highlight', nowrap ? ' nowrap' : '')}>
            {lang ? (
              <code
                className={lang ? `language-${lang}` : ''}
                data-lang={lang}
                dangerouslySetInnerHTML={{
                  __html: hljs.getLanguage(lang)
                    ? hljs.highlight(decodedContent, { language: lang }).value
                    : decodedContent,
                }}
              />
            ) : (
              <code dangerouslySetInnerHTML={{ __html: decodedContent }} />
            )}
          </pre>
        </div>
      </div>
    )
  } else {
    return (
      <div className="listingblock" {...getLineNumber(node)}>
        <CaptionedTitle node={node} />
        <div className="content">
          <pre className={nowrap ? ' nowrap' : ''}>{node.getSource()}</pre>
        </div>
      </div>
    )
  }
}

export default Listing
