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
const Access24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3 4.72a1 1 0 0 1 .684-.948l8-2.667a1 1 0 0 1 .632 0l8 2.667a1 1 0 0 1 .684.949v8.572a8 8 0 0 1-4.115 6.993l-4.4 2.444a1 1 0 0 1-.97 0l-4.4-2.444A8 8 0 0 1 3 13.293zM7 15a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1.434a1 1 0 0 1-.485.857l-4 2.4a1 1 0 0 1-1.03 0l-4-2.4A1 1 0 0 1 7 16.434zm5-5a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
      clipRule="evenodd"
    />
  </svg>
)
export default Access24Icon
