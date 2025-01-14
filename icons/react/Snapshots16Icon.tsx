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
const Snapshots16Icon = ({
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
      d="m7.705 1.127-5.9 2.528a.375.375 0 0 0 0 .69l5.9 2.528a.75.75 0 0 0 .59 0l5.9-2.528a.375.375 0 0 0 0-.69l-5.9-2.528a.75.75 0 0 0-.59 0M1 7.505v-.368a.75.75 0 0 1 1.045-.689l5.66 2.425a.75.75 0 0 0 .59 0l5.66-2.425a.75.75 0 0 1 1.045.69v.367a.75.75 0 0 1-.455.69l-6.25 2.678a.75.75 0 0 1-.59 0l-6.25-2.678A.75.75 0 0 1 1 7.505m0 3.632v.368c0 .3.179.572.455.69l6.25 2.678a.75.75 0 0 0 .59 0l6.25-2.678a.75.75 0 0 0 .455-.69v-.368a.75.75 0 0 0-1.045-.689l-5.66 2.425a.75.75 0 0 1-.59 0l-5.66-2.425a.75.75 0 0 0-1.045.69"
      clipRule="evenodd"
    />
  </svg>
)
export default Snapshots16Icon
