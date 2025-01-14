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
const Close8Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={8}
    height={8}
    viewBox="0 0 8 8"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6.21 6.917a.375.375 0 0 0 .53 0l.177-.177a.375.375 0 0 0 0-.53L4.707 4l2.21-2.21a.375.375 0 0 0 0-.53l-.177-.177a.375.375 0 0 0-.53 0L4 3.293l-2.21-2.21a.375.375 0 0 0-.53 0l-.177.177a.375.375 0 0 0 0 .53L3.293 4l-2.21 2.21a.375.375 0 0 0 0 .53l.177.177a.375.375 0 0 0 .53 0L4 4.707z"
      clipRule="evenodd"
    />
  </svg>
)
export default Close8Icon
