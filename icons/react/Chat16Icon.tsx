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
const Chat16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M1 8a7 7 0 1 1 7 7H1.746A.746.746 0 0 1 1 14.254zm3-1.25A.75.75 0 0 1 4.75 6h6.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-6.5A.75.75 0 0 1 4 7.25zM4.75 9a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75h3.5a.75.75 0 0 0 .75-.75v-.5A.75.75 0 0 0 8.25 9z"
      clipRule="evenodd"
    />
  </svg>
)
export default Chat16Icon
