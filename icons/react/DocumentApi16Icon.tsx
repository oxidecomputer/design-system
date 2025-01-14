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
const DocumentApi16Icon = ({
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
      d="M11.185 0a.75.75 0 0 1 .535.224l2.065 2.103a.75.75 0 0 1 .215.525V15.25a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75V.75A.75.75 0 0 1 2.75 0zM7.298 3.884a.75.75 0 0 1 0 1.06l-1.47 1.47 1.47 1.47a.75.75 0 0 1 0 1.06l-.353.354a.75.75 0 0 1-1.061 0L3 6.414 5.884 3.53a.75.75 0 0 1 1.06 0zm1.404 3.171a.75.75 0 0 0 0 1.061l1.47 1.47-1.47 1.47a.75.75 0 0 0 0 1.06l.353.354a.75.75 0 0 0 1.061 0L13 9.586l-2.884-2.884a.75.75 0 0 0-1.06 0z"
      clipRule="evenodd"
    />
  </svg>
)
export default DocumentApi16Icon
