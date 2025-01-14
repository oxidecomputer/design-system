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
const Heart24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M12 3.889c2.299-2.502 5.977-2.502 8.276 0s2.299 6.604 0 9.106l-7.536 8.2a1 1 0 0 1-1.476-.005l-7.54-8.296c-2.299-2.501-2.299-6.604 0-9.105 2.299-2.402 5.977-2.402 8.276.1"
    />
  </svg>
)
export default Heart24Icon
