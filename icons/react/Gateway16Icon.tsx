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
const Gateway16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.75 0h10.5a.75.75 0 0 1 .75.75v14.5a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75V.75A.75.75 0 0 1 2.75 0Zm3.471 4.15A.375.375 0 0 0 6 4.492v6.838c0 .143.082.274.21.337l4.25 2.07c.25.122.54-.06.54-.337V2.58a.375.375 0 0 0-.529-.342l-4.25 1.913Z"
      fill="currentColor"
    />
  </svg>
)
export default Gateway16Icon
