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
const Terminal24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M2 3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm3.44 12.294A1 1 0 0 1 4 14.396v-.138a1 1 0 0 1 .585-.91L9.733 11 4.585 8.651A1 1 0 0 1 4 7.741v-.137a1 1 0 0 1 1.44-.898l6 2.943a1 1 0 0 1 .56.898v.906a1 1 0 0 1-.56.898zM19 16h-6a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2"
      clipRule="evenodd"
    />
  </svg>
)
export default Terminal24Icon
