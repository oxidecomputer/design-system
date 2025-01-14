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
const Cpu16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M7 0v3h2V0h2v3h1.25a.75.75 0 0 1 .75.75V5h3v2h-3v2h3v2h-3v1.25a.75.75 0 0 1-.75.75H11v3H9v-3H7v3H5v-3H3.75a.75.75 0 0 1-.75-.75V11H0V9h3V7H0V5h3V3.75A.75.75 0 0 1 3.75 3H5V0zm0 9V7h2v2zm3.5-4h-5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5"
      clipRule="evenodd"
    />
  </svg>
)
export default Cpu16Icon
