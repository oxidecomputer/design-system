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
const Cpu24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M7 2v3H6a1 1 0 0 0-1 1v1H2v2h3v2H2v2h3v2H2v2h3v1a1 1 0 0 0 1 1h1v3h2v-3h2v3h2v-3h2v3h2v-3h1a1 1 0 0 0 1-1v-1h3v-2h-3v-2h3v-2h-3V9h3V7h-3V6a1 1 0 0 0-1-1h-1V2h-2v3h-2V2h-2v3H9V2zm3 12v-4h4v4zm5.5-6h-7a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5"
      clipRule="evenodd"
    />
  </svg>
)
export default Cpu24Icon
