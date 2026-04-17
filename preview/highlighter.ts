/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  createHighlighter,
  type BundledLanguage,
  type BundledTheme,
  type HighlighterGeneric,
} from 'shiki'

import theme from '../components/src/asciidoc/oxide-syntax.json'

let highlighterPromise: Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> | null =
  null

export const themeName = theme.name

export function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [theme],
      langs: ['tsx', 'rust', 'json', 'yaml', 'toml', 'css', 'diff', 'md', 'go', 'graphql'],
    })
  }
  return highlighterPromise
}
