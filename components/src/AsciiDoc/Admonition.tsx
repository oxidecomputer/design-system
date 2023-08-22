/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type AdocTypes, Content, Title, useGetContent } from '@oxide/react-asciidoc'
import parse from 'html-react-parser'

import { titleCase } from '../utils'

const Admonition = ({ node }: { node: AdocTypes.Block }) => {
  const attrs = node.getAttributes()
  const content = useGetContent(node)

  // Undocumented asciidoc attribute
  // Use this to check if we should render the content as is, or use a <Content /> block
  const contentModel = node.getContentModel()

  let icon
  if (attrs.name === 'caution') {
    icon = <Error12 />
  } else if (attrs.name === 'warning') {
    icon = <Warning12 />
  } else {
    icon = <Error12 className="rotate-180" />
  }

  return (
    <div className={`admonitionblock ${attrs.name}`}>
      <div className="admonition-icon">{icon}</div>
      <div className="admonition-content content">
        <Title node={node} />
        <div>{titleCase(attrs.name)}</div>
        <p>
          {contentModel === 'simple' ? (
            parse(content)
          ) : (
            <Content blocks={node.getBlocks()} />
          )}
        </p>
      </div>
    </div>
  )
}

const Error12 = ({ className }: { className?: string }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12Zm.083-9c.368 0 .667.299.667.667v2.666A.667.667 0 0 1 6.083 7h-.166a.667.667 0 0 1-.667-.667V3.667c0-.368.299-.667.667-.667h.166Zm0 5c.368 0 .667.299.667.667v.166a.667.667 0 0 1-.667.667h-.166a.667.667 0 0 1-.667-.667v-.166c0-.368.299-.667.667-.667h.166Z"
      fill="currentColor"
    />
  </svg>
)

const Warning12 = ({ className }: { className?: string }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12Zm.083-9c.368 0 .667.299.667.667v2.666A.667.667 0 0 1 6.083 7h-.166a.667.667 0 0 1-.667-.667V3.667c0-.368.299-.667.667-.667h.166Zm0 5c.368 0 .667.299.667.667v.166a.667.667 0 0 1-.667.667h-.166a.667.667 0 0 1-.667-.667v-.166c0-.368.299-.667.667-.667h.166Z"
      fill="currentColor"
    />
  </svg>
)

export default Admonition
