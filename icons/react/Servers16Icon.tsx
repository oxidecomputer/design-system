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
const Servers16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.25 2a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75H.75A.75.75 0 0 1 0 6.25v-3.5A.75.75 0 0 1 .75 2h14.5ZM4 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.25 9a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1-.75-.75v-3.5A.75.75 0 0 1 .75 9h14.5ZM4 11.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
      fill="currentColor"
    />
  </svg>
)
export default Servers16Icon
