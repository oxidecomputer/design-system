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
const Monitoring16Icon = ({
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
      d="M11 .75v.5c0 .414.336.75.75.75H14v2.25c0 .414.336.75.75.75h.5a.75.75 0 0 0 .75-.75V.75a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0-.75.75M1.25 11h-.5a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h3.5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75H2v-2.25a.75.75 0 0 0-.75-.75m13.5 0h.5a.75.75 0 0 1 .75.75v3.5a.747.747 0 0 1-.75.75h-3.5a.75.75 0 0 1-.75-.75v-.5a.75.75 0 0 1 .75-.75H14v-2.25a.75.75 0 0 1 .75-.75M5 1.25v-.5A.75.75 0 0 0 4.25 0H.75A.75.75 0 0 0 0 .75v3.5c0 .414.336.75.75.75h.5A.75.75 0 0 0 2 4.25V2h2.25A.75.75 0 0 0 5 1.25m-1 3.5A.75.75 0 0 1 4.75 4h6.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-6.5A.75.75 0 0 1 4 6.25zM4.75 9a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h6.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
)
export default Monitoring16Icon
