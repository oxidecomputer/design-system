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
            plugins: [],
          }),
        ],
        outputters: [
          require('@figma-export/output-components-as-svg')({
            output: './icons',
            getDirname: () => '',
          }),
        ],
      },
    ],
  ],
}
