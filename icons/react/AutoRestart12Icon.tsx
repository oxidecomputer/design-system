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
const AutoRestart12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M6 10.5a4.5 4.5 0 0 0 1.277-.184c.32-.094.677.01.854.293l.098.157c.21.338.083.787-.294.915A6 6 0 1 1 12 6a6.14 6.14 0 0 1-1.035 3.392c-.225.337-.703.336-.97.031L7.972 7.111A.67.67 0 0 1 8.477 6H10.5A4.5 4.5 0 1 0 6 10.5"
    />
  </svg>
)
export default AutoRestart12Icon