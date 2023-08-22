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
const Loader12Icon = ({
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
    <circle cx={6} cy={6} r={5.25} stroke="#1C2225" strokeWidth={1.5} />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.25 2.103a4.5 4.5 0 0 0-1.585-.554C6.3 1.495 6 1.201 6 .833V.667c0-.368.3-.67.666-.63a6 6 0 0 1 4.831 8.367c-.147.337-.559.446-.878.262l-.144-.083c-.319-.185-.423-.591-.288-.934A4.5 4.5 0 0 0 8.25 2.103Z"
      fill="currentColor"
    />
  </svg>
)
export default Loader12Icon
