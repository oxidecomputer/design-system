/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { SVGProps } from 'react'

export type OxSvgProps = {
    size: 12 | 16 | 24;
    title?: string;
}

export const Svg = ({
    path,
    size,
    title,
    ...props
}: SVGProps<SVGSVGElement> & OxSvgProps) => (
<svg
    aria-hidden={!title}
    width={size}
    height={size}
    viewBox={`0 0 ${size} ${size}`}
    xmlns="http://www.w3.org/2000/svg"
    role={title ? "img" : "presentation"}
    {...props}
  >
    {title && <title>{title}</title>}
    <path
      d={path}
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>)
