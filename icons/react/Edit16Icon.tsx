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
const Edit16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M.75 16a.75.75 0 0 1-.75-.75v-2.94a.75.75 0 0 1 .22-.53l8.25-8.25a.75.75 0 0 1 1.06 0l2.94 2.94a.75.75 0 0 1 0 1.06l-8.25 8.25a.75.75 0 0 1-.53.22zM13.47 5.47a.75.75 0 0 0 1.06 0l.94-.94a.75.75 0 0 0 0-1.06L12.53.53a.75.75 0 0 0-1.06 0l-.94.94a.75.75 0 0 0 0 1.06z"
      clipRule="evenodd"
    />
  </svg>
)
export default Edit16Icon
