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
