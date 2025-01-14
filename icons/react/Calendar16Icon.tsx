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
const Calendar16Icon = ({
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
      d="M1.75 3a.75.75 0 0 0-.75.75V6h14V3.75a.75.75 0 0 0-.75-.75H13V1h-2v2H5V1H3v2zM1 7h14v7.25a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75zm2 2.75A.75.75 0 0 1 3.75 9h2.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
)
export default Calendar16Icon
