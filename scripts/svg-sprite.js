const fs = require('fs')
const path = require('path')
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
