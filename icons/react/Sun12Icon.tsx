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
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6.833 10.5c.368 0 .667.299.667.667v.166a.667.667 0 0 1-.667.667H5.167a.667.667 0 0 1-.667-.667v-.166c0-.368.298-.667.667-.667zM.775 7.284a.667.667 0 0 1 .911.244l.833 1.444a.667.667 0 0 1-.244.91l-.143.084a.667.667 0 0 1-.912-.244L.387 8.278a.667.667 0 0 1 .245-.91zm9.538.244a.667.667 0 0 1 .911-.244l.145.083a.67.67 0 0 1 .244.911l-.833 1.444a.67.67 0 0 1-.911.244l-.145-.083a.67.67 0 0 1-.244-.911zM3.5 3.5a3.536 3.536 0 0 1 5 0l.126.132A3.536 3.536 0 0 1 8.5 8.5l-.132.125A3.536 3.536 0 0 1 3.5 3.5m3.94 1.06a2.036 2.036 0 1 0-2.88 2.881 2.036 2.036 0 0 0 2.88-2.88M1.22 2.279a.667.667 0 0 1 .912-.244l.143.083a.667.667 0 0 1 .244.911l-.833 1.444a.667.667 0 0 1-.91.244l-.144-.083a.667.667 0 0 1-.245-.911zm8.649-.244a.67.67 0 0 1 .911.244l.833 1.444a.67.67 0 0 1-.244.91l-.145.084a.667.667 0 0 1-.91-.244L9.48 3.028a.67.67 0 0 1 .244-.91zM6.833 0C7.2 0 7.5.299 7.5.667v.166a.667.667 0 0 1-.667.667H5.167A.667.667 0 0 1 4.5.833V.667C4.5.299 4.798 0 5.167 0z"
      clipRule="evenodd"
    />
  </svg>
)
export default Sun12Icon
