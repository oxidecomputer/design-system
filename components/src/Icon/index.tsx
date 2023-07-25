/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/*
  This is for reference only, it needs to be
  in the project directly so that the sprite image path can
  be passed to the component  
*/
import { type Icon as IconType } from '../../../icons'

type IconProps = IconType & {
  className?: string
}

export const Icon = ({ name, size, ...props }: IconProps) => {
  const id = `${name}-${size}`
  const sprite = 'your-imported-sprite-path'

  return (
    <svg width={size} height={size} {...props}>
      <use xlinkHref={`${sprite}#${id}`} />
    </svg>
  )
}
