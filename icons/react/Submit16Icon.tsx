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
const Submit16Icon = ({
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
      d="M14.168 7.655C9.92 5.885 4.005 3.312 1.838 2.366a.38.38 0 0 0-.506.487l1.896 4.875a.75.75 0 0 1 0 .544l-1.9 4.884a.38.38 0 0 0 .504.487L14.17 8.357a.38.38 0 0 0-.002-.701"
    />
  </svg>
)
export default Submit16Icon
