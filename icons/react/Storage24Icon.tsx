/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { IconSvg } from './IconSvg'

const Storage24Icon = ({ title, ...props }: {title?: string}) => (
  <IconSvg
    title={title}
    size={24}
    path="M18.3 2.375A1 1 0 0 0 17.52 2H17a1 1 0 0 0-1 1v3.1H5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7.35a1 1 0 0 0-.22-.624l-3.48-4.35ZM12 18c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Z"
    {...props}
  />
)
export default Storage24Icon
