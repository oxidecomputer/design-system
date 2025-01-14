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
const Dislike16Icon = ({
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
      d="M8.379 14.527 12 10V1H4.464a.75.75 0 0 0-.671.415L1 7v1a2 2 0 0 0 2 2h4l-.61 2.444a2 2 0 0 0 1.045 2.273l.023.012a.75.75 0 0 0 .92-.202M14.25 10a.75.75 0 0 0 .75-.75v-7.5a.75.75 0 0 0-.75-.75H13v9z"
      clipRule="evenodd"
    />
  </svg>
)
export default Dislike16Icon
