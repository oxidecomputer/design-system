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
const TimeOutline12Icon = ({
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
      d="M6 0a6 6 0 1 1 0 12A6 6 0 0 1 6 0m0 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1m.17 2a.33.33 0 0 1 .33.33v2.326a.33.33 0 0 0 .097.234L7.62 6.913a.33.33 0 0 1 0 .467l-.24.24a.33.33 0 0 1-.467 0L5.597 6.304A.33.33 0 0 1 5.5 6.07V3.33A.33.33 0 0 1 5.83 3z"
    />
  </svg>
)
export default TimeOutline12Icon
