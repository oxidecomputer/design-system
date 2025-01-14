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
const Access16Icon = ({
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
      d="M5 13.29a6.32 6.32 0 0 1-3-5.354V3.541a.75.75 0 0 1 .513-.712l5.25-1.75a.75.75 0 0 1 .474 0l5.25 1.75a.75.75 0 0 1 .513.712v4.395c0 2.152-1.12 4.126-3 5.348l-.2.125-2.43 1.38a.75.75 0 0 1-.74 0L5.2 13.41a6 6 0 0 1-.2-.12m0-2.887c0 .175.06.347.18.474.29.307.63.576 1.011.795l.003.002 1.435.815c.23.13.512.13.742 0l1.416-.804q.592-.365 1.033-.835a.7.7 0 0 0 .18-.475V10a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2zM10 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0"
      clipRule="evenodd"
    />
  </svg>
)
export default Access16Icon
