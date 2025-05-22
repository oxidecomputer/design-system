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
const Webhooks24Icon = ({
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
      d="M12.75 0h-1.5a.75.75 0 0 0-.75.75v4.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V.75a.75.75 0 0 0-.75-.75M10.5 18.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75zm5.212-1.977 1.061-1.06a.75.75 0 0 1 1.06 0l2.476 2.474a.75.75 0 0 1 0 1.06l-1.061 1.061a.75.75 0 0 1-1.06 0l-2.476-2.474a.75.75 0 0 1 0-1.061M4.752 3.691l-1.06 1.061a.75.75 0 0 0 0 1.06l2.474 2.476a.75.75 0 0 0 1.061 0l1.06-1.061a.75.75 0 0 0 0-1.06L5.814 3.69a.75.75 0 0 0-1.06 0m12.021 4.597-1.06-1.061a.75.75 0 0 1 0-1.06l2.474-2.476a.75.75 0 0 1 1.06 0l1.061 1.061a.75.75 0 0 1 0 1.06l-2.474 2.476a.75.75 0 0 1-1.061 0M3.692 19.248l1.06 1.06a.75.75 0 0 0 1.06 0l2.476-2.474a.75.75 0 0 0 0-1.061l-1.06-1.06a.75.75 0 0 0-1.062 0l-2.474 2.474a.75.75 0 0 0 0 1.06M6 11.25v1.5a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75m17.25 2.25a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
      clipRule="evenodd"
    />
  </svg>
)
export default Webhooks24Icon
