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
const Ram16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 16 16"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M0 4.75A.75.75 0 0 1 .75 4h14.5a.75.75 0 0 1 .75.75V6h-1.25a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75H16v1.25a.75.75 0 0 1-.75.75H.75A.75.75 0 0 1 0 9.25zM6.25 9h-1.5A.75.75 0 0 1 4 8.25v-2.5A.75.75 0 0 1 4.75 5h1.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75m5 0h-1.5A.75.75 0 0 1 9 8.25v-2.5A.75.75 0 0 1 9.75 5h1.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75M14 11H2v1.25c0 .414.336.75.75.75h10.5a.75.75 0 0 0 .75-.75z"
      clipRule="evenodd"
    />
  </svg>
)
export default Ram16Icon
