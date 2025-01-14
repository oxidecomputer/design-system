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
const Success12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={12}
    viewBox="0 0 12 12"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12m3.111-7.002a.667.667 0 0 0-.05-.942l-.123-.112a.667.667 0 0 0-.942.05L5.36 6.924 4 5.632a.667.667 0 0 0-.943.023l-.114.12a.667.667 0 0 0 .023.943l1.979 1.885c.272.26.704.242.955-.037z"
      clipRule="evenodd"
    />
  </svg>
)
export default Success12Icon
