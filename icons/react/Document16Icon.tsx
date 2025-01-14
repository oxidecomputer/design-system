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
const Document16Icon = ({
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
      d="M11.72.224A.75.75 0 0 0 11.186 0H2.75A.75.75 0 0 0 2 .75v14.5c0 .414.336.75.75.75h10.5a.75.75 0 0 0 .75-.75V2.852a.75.75 0 0 0-.215-.525zM4 8.75A.75.75 0 0 1 4.75 8h3.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-3.5A.75.75 0 0 1 4 9.25zm6 3.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75zm1-5.91a.75.75 0 0 1-.75.75h-5.5A.75.75 0 0 1 4 6.34v-.59A.75.75 0 0 1 4.75 5h5.5a.75.75 0 0 1 .75.75z"
    />
  </svg>
)
export default Document16Icon
