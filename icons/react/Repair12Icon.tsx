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
const Repair12Icon = ({
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
      d="M5.647 7.647a4 4 0 0 1-5.58-4.375c.084-.459.639-.566.968-.237l1.73 1.73c.13.13.34.13.47 0l1.53-1.53a.333.333 0 0 0 0-.47l-1.73-1.73c-.33-.33-.222-.884.237-.969Q3.627.001 4 0a4 4 0 0 1 3.646 5.647l3.882 3.881c.26.26.26.683 0 .944l-1.056 1.056a.667.667 0 0 1-.944 0z"
      clipRule="evenodd"
    />
  </svg>
)
export default Repair12Icon
