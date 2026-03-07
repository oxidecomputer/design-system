/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'

export type BadgeColor =
  | 'default'
  | 'destructive'
  | 'notice'
  | 'neutral'
  | 'purple'
  | 'blue'
export type BadgeVariant = 'default' | 'solid'

export interface BadgeProps {
  color?: BadgeColor
  className?: string
  children: React.ReactNode
  variant?: BadgeVariant
}

export const badgeColors: Record<BadgeVariant, Record<BadgeColor, string>> = {
  default: {
    default: 'bg-accent text-accent ring-current/15',
    destructive: 'bg-destructive text-destructive ring-current/15',
    notice: 'bg-notice text-notice ring-current/15',
    blue: 'bg-info text-info ring-current/15',
    purple: 'bg-accent-alt text-accent-alt ring-current/15',
    neutral: 'bg-secondary text-default ring-current/15',
  },
  solid: {
    default: 'bg-green-700 text-inverse',
    destructive: 'bg-red-700 text-inverse',
    notice: 'bg-yellow-700 text-inverse',
    blue: 'bg-blue-700 text-inverse',
    purple: 'bg-purple-700 text-inverse',
    neutral: 'bg-neutral-700 text-inverse',
  },
}

export const Badge = ({
  className,
  children,
  color = 'default',
  variant = 'default',
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'ox-badge ring ring-inset',
        `variant-${variant}`,
        'text-mono-sm inline-flex h-4 items-center rounded-sm px-0.75 py-px whitespace-nowrap uppercase',
        badgeColors[variant][color],
        className,
      )}
    >
      <span>{children}</span>
    </span>
  )
}
