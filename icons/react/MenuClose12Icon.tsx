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
const MenuClose12Icon = ({
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
      d="M2.886 1.474a.67.67 0 0 0-.948 0l-.464.464a.67.67 0 0 0 0 .948l3.063 3.063-3.063 3.063a.67.67 0 0 0 0 .947l.464.464a.67.67 0 0 0 .948 0L5.949 7.36l3.063 3.063a.67.67 0 0 0 .947 0l.464-.464a.67.67 0 0 0 0-.947L7.36 5.949l3.063-3.063a.67.67 0 0 0 0-.948l-.464-.464a.67.67 0 0 0-.947 0L5.948 4.537z"
      clipRule="evenodd"
    />
  </svg>
)
export default MenuClose12Icon
