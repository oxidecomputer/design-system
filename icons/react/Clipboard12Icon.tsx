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
const Clipboard12Icon = ({
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
      d="M4.67 0C4.3 0 4 .3 4 .67v.66a.667.667 0 0 0 .67.67h2.66A.67.67 0 0 0 8 1.33V.67C8 .3 7.7 0 7.33 0zm-3 1h.83v.33A2.17 2.17 0 0 0 4.67 3.5h2.66A2.17 2.17 0 0 0 9.5 1.33V1h.83c.37 0 .67.3.67.67v9.66c0 .37-.3.67-.67.67H1.67a.67.67 0 0 1-.67-.67V1.67c0-.37.3-.67.67-.67"
      clipRule="evenodd"
    />
  </svg>
)
export default Clipboard12Icon
