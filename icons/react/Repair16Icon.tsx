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
const Repair16Icon = ({
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
      d="M6.703 9.703A5 5 0 0 1 .03 4.443c.06-.545.712-.7 1.1-.312L3.47 6.47a.75.75 0 0 0 1.06 0l1.94-1.94a.75.75 0 0 0 0-1.06L4.13 1.13c-.388-.388-.233-1.04.312-1.1Q4.718 0 5 0a5 5 0 0 1 4.703 6.703l5.767 5.767a.75.75 0 0 1 0 1.06l-1.94 1.94a.75.75 0 0 1-1.06 0z"
      clipRule="evenodd"
    />
  </svg>
)
export default Repair16Icon
