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
const Overview16Icon = ({
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
      d="M7 1.75A.75.75 0 0 0 6.25 1h-4.5a.75.75 0 0 0-.75.75v6.5c0 .414.336.75.75.75h4.5A.75.75 0 0 0 7 8.25zm8 0a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0-.75.75v2.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75zm-14 10a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75zm14-4a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0-.75.75v6.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75z"
      clipRule="evenodd"
    />
  </svg>
)
export default Overview16Icon
