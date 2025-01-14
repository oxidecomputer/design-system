/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import svgOutputter from '@figma-export/output-components-as-svg'
import svgrOutputter from '@figma-export/output-components-as-svgr'
import svgoTransformer from '@figma-export/transform-svg-with-svgo'
import { pascalCase } from '@figma-export/utils'

export default {
  commands: [
    [
      'components',
      {
        fileId: 'iMVpYGoNGpwMEL9gd0oeYF',
        onlyFromPages: ['Icons'],
        transformers: [
          svgoTransformer({
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
          svgOutputter({
            output: './icons/svg',
            getDirname: () => '',
            getBasename: ({ basename, dirname }) => {
              if (basename.includes('Direction=')) {
                basename = `carat-${basename.split('=')[1].toLowerCase()}-12`
              }
              if (!isNaN(parseInt(dirname))) {
                return `${basename}-${dirname}.svg`
              }
              return `${basename}.svg`
            },
          }),
          svgrOutputter({
            output: './icons/react',
            getFileExtension: () => '.tsx',
            getDirname: () => '',
            getComponentName: ({ componentName }) =>
              pascalCase(
                componentName
                  .split('/')
                  .map((n) => `${n[0].toUpperCase()}${n.slice(1)}`)
                  .reverse()
                  .join('') + 'Icon',
              ),
            getSvgrConfig: () => ({
              jsxRuntime: 'automatic',
              typescript: true,
              titleProp: true,
              plugins: ['@svgr/plugin-jsx'],
              svgProps: {
                role: 'img',
              },
              expandProps: 'end',
              exportType: 'default',
            }),
          }),
        ],
      },
    ],
  ],
}
