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
const Prohibited24Icon = ({
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
      d="M16.49 5.388A7.94 7.94 0 0 0 12 4c-4.4 0-8 3.6-8 8 0 1.661.513 3.208 1.388 4.49zm2.122 2.122L7.51 18.612A7.94 7.94 0 0 0 12 20c4.4 0 8-3.6 8-8a7.94 7.94 0 0 0-1.388-4.49M1 12C1 5.9 5.9 1 12 1s11 4.9 11 11-4.9 11-11 11S1 18.1 1 12"
      clipRule="evenodd"
    />
  </svg>
)
export default Prohibited24Icon
