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
const Hide16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M3.997 12.003 2.5 13.5a.707.707 0 1 1-1-1l1.28-1.28A10.638 10.638 0 0 1 .185 8.325a.63.63 0 0 1 0-.652C.852 6.563 3.357 3 8 3c.956 0 1.822.151 2.6.4l1.9-1.9a.707.707 0 0 1 1 1l-1.497 1.497L10.12 5.88 5.88 10.12l-1.882 1.882ZM5.13 8.87 8.87 5.13a3 3 0 0 0-3.743 3.743Zm8.09-4.09-2.348 2.348A3.003 3.003 0 0 1 7.13 10.87L5.4 12.6C6.178 12.85 7.044 13 8 13c4.643 0 7.148-3.563 7.816-4.674a.63.63 0 0 0 0-.652c-.35-.581-1.2-1.832-2.597-2.893Z"
      fill="currentColor"
    />
  </svg>
)
export default Hide16Icon
