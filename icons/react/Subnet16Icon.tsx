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
const Subnet16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M.75 0h4.5A.75.75 0 0 1 6 .75V2h4V.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75H14v4h1.25a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75V14H6v1.25a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1-.75-.75v-4.5A.75.75 0 0 1 .75 10H2V6H.75A.75.75 0 0 1 0 5.25V.75A.75.75 0 0 1 .75 0M6 12h4v-1.25a.75.75 0 0 1 .75-.75H12V6h-1.25a.75.75 0 0 1-.75-.75V4H6v1.25a.75.75 0 0 1-.75.75H4v4h1.25a.75.75 0 0 1 .75.75z"
      clipRule="evenodd"
    />
  </svg>
)
export default Subnet16Icon
