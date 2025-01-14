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
const Router24Icon = ({
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
      d="M20.933 5.2a1 1 0 0 1 0 1.6L14.8 11.4a.5.5 0 0 1-.8-.4V9H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h9V1a.5.5 0 0 1 .8-.4zm-17.866 12a1 1 0 0 0 0 1.6L9.2 23.4a.5.5 0 0 0 .8-.4v-2h9a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-9v-2a.5.5 0 0 0-.8-.4z"
      clipRule="evenodd"
    />
  </svg>
)
export default Router24Icon
