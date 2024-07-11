/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { IconSvg } from './IconSvg'

const Storage16Icon = ({ title, ...props }: {title?: string}) => (
  <IconSvg
    title={title}
    size={16}
    path="M11.625 1a.75.75 0 0 1 .6.3l2.625 3.5a.75.75 0 0 1 .15.45v9a.75.75 0 0 1-.75.75H1.75a.75.75 0 0 1-.75-.75V1.75A.75.75 0 0 1 1.75 1h.5a.75.75 0 0 1 .75.75V5h7V1.75a.75.75 0 0 1 .75-.75h.875ZM8 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
    {...props}
  />
)
export default Storage16Icon
