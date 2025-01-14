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
const Info12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M6 0a6 6 0 1 0 0 12A6 6 0 0 0 6 0m-.083 9a.667.667 0 0 1-.667-.667V5.667c0-.368.299-.667.667-.667h.166c.368 0 .667.299.667.667v2.666A.667.667 0 0 1 6.083 9zm0-5a.667.667 0 0 1-.667-.667v-.166c0-.368.299-.667.667-.667h.166c.368 0 .667.299.667.667v.166A.667.667 0 0 1 6.083 4z"
      clipRule="evenodd"
    />
  </svg>
)
export default Info12Icon
