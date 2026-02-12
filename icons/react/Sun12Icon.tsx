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
const Sun12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={12}
    viewBox="0 0 12 12"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g fill="currentColor">
      <path
        fillRule="evenodd"
        d="M6.833 10.5c.368 0 .667.299.667.667v.166a.667.667 0 0 1-.667.667H5.167a.667.667 0 0 1-.667-.667v-.166c0-.368.299-.667.667-.667zM3.5 3.5a3.536 3.536 0 0 1 5 0l.126.132A3.536 3.536 0 0 1 8.5 8.5l-.132.125A3.536 3.536 0 0 1 3.5 3.5m3.94 1.06a2.036 2.036 0 1 0-2.88 2.881 2.036 2.036 0 0 0 2.88-2.88M6.832 0C7.2 0 7.5.299 7.5.667v.166a.667.667 0 0 1-.667.667H5.167A.667.667 0 0 1 4.5.833V.667C4.5.299 4.799 0 5.167 0z"
        clipRule="evenodd"
      />
      <rect width={1.5} height={3} x={7.5} rx={0.667} transform="rotate(90 7.5 0)" />
      <rect
        width={1.5}
        height={3}
        x={7.5}
        y={10.5}
        rx={0.667}
        transform="rotate(90 7.5 10.5)"
      />
      <rect
        width={1.5}
        height={3}
        x={11.946}
        y={4.299}
        rx={0.667}
        transform="rotate(150 11.946 4.299)"
      />
      <rect
        width={1.5}
        height={3}
        x={2.853}
        y={9.549}
        rx={0.667}
        transform="rotate(150 2.853 9.549)"
      />
      <rect
        width={1.5}
        height={3}
        x={10.446}
        y={10.299}
        rx={0.667}
        transform="rotate(-150 10.446 10.299)"
      />
      <rect
        width={1.5}
        height={3}
        x={1.353}
        y={5.049}
        rx={0.667}
        transform="rotate(-150 1.353 5.049)"
      />
    </g>
  </svg>
)
export default Sun12Icon
