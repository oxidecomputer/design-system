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
const Email24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.226 14.975a1 1 0 0 1-.98-1.201l1.637-7.975A1 1 0 0 1 7.863 5h8.318a1 1 0 0 1 .98.803l1.6 7.975a1 1 0 0 1-.981 1.197H16a1 1 0 0 0-1 1V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.025a1 1 0 0 0-1-1H6.226ZM5 3c.109-.49.435-1 .938-1H18c.502 0 .891.51 1 1l2.974 11.742c.017.077.026.155.026.233v5.954C22 21.52 21.52 22 20.929 22H3.07C2.48 22 2 21.52 2 20.929v-5.954c0-.078.009-.156.026-.233L5 3Z"
      fill="currentColor"
    />
  </svg>
)
export default Email24Icon
