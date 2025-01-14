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
const Like16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M7.621 1.473 4 6v9h7.536a.75.75 0 0 0 .671-.415L15 9V8a2 2 0 0 0-2-2H9l.61-2.444a2 2 0 0 0-1.045-2.273l-.023-.012a.75.75 0 0 0-.92.202M1.75 6a.75.75 0 0 0-.75.75v7.5c0 .414.336.75.75.75H3V6z"
      clipRule="evenodd"
    />
  </svg>
)
export default Like16Icon
