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
const Images16Icon = ({
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
    <g fill="currentColor">
      <path d="M1.523 5.312A.375.375 0 0 0 1 5.657v5.808a.75.75 0 0 0 .451.688l5.024 2.184A.375.375 0 0 0 7 13.993V8.154a.75.75 0 0 0-.455-.69zM9 13.993c0 .27.277.452.525.344l5.024-2.184a.75.75 0 0 0 .451-.688V5.657c0-.27-.275-.451-.523-.345L9.455 7.465A.75.75 0 0 0 9 8.154zM12.891 3.816a.375.375 0 0 0 .002-.689L8.299 1.13a.75.75 0 0 0-.598 0L3.107 3.127c-.301.131-.3.56.002.689l4.596 1.97a.75.75 0 0 0 .59 0z" />
    </g>
  </svg>
)
export default Images16Icon
