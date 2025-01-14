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
const Snapshots24Icon = ({
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
      d="M11.486 1.309 2.714 6.57a.5.5 0 0 0 0 .858l8.77 5.262a1 1 0 0 0 1.03 0l8.77-5.262a.5.5 0 0 0 0-.858l-8.77-5.262a1 1 0 0 0-1.03 0m-8.187 9.47 8.187 4.912a1 1 0 0 0 1.028 0l8.187-4.912a.858.858 0 0 1 .883 1.47l-9.07 5.442a1 1 0 0 1-1.028 0l-9.07-5.441a.858.858 0 0 1 .883-1.47m8.187 9.912L3.299 15.78a.858.858 0 0 0-.883 1.47l9.07 5.442a1 1 0 0 0 1.028 0l9.07-5.441a.857.857 0 0 0-.883-1.47l-8.187 4.911a1 1 0 0 1-1.028 0"
      clipRule="evenodd"
    />
  </svg>
)
export default Snapshots24Icon
