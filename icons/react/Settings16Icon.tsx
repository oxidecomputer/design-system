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
const Settings16Icon = ({
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
      d="M8.372.213a.75.75 0 0 0-.744 0l-6.25 3.571A.75.75 0 0 0 1 4.435v7.13c0 .269.144.517.378.65l6.25 3.572a.75.75 0 0 0 .744 0l6.25-3.571a.75.75 0 0 0 .378-.651v-7.13a.75.75 0 0 0-.378-.65zM8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8"
      clipRule="evenodd"
    />
  </svg>
)
export default Settings16Icon
