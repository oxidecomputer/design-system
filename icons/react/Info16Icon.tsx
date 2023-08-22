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
const Info16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.25-11a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5A.75.75 0 0 1 7 5.25v-.5A.75.75 0 0 1 7.75 4h.5Zm0 3a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-3.5A.75.75 0 0 1 7.75 7h.5Z"
      fill="currentColor"
    />
  </svg>
)
export default Info16Icon
