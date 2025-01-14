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
const Metrics16Icon = ({
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
      d="M9 1.75c0-.414.337-.755.749-.704a6 6 0 0 1 5.205 5.205c.05.412-.29.749-.704.749h-4.5A.75.75 0 0 1 9 6.25zM1 9a6 6 0 0 1 5.251-5.954c.412-.05.749.29.749.704v4.5c0 .414.336.75.75.75h4.5c.414 0 .755.337.704.749A6.001 6.001 0 0 1 1 9"
      clipRule="evenodd"
    />
  </svg>
)
export default Metrics16Icon
