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
const Hourglass16Icon = ({
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
      d="M4 0h-.25A.75.75 0 0 0 3 .75v.5c0 .414.336.75.75.75H4v2.625a.75.75 0 0 0 .3.6L8 8l-3.7 2.775a.75.75 0 0 0-.3.6V14h-.25a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75H12v-2.625a.75.75 0 0 0-.3-.6L8 8l3.7-2.775a.75.75 0 0 0 .3-.6V2h.25a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75H4m6 12v2H6v-2l2-1.5z"
      clipRule="evenodd"
    />
  </svg>
)
export default Hourglass16Icon
