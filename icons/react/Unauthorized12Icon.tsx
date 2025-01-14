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
const Unauthorized12Icon = ({
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
      d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12M4.472 8.528a.667.667 0 0 1-.944 0l-.056-.056a.667.667 0 0 1 0-.944l4.056-4.056c.26-.26.683-.26.944 0l.056.056c.26.26.26.683 0 .944z"
      clipRule="evenodd"
    />
  </svg>
)
export default Unauthorized12Icon
