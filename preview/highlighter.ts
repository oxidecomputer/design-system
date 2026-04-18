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

import oxql from '../components/src/asciidoc/langs/oxql.tmLanguage.json'
import p4 from '../components/src/asciidoc/langs/p4.tmLanguage.json'
import theme from '../components/src/asciidoc/oxide-syntax.json'

let highlighterPromise: Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> | null =
  null

export const themeName = theme.name

export function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [theme],
      // Bundled languages by name and custom grammars (oxql, p4) are imported as objects.
      langs: [
        'tsx',
        'rust',
        'json',
        'yaml',
        'toml',
        'css',
        'diff',
        'md',
        'go',
        'graphql',
        oxql,
        p4,
      ],
    })
  }
  return highlighterPromise
}
