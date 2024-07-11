/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { IconSvg } from './IconSvg'

const Action16Icon = ({ title, ...props }: {title?: string}) => (
  <IconSvg
    title={title}
    size={16}
    path="M9 7h3.978a.5.5 0 0 1 .394.807L7.895 14.85A.5.5 0 0 1 7 14.543V9H3.022a.5.5 0 0 1-.394-.807L8.105 1.15A.5.5 0 0 1 9 1.457V7Z"
    {...props}
  />
)
export default Action16Icon
