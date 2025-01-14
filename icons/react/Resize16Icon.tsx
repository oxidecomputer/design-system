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
const Resize16Icon = ({
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
      d="M11 .75v.5c0 .414.336.75.75.75H14v2.25c0 .414.336.75.75.75h.5a.75.75 0 0 0 .75-.75V.75a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0-.75.75M.75 11h.5a.75.75 0 0 1 .75.75V14h2.25a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1-.75-.75v-3.5A.75.75 0 0 1 .75 11m4-7h6.5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-.75.75h-6.5a.75.75 0 0 1-.75-.75v-6.5A.75.75 0 0 1 4.75 4"
      clipRule="evenodd"
    />
  </svg>
)
export default Resize16Icon
