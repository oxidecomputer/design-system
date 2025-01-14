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
const Person24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      fillRule="evenodd"
      d="M18 8A6 6 0 1 1 6 8a6 6 0 0 1 12 0M1 21.455A5.455 5.455 0 0 1 6.455 16h11.09A5.455 5.455 0 0 1 23 21.454a.545.545 0 0 1-.546.546H1.546A.545.545 0 0 1 1 21.454"
      clipRule="evenodd"
    />
  </svg>
)
export default Person24Icon
