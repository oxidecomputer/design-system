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
const PersonGroup16Icon = ({
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
      d="M10.5 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM9 10a3 3 0 0 0-3 3v1.25c0 .414.336.75.75.75h7.5a.75.75 0 0 0 .75-.75V13a3 3 0 0 0-3-3H9ZM5.508 4.212A4.98 4.98 0 0 0 6.68 7.726 2.5 2.5 0 0 1 2 6.5a2.5 2.5 0 0 1 3.508-2.288ZM5.168 11a4.977 4.977 0 0 0-.668 2.5V15H1.75a.75.75 0 0 1-.75-.75V14a3 3 0 0 1 3-3h1.169Z"
      fill="currentColor"
    />
  </svg>
)
export default PersonGroup16Icon
