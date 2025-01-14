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
const Key24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M18.173 2.707a1 1 0 0 1 1.414 0l.707.707a1 1 0 0 1 0 1.414l-.233.233 1.232 1.232a1 1 0 0 1-1.414 1.414l-1.232-1.231-1.464 1.464 1.231 1.232a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414 0L15.06 10.06 13.623 11.5a6.5 6.5 0 1 1-2.359-1.884zM8.5 19a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"
      clipRule="evenodd"
    />
  </svg>
)
export default Key24Icon
