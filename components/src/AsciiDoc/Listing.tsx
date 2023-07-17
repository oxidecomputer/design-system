import { type AdocTypes, CaptionedTitle, useGetContent } from '@oxide/react-asciidoc'
import cn from 'classnames'
import hljs from 'highlight.js'

const Listing = ({ node }: { node: AdocTypes.Block }) => {
  const document = node.getDocument()
  const attrs = node.getAttributes()
  const nowrap = node.isOption('nowrap') || !document.hasAttribute('prewrap')
  const content = useGetContent(node)

  if (node.getStyle() === 'source') {
    const lang = attrs.language

    // console.log(node.applySubstitutions(node.getSource(), ['callouts']))
    // console.log(node.getSource())

    return (
      <div className="listingblock">
        <CaptionedTitle node={node} />
        <div className="content">
          <pre className={cn('highlight', nowrap ? ' nowrap' : '')}>
            {lang ? (
              <code
                className={lang ? `language-${lang}` : ''}
                data-lang={lang}
                dangerouslySetInnerHTML={{
                  __html: hljs.getLanguage(lang)
                    ? hljs.highlight(content, { language: lang }).value
                    : content,
                }}
              />
            ) : (
              <code dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </pre>
        </div>
      </div>
    )
  } else {
    return (
      <div className="listingblock">
        <CaptionedTitle node={node} />
        <div className="content">
          <pre className={nowrap ? ' nowrap' : ''}>
            <code dangerouslySetInnerHTML={{ __html: node.getSource() }} />
          </pre>
        </div>
      </div>
    )
  }
}

export default Listing
