# dual-grid

A Figma plugin that generates aligned column and cell grids, an ASCII grid, and type
specimens. It has its own `package.json` and `node_modules`, independent of the
design-system root package. Run npm commands from this directory.

The grid math (`computeGrid`, the solver, the cell ladder, `gridLineSegments`) lives in
`components/src/grid/index.ts` at the repo root, published as
`@oxide/design-system/grid` and tested by the root `test/grid.test.ts` vitest suite.
`src/main.ts` imports it by relative path and Vite bundles it into `dist/main.js`, so
the built plugin stays self-contained. Keep that module dependency-free, free of Figma
types, and within ES2018 syntax. `src/main.ts` adapts stored `Params` to the module's
`GridSpec` via `gridSpecOf` and keeps everything Figma-specific (layer creation, font
probing, `buildLayoutGrids`).

## Build

```sh
cd plugins/dual-grid
npm install
npm run build         # tsc --noEmit typecheck, then vite bundle → dist/main.js
npm run dev           # nodemon: rebuild on .ts change
```

Load in Figma via **Plugins → Development → Import plugin from manifest…**. `dist/` is
gitignored, so a fresh clone must be built before Figma can run it.

## Structure

`manifest.json` points at `dist/main.js` (the sandbox) and `ui.html` (the iframe panel). The
plugin and panel communicate through `postMessage`:

- **UI → plugin**: `parent.postMessage({ pluginMessage: {...} }, '*')`
- **plugin → UI**: `figma.ui.postMessage({...})`, received as `event.data.pluginMessage`

`ui.html` contains inline CSS and JS, with no bundler or dependencies. Don't add a build
step for it. The iframe is sandboxed without an origin, so accessing `window.localStorage`
throws. Keep its shim at the start of `<head>`.

`vite.config.ts` targets `es2018`: Figma's plugin engine rejects optional catch binding
(`catch {}`) and other newer syntax. Don't raise it.

## Figma API constraints

- Set `themeColors: true` in `figma.showUI`. Without it Figma never injects the
  `--figma-color-*` variables and the panel renders in its light fallback even in dark mode.
- `LayoutGrid` requires `gutterSize` on every entry, including `ROWS`. Omitting it throws a
  validation error naming the array index.
- `node.visible` must be a boolean. Coerce stored flags before assigning them; older
  `pluginData` may have missing values.
- Keep the initial `sendActionState()` at the end of `src/main.ts`. It depends on constants
  declared earlier in the file; calling it before they are initialised throws
  `Cannot access 'X' before initialization`.
- Figma exposes no baseline metric. Measure `absoluteRenderBounds` (the tight ink box) on a
  flat-footed capital such as `H` and use its bottom edge as the baseline.
- Fractional `fontSize` and `lineHeight` are supported. Call `loadFontAsync` before setting
  a text node's `characters` or `fontName`.

## Conventions

- Formatting follows the design-system root Prettier config (no semicolons, single quotes,
  printWidth 92); `npm run fmt` at the repo root covers this directory.
- Comments should explain non-obvious choices, including the reasons for constants.
- Fonts: GT America Mono / Regular OCC and Suisse Int'l / Regular. Resolve through a
  preference list with fallbacks, since neither is guaranteed to be installed.

## Testing

About 650 plugin and 150 panel assertions. The tests are plain Node scripts that print
`PASS`/`FAIL` and exit non-zero on failure.

```sh
npm test              # build, then both suites
npm run test:plugin   # test/plugin.test.mjs: grid maths and generated layers
npm run test:ui       # test/ui.test.mjs: the panel
```

`npm test` builds first, because the plugin suite runs the built bundle, not the TypeScript.
Editing `src/` and running `test:plugin` alone tests the old code.

1. Plugin logic: runs `dist/main.js` inside `vm.createContext()` against a mock `figma`
   object (`createText`, `createFrame`, `createVector`, `loadFontAsync`, `getNodeByIdAsync`,
   plus `absoluteBoundingBox` / `absoluteRenderBounds` getters modelling real font metrics).
   It drives the captured `figma.ui.onmessage` handler and asserts on the nodes produced and
   the `action-state` posted back. Several suites calculate expected results with an
   independent brute-force search to check the solver and its weighting.
2. Panel: loads `ui.html` in `jsdom` with `runScripts: 'dangerously'`, stubs
   `ResizeObserver` and `getBoundingClientRect` (jsdom has no layout), and captures
   `parent.postMessage`.

When adding a parameter, update `Params` and `DEFAULT_PARAMS` in `main.ts`, `PARAM_DEFAULTS`
/ `GRID_PARAM_IDS` / `getPanelParams` / `setPanelParams` in `ui.html`, and the `P` object
plus the control-count assertions in the tests.

Test limitations and checks:

- Check the exit code and final `ALL PASS` summary. A suite can crash after printing passes
  without reaching the remaining checks.
- Synthetic events bypass hit-testing. jsdom can toggle a checkbox even when CSS makes it
  unclickable. Verify interactive elements in Chrome with `document.elementFromPoint` at the
  control's centre.
- jsdom has no layout engine, and headless Chrome ignores `--window-size` for the layout
  viewport. Set the width in CSS (`html,body{width:280px}`) before taking screenshots to
  avoid mistaking a cropped layout for overflow.
- When testing with a mutation, check the diff to confirm it applied before interpreting the
  test result.

Headless Chrome
(`/Applications/Google Chrome.app/.../Google Chrome --headless --screenshot`) with the
`--figma-color-*` variables injected can be used to inspect the panel.

## Invariants

See `README.md` for the derivation and examples.

- `N = 2m + ck + (c−1)g`, `u = W / N`. Margin, column and gutter widths are whole numbers of
  cells summing to `N·u = W`, so every edge lands on a cell line. Keep these values in
  cells; arbitrary pixel values break alignment.
- Choose cell density through `Cell columns`, not by minimising aspect error. Report the
  resulting aspect ratio. With Pixel snap on, allow deviation up to `Aspect tol.` (%) to
  find an integer row height.
- The solver and `computeGrid` must both use `snapUnit` to snap `u`. Optimise the measured
  margin, `m·u + (W − N·u)/2`, to account for centring. Weights are columns 16×, gutter 8×,
  margin 1×. Column count takes priority because `N` sets the cell size and only certain
  values of `N` permit an exact gutter match.
- Generated layers extend to the frame edge and clip; the layer container sets
  `clipsContent` so this holds regardless of the target frame.
- Every generated layer is found by ID from `pluginData` and updated in place. Per-frame
  state also caches the font probes, so reapplying creates no temp nodes.
- `ui.html` implements the `<fig-*>` controls as custom elements. The switch's checkbox must
  cover the whole control or clicks hit an inert `<span>`. `emit()` must call
  `stopPropagation()` on the inner native event to prevent duplicate handler calls.
