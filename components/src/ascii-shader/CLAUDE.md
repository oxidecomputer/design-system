# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm install
npm run build          # tsc -p tsconfig.build.json → dist/
npm run examples       # build and server examples
npm run check          # typecheck only (tsc --noEmit)
npm test               # run all tests (vitest)
npx vitest run tests/clock.test.ts   # run a single test file
npm run lint           # oxlint --type-aware
npm run fmt            # oxfmt (fmt:check to verify)
```

## What this is

An ASCII animation engine: a user-supplied "program" runs once per grid cell per frame, like a fragment shader over characters. Derived from play.core, merging two internal Oxide forks (mitos's engine/canvas renderer + the oxide.computer website's DOM text renderer) with the playback loop rewritten. Zero runtime dependencies; React is an optional peer dep for `@oxide/ascii-shader/react`.

## Architecture

- `src/animation.ts` — the core. `createAnimation(program, settings, userData?)` owns a single cancellable rAF loop, the frame clock, the cell buffer, pointer events, and a small event emitter (`boot`/`frame`/`play`/`pause`/`ended`). Everything else is a leaf module it composes: `clock.ts` (frame advance/clamp), `fps.ts`, `metrics.ts` (font measurement + `waitForFonts`), `color.ts`, `buffer-text.ts` (plain-text/colored-row export).
- `src/renderers/` — `text.ts` renders into a `<pre>` (row-diffed against a back-buffer, same-styled runs coalesced into spans, HTML-escaped); `canvas.ts` renders on a Display P3 context and resolves CSS-variable colors. The renderer is inferred from the element (`<pre>` → text, `<canvas>` → canvas) or supplied as a custom `{ render(context, buffer) }`.
- `src/react.tsx` — `AsciiAnimation` wrapper: IntersectionObserver-gated playback, `prefers-reduced-motion` → `settings.reducedMotion`, a spacer `<pre>` to avoid boot-time layout shift. Grid/fps prop changes go through `updateSettings` without re-booting; only a `program` change recreates the animation.
- Programs are module-level singletons — per-instance state belongs in `userData` (passed to every hook), not module-scope variables. Settings precedence: defaults < run settings < `program.settings`.

## Playback audit — differences from the source forks

These are deliberate changes from play.core and the two forks. Don't regress them:

- **Single owned rAF chain.** The old engines called
  `requestAnimationFrame(loop)` from `togglePlay`/`setFrame` without tracking
  a handle, so repeated calls stacked concurrent loop chains over one buffer.
  The loop schedules through one cancellable handle — never call
  `requestAnimationFrame` from playback-control methods.
- **`play()`/`pause()` instead of `togglePlay(bool)`** — and pause is a real
  state, not the website fork's trick of mutating `settings.once`.
- **Paused seeks always render.** `setFrame` used to go through the fps gate,
  which silently dropped scrubs faster than 1/fps while paused. `seek` sets a
  `needsRender` flag that bypasses the gate (and never advances the frame).
- **`updateSettings({ fps })` works.** The frame interval was previously
  computed once at init; the app worked around it by destroying and
  recreating the whole controller. It's recomputed on every patch, and
  `undefined` values in a patch are ignored so partial patches are safe.
- **`'frame'` fires only on actual renders.** `onFrameUpdate` used to fire
  every loop iteration, including paused no-ops, driving redundant React
  state updates. Events are a small emitter
  (`boot`/`frame`/`play`/`pause`/`ended`) instead of a settings callback.
- **`context.time` is pause-aware** accumulated play time (with a 1s cap per
  tick so a backgrounded tab doesn't jump). It was previously the raw rAF
  timestamp, which leapt after any pause. It accumulates only the beat time a
  tick consumed (`elapsed - elapsed % interval`) — the remainder stays in
  `lastTick` for the next tick, and counting it in `playTime` too made time
  run up to ~1.5× fast on off-beat rAF ticks. Absent capped gaps,
  `time === frame × interval`.
- **Non-looping playback ends cleanly**: with `loop: false` the animation
  stops on the last frame and emits `'ended'` (upstream could only wrap).
- **`boot` gets a sized buffer** and the first frame draws synchronously at
  boot, so paused/`autoplay: false` mounts still show frame 0.
- **`dispose()` actually cleans up**: cancels the pending rAF, removes the
  pointer listeners (the website fork leaked them), and clears the renderer's
  DOM.
- **Layout reads only when needed**: the per-frame `getBoundingClientRect()`
  is skipped when `cols`/`rows` are pinned, and the canvas bitmap is not
  reallocated every frame.
- **Kept from mitos**: `renderFrame(n)` synchronous export rendering, frame
  increment _after_ render (frame 0 renders first), `maxFrames`→`frames`
  wrap-around, buffer sanity clamps, the Display P3 canvas context + CSS-var
  color resolution, and the Safari `fonts.ready` + 3×rAF boot workaround
  (mitos's hex→display-p3 promotion of sRGB colors was dropped — authors write
  `oklch()`/`color(display-p3 …)` directly when they want wide gamut).
- **Kept from the website fork**: the row-diffing text renderer, now with
  HTML-escaping of `& < >` (previously those characters corrupted a row's
  markup) and native CSS-variable pass-through.
- Dead settings from both forks (`allowSelect`, `restoreState`,
  `renderer: string` on a single-renderer build, unused `cycle`) were dropped;
  `reducedMotion` stays because programs branch on it.

## Licensing

Dual-licensed: MPL-2.0 generally, but files derived from play.core (`animation.ts`, `metrics.ts`, `fps.ts`, `renderers/text.ts`) stay under Apache-2.0 (Copyright ertdfgcvb). Keep the existing per-file license headers intact and use the matching header in any new file split out from those modules.
