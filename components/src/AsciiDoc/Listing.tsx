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
  getContent,
  getLineNumber,
} from '@oxide/react-asciidoc'
import cn from 'classnames'
import hljs from 'highlight.js'
import { decode } from 'html-entities'

// Custom highlight.js language definition to support TLA+
// Reference: https://github.com/highlightjs/highlight.js/pull/1658
hljs.registerLanguage('tla', function (hljs) {
  return {
    keywords: {
      keyword:
        'ASSUME ASSUMPTION AXIOM BOOLEAN CASE CONSTANT CONSTANTS ELSE EXCEPT EXTENDS FALSE ' +
        'IF IN INSTANCE LET LOCAL MODULE OTHER STRING THEN THEOREM LEMMA PROPOSITION COROLLARY ' +
        'TRUE VARIABLE VARIABLES WITH CHOOSE ENABLED UNCHANGED SUBSET UNION DOMAIN BY OBVIOUS ' +
        'HAVE QED TAKE DEF HIDE RECURSIVE USE DEFINE PROOF WITNESS PICK DEFS PROVE SUFFICES ' +
        'NEW LAMBDA STATE ACTION TEMPORAL ONLY OMITTED ',
    },
    contains: [
      hljs.QUOTE_STRING_MODE,
      hljs.COMMENT('\\(\\*', '\\*\\)'),
      hljs.COMMENT('\\\\\\*', '$'),
      hljs.C_NUMBER_MODE,
      { begin: /\/\\/ }, // relevance booster
    ],
  }
})

const Listing = ({ node }: { node: AdocTypes.Block }) => {
  const document = node.getDocument()
  const attrs = node.getAttributes()
  const nowrap = node.isOption('nowrap') || !document.hasAttribute('prewrap')
  const content = getContent(node)
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
