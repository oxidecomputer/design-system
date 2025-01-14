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
const Security16Icon = ({
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
      d="M4.75 7A.75.75 0 0 1 4 6.25V5a4 4 0 1 1 8 0v1.25a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75V5a2 2 0 1 0-4 0v1.25a.75.75 0 0 1-.75.75zm-2 1a.75.75 0 0 0-.75.75v5.5c0 .414.336.75.75.75h10.5a.75.75 0 0 0 .75-.75v-5.5a.75.75 0 0 0-.75-.75zM8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
      clipRule="evenodd"
    />
  </svg>
)
export default Security16Icon
