/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { type JSX, createElement } from 'react'

const titleCase = (text: string): string => {
  return text.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  )
}

// all the cuteness of tw.span`text-secondary uppercase` with zero magic

const make =
  <T extends keyof JSX.IntrinsicElements>(tag: T) =>
  // only one argument here means string interpolations are not allowed
  (strings: TemplateStringsArray) => {
    const Comp = ({ className, children, ...rest }: JSX.IntrinsicElements[T]) =>
      createElement(tag, { className: cn(strings[0], className), ...rest }, children)
    Comp.displayName = `classed.${tag}`
    return Comp
  }

// JSX.IntrinsicElements[T] ensures same props as the real DOM element. For example,
// classed.span doesn't allow a type attr but classed.input does.

const classed = {
  button: make('button'),
  div: make('div'),
  h1: make('h1'),
  h2: make('h2'),
  h3: make('h3'),
  h4: make('h4'),
  hr: make('hr'),
  header: make('header'),
  input: make('input'),
  label: make('label'),
  li: make('li'),
  main: make('main'),
  ol: make('ol'),
  p: make('p'),
  span: make('span'),
  table: make('table'),
  tbody: make('tbody'),
  td: make('td'),
  th: make('th'),
  tr: make('tr'),
} as const

// result: classed.button`text-secondary uppercase` returns a component with those classes

export { titleCase, classed }
