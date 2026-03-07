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
    default: 'bg-green-800 text-green-200 light:bg-green-900 ring-current/15',
    destructive: 'bg-red-800 text-red-200 light:bg-red-900 ring-current/15',
    notice: 'bg-yellow-800 text-yellow-200 light:bg-yellow-900 ring-current/15',
    blue: 'bg-blue-800 text-blue-200 light:bg-blue-900 ring-current/15',
    purple: 'bg-purple-800 text-purple-200 light:bg-purple-900 ring-current/15',
    neutral: 'bg-neutral-800 text-neutral-200 light:bg-neutral-900 ring-current/15',
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
