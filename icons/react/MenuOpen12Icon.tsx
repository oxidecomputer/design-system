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
const MenuOpen12Icon = ({
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
      d="M1 1.667C1 1.299 1.299 1 1.667 1h8.666c.368 0 .667.299.667.667v.666a.667.667 0 0 1-.667.667H1.667A.667.667 0 0 1 1 2.333zm0 4C1 5.299 1.299 5 1.667 5h8.666c.368 0 .667.299.667.667v.666a.667.667 0 0 1-.667.667H1.667A.667.667 0 0 1 1 6.333zm10 4A.667.667 0 0 0 10.333 9H1.667A.667.667 0 0 0 1 9.667v.666c0 .368.299.667.667.667h8.666a.667.667 0 0 0 .667-.667z"
      clipRule="evenodd"
    />
  </svg>
)
export default MenuOpen12Icon
