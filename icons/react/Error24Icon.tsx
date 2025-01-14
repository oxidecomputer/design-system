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
const Error24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10M7.447 9.613a.75.75 0 0 1 0-1.06l.884-.884a.75.75 0 0 1 1.06 0l2.387 2.387 2.387-2.387a.75.75 0 0 1 1.06 0l.884.884a.75.75 0 0 1 0 1.06L13.723 12l2.386 2.387a.75.75 0 0 1 0 1.06l-.884.884a.75.75 0 0 1-1.06 0l-2.387-2.386-2.386 2.386a.75.75 0 0 1-1.061 0l-.884-.884a.75.75 0 0 1 0-1.06L9.834 12z"
      clipRule="evenodd"
    />
  </svg>
)
export default Error24Icon
