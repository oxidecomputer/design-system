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
const PersonGroup24Icon = ({
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
      d="M16 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10m-2 2a5 5 0 0 0-5 5v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2a5 5 0 0 0-5-5zM9.136 5.618Q9 6.29 9 7c0 1.557.508 2.995 1.368 4.158a4 4 0 1 1-1.232-5.54m-.886 9.388A6.97 6.97 0 0 0 7 19v3H2a1 1 0 0 1-1-1v-1a5 5 0 0 1 5-5h2q.126 0 .25.006"
      clipRule="evenodd"
    />
  </svg>
)
export default PersonGroup24Icon
