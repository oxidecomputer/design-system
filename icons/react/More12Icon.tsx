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
const More12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M5 1.667C5 1.299 5.299 1 5.667 1h.666c.368 0 .667.299.667.667v.666A.667.667 0 0 1 6.333 3h-.666A.667.667 0 0 1 5 2.333zm0 4C5 5.299 5.299 5 5.667 5h.666c.368 0 .667.299.667.667v.666A.667.667 0 0 1 6.333 7h-.666A.667.667 0 0 1 5 6.333zm2 4A.667.667 0 0 0 6.333 9h-.666A.667.667 0 0 0 5 9.667v.666c0 .368.299.667.667.667h.666A.667.667 0 0 0 7 10.333z"
      clipRule="evenodd"
    />
  </svg>
)
export default More12Icon
