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
const Router16Icon = ({
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
      fillRule="evenodd"
      d="M13.268 3.414a.75.75 0 0 1 0 1.172L9.609 7.513A.375.375 0 0 1 9 7.22V6H3.75A.75.75 0 0 1 3 5.25v-2.5A.75.75 0 0 1 3.75 2H9V.78c0-.314.364-.489.61-.293zm-10.536 8a.75.75 0 0 0 0 1.172l3.659 2.927c.245.196.609.021.609-.293V14h5.25a.75.75 0 0 0 .75-.75v-2.5a.75.75 0 0 0-.75-.75H7V8.78a.375.375 0 0 0-.61-.293z"
      clipRule="evenodd"
    />
  </svg>
)
export default Router16Icon
