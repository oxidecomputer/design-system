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
const Location24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M18 7a6 6 0 0 1-5 5.917V17h-2v-4.083A6.002 6.002 0 0 1 12 1a6 6 0 0 1 6 6m3 13c0 1.657-4.03 3-9 3s-9-1.343-9-3c0-1.544 3.5-2.816 8-2.982V20a1 1 0 1 0 2 0v-2.982c4.5.166 8 1.438 8 2.982"
      clipRule="evenodd"
    />
  </svg>
)
export default Location24Icon
