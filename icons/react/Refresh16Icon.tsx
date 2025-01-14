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
const Refresh16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    viewBox="0 0 16 16"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6.806 4.182A4 4 0 0 1 11.873 7h-.968a.375.375 0 0 0-.265.64l1.83 1.83a.75.75 0 0 0 1.06 0l1.83-1.83a.375.375 0 0 0-.265-.64h-1.179A6 6 0 0 0 4.32 3.262c-.327.254-.324.733-.031 1.026l.353.353c.293.293.765.286 1.107.053a4 4 0 0 1 1.058-.512M2.084 9H.905a.375.375 0 0 1-.265-.64l1.83-1.83a.75.75 0 0 1 1.06 0l1.83 1.83a.375.375 0 0 1-.265.64h-.968a4 4 0 0 0 6.125 2.306c.342-.233.814-.24 1.107.053l.353.353c.293.293.296.772-.031 1.027A6 6 0 0 1 2.084 9"
      clipRule="evenodd"
    />
  </svg>
)
export default Refresh16Icon
