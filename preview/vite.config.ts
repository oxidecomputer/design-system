import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const projectRoot = path.resolve(import.meta.dirname, '..')

export default defineConfig({
  root: import.meta.dirname,
  plugins: [tailwindcss(), react(), tsconfigPaths({ root: projectRoot })],
})
