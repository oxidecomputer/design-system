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
const Heart16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M8 3.228a4.05 4.05 0 0 1 5.793 0c1.61 1.626 1.61 4.292 0 5.918l-5.257 5.312a.75.75 0 0 1-1.069-.003l-5.26-5.374c-1.61-1.626-1.61-4.292 0-5.918A4.11 4.11 0 0 1 8 3.228"
    />
  </svg>
)
export default Heart16Icon
