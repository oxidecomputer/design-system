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
const Security12Icon = ({
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
      d="M4 5h4V4a2 2 0 1 0-4 0zM2 5h-.333A.667.667 0 0 0 1 5.667v5.666c0 .368.299.667.667.667h8.666a.667.667 0 0 0 .667-.667V5.667A.667.667 0 0 0 10.333 5H10V4a4 4 0 1 0-8 0z"
      clipRule="evenodd"
    />
  </svg>
)
export default Security12Icon
