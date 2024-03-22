/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { SVGProps } from 'react'

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
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.472 4.114a.667.667 0 0 1-.944 0L3.643 2.23a.667.667 0 0 0-.943 0l-.471.47a.667.667 0 0 0 0 .944l1.885 1.885c.26.26.26.683 0 .944L2.23 8.357a.667.667 0 0 0 0 .943l.47.471c.261.26.684.26.944 0l1.885-1.885c.26-.26.683-.26.944 0L8.357 9.77c.26.26.683.26.943 0l.471-.47a.667.667 0 0 0 0-.944L7.886 6.472a.667.667 0 0 1 0-.944L9.77 3.643a.667.667 0 0 0 0-.943l-.47-.471a.667.667 0 0 0-.944 0L6.472 4.114Z"
      fill="currentColor"
    />
  </svg>
)
export default MenuClose12Icon
