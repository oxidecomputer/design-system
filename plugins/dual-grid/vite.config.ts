import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    // Figma's plugin engine rejects optional catch binding (`catch {}`, ES2019)
    // and other newer syntax. Target ES2018 so esbuild always down-levels it.
    target: 'es2018',
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'DualGrid',
      formats: ['es'],
      fileName: () => 'main.js',
    },
  },
})
