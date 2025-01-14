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
const Close16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M2.22 2.644a.75.75 0 0 0 0 1.06L6.514 8 2.22 12.295a.75.75 0 0 0 0 1.06l.424.425a.75.75 0 0 0 1.06 0L8 9.484l4.295 4.296a.75.75 0 0 0 1.06 0l.425-.425a.75.75 0 0 0 0-1.06L9.484 8l4.295-4.296a.75.75 0 0 0 0-1.06l-.424-.424a.75.75 0 0 0-1.061 0L7.999 6.515 3.704 2.22a.75.75 0 0 0-1.06 0z"
      clipRule="evenodd"
    />
  </svg>
)
export default Close16Icon
