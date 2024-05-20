/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type LiteralBlock, Title, useConverterContext } from '@oxide/react-asciidoc'
import cn from 'classnames'

// import hljs from 'highlight.js'

// // Custom highlight.js language definition to support TLA+
// // Reference: https://github.com/highlightjs/highlight.js/pull/1658
// hljs.registerLanguage('tla', function (hljs) {
//   return {
//     keywords: {
//       keyword:
//         'ASSUME ASSUMPTION AXIOM BOOLEAN CASE CONSTANT CONSTANTS ELSE EXCEPT EXTENDS FALSE ' +
//         'IF IN INSTANCE LET LOCAL MODULE OTHER STRING THEN THEOREM LEMMA PROPOSITION COROLLARY ' +
//         'TRUE VARIABLE VARIABLES WITH CHOOSE ENABLED UNCHANGED SUBSET UNION DOMAIN BY OBVIOUS ' +
//         'HAVE QED TAKE DEF HIDE RECURSIVE USE DEFINE PROOF WITNESS PICK DEFS PROVE SUFFICES ' +
//         'NEW LAMBDA STATE ACTION TEMPORAL ONLY OMITTED ',
//     },
//     contains: [
//       hljs.QUOTE_STRING_MODE,
//       hljs.COMMENT('\\(\\*', '\\*\\)'),
//       hljs.COMMENT('\\\\\\*', '$'),
//       hljs.C_NUMBER_MODE,
//       { begin: /\/\\/ }, // relevance booster
//     ],
//   }
// })

const Listing = ({ node }: { node: LiteralBlock }) => {
  const { document } = useConverterContext()

  const nowrap = node.attributes.nowrap || document.attributes?.['prewrap'] || false

  if (node.style === 'source') {
    const lang = node.language

    return (
      <div
        className="listingblock"
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        <Title text={node.title} />
        <div className="content">
          <pre className={cn('highlight', nowrap ? ' nowrap' : '')}>
            {lang ? (
              <code
                className={lang ? `language-${lang}` : ''}
                data-lang={lang}
                dangerouslySetInnerHTML={{
                  __html: node.content || '',
                }}
              />
            ) : (
              <code dangerouslySetInnerHTML={{ __html: node.content || '' }} />
            )}
          </pre>
        </div>
      </div>
    )
  } else {
    return (
      <div
        className="listingblock"
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        <Title text={node.title} />
        <div className="content">
          <pre className={nowrap ? ' nowrap' : ''}>
            <code dangerouslySetInnerHTML={{ __html: node.source }} />
          </pre>
        </div>
      </div>
    )
  }
}

export default Listing
