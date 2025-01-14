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
const Key16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="m14.53.53.94.94a.75.75 0 0 1 0 1.06L15 3l.5.5a.707.707 0 0 1-1 1L14 4l-1 1 .47.47a.75.75 0 0 1 0 1.06l-.94.94a.75.75 0 0 1-1.06 0L11 7 9.392 8.608a5 5 0 1 1-2-2L13.47.53a.75.75 0 0 1 1.06 0M5 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
      clipRule="evenodd"
    />
  </svg>
)
export default Key16Icon
