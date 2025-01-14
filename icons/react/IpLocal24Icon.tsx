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
const IpLocal24Icon = ({
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
      d="M12.555 9.962a4 4 0 0 1-1.354-.042l-2.812 4.871a4 4 0 1 1-1.872-.758L9.4 9.04a4 4 0 1 1 5.018.147l2.82 4.886Q17.608 14 18 14a4 4 0 1 1-2.572.937z"
      clipRule="evenodd"
    />
  </svg>
)
export default IpLocal24Icon
