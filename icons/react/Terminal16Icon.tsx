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
const Terminal16Icon = ({
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
      d="M.75 1a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h14.5a.75.75 0 0 0 .75-.75V1.75a.75.75 0 0 0-.75-.75zm2.335 9.457A.75.75 0 0 1 2 9.787v-.323a.75.75 0 0 1 .415-.671L6 7 2.415 5.207A.75.75 0 0 1 2 4.537v-.323a.75.75 0 0 1 1.085-.671l4.5 2.25a.75.75 0 0 1 .415.67v1.073a.75.75 0 0 1-.415.671zM8 11.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
)
export default Terminal16Icon
