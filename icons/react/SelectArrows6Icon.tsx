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
const SelectArrows6Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={6}
    height={14}
    viewBox="0 0 6 14"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.322.536a.375.375 0 0 0-.644 0L.341 4.432C.19 4.682.37 5 .662 5h4.676a.375.375 0 0 0 .321-.568zm-.644 12.928a.375.375 0 0 0 .644 0l2.337-3.896A.375.375 0 0 0 5.338 9H.662a.375.375 0 0 0-.321.568z"
      clipRule="evenodd"
    />
  </svg>
)
export default SelectArrows6Icon
