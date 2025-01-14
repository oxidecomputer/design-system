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
const Person16Icon = ({
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
      d="M12 5a4 4 0 1 1-8 0 4 4 0 0 1 8 0M1 14.368A3.37 3.37 0 0 1 4.368 11h7.264A3.37 3.37 0 0 1 15 14.368a.63.63 0 0 1-.632.632H1.632A.63.63 0 0 1 1 14.368"
      clipRule="evenodd"
    />
  </svg>
)
export default Person16Icon
