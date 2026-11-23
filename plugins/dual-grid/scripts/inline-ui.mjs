// Writes dist/ui.html: ui.html with the bundled FigUI3 stylesheet and script
// (from vite.ui.config.ts) inlined at its <!-- figui3 --> marker. Figma loads the
// panel from this one file, so it can't reference anything beside it.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')

const html = read('ui.html')
const MARKER = '<!-- figui3 -->'
if (html.split(MARKER).length !== 2) {
  throw new Error(`ui.html needs exactly one ${MARKER} marker`)
}
// A literal "</script>" or "</style>" inside the bundle would close the tag early.
const css = read('dist/ui/figui3.css').replace(/<\/style/gi, '<\\/style')
const js = read('dist/ui/figui3.js').replace(/<\/script/gi, '<\\/script')
const out = html.replace(
  MARKER,
  () => `<style>\n${css}\n</style>\n<script>\n${js}\n</script>`,
)
// Written beside the panel and renamed over it, so Figma's hot reload never
// reads a half-written file.
const target = path.join(root, 'dist/ui.html')
fs.writeFileSync(target + '.tmp', out)
fs.renameSync(target + '.tmp', target)
console.log(`dist/ui.html ${(out.length / 1024).toFixed(0)} kB`)
