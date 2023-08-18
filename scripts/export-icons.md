# Export Icons

> **Note** The codeblocks in this document are executed by `npm run export-icons`.

## Retrieve icons from figma

We use the [figma-export cli](https://github.com/marcomontalbano/figma-export) to download
SVG files directly from figma. The configuration for this process is located in
`.figmaexportrc.js`.

For this process to work you _must_ create a `.env` file and add `FIGMA_TOKEN=<your_token>`.
See
[Figma's docs](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)
for more information on creating an access token.

```sh
# Remove all the icons so any icon that was removed from figma won't linger
rm -rf icons

# Export the FIGMA_TOKEN
export $(egrep -v '^#' .env | xargs)

# This command requires a FIGMA_TOKEN env var with read access to Oxide's DS to be set
npx figma-export use-config
```

## Cleanup fill color

When the icons are imported from figma they have fill values associated with whatever the
fill color was set as in the designs. What we want instead is to be able to use
[currentColor](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#currentcolor_keyword)
such that the fill color of the icons can be controlled in its calling code.

```js
const icons = await glob('./icons/svg/*.svg')
for (let icon of icons) {
  await $`cat ${icon}`
    .then((i) => i.stdout.replace(/fill="[^"]*"/g, 'fill="currentColor"'))
    .then((r) => fs.writeFile(icon, r))
}
```

## Create the icons type file

Making a type which is a union of all the icon names and sizes. That way we can check
whether the user is specifying a valid combination in the icon component

```js
const iconMap = {}

for (let icon of icons) {
  let iconName = path.basename(icon, '.svg')
  let nameParts = iconName.split('-')
  let size = parseInt(nameParts.pop())

  if (iconMap[nameParts.join('-')]) {
    iconMap[nameParts.join('-')].push(size)
  } else {
    iconMap[nameParts.join('-')] = [size]
  }
}

let contents = `/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export type Icon = \n`

for (let icon in iconMap) {
  for (let size of iconMap[icon]) {
    contents += `| { name: '${icon}', size: ${size} }\n`
  }
}

fs.writeFileSync('./icons/index.ts', contents)
```

## Create the SVG sprite

Create the SVG sprite. It's a combination of all the SVGs. In the future we might consider
splitting this up if the file gets too large.

```sh
svg-sprite --symbol --symbol-dest=icons --symbol-sprite=sprite.svg icons/*.svg
```
