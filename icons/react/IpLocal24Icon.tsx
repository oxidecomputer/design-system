/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { SVGProps } from 'react'

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
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.555 9.962a4.036 4.036 0 0 1-1.354-.042l-2.812 4.871a4 4 0 1 1-1.872-.758L9.4 9.04a4 4 0 1 1 5.018.147l2.82 4.886a4 4 0 1 1-1.81.864l-2.873-4.975Z"
      fill="currentColor"
    />
  </svg>
)
export default IpLocal24Icon
