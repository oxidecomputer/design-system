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
const Moon12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={12}
    viewBox="0 0 12 12"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      d="M4.18.283c.432-.137.82.25.82.703V1l.008.308a6 6 0 0 0 5.683 5.684L11 7h.013c.453-.001.84.387.703.82a6 6 0 0 1-1.475 2.422l-.224.213a6 6 0 0 1-8.036 0l-.224-.213a6 6 0 0 1-.213-8.26l.213-.225A6 6 0 0 1 4.18.283m-.584 1.913a4.5 4.5 0 0 0-.777 6.985 4.5 4.5 0 0 0 6.983-.778 7.5 7.5 0 0 1-6.206-6.207"
    />
  </svg>
)
export default Moon12Icon
