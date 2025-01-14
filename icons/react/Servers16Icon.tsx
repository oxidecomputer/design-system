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
const Servers16Icon = ({
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
      d="M15.25 2a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75H.75A.75.75 0 0 1 0 6.25v-3.5A.75.75 0 0 1 .75 2zM4 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M15.25 9a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1-.75-.75v-3.5A.75.75 0 0 1 .75 9zM4 11.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
      clipRule="evenodd"
    />
  </svg>
)
export default Servers16Icon
