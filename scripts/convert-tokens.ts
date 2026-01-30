/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * Utilized by `build_themes.sh` to convert theme token files to generate the files in `styles/themes`
 */
import { converter, parse } from 'culori'
import type { Config, TransformedToken } from 'style-dictionary'
import StyleDictionary, { Dictionary } from 'style-dictionary'

const THEMES = ['main', 'blue', 'yellow', 'purple', 'red', 'green'] as const

const FONT_FAMILIES = {
  'GT America Mono': '"GT America Mono", monospace',
  "Suisse Int'l":
    'SuisseIntl, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif',
}

const FONT_VARS = {
  'GT America Mono': 'var(--font-mono)',
  "Suisse Int'l": 'var(--font-sans)',
}

const percentToRem = (value: string) => {
  return parseFloat(value) / 100 + 'rem'
}
const pxToRem = (value: string | number) => parseFloat(value as string) / 16 + 'rem'
const valueToRem = (value: string | number) =>
  typeof value === 'string' && value.includes('%') ? percentToRem(value) : pxToRem(value)

const formatFontClass = (name: string) => {
  return name.replace('-regular', '')
}

const camelCase = (s: string) =>
  s
    .replace(/[\W|_]+/g, ' ')
    .replace(
      /([A-Z])([A-Z]+)/g,
      (_, first, remaining) => `${first}${remaining.toLowerCase()}`,
    )

    .replace(/(?:^\w|[A-Z]|\b\w)/g, (leftTrim, idx) =>
      idx === 0 ? leftTrim.toLowerCase() : leftTrim.toUpperCase(),
    )
    .replace(
      /([A-Z])([A-Z]+)/g,
      (_, first, remaining) => `${first}${remaining.toLowerCase()}`,
    )
    .replace(/\s+/g, '')

const kebabCase = (s: string) =>
  camelCase(s)
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
    .toLowerCase()

/**
 * The token build process leaves typography styles in object form while it
 * collapses everything else into individual properties. We pass that object
 * to this function to ensure everything is formatted to `rem` units and to remove
 * and properties that we don't really want or need
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatTypographyStyles = (name: string, value: any): [string, string] | null => {
  // eslint-disable-next-line no-param-reassign
  name = kebabCase(name)
  if (value === 'none') return null
  switch (name) {
    case 'font-family': {
      const fontVar =
        value in FONT_VARS ? FONT_VARS[value as keyof typeof FONT_VARS] : value
      return [name, fontVar]
    }
    case 'line-height':
      return value === 'AUTO' ? null : [name, valueToRem(value)]
    case 'font-weight': {
      const weight = value.toLowerCase()
      if (weight.includes('light')) {
        return [name, '300']
      } else if (weight.includes('medium')) {
        return [name, '500']
      } else {
        return [name, '400']
      }
    }
    case 'paragraph-spacing':
      return null
    case 'text-case':
      return ['text-transform', value]
    case 'font-size':
    case 'letter-spacing':
      return [name, valueToRem(value)]
    default:
      return [name, value]
  }
}

const toColorName = (name?: string) => (name ? name.replace('base', 'color') : '')
const toRgb = converter('rgb')

const formatP3Color = (value: string, name: string, alpha?: number) => {
  const color = parse(value)
  if (!color) {
    throw new Error(`Invalid color for ${name}. Expected a hex value, got '${value}'`)
  }

  const rgbColor = toRgb(color)
  const r = (rgbColor.r || 0).toFixed(4)
  const g = (rgbColor.g || 0).toFixed(4)
  const b = (rgbColor.b || 0).toFixed(4)

  return alpha !== undefined
    ? `color(display-p3 ${r} ${g} ${b} / ${alpha.toFixed(2)})`
    : `color(display-p3 ${r} ${g} ${b})`
}

const formatColorValue = (prop: TransformedToken) => {
  const { hasAlpha } = prop.attributes || {}
  const alpha =
    hasAlpha && prop.attributes?.alpha ? (prop.attributes.alpha as number) : undefined
  const p3Value = formatP3Color(prop.value, prop.name, alpha)

  return `${p3Value}; /* ${prop.value}${hasAlpha && alpha ? ` with alpha ${alpha.toFixed(2)}` : ''} */`
}

const semanticPrefixMap = {
  'surface-': { prefixes: ['background'], replacement: 'surface-' },
  'content-': { prefixes: ['text'], replacement: 'content-' },
  'stroke-': { prefixes: ['border', 'ring', 'outline'], replacement: 'stroke-' },
  'chart-fill-': { prefixes: ['fill'], replacement: 'chart-fill-' },
  'chart-stroke-': { prefixes: ['stroke'], replacement: 'chart-stroke-' },
}

StyleDictionary.registerFormat({
  name: 'theme',
  async format({ dictionary, options }) {
    /** Used with the `??` operator when you only want to include styles on the root stylesheet */
    const root = options.selector === ':root' ? undefined : ''
    const colorVars: string[] = []

    const createUtilityVar = (
      prop: TransformedToken,
      prefixes: string[],
      replacement: string,
    ) => {
      const { hasAlpha } = prop.attributes || {}
      prefixes.forEach((prefix) => {
        colorVars.push(
          `  --${prefix}-color-${prop.name.replace(replacement, '')}: var(--${toColorName(
            prop.name,
          )});`,
        )
      })
      const colorName = toColorName(prop.attributes?.ref as string)
      // We are combining the color var with the alpha value if it exists
      // but we can't use the color reference directly and need to grab the value
      return `  --${prop.name}: ${
        hasAlpha ? formatColorValue(prop) : `var(--${colorName})`
      };`
    }

    return `/* THIS FILE IS AUTOGENERATED, DO NOT EDIT */
@import "tailwindcss";

${options.selector} {
${dictionary.allTokens
  .filter((prop) => typeof prop.value !== 'object' && prop.type === 'color')
  .sort(({ name }) => (name.startsWith('base-') ? -1 : 1))
  .map((prop) => {
    const { alpha } = prop.attributes || {}
    const color = parse(prop.value)
    if (!color) {
      throw new Error(
        `Invalid color for ${prop.name}. Expected a hex value, got '${prop.value}'`,
      )
    }
    const name = toColorName(prop.name)
    const colorRef = toColorName(prop.attributes?.ref as string)
    color.alpha = alpha as number
    if (prop.name.startsWith('theme-') && prop.attributes?.ref) {
      return `  --${name}: var(--${colorRef});`
    }
    for (const [prefix, config] of Object.entries(semanticPrefixMap)) {
      if (prop.name.startsWith(prefix) && prop.attributes?.ref) {
        return createUtilityVar(prop, config.prefixes, config.replacement)
      }
    }

    return `  --${name}: ${formatColorValue(prop)}`
  })
  .join('\n')}
}

${generateThemeInline(!root, dictionary, colorVars)}

${generateBoxShadowUtilities(!root, dictionary)}

${generateTypographyUtilities(!root, dictionary)}`
  },
})

StyleDictionary.registerFormat({
  name: 'themeOverride',
  async format({ dictionary, options }) {
    return `${options.selector} {
${dictionary.allTokens
  .filter((prop) => typeof prop.value !== 'object' && prop.type === 'color')
  .filter(
    (prop) =>
      prop.name.startsWith('surface-') ||
      prop.name.startsWith('content-') ||
      prop.name.startsWith('theme-') ||
      prop.name.startsWith('stroke-') ||
      prop.name.startsWith('chart-fill-') ||
      prop.name.startsWith('chart-stroke-'),
  )
  .map((prop) => {
    const { alpha } = prop.attributes || {}
    const color = parse(prop.value)
    if (!color) {
      throw new Error(
        `Invalid color for ${prop.name}. Expected a hex value, got '${prop.value}'`,
      )
    }
    color.alpha = alpha as number

    // Only output variable references, not the base color definitions
    // unless it needs the alpha in which case it gets precomputed
    if (prop.attributes?.ref) {
      const { hasAlpha } = prop.attributes || {}
      const colorRef = toColorName(prop.attributes.ref as string)
      return `  --${prop.name}: ${
        hasAlpha ? formatColorValue(prop) : `var(--${colorRef})`
      };`
    }

    const p3Value = formatP3Color(prop.value, prop.name)
    return `  --${prop.name}: ${p3Value}; /* ${prop.value} */`
  })
  .join('\n')}
}`
  },
})

function generateThemeInline(root: boolean, dictionary: Dictionary, colorVars: string[]) {
  if (!root) return ''

  return `@theme inline {
  --font-sans: ${FONT_FAMILIES["Suisse Int'l"]};
  --font-mono: ${FONT_FAMILIES['GT America Mono']};

${colorVars.join('\n')}

${dictionary.allTokens
  .filter((prop) => prop.type === 'borderRadius')
  .map((prop) => `  --${prop.name.replace('border-', '')}: ${prop.value};`)
  .join('\n')}
}`
}

function generateBoxShadowUtilities(root: boolean, dictionary: Dictionary) {
  if (!root) return ''

  return dictionary.allTokens
    .filter((prop) => prop.type === 'boxShadow')
    .map((prop) => {
      return `@utility ${prop.name} {
  box-shadow: ${[prop.value]
    .flat()
    .map((v) => (typeof v === 'object' ? `${v.x}px ${v.y}px ${v.blur}px ${v.color}` : v))};
}`
    })
    .join('\n')
}

function generateTypographyUtilities(root: boolean, dictionary: Dictionary) {
  if (!root) return ''

  return dictionary.allTokens
    .filter((prop) => prop.type === 'typography')
    .map((prop) => {
      const fontFeatures =
        prop.value['fontFamily'] === 'GT America Mono'
          ? `\n  font-feature-settings: "ss02" on,"ss03" on,"ss09" on,"ss06" on,"ss07" on,"ss08" on,"calt" off;`
          : ''

      return `@utility text-${formatFontClass(prop.name)} {
${Object.entries(prop.value)
  .map(([name, value]) => formatTypographyStyles(name, value))
  .filter((style) => style !== null)
  .map((tuple) => (tuple ? `  ${tuple[0]}: ${tuple[1]};` : ''))
  .join('\n')}${fontFeatures}
}`
    })
    .join('\n')
}

/**
 * Anything we're not actively using in the theme files or tailwind config should be filtered out
 *
 * If an asterisk appears in the token path that style will be filtered out here which gives us the ability
 * to explicitly filter things out directly from the token file
 */
StyleDictionary.registerFilter({
  name: 'unused-theme-tokens',
  filter: (prop) => {
    return (
      ![
        'fontFamilies',
        'fontWeights',
        'fontSizes',
        'letterSpacing',
        'paragraphSpacing',
        'textCase',
        'textDecoration',
        'lineHeights',
      ].includes(prop.original.type || '') &&
      !prop.path.some((i) => i.includes('*')) &&
      !prop.name.endsWith('-uncased')
    )
  },
})

StyleDictionary.registerTransform({
  name: 'name/strip-default',
  type: 'name',
  transform(token) {
    return token.name.replace(/(\w+-\w+)-default/, '$1')
  },
})

StyleDictionary.registerTransform({
  name: 'attribute/reference',
  type: 'attribute',
  filter: (token) => token.original.type === 'color',
  transform(token) {
    const ref = token.original.rawValue.match(/{(.+)}/)?.[1]?.replace(/\./g, '-')
    return { ...token.attributes, ref }
  },
})

const hexToRGB = (hexColor: string) => {
  return hexColor.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
}

StyleDictionary.registerTransform({
  name: 'attribute/alpha',
  type: 'attribute',
  filter: (token) => token.original.type === 'color',
  transform(token) {
    const alphaText = token.value.slice(7, 9)
    const alpha = alphaText && hexToRGB(alphaText)[0] / 255
    return { ...token.attributes, alpha, hasAlpha: typeof alpha === 'number' }
  },
})

StyleDictionary.registerTransform({
  name: 'pxToRem',
  type: 'value',
  filter: (token) => ['borderRadius'].includes(token.original.type || ''),
  transform(token) {
    return `${token.value / 16}rem`
  },
})

const makeConfig = (theme: (typeof THEMES)[number]) => {
  const config: Config = {
    source: [`styles/src/.tokens/${theme}.json`],
    platforms: {
      web: {
        transforms: [
          'attribute/cti',
          'name/kebab',
          'name/strip-default',
          'attribute/reference',
          'attribute/alpha',
          'pxToRem',
        ],
        buildPath: 'styles/dist/',
        files: [
          {
            filter: 'unused-theme-tokens',
            destination: `${theme}.css`,
            format: theme === 'main' ? 'theme' : 'themeOverride',
            options: {
              selector: theme === 'main' ? ':root' : `.${theme}-theme`,
            },
          },
        ],
      },
    },
  }

  return config
}

THEMES.forEach(async (theme) => {
  const sd = new StyleDictionary(makeConfig(theme))
  await sd.hasInitialized
  await sd.buildAllPlatforms()
})
