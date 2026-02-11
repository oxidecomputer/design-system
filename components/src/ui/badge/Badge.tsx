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
    neutral: 'bg-secondary text-default ring-current/25',
  },
  solid: {
    default: 'bg-accent-secondary text-accent ring-current/20',
    destructive: 'bg-destructive-secondary text-destructive ring-current/20',
    notice: 'bg-notice-secondary text-notice ring-current/20',
    blue: 'bg-info-secondary text-info ring-current/20',
    purple: 'bg-accent-alt-secondary text-accent-alt ring-current/20',
    neutral: 'bg-tertiary text-default ring-raise/35',
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
