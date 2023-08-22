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
const Profile16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 13.745a7 7 0 1 0-8-11.49 7 7 0 0 0 8 11.49Zm-7.88-2.59A3.001 3.001 0 0 1 7 9h2c1.363 0 2.514.91 2.88 2.155A4.99 4.99 0 0 1 8 13a4.99 4.99 0 0 1-3.88-1.845ZM10 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
      fill="currentColor"
    />
  </svg>
)
export default Profile16Icon
