/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const OpenLink12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.667 1H5.02l.99.99.51.51H2.5v7h7V5.48l.51.51.99.99v3.353a.667.667 0 0 1-.667.667H1.667A.667.667 0 0 1 1 10.333V1.667C1 1.299 1.299 1 1.667 1ZM9.5 3.5l-1-1-.1-.1-.261-.261L7 1h3.333c.368 0 .667.299.667.667V5L9.862 3.862 9.6 3.6l-.1-.1Z"
      fill="currentColor"
    />
  </svg>
)
export default OpenLink12Icon
