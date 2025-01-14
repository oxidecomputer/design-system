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
const Folder16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M1.75 2h6.773a.75.75 0 0 1 .75.75v1.16H1V2.75A.75.75 0 0 1 1.75 2M1 5h13.25a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
)
export default Folder16Icon
