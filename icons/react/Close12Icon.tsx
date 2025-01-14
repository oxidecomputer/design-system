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
const Close12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M10.301 2.76a.667.667 0 0 0 0-.944l-.117-.117a.667.667 0 0 0-.943 0L6 4.939 2.76 1.7a.667.667 0 0 0-.944 0l-.117.117a.667.667 0 0 0 0 .943L4.939 6 1.7 9.24a.667.667 0 0 0 0 .944l.117.117c.26.26.683.26.943 0L6 7.061l3.24 3.24c.261.26.683.26.944 0l.117-.117a.667.667 0 0 0 0-.943L7.061 6z"
    />
  </svg>
)
export default Close12Icon
