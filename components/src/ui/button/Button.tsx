/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import type { MouseEventHandler } from 'react'
import { forwardRef } from 'react'

import { Spinner } from '../'

export const buttonSizes = ['sm', 'icon', 'base'] as const
export const variants = ['primary', 'secondary', 'ghost', 'danger'] as const

export type ButtonSize = (typeof buttonSizes)[number]
export type Variant = (typeof variants)[number]

const sizeStyle: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-mono-sm svg:w-4',
  // meant for buttons that only contain a single icon
  icon: 'h-8 w-8 text-mono-sm svg:w-4',
  base: 'h-10 px-4 text-mono-sm svg:w-5',
}

type ButtonStyleProps = {
  size?: ButtonSize
  variant?: Variant
}

export const buttonStyle = ({
  size = 'base',
  variant = 'primary',
}: ButtonStyleProps = {}) => {
  return cn(
    'ox-button inline-flex items-center justify-center rounded align-top elevation-1 disabled:cursor-not-allowed',
    `btn-${variant}`,
    sizeStyle[size],
    variant === 'danger'
      ? 'focus:outline-destructive-secondary'
      : 'focus:outline-accent-secondary',
  )
}

/**
 * When the `disabled` prop is passed to the button we put it in a visually disabled state.
 * In that case we want to override the default mouse down and click behavior to simulate a
 * disabled state.
 */
const noop: MouseEventHandler<HTMLButtonElement> = (e) => {
  e.stopPropagation()
  e.preventDefault()
}

export interface ButtonProps
  extends React.ComponentPropsWithRef<'button'>,
    ButtonStyleProps {
  innerClassName?: string
  loading?: boolean
}

// Use `forwardRef` so the ref points to the DOM element (not the React Component)
// so it can be focused using the DOM API (eg. this.buttonRef.current.focus())
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      children,
      size,
      variant,
      className,
      loading,
      innerClassName,
      disabled,
      onClick,
      // needs to be a spread because we sometimes get passed arbitrary <button>
      // props by the parent
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading
    return (
      <button
        className={cn(buttonStyle({ size, variant }), className, {
          'visually-disabled': isDisabled,
        })}
        ref={ref}
        type={type}
        onMouseDown={isDisabled ? noop : undefined}
        onClick={isDisabled ? noop : onClick}
        aria-disabled={isDisabled}
        {...rest}
      >
        {loading && <Spinner className="absolute" variant={variant} />}
        <span className={cn('flex items-center', innerClassName, { invisible: loading })}>
          {children}
        </span>
      </button>
    )
  },
)
