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
    default: 'bg-accent-secondary text-accent ring-accent/15',
    destructive: 'bg-destructive-secondary text-destructive ring-destructive/15',
    notice: 'bg-notice-secondary text-notice ring-notice/15',
    blue: 'bg-blue-200 text-blue-800 ring-blue-800/15',
    purple: 'bg-purple-200 text-purple-800 ring-purple-800/15',
    neutral: 'bg-secondary text-default ring-neutral-700/15',
  },
  solid: {
    default: 'bg-accent text-inverse',
    destructive: 'bg-destructive text-inverse',
    notice: 'bg-notice text-inverse',
    neutral: 'bg-inverse-secondary text-inverse',
    purple: 'bg-purple-700 text-inverse',
    blue: 'bg-info text-inverse',
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
        'text-mono-sm inline-flex h-4 items-center whitespace-nowrap rounded-sm px-[3px] py-[1px] uppercase',
        badgeColors[variant][color],
        className,
      )}
    >
      <span>{children}</span>
    </span>
  )
}
