# @oxide/design-system

Home to the styles, themes, and base components that are shared across Oxide UI clients.

## Installation

```
npm install --save @oxide/design-system
```

## Publishing

This package uses [auto](https://github.com/intuit/auto/) to automatically publish new
changes for any merged pull requests. Version bumps are determined by the GitHub labels
added to the pull request. `major`, `minor`, and `patch` labels bumps the related semver
version when the PR is merged. `documentation` and `internal` can be used instead to
indicate that a version bump shouldn't happen. If you want to indiciate a version bump but
don't want the release to happen yet you can use `major`, `minor`, or `patch` in conjunction
with `skip-release`.

For more information checkout [auto's docs](https://intuit.github.io/auto/docs).

## Syncing with Figma

To ensure consistency between our designs and implementation we use the
[Design Tokens Plugin](https://www.figma.com/community/plugin/888356646278934516/Design-Tokens)
inside of figma to export a [json tokens file](styles/src/tokens.json) to the repo. When
that file is changed the [build-themes](.github/workflows/build-themes.yaml) workflow runs
to generate theme stylesheets, a tailwind token file, and other artifacts in
[dist](styles/dist/).

The design tokens plugin is two way so token changes made in the json file can be synced
back with figma.

## Exporting Icons

Icons are also exported from figma using
[figma export cli](https://figma-export.marcomontalbano.com/). A PR should be opened
automatically for updating icons via the
[update-icons workflow](.github/workflows/update-icons.yaml).

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

## AsciiDoc Components

This repository includes various
[`@oxide/react-asciidoc`](https://github.com/oxidecomputer/react-asciidoc) components that
are reused across multiple internal sites such as docs.oxide.computer, oxide.computer, and
eventually the rfd.shared.oxide.computer (when its conversion to `react-asciidoc` is
complete). The associated stylesheet `asciidoc.css` is also included.

They can be imported and used as follows:

```ts
import { AsciiDocBlocks } from '@oxide/design-system/components/dist'

export const opts: Options = {
  overrides: {
    admonition: AsciiDocBlocks.Admonition,
    table: AsciiDocBlocks.Table,
    listing: AsciiDocBlocks.Listing,
  },
}
```

```tsx
<Asciidoc content={document} options={opts} />
```

## React Components

The full UI library is housed within the web console repo. The components included in this
package are those reused across other Oxide sites. When using them, remember to also import
their associated stylesheets.

Be sure to add the components path to the `tailwind.config.js` to ensure the appropriate
styles are included. For example:

```ts
content: [
  './libs/**/*.{ts,tsx,mdx}',
  './app/**/*.{ts,tsx}',
  'node_modules/@oxide/design-system/components/**/*.{ts,tsx,jsx,js}',
],
```
