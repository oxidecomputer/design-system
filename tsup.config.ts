/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { defineConfig } from 'tsup'

export default defineConfig({
  publicDir: 'components/src/assets/',
  entry: [
    'components/src/index.ts',
    'components/src/ui/index.ts',
    'icons/index.ts',
    'icons/react/index.ts',
  ],
  sourcemap: true,
  clean: true,
  format: ['esm'],
  // prevent ui export from including stuff from asciidoc
  splitting: false,
})
