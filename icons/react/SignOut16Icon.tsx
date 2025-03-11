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
const SignOut16Icon = ({
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
      d="M7.25 2h-4.5a.75.75 0 0 0-.75.75v10.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.5a.75.75 0 0 0-.75-.75H4V4h3.25A.75.75 0 0 0 8 3.25v-.5A.75.75 0 0 0 7.25 2M10 6H6.75a.75.75 0 0 0-.75.75v2.5c0 .414.336.75.75.75H10v1.22c0 .314.364.489.61.293l3.658-2.927a.75.75 0 0 0 0-1.172l-3.659-2.927A.375.375 0 0 0 10 4.78z"
      clipRule="evenodd"
    />
  </svg>
)
export default SignOut16Icon
