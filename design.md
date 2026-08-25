# Oxide Design System

> The styles, tokens, themes, and base components shared across Oxide's web
> surfaces. Published as `@oxide/design-system`.

```yaml
system:
  name: Oxide Design System
  package: "@oxide/design-system"
  default_theme: dark        # :root is dark; light is opt-in via [data-theme="light"]
  color_space: oklch         # every color is authored in OKLCH
  framework: tailwind v4     # tokens are exposed as @theme + @utility, consumed as classes

typography:
  sans: "SuisseIntl, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif"
  mono: "'GT America Mono', monospace"   # uppercase, used for UI chrome & labels
  scale_px: [11, 12, 14, 16, 18, 20, 22, 25, 28, 36, 50, 52, 65]
  weights: [400 regular, 500 semi]
  tracking: optical          # letter-spacing ∝ 1/size; small opens up, display tightens

color_scales:                # OKLCH, perceptually even
  neutral: [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300]
  hue: [blue, purple, red, yellow, green]   # steps 200–1300
  # step encodes lightness: 0 = darkest, 1300 = lightest

semantic_intents:            # mapped per theme onto the scales above
  accent: green              # the brand accent; themeable (see "Accent Theming")
  accent-alt: purple
  success: green
  error: red
  destructive: red
  notice: yellow
  info: blue

token_layers:                # the three families you compose UI from
  surface: bg-*              # backgrounds & fills
  content: text-*            # text & foreground
  stroke:  border-* / ring-* / outline-*   # 1px lines

radius_px: { sm: 1, md: 2, lg: 4, xl: 6, full: 9999 }

shadows: [border, border-small, border-medium, border-large, menu, menu-inset, toast, modal, tooltip]

breakpoints_px: [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1600]

components: [Button, Badge, Checkbox, Listbox, Spinner, Tabs]
asciidoc:  [Section, Admonition, Table, TableOfContents]   # long-form content rendering
icons: { react: "@oxide/design-system/icons/react", sprite: "@oxide/design-system/icons" }
```

---

## Overview

Oxide builds hardware and the software that runs on it. The design system is
**dense, precise, and technical** to match.

The brand combines two elements: a modernist **Swiss Style** (type, color,
composition) for structure, and a low-level **ASCII "machine language" texture** as
the expressive layer.

- **Dark-first.** Default theme is dark; light is an explicit opt-in.
- **Monospace.** UI chrome — labels, badges, buttons, table headers, nav — is
  uppercase `GT America Mono`; prose and headings are `SuisseIntl`. The contrast is
  the system's signature.
- **Tight geometry.** Radii top out at 6px. Edges are crisp; surfaces separate by
  hairline strokes plus soft ambient shadow, never heavy fills.
- **Visible grids.** Let the underlying structure show — an ASCII character grid, the
  alignment of a server room. See [ASCII](#ascii).
- **OKLCH throughout.** Colors are authored in OKLCH so scales are perceptually even
  and lightness is predictable across hues.
- **Semantic, not literal.** Name a *role* (`bg-raise`, `text-secondary`,
  `border-error`), not a color; the theme resolves it.

Ships as CSS (Tailwind v4 `@theme`/`@utility`) plus a small set of React components.
Most UI composes the semantic utility classes directly; components cover the
interactions that are hard to get right by hand.

---

## Colors

The palette is **neutral-first with saturated accents**, drawn from (in-part) the monochrome
phosphors of early CRTs. Green is the primary accent; yellow, blue, purple, and red
carry information and state. Neither canvas goes to pure black or white — both pull a
step inward (`neutral-0`, `neutral-1300`) to avoid clipping contrast.

### Scales

OKLCH scales. The **neutral** scale runs fifteen steps (`0, 50, 100, 200 … 1300`);
the five **hue** scales — `blue`, `purple`, `red`, `yellow`, `green` — run `200` to
`1300`. The step encodes lightness: **`0` darkest, `1300` lightest**, regardless of
hue. Because steps are spaced in OKLCH, the same step reads as the same perceived
lightness across hues.

<!-- @generated colors:examples (run: npm run design-md) -->
```css
--color-neutral-0:    oklch(0.162 0.01 260);    /* dark: surface-default · light: content-raise */
--color-neutral-300:  oklch(0.316 0.006 260);   /* dark: surface-tertiary, stroke-default · light: content-default */
--color-neutral-800:  oklch(0.79 0.0011 260);   /* dark: content-default · light: content-quaternary, stroke-raise */
--color-neutral-1300: oklch(0.995 0.0001 260);  /* light: surface-default */
--color-green-800:    oklch(0.77 0.1919 163.7); /* the default accent anchor */
--color-red-800:      oklch(0.712 0.185 11.3);  /* error / destructive anchor */
--color-yellow-800:   oklch(0.837 0.14 75);     /* notice anchor */
--color-blue-800:     oklch(0.71 0.15 272);     /* info anchor */
```
<!-- /@generated -->

Raw scale colors are available as Tailwind classes (`bg-green-800`, `text-red-200`),
but reach for them **only inside the design system** or for rare decoration. Product
code uses semantic tokens.

`800` is the canonical highlight for each accent, mid-scale. Dark themes use mostly
`800` and below, light `800` and above.

### Semantic intents

Each scale maps to **intents** that carry meaning — stable names that hold across
themes:

| Intent        | Meaning                              | Mapped scale |
| ------------- | ------------------------------------ | ------------ |
| `accent`      | brand, primary actions, selection    | green*       |
| `accent-alt`  | secondary accent / decorative        | purple       |
| `success`     | confirmation, healthy state          | green        |
| `error`       | validation failure                   | red          |
| `destructive` | dangerous actions (delete)           | red          |
| `notice`      | warnings, attention                  | yellow       |
| `info`        | neutral informational state          | blue         |

\* `accent` is themeable — see [Accent Theming](#accent-theming).

### The three token layers

All product UI is painted from three families of semantic tokens. Each resolves to
the right scale step for the active theme, so the *same class works in light and
dark*.

**`surface` → backgrounds** (`bg-*`)
```
bg-default      page / base canvas
bg-raise        raised panels, cards, popovers (one step toward the viewer)
bg-secondary    inset / secondary panels
bg-tertiary     deepest inset
bg-hover        interactive hover fill
bg-disabled     disabled fill
bg-accent       accent fill (selected, primary button)
bg-accent-hover / bg-accent-secondary
bg-destructive / bg-error / bg-notice / bg-info  (+ -hover, -secondary, -inverse)
bg-scrim        modal backdrop
```

**`content` → text & foreground** (`text-*`)
```
text-raise        highest-contrast text (headings, emphasis)
text-default      body text
text-secondary    supporting text
text-tertiary     hints, metadata
text-quaternary   faintest (placeholder-level)
text-disabled     disabled text
text-accent       accent text & icons    (+ -secondary, -tertiary, -disabled)
text-error / text-success / text-notice / text-info   (+ tiers)
text-inverse      text on inverse surfaces
```

**`stroke` → 1px lines** (`border-*`, `ring-*`, `outline-*`)
```
border-default     standard hairline
border-raise       stroke on raised surfaces
border-secondary   quieter divider
border-tertiary    faintest divider
border-accent      accent outline (focus, selection)   (+ -secondary … -quaternary)
border-error / border-success / border-notice / border-info   (+ tiers)
```

Each `stroke` token exists identically as `border-`, `ring-`, and `outline-`, so
focus rings and borders stay in sync.

> **Hierarchy through tier, not opacity.** Step through `default → secondary →
> tertiary → quaternary` for hierarchy. Don't fake it with `/50` opacity on a solid
> token — the tiers are tuned per theme; opacity isn't.

### Accent Theming

The default accent is **green**. Re-accent any subtree with a theme class —
`blue-theme`, `red-theme`, `yellow-theme`, `purple-theme`, `green-theme` — which
remaps `--theme-accent-*` onto that hue. Everything painted with `accent` tokens
(`bg-accent`, `text-accent`, `border-accent`, focus rings) follows automatically.

```html
<!-- An info-flavored region: accent tokens now resolve to blue -->
<section class="blue-theme">
  <span class="text-accent">Linked</span>
  <div class="border-accent-secondary">…</div>
</section>
```

This is how status surfaces are built — an error toast wraps its content in
`red-theme`, a warning in `yellow-theme` — so one set of `accent` classes renders in
the right semantic color.

### Colorways

Compositions hold to one of two structures, both on a dark neutral base with white
hero text:

- **Mono** — base + one hue.
- **Duo** — base + two hues.

Hierarchy *within* a colorway comes from tonal steps of one hue (`green-800` beside
`green-600` with white), not from adding hues. Add color deliberately; fewer hues
read as more precise.

**The accent is rationed.** Aim for one, maybe two accent objects on a screen. Use
`accent` only when it *means* something (the primary action, focus, a healthy or
active state, a link), never decoration; used everywhere, it signals nothing. The
other hues are stricter — `notice`, `error`, `info`, and `accent-alt` appear only for
their semantic role. And there are **no gradients** anywhere except the modal scrim:
flat fills only.

### Accessibility

Targets **WCAG 2.1 AA** minimum. Since neither canvas is pure black or white, check
contrast against the *actual* surface token, not `#000`/`#fff`. The content tiers
(`text-default → secondary → tertiary → quaternary`) stay legible on their intended
surfaces — go below `tertiary` only for non-essential text. The palette is OKLCH, so
lean on a perceptual model (**APCA**) alongside the WCAG 2 ratio; it better predicts
reading on mid-tone surfaces.

- **Never carry meaning in color alone.** A state that says "error" only by being red
  disappears for a color-blind user. Pair the hue with a second cue — a label, icon,
  or shape. A status `Badge` reads *Failed*; it doesn't just turn red.
- **Match `color-scheme` to the theme.** Set `color-scheme: dark` on root (`light`
  under `[data-theme="light"]`) so native controls, scrollbars, and form widgets
  follow, and point `<meta name="theme-color">` at the canvas token so browser chrome
  blends into the page.

---

## Typography

Two typefaces with a clear division of labor:

- **`SuisseIntl`** (`--font-sans`) — prose, headings, form values, anything read as
  language.
- **`GT America Mono`** (`--font-mono`) — UI chrome: labels, badges, buttons, table
  headers, nav, timestamps. **Uppercase**, with stylistic sets (`ss02/03/06/07/08/09`)
  on and contextual alternates off; tracking opens ~4%. Lowercase mono is the
  exception, only where casing carries meaning (code).

Following Swiss practice, **hierarchy comes from tone, not weight**. Sans is Regular
almost everywhere; emphasis steps a heading lighter (`text-raise`) against copy a few
tiers darker (`text-secondary` / `text-tertiary`) at the same size. The `500` "semi"
weight is used sparingly — UI labels, the occasional blog heading — never as the
default for emphasis.

### Optical tracking

Sans letter-spacing follows an optical curve, not a fixed value: tracking ∝ `1/size`
(in `em`, so it scales with the type). Small text **opens up** (`+0.049em` at 11px);
display **tightens** (`−0.025em` at 65px); the zero crossing sits near 24px. The type
utilities apply it — never set `letter-spacing` by hand.

### Type scale

Sans primitives are named by pixel size (`text-sans-11 … text-sans-65`). Prefer the
**semantic aliases** in product code so intent survives a scale change:

| Semantic            | Size | Use                          |
| ------------------- | ---- | ---------------------------- |
| `text-sans-sm`      | 12   | dense secondary text         |
| `text-sans-md`      | 14   | **default body**             |
| `text-sans-lg`      | 16   | lead body                    |
| `text-sans-xl`      | 18   | small headings               |
| `text-sans-2xl`     | 25   | section heading              |
| `text-sans-3xl`     | 36   | page heading                 |
| `text-sans-4xl`     | 52   | display                      |
| `text-sans-5xl`     | 65   | hero display                 |

A `500`-weight set mirrors the small sizes: `text-sans-semi-sm/md/lg/xl`.

**Responsive headings** ramp across breakpoints automatically — prefer these for page
structure:

```
heading-display   36 → 52 @800 → 65 @1000   hero / banner titles
heading-xl        25 → 36 @600 → 52 @1000   primary section <h2>
heading-lg        18 → 25 @600 → 36 @1000   secondary heading <h3>
heading-md        16 → 18 @600 → 25 @1000   subsection <h4>
```

### Mono scale

```
text-mono-xs      11px  uppercase   smallest labels, eyebrows
text-mono-sm      12px  uppercase   badges, buttons, table headers (the workhorse)
text-mono-md      14px  uppercase   larger labels
text-mono-code    12px  normal case inline & block code (alternates off, no tracking)
```

`text-mono-code` is the only mono utility **not** uppercased — for code, where casing
matters. Inline code in prose uses the `inline-code` utility (tinted background +
hairline border, sized to `0.825em` of its context).

### ASCII as type

ASCII-inspired characters double as typographic elements: list markers, dividers,
arrows, accents. A list might swap its bullets for colored terminal characters (`▸`,
`●`, `└─`); a divider might be a run of box characters. Set these in `GT America Mono`
to keep the character grid (see [ASCII](#ascii)).

---

## ASCII

ASCII is the expressive counterpart to the Swiss frame. On the web it appears as
decorative patterns, illustrative diagrams, and typographic accents — the reason the
[Visible grids](#overview) principle exists.

**Grid integrity is the one hard rule.** Each cell is exactly one monospace
character, wide and tall. Add **no** extra letter- or line-spacing — `GT America Mono`
at `0%` tracking, `110%` leading — or the art shears off its grid. Box-drawing and
block glyphs (`▁▂▃▄▅▆▇█ ▏▎▍▌▋▊▉ ╲╱ ● ○ ■ □ ▲ ▶ ▼ ◀`) rely on stylistic sets `ss06` +
`ss07`.

Patterns range from bold macro shapes to fine textural fields, from a single repeated
symbol to a varied set. In color, ASCII follows the [colorways](#colorways): structure
in the accent hue over a fainter background layer suggesting a grid or digital
surface, without competing with legibility. Keep it minimal; let the ASCII support the
content, not overpower it.

Two tools produce brand-correct output:

- **Mitos** (`mitos.shared.oxide.computer`) — Oxide's ASCII generator: control over
  character set, column density, and scale, image-to-ASCII conversion, and custom code
  for generative or animated textures. Exports SVG or pastes into Figma (`GT America
  Mono` at `0%` letter-spacing).
- **Monodraw** — a Mac ASCII editor for hand-drawn diagrams; set its preview font to
  the brand mono with the extended character set.

For terminal/system moments, ASCII can drive motion — text resolving through cycling
binary and symbols, as in lower-third title reveals.

---

## Imagery & Texture

Photography and texture stay as disciplined as the type.

- **Backgrounds are flat.** Solid black (`bg-default`) on dark, solid white on light —
  no gradient washes, no bluish-purple hero fades. The only "gradient" is the modal
  scrim.
- **Hardware, shot cool.** Brand imagery is photographic hardware — the rack, the
  sled, the boards — with a cool-to-neutral cast, never warm. No stock-photo poses,
  clouds-with-faces, or mascots.
- **ASCII is the illustration language.** Where another brand reaches for an isometric
  vector scene or a 3D blob, Oxide reaches for [ASCII](#ascii). Hand-drawn or
  "friendly" illustration is off-brand.
- **Grain, used quietly.** A subtle noise/grain may sit over hero photography, and a
  diamond-stripe motif appears on covers and avatars — texture, never loud enough to
  compete with content.

---

## Layout & Spacing

Spacing uses Tailwind's default `0.25rem` (4px) step scale (`p-2` = 8px, `gap-4` =
16px). Conventions:

- **Control height is the rhythm unit.** Controls are `h-10` (40px) at base, `h-8`
  (32px) when compact. Buttons, inputs, and listboxes share these heights so they
  align side by side.
- **Group with 8, separate with 16.** Tighten related items to `gap-2`; separate
  groups with `gap-4` or more.
- **Twelve-column grid.** Layouts are generally (not exclusively) on a 12-column grid
  — enough divisions for consistent alignment across varied content.
- **Breakpoints are pixel-named** (`300 … 1600`), used as `min-width` prefixes:
  `800:text-sans-lg`. The dense range (`300–700`) exists because product views pack a
  lot of instrumentation into narrow columns.
- **Hit targets reach 44px on touch.** Visual heights stay tight (32–40px), but touch
  needs a **44px minimum** target — extend the hit area with padding or a
  pseudo-element rather than enlarging the visible control. Gate hover affordances
  behind `@media (hover: hover) and (pointer: fine)` so a tap doesn't leave a control
  stuck in hover.
- **No layout shift.** Reserve space for anything that changes: set changing numbers
  (counters, metrics, timers) in `tabular-nums`, give async content fixed dimensions
  or a skeleton, and never swap font weight on hover or select. This is the practical
  companion to *hierarchy from tone, not weight* — see [Typography](#typography).
- **Optical over geometric.** Trust the eye: nudge a glyph, icon, or edge by ±1px when
  the math looks wrong. Align every element to *something* — nothing floats unanchored.

---

## Elevation & Depth

Depth is **a hairline border plus a soft ambient shadow**, layered — not a single drop
shadow. The border keeps edges crisp at any zoom; the shadow supplies the light. Both
have light- and dark-theme values.

```
shadow-border          1px ambient border (the base for everything else)
shadow-border-small    border + subtle lift          — buttons, inputs at rest
shadow-border-medium   border + medium lift           — raised cards
shadow-border-large    border + large lift            — prominent cards
shadow-menu            stacked shadow for dropdowns
shadow-menu-inset      menu shadow + inset outline    — overlap ring without clipping
shadow-toast           toast elevation
shadow-modal           modal elevation (largest)
shadow-tooltip         tooltip elevation (smallest)
```

There are **three elevation levels** — resting, raised, floating — expressed by the
`small` / `medium` / `large` border-shadows; `menu`, `modal`, `toast`, and `tooltip`
are tuned floating variants for specific overlays. Match the shadow to the job: a
resting control gets `shadow-border-small`, a popover `shadow-menu`, a dialog
`shadow-modal`. Don't stack a `shadow-*` on a separate `border` — the `shadow-border-*`
family already includes the line.

---

## Shapes

Radii are intentionally tight.

```
rounded-sm    1px    checkboxes, tiny chips
rounded-md    2px    default for most controls & cards (the implicit default)
rounded-lg    4px    larger cards, modals
rounded-xl    6px    the largest corner the system uses
rounded-full  pill   badges-as-pills, avatars, toggles
```

When nesting rounded elements, the inner radius should be smaller than the outer so
the curves stay concentric. Because the scale is tight, most nesting resolves to `md`
inside `lg`.

---

## Motion

Motion **explains a change, not decorates it** — what appeared, where it came from,
where it went. If an animation doesn't clarify cause and effect, leave it out.

- **Honor `prefers-reduced-motion`.** Where necessary add reduced variants also. E.g. the
  `Spinner` slows its rotation and drops the dash animation.
- **Animate compositor-friendly properties** — `transform` and `opacity`. Avoid layout
  (`width`, `top`, `height`) and `transition: all`.
- **Match easing to the motion.** `ease-out` for anything **entering or leaving**
  (dropdowns, modals, toasts) — the fast start reads as instant. `ease-in-out` for
  elements **already on screen** that reposition or morph. Plain `ease` for **hover and
  color**. Avoid `ease-in` (the slow start feels sluggish); reserve `linear` for
  constant motion (marquees, hold-to-confirm progress).
- **Keep it short; scale with size and frequency.** UI transitions run **150–300ms**;
  let an exit run quicker than its entrance, and give larger moves a longer
  curve (the TOC accordion uses ~300ms `cubic-bezier(0.87, 0, 0.13, 1)`). **The more
  often a control is used, the less it should animate** — something hit dozens of times
  a day should feel instant. A quick `scale(0.97)` on `:active` is the exception:
  tactile feedback with no duration to wait through.
- **Animate from near, not nothing.** Enter from `scale(0.95)` and a few pixels of
  offset, not `scale(0)` or a long slide — elements should settle in, not fly in.
  Elements that move as a unit (modal + scrim, tooltip + arrow) share one easing and
  duration.
- **Make motion interruptible.** State-driven transitions reverse cleanly if the user
  changes their mind mid-animation; never trap input behind an animation.
- **`transform-origin` matters.** Scale/reveal animations originate from the element's
  anchor (the trigger it expanded from), not its center.
- **Skeletons for content, spinners for actions.** A skeleton that mirrors the final
  layout beats a spinner for loading regions — it holds the space and avoids a shift on
  arrival. Reserve the `Spinner` for button-load states and small inline waits. No
  spring physics, no bounce, no scroll-jacked choreography; the vocabulary is short
  fades and small translates.

---

## Interaction States

Feedback is quiet — a control acknowledges you without restyling itself.

- **Hover** shifts the surface one step up the neutral ramp (`bg-default → bg-hover`);
  text holds its color, weight, and position. Body text never recolors on hover.
- **Press** acknowledges with a slight transform, not a color or shape change — same
  size and weight, it just registers the tap.
- **Disabled** dims the control, sets `cursor: not-allowed`, and — as the `Button` does
  — drops pointer events so the state is real, not just visual.
- **Focus** is a 2px ring in `outline-accent-secondary`, offset 0; destructive controls
  focus in `outline-destructive-secondary`.

---

## Components

A small selection of shared React components are found under `@oxide/design-system/ui`. Most 
live within the repos directly.

### Button

```tsx
import { Button } from '@oxide/design-system/ui'

<Button variant="primary" size="base" onClick={save}>Save</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="danger" loading={deleting}>Delete</Button>
<Button variant="ghost" size="icon" aria-label="Settings"><Settings16Icon /></Button>
```

- `variant`: `primary` (accent fill) · `secondary` (neutral) · `ghost` (transparent
  until hover) · `danger` (destructive). Default `primary`.
- `size`: `base` (h-10) · `sm` (h-8) · `icon` (square). Default `base`.
- `loading` overlays a centered `Spinner`, hides the label, blocks clicks.
- Disabled and loading set `aria-disabled` and drop pointer events — not just dimmed.
  Focus ring `outline-accent-secondary` (`outline-destructive-secondary` for `danger`).
- Labels are uppercase mono (`text-mono-sm`). A `buttonStyle()` helper gives the button
  look on a non-`<button>` element (e.g. a link).

### Badge

```tsx
import { Badge } from '@oxide/design-system/ui'

<Badge color="default">Running</Badge>
<Badge color="destructive" variant="solid">Failed</Badge>
<Badge color="blue">GET</Badge>
```

- `color`: `default` (accent) · `destructive` · `notice` · `neutral` · `purple` ·
  `blue`. `variant`: `default` (tinted) · `solid` (filled).
- Small uppercase mono, inset ring (`ring-current/15`), `h-4`. For status and metadata
  — HTTP methods in the docs, resource states in the console.

### Checkbox

```tsx
import { Checkbox } from '@oxide/design-system/ui'

<Checkbox checked={on} onChange={toggle}>Enable telemetry</Checkbox>
<Checkbox indeterminate={some} onChange={toggleAll}>Select all</Checkbox>
```

- Native `<input type="checkbox">` with appearance reset. `indeterminate` is applied
  via ref (no HTML attribute) and renders a bar instead of the checkmark. Checked fills
  with `bg-accent`.

### Listbox

```tsx
import { Listbox } from '@oxide/design-system/ui'

<Listbox
  selected={zone}
  onChange={setZone}
  items={[{ value: 'a', label: 'Zone A' }, { value: 'b', label: 'Zone B' }]}
  placeholder="Select a zone"
/>
```

- An accessible select on Headless UI + Floating UI (flip, width-sync, 12px offset).
  Props: `selected`, `onChange`, `items`, `placeholder`, `disabled`, `hasError`,
  `isLoading`, `name`.
- Items are `{ value, label }`; when `label` is a React node, supply `labelString` for
  the accessible/typeahead name. `hasError` switches strokes to `border-error-*`;
  `isLoading` shows a `SpinnerLoader`. The menu uses `shadow-menu-inset` so its focus
  ring overlaps the border without clipping.

### Spinner

```tsx
import { Spinner, SpinnerLoader } from '@oxide/design-system/ui'

<Spinner size="base" variant="primary" />
<SpinnerLoader isLoading={pending} minTime={500}><Result /></SpinnerLoader>
```

- `size`: `base` (12px) · `lg` (36px). `variant` matches the button variants.
- `SpinnerLoader` enforces a **`minTime` floor (default 500ms)** so a spinner never
  flickers out instantly — it stays visible long enough to read. Respects
  `prefers-reduced-motion`.

### Tabs

```tsx
import { Tabs } from '@oxide/design-system/ui'

<Tabs.Root defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="metrics">Metrics <Badge>12</Badge></Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">…</Tabs.Content>
  <Tabs.Content value="metrics">…</Tabs.Content>
</Tabs.Root>
```

- Radix-based compound component. Triggers are uppercase mono; the active one is marked
  with `text-accent` and an accent bottom border. Triggers can carry a count `Badge`.

### AsciiDoc rendering

For long-form content (the site and docs render AsciiDoc), the system exports
`Section`, `Admonition`, `Table`, and `TableOfContents`. Behaviors: auto-anchored
headings with a hover link icon; admonitions that re-accent by type (`note` → green,
`tip` → purple, `caution`/`important` → yellow, `warning` → red); horizontally
scrollable tables with sticky hairline borders; and a `useActiveSectionTracking` hook
driving a scroll-synced table of contents.

---

## Icons

Two delivery formats from the same Figma-exported source:

- **React components** — `@oxide/design-system/icons/react`. Import named components
  (`Error12Icon`, `Sparkle16Icon`, …) and style with `currentColor`. Best for app code
  with SVGR support (the console uses this exclusively).

  ```tsx
  import { Error12Icon } from '@oxide/design-system/icons/react'
  <Error12Icon className="text-error" />
  ```

- **Spritesheet** — `@oxide/design-system/icons` ships a `sprite.svg` and an `Icon`
  type. For where SVGR isn't available (the site and docs), via a wrapper rendering
  `<use href="…#name-size">`.

Names encode size (`Error12Icon` is the 12px artwork), provided at **24, 16, and
12px**. Pick the size matching adjacent type — 12/16px icons sit with mono labels; size
icons to the cap height of neighboring text, not larger.

Icons are **filled by default**; outlined variants exist for the lighter weight wanted
inline with text. Drawn on a **24×24 grid with a ~2px margin**, with optical exceptions
— some shapes extend past the margin to keep visual weight even across the set.

---

## Do & Don't

**Do**
- Use semantic tokens (`bg-raise`, `text-secondary`, `border-error`) so UI re-themes
  for free across light/dark and accent themes.
- Establish hierarchy through token tiers (`default → secondary → tertiary`), not
  opacity.
- Use the type utilities for everything — they carry the optical tracking, line height,
  and mono features you can't easily reproduce by hand.
- Give every interactive control a visible focus ring (`outline-accent-secondary`) and
  an accessible name.
- Set changing numbers in `tabular-nums` and reserve space for dynamic content.

**Don't**
- Frequently reach for raw scale colors (`bg-green-800`) in product code — those are for
  system internals and occasional decoration.
- Splash the accent around or use a hue as decoration; color is rationed, and `notice`,
  `error`, `info`, and `accent-alt` appear only for their meaning.
- Use a gradient anywhere but the modal scrim — backgrounds are flat black or white.
- Invent radii, shadows, or type sizes outside the scales.
- Animate a control a user touches dozens of times a day, or start an entrance from
  `scale(0)` — animate from `scale(0.95)` so elements settle in.
- Encode status in color alone; back every intent with a label, icon, or shape.
- Uppercase text by typing capitals; let the mono utilities transform it.
- Hardcode light/dark colors when a semantic token resolves correctly in both.

---

*Parts of this guidance build on prior art: [Emil Kowalski](https://emilkowal.ski/) on web
animation and design engineering ([animations.dev](https://animations.dev)), and Vercel's
[Web Interface Guidelines](https://vercel.com/design/guidelines).*
