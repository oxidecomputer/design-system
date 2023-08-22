/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Question12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 12A6 6 0 1 0 6 0a6 6 0 0 0 0 12ZM4.982 3.96c-.063.095-.11.198-.145.3-.09.261-.31.49-.587.49h-.5c-.276 0-.502-.225-.455-.497a2.97 2.97 0 0 1 .434-1.118C4.151 2.495 4.885 2 6 2c1.04 0 1.77.355 2.223.902.427.517.527 1.108.527 1.466 0 .598-.182 1.064-.522 1.417-.268.278-.61.45-.826.558l-.062.031c-.253.13-.37.206-.447.3a.518.518 0 0 0-.094.18c-.066.211-.228.396-.449.396h-.43c-.37 0-.683-.304-.6-.665.076-.334.214-.619.412-.861.298-.365.681-.56.928-.686.292-.149.407-.21.487-.293.035-.036.103-.112.103-.377 0-.12-.04-.337-.184-.51C6.95 3.715 6.678 3.5 6 3.5c-.604 0-.87.236-1.018.46Zm.143 4.96c0-.37.3-.67.67-.67h.41c.37 0 .67.3.67.67v.41c0 .37-.3.67-.67.67h-.41a.67.67 0 0 1-.67-.67v-.41Z"
      fill="currentColor"
    />
  </svg>
)
export default Question12Icon
