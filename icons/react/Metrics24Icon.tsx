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
const Metrics24Icon = ({
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
      d="M13 10a1 1 0 0 0 1 1h7c.552 0 1.006-.45.945-.998a9.004 9.004 0 0 0-7.947-7.947C13.45 1.995 13 2.448 13 3zM2 13c0-4.633 3.5-8.449 8.002-8.945.549-.06.998.393.998.945v7a1 1 0 0 0 1 1h7c.552 0 1.006.45.945.998A9.001 9.001 0 0 1 2 13"
      clipRule="evenodd"
    />
  </svg>
)
export default Metrics24Icon
