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
const Speaker24Icon = ({
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
      d="M10.723 7a1 1 0 0 0 .515-.143l8.247-4.948A1 1 0 0 1 21 2.766v18.468a1 1 0 0 1-1.515.857l-8.247-4.949a1 1 0 0 0-.515-.142H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"
      clipRule="evenodd"
    />
  </svg>
)
export default Speaker24Icon
