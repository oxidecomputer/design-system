# Token Sync

Figma plugin that synchronizes design tokens between CSS files and Figma variables/text styles.

## How it works

The plugin fetches CSS files from a GitHub branch and compares them against Figma's local variables and text styles, showing a diff UI where you can review and apply changes.

### CSS file structure

Tokens are split across three files in `styles/`:

| File | Contents | Figma collection | Mode |
|------|----------|-------------------|------|
| `main.css` | Base palette (colors, theme mappings, radius) + typography | `colors`, `core`, `global` | Collection name |
| `dark.css` | Semantic tokens (surface, content, stroke) | `main` | Dark |
| `light.css` | Semantic tokens (light overrides) | `main` | Light |

### Name mapping

CSS custom properties are converted to Figma variable paths:

- `--color-neutral-200` &rarr; `base/neutral/200`
- `--theme-accent-800` &rarr; `theme/accent/800`
- `--surface-accent-alt-hover` &rarr; `surface/accent-alt/hover`
- `--radius-sm` &rarr; `border-radius/sm`

### Alias resolution

`var()` references are preserved as Figma variable aliases. When applying, tokens are sorted by dependency depth so referenced variables exist before the tokens that alias them.

## Development

```
npm install
npm run dev     # Start dev server with hot reload
npm run build   # Production build
```

Built with [Plugma](https://github.com/gavinmcfarland/plugma), Vite, React, and TypeScript.
