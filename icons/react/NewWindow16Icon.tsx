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
const NewWindow16Icon = ({
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
      d="M14.25 1h-8.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-8.5a.75.75 0 0 0-.75-.75M7 3.75A.75.75 0 0 1 7.75 3h4.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 7 4.25zM1.75 5H4v2H3v6h6v-1h2v2.25a.75.75 0 0 1-.75.75h-8.5l-.077-.004A.75.75 0 0 1 1 14.25v-8.5A.75.75 0 0 1 1.75 5"
      clipRule="evenodd"
    />
  </svg>
)
export default NewWindow16Icon
