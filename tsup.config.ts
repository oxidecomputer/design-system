import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['components/src/index.ts'],
  outDir: 'components/dist',
  external: ['react/jsx-runtime'],
  splitting: false,
  sourcemap: true,
  clean: true,
})
