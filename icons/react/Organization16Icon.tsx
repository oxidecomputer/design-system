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
const Organization16Icon = ({
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
      d="M7.47.53a.75.75 0 0 1 1.06 0l2.273 2.273a.75.75 0 0 1 0 1.06L8.53 6.137a.75.75 0 0 1-1.06 0L5.197 3.864a.75.75 0 0 1 0-1.061zm8 8a.75.75 0 0 0 0-1.06l-2.273-2.273a.75.75 0 0 0-1.06 0L9.863 7.47a.75.75 0 0 0 0 1.06l2.272 2.273a.75.75 0 0 0 1.061 0zm-4.667 4.667a.75.75 0 0 0 0-1.06L8.53 9.863a.75.75 0 0 0-1.06 0l-2.273 2.272a.75.75 0 0 0 0 1.061L7.47 15.47a.75.75 0 0 0 1.06 0zM6.136 8.53a.75.75 0 0 0 0-1.06L3.864 5.197a.75.75 0 0 0-1.061 0L.53 7.47a.75.75 0 0 0 0 1.06l2.273 2.273a.75.75 0 0 0 1.06 0z"
      clipRule="evenodd"
    />
  </svg>
)
export default Organization16Icon
