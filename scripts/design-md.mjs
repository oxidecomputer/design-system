// Regenerates the @generated regions in design.md from styles/*.css.
//
//   node scripts/design-md.mjs          rewrite design.md in place
//   node scripts/design-md.mjs --check  exit 1 if design.md is out of date
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(root, p), 'utf8')

/** All `--name: value` declarations in a CSS file, last one wins. */
function parseVars(css) {
  const vars = {}
  for (const [, name, value] of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    vars[name] = value.trim()
  }
  return vars
}

/** Map of color token -> semantic roles that reference it directly, e.g. 'neutral-800' -> ['content-default']. */
function semanticRoles(css) {
  const roles = {}
  for (const [, role, color] of css.matchAll(
    /--((?:surface|content|stroke)-[\w-]+):\s*var\(--color-([\w-]+)\);/g,
  )) {
    ;(roles[color] ??= []).push(role)
  }
  return roles
}

const colors = parseVars(read('styles/main.css'))
const rolesByTheme = {
  dark: semanticRoles(read('styles/dark.css')),
  light: semanticRoles(read('styles/light.css')),
}

// Hue anchors aren't referenced directly (they bind via --theme-* vars), so
// their comments are static; neutral comments are derived from the theme maps.
const EXAMPLES = [
  'neutral-0',
  'neutral-300',
  'neutral-800',
  'neutral-1300',
  { token: 'green-800', note: 'the default accent anchor' },
  { token: 'red-800', note: 'error / destructive anchor' },
  { token: 'yellow-800', note: 'notice anchor' },
  { token: 'blue-800', note: 'info anchor' },
]

function comment(token) {
  const parts = []
  for (const theme of ['dark', 'light']) {
    const roles = rolesByTheme[theme][token]
    if (roles) parts.push(`${theme}: ${roles.join(', ')}`)
  }
  return parts.join(' · ')
}

function renderColorsExamples() {
  const rows = EXAMPLES.map((e) => {
    const token = typeof e === 'string' ? e : e.token
    const value = colors[`--color-${token}`]
    if (!value) throw new Error(`--color-${token} not found in styles/main.css`)
    return [`--color-${token}:`, `${value};`, typeof e === 'string' ? comment(token) : e.note]
  })
  const w0 = Math.max(...rows.map((r) => r[0].length))
  const w1 = Math.max(...rows.map((r) => r[1].length))
  const lines = rows.map(
    ([decl, value, note]) => `${decl.padEnd(w0)} ${value.padEnd(w1)} /* ${note} */`,
  )
  return '```css\n' + lines.join('\n') + '\n```'
}

const REGIONS = { 'colors:examples': renderColorsExamples }

const docPath = join(root, 'design.md')
const doc = readFileSync(docPath, 'utf8')

let found = 0
const updated = doc.replace(
  /(<!-- @generated ([\w:-]+).*?-->\n)[\s\S]*?(\n<!-- \/@generated -->)/g,
  (match, open, name, close) => {
    const render = REGIONS[name]
    if (!render) throw new Error(`no renderer for @generated region "${name}"`)
    found++
    return open + render() + close
  },
)
if (found !== Object.keys(REGIONS).length) {
  throw new Error(`expected ${Object.keys(REGIONS).length} @generated regions, found ${found}`)
}

if (process.argv.includes('--check')) {
  if (updated !== doc) {
    console.error('design.md is out of date with styles/*.css — run: npm run design-md')
    process.exit(1)
  }
  console.log('design.md is up to date')
} else if (updated !== doc) {
  writeFileSync(docPath, updated)
  console.log('design.md updated')
} else {
  console.log('design.md unchanged')
}
