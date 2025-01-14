/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Filter12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={12}
    viewBox="0 0 12 12"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M0 1.667C0 1.299.299 1 .667 1h10.666c.368 0 .667.299.667.667v.666a.667.667 0 0 1-.667.667H.667A.667.667 0 0 1 0 2.333zm2 4C2 5.299 2.299 5 2.667 5h6.666c.368 0 .667.299.667.667v.666A.667.667 0 0 1 9.333 7H2.667A.667.667 0 0 1 2 6.333zm6 4A.667.667 0 0 0 7.333 9H4.667A.667.667 0 0 0 4 9.667v.666c0 .368.299.667.667.667h2.666A.667.667 0 0 0 8 10.333z"
      clipRule="evenodd"
    />
  </svg>
)
export default Filter12Icon
