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
const Integration16Icon = ({
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
      d="M1.75 1a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h4.5A.75.75 0 0 0 7 6.25v-4.5A.75.75 0 0 0 6.25 1zm9.25.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75V3h1.25a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75H13v1.25a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75V5H9.75A.75.75 0 0 1 9 4.25v-.5A.75.75 0 0 1 9.75 3H11zm-10 8A.75.75 0 0 1 1.75 9h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75zM9.75 9a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
)
export default Integration16Icon
