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
const Error16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14M4.995 6.409a.75.75 0 0 1 0-1.06l.353-.354a.75.75 0 0 1 1.061 0L8 6.585l1.591-1.59a.75.75 0 0 1 1.06 0l.354.353a.75.75 0 0 1 0 1.061L9.415 8l1.59 1.591a.75.75 0 0 1 0 1.06l-.353.354a.75.75 0 0 1-1.061 0L8 9.415l-1.591 1.59a.75.75 0 0 1-1.06 0l-.354-.353a.75.75 0 0 1 0-1.061L6.585 8z"
      clipRule="evenodd"
    />
  </svg>
)
export default Error16Icon
