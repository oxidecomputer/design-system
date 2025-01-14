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
const Copy12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M9.5 2.5v-1H4V.67C4 .3 4.3 0 4.67 0h5.66c.37 0 .67.3.67.67v7.66c0 .37-.3.67-.67.67H9.5V2.5m-7 8v-6h4v6zM1 3.67c0-.37.3-.67.67-.67h5.66c.37 0 .67.3.67.67v7.66c0 .37-.3.67-.67.67H1.67a.67.67 0 0 1-.67-.67z"
      clipRule="evenodd"
    />
  </svg>
)
export default Copy12Icon
