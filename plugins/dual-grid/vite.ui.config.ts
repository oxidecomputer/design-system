import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Bundles FigUI3 for the panel. Figma loads the panel from a single HTML file,
// so scripts/inline-ui.mjs then writes this script and stylesheet into it.
export default defineConfig({
  build: {
    outDir: 'dist/ui',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, 'src/ui/figui3.js'),
      name: 'FigUI3',
      formats: ['iife'],
      fileName: () => 'figui3.js',
      cssFileName: 'figui3',
    },
  },
})
