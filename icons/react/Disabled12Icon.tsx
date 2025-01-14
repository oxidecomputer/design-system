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
const Disabled12Icon = ({
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
      d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12M3.167 6.75a.667.667 0 0 1-.667-.667v-.166c0-.368.299-.667.667-.667h5.666c.368 0 .667.299.667.667v.166a.667.667 0 0 1-.667.667z"
      clipRule="evenodd"
    />
  </svg>
)
export default Disabled12Icon
