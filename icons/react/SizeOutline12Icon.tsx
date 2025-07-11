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
const SizeOutline12Icon = ({
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
      d="M8.547 1a.67.67 0 0 1 .577.33l.045.09 1.783 4.46q.024.06.036.122l.012.127v4.201c0 .37-.3.67-.67.67H1.67l-.135-.014A.67.67 0 0 1 1 10.33V6.13l.012-.127a1 1 0 0 1 .036-.122L2.83 1.42l.045-.09a.67.67 0 0 1 .477-.322l.1-.008zM2 10h8V7H2zm2.67-2a.33.33 0 0 1 .33.33v.34a.33.33 0 0 1-.33.33H3.33A.33.33 0 0 1 3 8.67v-.34A.33.33 0 0 1 3.33 8zM2.077 6h7.846l-1.6-4H3.677z"
    />
  </svg>
)
export default SizeOutline12Icon
