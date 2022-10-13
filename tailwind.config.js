// @ts-check

/** @type {import('tailwindcss/lib/util/createPlugin').default} */
// @ts-ignore
const plugin = require('tailwindcss/plugin')
const {
  textUtilities,
  colorUtilities,
  borderRadiusTokens,
} = require('./styles/dist/tailwind-tokens')

/** @type {import('tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  corePlugins: {
    fontFamily: false,
    fontSize: true,
  },
  content: ['./libs/**/*.{ts,tsx,mdx}', './app/**/*.{ts,tsx}'],
  safelist: [
    {
      pattern: /(border|bg|text)-(.*)-(.*)/,
    },
  ],
  theme: {
    extend: {
      screens: {
        400: '400px',
        500: '500px',
        600: '600px',
        800: '800px',
        900: '900px',
        1000: '1000px',
        1100: '1100px',
        1200: '1200px',
        1400: '1400px',
        1600: '1600px',
        print: { raw: 'print' },
      },
      maxWidth: {
        500: '500px',
        600: '600px',
        620: '620px',
        720: '720px',
        800: '800px',
        900: '900px',
        1000: '1000px',
        1060: '1060px',
        1200: '1200px',
        1400: '1400px',
        1600: '1600px',
        1800: '1800px',
      },
    },
    borderRadius: {
      ...borderRadiusTokens,
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities(textUtilities)
      addUtilities(colorUtilities)
    }),
  ],
}
