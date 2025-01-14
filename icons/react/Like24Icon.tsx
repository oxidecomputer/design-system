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
const Like24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M12.563 2.512 7 9.018V22h10.323a1 1 0 0 0 .928-.629L22 12v-.982a2 2 0 0 0-2-2h-5.571l1.098-4.207a2 2 0 0 0-1.302-2.403l-.586-.195a1 1 0 0 0-1.076.299M2.75 9a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75H5V9z"
      clipRule="evenodd"
    />
  </svg>
)
export default Like24Icon
