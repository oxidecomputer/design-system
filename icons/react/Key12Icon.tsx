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
const Key12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="m10.972.472.556.556c.26.26.26.683 0 .944l-.278.278.278.278c.26.26.26.683 0 .944l-.056.056a.667.667 0 0 1-.944 0l-.278-.278-1 1 .278.278c.26.26.26.683 0 .944l-.056.056a.667.667 0 0 1-.944 0L8.25 5.25 7.044 6.456a3.75 3.75 0 1 1-1.5-1.5L10.028.472c.26-.26.683-.26.944 0M3.75 10a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5"
      clipRule="evenodd"
    />
  </svg>
)
export default Key12Icon
