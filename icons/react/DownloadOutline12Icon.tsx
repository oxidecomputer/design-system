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
const DownloadOutline12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
      d="M.67 8a.33.33 0 0 1 .33.33V11h10V8.33a.33.33 0 0 1 .33-.33h.34a.33.33 0 0 1 .33.33v3l-.014.135a.67.67 0 0 1-.521.521L11.33 12H.67l-.135-.014a.67.67 0 0 1-.521-.521L0 11.33v-3A.33.33 0 0 1 .33 8zm5.5-8a.33.33 0 0 1 .33.33v6.46l1.913-1.913a.33.33 0 0 1 .467 0l.24.24a.33.33 0 0 1 0 .467L6.233 8.471a.33.33 0 0 1-.466 0L2.88 5.584a.33.33 0 0 1 0-.467l.24-.24a.33.33 0 0 1 .467 0L5.5 6.79V.33A.33.33 0 0 1 5.83 0z"
    />
  </svg>
)
export default DownloadOutline12Icon
