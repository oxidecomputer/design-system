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
const Issues16Icon = ({
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
      d="M2.75 1a.75.75 0 0 0-.75.75V13h-.25a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75h2.5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75H4V8h3v1.25c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-.75-.75H9V2.75A.75.75 0 0 0 8.25 2H4v-.25A.75.75 0 0 0 3.25 1z"
      clipRule="evenodd"
    />
  </svg>
)
export default Issues16Icon
