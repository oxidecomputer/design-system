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
const DownloadRoundel16Icon = ({
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
      d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14M4.905 8H7V4.75A.75.75 0 0 1 7.75 4h.5a.75.75 0 0 1 .75.75V8h2.095c.334 0 .501.404.265.64l-2.83 2.83a.75.75 0 0 1-1.06 0L4.64 8.64A.375.375 0 0 1 4.905 8"
      clipRule="evenodd"
    />
  </svg>
)
export default DownloadRoundel16Icon
