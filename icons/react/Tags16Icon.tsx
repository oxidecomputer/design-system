/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Tags16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.78 1.78c.141.141.22.332.22.53v3.38a.75.75 0 0 1-.22.53l-9.25 9.25a.75.75 0 0 1-1.06 0L.53 10.53a.75.75 0 0 1 0-1.06L9.78.22a.75.75 0 0 1 .53-.22h3.38a.75.75 0 0 1 .53.22l1.56 1.56ZM12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
      fill="currentColor"
    />
  </svg>
)
export default Tags16Icon
