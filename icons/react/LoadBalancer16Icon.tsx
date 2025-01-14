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
const LoadBalancer16Icon = ({
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
      d="M10.25 0h-4.5A.75.75 0 0 0 5 .75v3.5c0 .414.336.75.75.75H7v2H2.75a.75.75 0 0 0-.75.75V11H.75a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75H4V9h8v2h-1.25a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75H14V7.75a.75.75 0 0 0-.75-.75H9V5h1.25a.75.75 0 0 0 .75-.75V.75a.75.75 0 0 0-.75-.75"
      clipRule="evenodd"
    />
  </svg>
)
export default LoadBalancer16Icon
