# @oxide/design-system

Home to the styles, themes, and base components that are shared across Oxide UI clients.

## Installation

```
npm install --save @oxide/design-system
```

## Publishing

Releases are managed via GitHub Actions workflows triggered from the Actions tab.

- **Full release**: Trigger the "Release" workflow manually with a version number (e.g.,
  `6.0.3`). This publishes to npm under the `latest` tag, commits the version bump, creates
  a git tag, and generates a GitHub Release.
- **Canary release**: Automatically published on every pull request. Each push to a PR
  publishes a prerelease version (e.g., `6.0.2-canary.a1b2c3d`) to npm under the `canary`
  tag. Install it with `npm install @oxide/design-system@canary` to test changes before
  merging.

## Figma Plugins

Figma plugins live in `plugins/`. Each is a standalone npm project with its own
`package.json` and `node_modules` — `cd plugins/<name> && npm install && npm run build`
(or use the `dual-grid:*` / `token-sync:*` scripts at the root). Load a built plugin in
Figma via **Plugins → Development → Import plugin from manifest…**.

- `plugins/token-sync` — reads the CSS files in `styles/` and compares them against
  Figma variables; changes can be applied from the plugin UI.
- `plugins/dual-grid` — generates a synchronised column + cell grid, ASCII grid, and
  type specimens on a frame.

## Syncing with Figma

To regenerate colour palettes, run `npm run color-gen:apply`. This updates the `--color-*`
variables in `styles/main.css` and writes the accent override files.

## Exporting Icons

Icons are also exported from figma using
[figma export cli](https://figma-export.marcomontalbano.com/).

Icons are processed and exported as SVGs for direct use in environments where SVGR is
supported (like our web console). However, for other internal sites such as the marketing
site, docs site, and the RFD site, we do not use SVGR due to limitations with Remix.

For these cases, we have exported a spritesheet and an icon type file that can be used in an
icon component as shown below:

```tsx
import { type Icon as IconType } from '@oxide/design-system/icons'
// Cannot be imported through '@oxide/design-system'
import sprite from '../../node_modules/@oxide/design-system/icons/sprite.svg'

type IconProps = IconType & {
  className?: string
}

const Icon = ({ name, size, ...props }: IconProps) => {
  const id = `${name}-${size}`

  return (
    <svg width={size} height={size} {...props}>
      <use href={`${sprite}#${id}`} />
    </svg>
  )
}

export default Icon
```

Subsequently, you can use it as follows:

```tsx
<Icon name="access" size={16} />
```

This is type-checked, and will throw an error if the corresponding icon doesn't exist.

## Usage

This package provides three main entry points:

### UI Components (`@oxide/design-system/ui`)

Basic UI components like Badge, Button, Checkbox, Listbox, Spinner, and Tabs. These are
lightweight components without dependencies on AsciiDoc processing.

```ts
import { Button, Badge } from '@oxide/design-system/ui'
```

### AsciiDoc Components (`@oxide/design-system/asciidoc`)

[`@oxide/react-asciidoc`](https://github.com/oxidecomputer/react-asciidoc) components for
rendering AsciiDoc content, reused across docs.oxide.computer, oxide.computer, and
rfd.shared.oxide.computer. The associated stylesheet `asciidoc.css` is also included.

```ts
import { AsciiDocBlocks } from '@oxide/design-system/asciidoc'

export const opts: Options = {
  overrides: {
    admonition: AsciiDocBlocks.Admonition,
    table: AsciiDocBlocks.Table,
    section: AsciiDocBlocks.Section,
  },
}
```

```tsx
<Asciidoc content={document} options={opts} />
```

When using these components, remember to also import their associated stylesheets.

Be sure to add the components path to the `tailwind.config.js` to ensure the appropriate
styles are included. For example:

```ts
content: [
  './libs/**/*.{ts,tsx,mdx}',
  './app/**/*.{ts,tsx}',
  'node_modules/@oxide/design-system/components/**/*.{ts,tsx,jsx,js}',
],
```

### Grid math (`@oxide/design-system/grid`)

The maths behind the dual-grid Figma plugin: computes an ASCII cell grid aligned with a
column grid, where margin, column and gutter widths are all whole multiples of the cell
size. Pure TypeScript with no dependencies. See `plugins/dual-grid/README.md` for the
derivation.

`computeGrid` takes the layout column count, the frame size, and either pixel targets
(`mode: 'auto'` — a solver finds the closest whole-cell fit) or explicit cell counts
(`mode: 'manual'`):

```ts
import { computeGrid, gridLineSegments } from '@oxide/design-system/grid'

const grid = computeGrid({
  mode: 'auto', // or 'manual' with marginCells / gutterCells
  columns: 12, // layout columns
  width: 1920, // frame size, px
  height: 1080,
  targetMarginPx: 50, // the solver aims at these…
  targetGutterPx: 20,
  targetCellColumns: 89, // …and at this ASCII column count
  // optional: cellAspect, snapRows, pixelSnap, snapTolerancePx, aspectTolerancePct
})

grid.N // ASCII grid columns
grid.rows // ASCII grid rows
grid.u // cell width, px
grid.cellH // cell height, px
grid.solvedM // margin in cells
grid.solvedG // gutter in cells
grid.margin // margin in px (effectiveMargin includes the pixel-snap remainder)
grid.gutterWidth // gutter in px
grid.columnWidth // column width in px

// The cell grid as drawable [x1, y1, x2, y2] line segments, with lines near
// the frame edge culled.
const segments = gridLineSegments(grid, 1920, 1080, { edgeCull: true })
```
