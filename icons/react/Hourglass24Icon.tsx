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
const Hourglass24Icon = ({
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
      d="M3 2a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2h-2v4.465a1 1 0 0 1-.445.832L12 12 6.445 8.297A1 1 0 0 1 6 7.465V3H4a1 1 0 0 1-1-1Zm9 10-5.555 3.703a1 1 0 0 0-.445.832V21H4a1 1 0 1 0 0 2h16a1 1 0 1 0 0-2h-2v-4.465a1 1 0 0 0-.445-.832L12 12Zm-4 9v-3.93l4-2.666 4 2.666V21H8Z"
      fill="currentColor"
    />
  </svg>
)
export default Hourglass24Icon
