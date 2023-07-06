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
const icons = await glob('./icons/*.svg')
for (let icon of icons) {
  await $`cat ${icon}`
    .then((i) => i.stdout.replace(/fill="[^"]*"/g, 'fill="currentColor"'))
    .then((r) => fs.writeFile(icon, r))
}
```

## Create the icons type file

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

let contents = 'export type Icon = \n'

for (let icon in iconMap) {
  for (let size of iconMap[icon]) {
    contents += `| { name: '${icon}', size: ${size} }\n`
  }
}

fs.writeFileSync('./icons/index.ts', contents)
```

## Create the SVG sprite

```sh
svg-sprite --symbol --symbol-dest=icons --symbol-sprite=sprite.svg icons/*.svg
```

```js
const SVGSpriter = require('svg-sprite')

// Create spriter instance (see below for `config` examples)
const spriter = new SVGSpriter({
  mode: {
    symbol: true,
  },
})

// Define the folder path that contains your SVGs
const svgFolderPath = 'icons'

// Use fs.readdirSync to get an array of filenames in the folder
const svgFiles = fs.readdirSync(svgFolderPath)

// Loop through each file and add it to the spriter
for (const svgFile of svgFiles) {
  // Ensure that we only process SVG files
  if (path.extname(svgFile) === '.svg') {
    const svgPath = path.join(svgFolderPath, svgFile)
    const svg = fs.readFileSync(svgPath, 'utf-8')
    spriter.add(svgPath, null, svg)
  }
}

// Compile the sprite
spriter.compile((error, result) => {
  if (error) {
    console.error('Compilation error:', error)
    return
  }

  const moduleContents = `export default \`${result.symbol.sprite.contents.toString()}\`;`

  fs.writeFileSync(path.join(svgFolderPath, 'sprite.ts'), moduleContents)
})
```
