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

## Generate component wrappers

Given that all our projects use react its helpful to still be able to import the icons like
normal components. This section generates small wrappers for every component that simply
injects the contents of the svg inside a span.

First let's create a
[barrel export file](https://blog.logrocket.com/using-barrel-exports-organize-react-components/)
to make importing easier.

```sh
touch ./icons/index.ts
```

Next let's generate the wrappers

```js
// icons is re-used from the section above
for (let icon of icons) {
  // Turns ./icons/access-16.svg into access-16
  const iconFileName = icon.split('/').reverse()[0].replace('.svg', '')

  // Turns access-16 into Access16
  const iconComponentName = iconFileName
    .match(/[A-Za-z0-9]+/g)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')

  // The actual component text
  const componentWrapper = `
    import icon from './${iconFileName}.svg'
    export const ${iconComponentName} = () =>
      <span
        className="ox-icon"
        dangerouslySetInnerHTML={{__html: icon}}
      />
  `

  await fs.writeFile(icon.replace('.svg', '.tsx'), componentWrapper)
  await fs.appendFile(
    './icons/index.ts',
    `export { ${iconComponentName} } from './${iconFileName}'\n`,
  )
}
```

## Format the output

```sh
npm run fmt .
```
