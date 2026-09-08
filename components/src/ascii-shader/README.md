# ascii-shader

ASCII animation engine: a program runs once per grid cell per frame, like a
fragment shader over characters. Derived from
[play.core](https://github.com/ertdfgcvb/play.core) by Andreas Gysin, merging
two internal forks:

- the **engine and canvas renderer** from [mitos](https://github.com/oxidecomputer/mitos)
  (Display P3, CSS-variable colors, deterministic frame export), with the
  playback loop rewritten, and
- the **DOM text renderer** from the oxide.computer website fork
  (row-diffed, span-run-coalesced, real selectable text).

Zero runtime dependencies. React is an optional peer dependency for the
`@oxide/ascii-shader/react` wrapper.

## Quick start

```ts
import { createAnimation } from '@oxide/ascii-shader'

// A program is a plain object (usually an imported module).
const program = {
  settings: { cols: 60, rows: 16, fps: 24, frames: 120 },
  main({ x, y }, context) {
    const ramp = ' .:-=+*#%@'
    const t = context.frame / 120
    const v = Math.sin(x * 0.3 + t * Math.PI * 2) * 0.5 + 0.5
    return ramp[Math.floor(v * (ramp.length - 1))]
  },
}

const animation = createAnimation(program, {
  element: document.querySelector('pre')!, // <pre> → text renderer, <canvas> → canvas renderer
})

animation.pause()
animation.seek(42) // works while paused
animation.play()
```

## Program model

A program exports any of:

| Function                                    | Runs                           | Signature                                                    |
| ------------------------------------------- | ------------------------------ | ------------------------------------------------------------ |
| `boot`                                      | once, after fonts load         | `(context, buffer, userData)`                                |
| `pre`                                       | every frame, before `main`     | `(context, cursor, buffer, userData)`                        |
| `main`                                      | every frame, once **per cell** | `(pos, context, cursor, buffer, userData) => Cell \| string` |
| `post`                                      | every frame, after `main`      | `(context, cursor, buffer, userData)`                        |
| `pointerMove` / `pointerDown` / `pointerUp` | on pointer events              | `(context, cursor, buffer, userData)`                        |
| `cleanup`                                   | on `dispose()`                 | `()`                                                         |

`main` returns a string (the character) or a `Cell`
(`{ char, color?, backgroundColor?, fontWeight? }`), merged into the existing
cell. `context` is a frozen per-frame snapshot:
`{ frame, time, cols, rows, metrics, width, height, settings, runtime: { fps } }`.

**Animate with `context.frame`, not `context.time`** — the frame counter
advances once per rendered frame and never while paused, so playback is
deterministic and scrubbable. `context.time` is accumulated play time in ms
and also stops while paused.

Programs are module-level singletons: keep per-instance state in `userData`
(the third argument to `createAnimation`, passed to every hook) rather than in
module-scope `let`s if the same program can mount twice.

Settings precedence is `defaults < runSettings < program.settings` — a
program's exported `settings` pins its grid/fps; the host can still override
at runtime via `updateSettings` (e.g. a smaller mobile grid).

## API

`createAnimation(program, settings, userData?)` returns:

| Member                                                      | Notes                                                                                                                            |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `play()` / `pause()` / `toggle(force?)`                     | Explicit playback control. Idempotent.                                                                                           |
| `seek(frame)` / `step(delta = 1)`                           | Jump/scrub. Renders even while paused; wraps into `[0, frames)`.                                                                 |
| `renderFrame(frame)`                                        | Synchronous render, no rAF — read `getBuffer()` right after. For export/snapshotting.                                            |
| `playing` / `frame`                                         | Current state (getters).                                                                                                         |
| `ready`                                                     | `Promise<void>`, resolves after fonts + `boot`.                                                                                  |
| `on(event, handler)`                                        | `'boot' \| 'frame' \| 'play' \| 'pause' \| 'ended'`; returns unsubscribe. `'frame'` fires per rendered frame, not per loop tick. |
| `updateSettings(patch)`                                     | Live-patch `fps`, `frames`, `loop`, `cols`, `rows`, colors… `undefined` values are ignored; takes effect immediately.            |
| `getBuffer()` / `getMetrics()` / `getSettings()` / `text()` | Introspection.                                                                                                                   |
| `dispose()`                                                 | Cancels the loop, removes pointer listeners, releases the renderer.                                                              |

Key settings: `element` (required), `cols`/`rows` (omit to derive from element
size), `fps` (default 30), `frames` (loop length; omit for endless), `loop`
(default true; false pauses on the last frame and emits `'ended'`), `autoplay`
(default true), `renderer` (`'text' | 'canvas'` or a custom
`{ render(context, buffer) }`, default inferred from the element), `color`,
`backgroundColor`, `fontWeight`, and canvas-only `padding` and `supersample`.

## Renderers

**Text** (`<pre>`): one block `<span>` per row; rows unchanged since the last
frame are skipped via a back-buffer diff, same-styled runs coalesce into one
span, and default-styled runs emit bare spans. Output is real selectable text
that inherits font and sizing from CSS (size with container queries). Colors
are emitted as-is — use `oklch()` or `color(display-p3 …)` directly for
wide-gamut colors; CSS variables (`'--accent'`) pass through natively.

**Canvas** (`<canvas>`): renders on a Display P3 context when available,
resolves CSS-variable colors to concrete values (canvas can't dereference
them), supports per-cell `color`/`backgroundColor`/`fontWeight`, and
reallocates the backing store only when the grid or scale changes. Set
`supersample` above 1 if the canvas will be zoomed.

Export helpers: `getContent(buffer, cols, rows)` for plain text and
`getColoredRows(buffer, cols, rows, defaultColor)` for per-row color runs
(SVG export).

## React

```tsx
import { AsciiAnimation } from '@oxide/ascii-shader/react'
import * as program from './programs/wave'
;<AsciiAnimation
  program={program}
  alt="ASCII wave animation"
  className="my-animation"
  cols={isSmall ? 72 : 144}
  rows={24}
/>
```

The wrapper plays only while visible (IntersectionObserver; tune with
`playOnVisible` / `visibleThreshold`) and tracks `prefers-reduced-motion`
into `settings.reducedMotion` for programs to branch on. An invisible spacer
`<pre>` reserves the final layout so the font-loading boot delay causes no
layout shift, and `onReady` exposes the controller for seek/export. Grid/fps
prop changes apply via `updateSettings` without re-booting the program; only
a `program` change recreates the animation.

## Development

```sh
npm install
npm run build   # tsc → dist/
npm test        # unit tests for the pure modules (vitest)
npm run lint    # oxlint (type-aware)
npm run fmt     # oxfmt
```

`examples/index.html` exercises both renderers and the playback API — build,
then serve the repo root.

## License

MPL-2.0, except files derived from play.core (`animation.ts`, `metrics.ts`,
`fps.ts`, `renderers/text.ts`), which remain under the Apache License 2.0 —
Copyright ertdfgcvb (Andreas Gysin).
