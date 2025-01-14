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
const Checkmark12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={12}
    viewBox="0 0 12 12"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M10.492 2.651c.28.242.31.665.067.944L5.448 9.463a.667.667 0 0 1-.974.035L1.475 6.516a.667.667 0 0 1 0-.946l.237-.235a.667.667 0 0 1 .94 0l2.24 2.226L9.3 2.501a.667.667 0 0 1 .938-.068z"
      clipRule="evenodd"
    />
  </svg>
)
export default Checkmark12Icon
