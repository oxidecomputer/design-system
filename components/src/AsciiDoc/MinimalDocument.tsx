import { type AdocTypes, Content } from '@oxide/react-asciidoc'

const MinimalDocument = ({ document }: { document: AdocTypes.Document }) => (
  <div id="content" className="asciidoc-body w-full">
    <Content blocks={document.getBlocks()} />
  </div>
)

export default MinimalDocument
