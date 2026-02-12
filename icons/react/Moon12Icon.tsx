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
const Moon12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <mask id="a" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M4.18.283c.432-.137.82.25.82.704V1a6 6 0 0 0 6 6h.013c.454-.001.84.387.704.82A6 6 0 1 1 4.179.284"
        clipRule="evenodd"
      />
    </mask>
    <path
      fill="currentColor"
      d="M5 1H3.5zm6 6v1.5zm-.757 3.243 1.06 1.06zm-8.486 0-1.06 1.06zm0-8.485L.697.697zm9.96 6.062-1.43-.453zM4.179.283l-.453-1.43zM5 .987 3.5.984V1h3V.99zM5 1H3.5A7.5 7.5 0 0 0 11 8.5v-3A4.5 4.5 0 0 1 6.5 1zm6 6v1.5h.018L11.013 7l-.003-1.5H11zm.718.82-1.43-.453a4.47 4.47 0 0 1-1.105 1.815l1.06 1.06 1.061 1.061a7.46 7.46 0 0 0 1.844-3.03zm-1.474 2.423-1.061-1.06a4.5 4.5 0 0 1-6.364 0l-1.06 1.06-1.061 1.06a7.5 7.5 0 0 0 10.606 0zm-8.486 0 1.061-1.06a4.5 4.5 0 0 1 0-6.365l-1.06-1.06L.696.697a7.5 7.5 0 0 0 0 10.606zm0-8.485 1.061 1.06a4.5 4.5 0 0 1 1.814-1.105L4.18.283l-.453-1.43A7.5 7.5 0 0 0 .696.697zM11.013 7l.004 1.5a.73.73 0 0 1-.544-.248.92.92 0 0 1-.186-.885l1.43.453 1.43.453c.25-.787 0-1.536-.447-2.03a2.28 2.28 0 0 0-1.69-.743zM5 .987 6.5.99A2.28 2.28 0 0 0 5.757-.7a2.08 2.08 0 0 0-2.03-.447l.452 1.43.453 1.43a.92.92 0 0 1-.885-.186A.73.73 0 0 1 3.5.984z"
      mask="url(#a)"
    />
  </svg>
)
export default Moon12Icon
