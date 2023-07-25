/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// @ts-check

module.exports = {
  commands: [
    [
      'components',
      {
        fileId: 'iMVpYGoNGpwMEL9gd0oeYF',
        onlyFromPages: ['Icons'],
        transformers: [
          require('@figma-export/transform-svg-with-svgo')({
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false,
                  },
                },
              },
              {
                name: 'removeAttrs',
                params: {
                  attrs: 'svg:fill:none',
                },
              },
            ],
          }),
        ],
        outputters: [
          require('@figma-export/output-components-as-svg')({
            output: './icons',
            getDirname: () => '',
            getBasename: ({ basename, dirname }) => {
              // Special handing for the directional arrows which have an odd export naming convention
              if (basename.includes('Direction=')) {
                basename = `carat-${basename.split('=')[1].toLowerCase()}-12`
              }

              // Update distro icon names to match what's in figma
              if (dirname === 'distro') {
                return `distro-${basename}.svg`
              }

              // Add the icon's size category as a postfix, if present
              if (!isNaN(parseInt(dirname))) {
                return `${basename}-${dirname}.svg`
              }

              return `${basename}.svg`
            },
          }),
        ],
      },
    ],
  ],
}
