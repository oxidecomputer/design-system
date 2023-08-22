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
const Notifications16Icon = ({
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
      d="M8 1a1 1 0 0 0-1 1 .125.125 0 0 1-.098.12A5.002 5.002 0 0 0 3 7v2.69a.75.75 0 0 1-.22.53l-.573.573a.707.707 0 0 0 .5 1.207H13.293a.707.707 0 0 0 .5-1.207l-.573-.573a.75.75 0 0 1-.22-.53V7a5.002 5.002 0 0 0-3.902-4.88A.125.125 0 0 1 9 2a1 1 0 0 0-1-1Zm2 12a2 2 0 1 1-4 0h4Z"
      fill="currentColor"
    />
  </svg>
)
export default Notifications16Icon
