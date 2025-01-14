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
const Dislike24Icon = ({
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
      d="M11.328 23.616 17 16.982V4H5.78a.75.75 0 0 0-.689.455L1 14v.982a2 2 0 0 0 2 2h6.571l-1.098 4.207a2 2 0 0 0 1.302 2.403l.746.248a.75.75 0 0 0 .807-.224m9.922-6.634a.75.75 0 0 0 .75-.75V4.75a.75.75 0 0 0-.75-.75h-2.107v12.982z"
      clipRule="evenodd"
    />
  </svg>
)
export default Dislike24Icon
