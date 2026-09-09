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
const Monitoring16Icon = ({
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
      d="M1.25 11a.75.75 0 0 1 .75.75V14h2.25a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1-.75-.75v-3.5A.75.75 0 0 1 .75 11zm14 0a.75.75 0 0 1 .75.75v3.5l-.004.077a.75.75 0 0 1-.746.673h-3.5a.75.75 0 0 1-.75-.75v-.5a.75.75 0 0 1 .75-.75H14v-2.25a.75.75 0 0 1 .75-.75zm-4-2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-6.5a.75.75 0 0 1-.75-.75v-1.5A.75.75 0 0 1 4.75 9zm0-5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-6.5A.75.75 0 0 1 4 6.25v-1.5A.75.75 0 0 1 4.75 4zm-7-4A.75.75 0 0 1 5 .75v.5a.75.75 0 0 1-.75.75H2v2.25a.75.75 0 0 1-.75.75h-.5A.75.75 0 0 1 0 4.25V.75A.75.75 0 0 1 .75 0zm11.077.004A.75.75 0 0 1 16 .75v3.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75V2h-2.25a.75.75 0 0 1-.75-.75v-.5a.75.75 0 0 1 .75-.75h3.5q.04 0 .077.004"
    />
  </svg>
)
export default Monitoring16Icon
