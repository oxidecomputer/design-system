import { type AdocTypes, Table as InnerTable } from '@oxide/react-asciidoc'

const Table = ({ node }: { node: AdocTypes.Table }) => (
  <div className="table-wrapper">
    <InnerTable node={node} />
  </div>
)

export default Table
