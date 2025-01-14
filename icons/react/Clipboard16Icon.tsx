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
const Clipboard16Icon = ({
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
      d="M6.75 1a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75h2.5a.75.75 0 0 0 .75-.75v-.5A.75.75 0 0 0 9.25 1zm-4 1H4v2.25c0 .414.336.75.75.75h6.5a.75.75 0 0 0 .75-.75V2h1.25a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75V2.75A.75.75 0 0 1 2.75 2"
      clipRule="evenodd"
    />
  </svg>
)
export default Clipboard16Icon
