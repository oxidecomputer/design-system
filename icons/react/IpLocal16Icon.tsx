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
const IpLocal16Icon = ({
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
      d="M8.736 6.909a3 3 0 0 1-1.07.073L6.038 9.799a3 3 0 1 1-1.32-.713l1.53-2.65a3 3 0 1 1 3.804-.247l1.632 2.827Q11.84 9.001 12 9a3 3 0 1 1-1.737.554z"
      clipRule="evenodd"
    />
  </svg>
)
export default IpLocal16Icon
