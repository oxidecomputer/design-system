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
const Notifications24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M15 19a3 3 0 1 1-6 0zM12 2a2 2 0 0 1 2 2c0 .173.114.324.277.38A7 7 0 0 1 19 11v2.697a1 1 0 0 0 .168.555l.664.996a1 1 0 0 1 .168.555V16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-.197a1 1 0 0 1 .168-.555l.664-.996A1 1 0 0 0 5 13.697V11a7 7 0 0 1 4.723-6.62A.405.405 0 0 0 10 4a2 2 0 0 1 2-2"
    />
  </svg>
)
export default Notifications24Icon
