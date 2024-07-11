/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Svg } from './Svg'

const Instances24Icon = ({ title, ...props }: {title?: string}) => (
  <Svg
    title={title}
    size={24}
    path="M7 3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-2V6a1 1 0 0 0-1-1H7V3ZM3 7h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
    {...props}
  />
)
export default Instances24Icon
