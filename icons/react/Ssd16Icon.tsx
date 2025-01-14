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
const Ssd16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M.75 4h14.5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-.75.75H3.31a.75.75 0 0 1-.53-.22L.22 9.22A.75.75 0 0 1 0 8.69V4.75A.75.75 0 0 1 .75 4m2.5 4h-1.5A.75.75 0 0 1 1 7.25v-1.5A.75.75 0 0 1 1.75 5h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75m4.5 3h1.5a.75.75 0 0 0 .75-.75v-4.5A.75.75 0 0 0 9.25 5h-1.5a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75m4 0h1.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75"
      clipRule="evenodd"
    />
  </svg>
)
export default Ssd16Icon
