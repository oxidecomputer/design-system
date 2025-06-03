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
const Sparkle16Icon = ({
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
      d="M10.651 4.795a.38.38 0 0 1 .697 0L12.72 7.93a.75.75 0 0 0 .31.348l2.404 1.394a.38.38 0 0 1 0 .658l-2.404 1.394a.75.75 0 0 0-.31.348l-1.372 3.134a.38.38 0 0 1-.697 0l-1.37-3.134a.75.75 0 0 0-.311-.348L6.566 10.33a.38.38 0 0 1 0-.658L8.97 8.277a.75.75 0 0 0 .31-.348zM3.655.738a.38.38 0 0 1 .69 0L5.35 2.892a.75.75 0 0 0 .321.34l1.716.934a.38.38 0 0 1 0 .667l-1.716.934a.75.75 0 0 0-.321.34L4.345 8.263a.38.38 0 0 1-.69 0L2.65 6.108a.75.75 0 0 0-.32-.34L.612 4.833a.38.38 0 0 1 0-.667l1.715-.934a.75.75 0 0 0 .321-.34z"
    />
  </svg>
)
export default Sparkle16Icon
