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
const Sort16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 16 16"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.414 2.732a.75.75 0 0 1 1.172 0l2.927 3.659A.375.375 0 0 1 7.22 7H6v5.25a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75V7H.78a.375.375 0 0 1-.293-.61zm8 10.536a.75.75 0 0 0 1.172 0l2.926-3.659A.375.375 0 0 0 15.22 9H14V3.75a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75V9H8.78a.375.375 0 0 0-.293.61z"
      clipRule="evenodd"
    />
  </svg>
)
export default Sort16Icon
