/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Svg } from './Svg'

const Instances16Icon = ({ title, ...props }: {title?: string}) => (
  <Svg
    title={title}
    size={16}
    path="M6 1.75A.75.75 0 0 1 6.75 1h7.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75H13V3.75a.75.75 0 0 0-.75-.75H6V1.75Zm-5 4A.75.75 0 0 1 1.75 5h8.5a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-.75.75h-8.5a.75.75 0 0 1-.75-.75v-8.5Z"
    {...props}
  />
)
export default Instances16Icon
