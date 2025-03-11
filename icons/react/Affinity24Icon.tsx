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
const Affinity24Icon = ({
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
      d="M24 14.75v6.5a.75.75 0 0 1-.75.75h-6.5a.75.75 0 0 1-.75-.75v-6.5a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 .75.75M7.25 10A.75.75 0 0 0 8 9.25v-6.5A.75.75 0 0 0 7.25 2H.75a.75.75 0 0 0-.75.75v6.5c0 .414.336.75.75.75zm0 12a.75.75 0 0 0 .75-.75v-6.5a.75.75 0 0 0-.75-.75H.75a.75.75 0 0 0-.75.75v6.5c0 .414.336.75.75.75zM24 9.25v-6.5a.75.75 0 0 0-.75-.75h-6.5a.75.75 0 0 0-.75.75v6.5c0 .414.336.75.75.75h6.5a.75.75 0 0 0 .75-.75M12.25 6h-.5a.75.75 0 0 1-.75-.75V.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75m-.5 9h.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75h-.5a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75m.5 9h-.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75"
      clipRule="evenodd"
    />
  </svg>
)
export default Affinity24Icon
