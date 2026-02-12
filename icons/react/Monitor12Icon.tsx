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
const Monitor12Icon = ({
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
      d="M8.333 10.5c.368 0 .667.299.667.667v.166a.667.667 0 0 1-.667.667H3.667A.667.667 0 0 1 3 11.333v-.166c0-.368.299-.667.667-.667zM11.465.014A.67.67 0 0 1 12 .67v7.66l-.014.135a.67.67 0 0 1-.521.521L11.33 9H.67a.67.67 0 0 1-.656-.535L0 8.33V.67C0 .3.3 0 .67 0h10.66zM1.5 7.5h9v-6h-9z"
    />
  </svg>
)
export default Monitor12Icon
