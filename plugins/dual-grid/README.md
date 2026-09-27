# Dual Grid Generator

Figma plugin that overlays two aligned grids on a frame:

- a column layout grid (12 columns by default, configurable down to 1)
- a cell grid where every cell is one base unit wide

The column grid's gutter spans a whole number of cells, one by default. Each cell is `u`
pixels wide. A monospaced layer of `x` characters shows the cell grid, the panel displays
computed values, and type specimens align to the grid.

## The grid equation

Dimensions are measured in cells. Cell size is calculated from the frame width:

```
N = 2m + c·k + (c−1)·g       (cells across the frame width)
u = W / N                     (base unit = cell size, px)

margin      = m × u
columnWidth = k × u
gutterWidth = g × u
```

| Symbol | Control      | Meaning                | Default |
| ------ | ------------ | ---------------------- | ------- |
| `c`    | Columns      | number of columns      | 12      |
| `m`    | Margin cells | margin width in cells  | 3       |
| `g`    | Gutter cells | cells per gutter       | 1       |
| `N`    | Cell columns | cells across the frame | 197     |
| `k`    | _(derived)_  | cells per column       | —       |

Margin and gutter are independent controls, both measured in whole cells.

Column width is derived. With `m` and `g` fixed, the cells per column determine `N` and the
cell size. The result is shown in the **Cells** row under **Advanced**
(`m3 k15 g1 · aspect Δ 0%`).

Whole-cell dimensions keep the grids aligned; see _Why multiples rather than pixel values_
below. To work in pixels, use **Solve mode**.

### The cell ladder

With `c`, `m` and `g` fixed, `k` is the only free variable in `N = 2m + ck + (c−1)g`. The
possible values of `N` step by `c` (`N ≡ 2m + (c−1)g mod c`), giving a discrete set of cell
sizes `u = W/N`. At 1920×1080 with `c=12, g=1, m=3` and **Pixel snap** off (the default),
there are 48 sizes, each dividing the frame exactly. These include:

```
6.06  6.30  6.55  6.83  7.14  7.47  7.84  8.24  8.69  9.19  9.75
10.38  11.10  11.93  12.89  14.01  15.36  16.99  19.01  21.57  24.94  29.54 px
```

With **Pixel snap** on, sizes within **Snap tol.** of a whole pixel are rounded; the rest
keep their exact fractions. Duplicate rounded sizes are merged. At the default tolerance of
0.5px, all sizes snap, leaving 21 whole-pixel values. Lowering the tolerance preserves more
fractional sizes.

The full range extends down to `LADDER_MIN_CELL` (2px) and up to a 66px cell at `k = 1`.

**Cell columns** steps through these sizes, expressed as `N`, the number of cells across the
frame. Every stop produces a valid grid. Requested counts snap to the nearest available
value; ties go to the coarser grid.

The control uses whole-number counts rather than fractional pixel sizes. With `m`, `g` and
`c` fixed, choosing `N` also fixes `k`, so the same setting preserves the grid's proportions
across frame sizes.

Both this slider and **Columns** step through fixed lists and display their values as text.
**Margin cells**, **Gutter cells**, and **Aspect ratio** accept any in-range value and have
editable number fields.

Aspect deviation is reported rather than used to reject cell sizes. It stays within about 2%
across the ladder at typical settings. **Aspect tol.** serves a different purpose: it allows
aspect deviation to obtain an integer row height (see Modes).

The ladder is rebuilt whenever `c`, `m`, `g`, Pixel snap or the snap tolerance changes. The
current setting is matched by count, not slider position, so a setting of 197 columns stays
near 197 after a margin change.

Pixel snap is off by default because rounding can substantially change the margins. The
remainder, `W − N·u`, is split between them. Without snapping it is zero. At 1920px wide, a
snapped 17px cell leaves 1px and a 14px cell leaves 2px, but a 10px cell leaves 50px, adding
25px to each margin. **Snap tol.** limits the absolute remainder to `N × tolerance`. Bleed
is displayed beside **Cell w×h** and flagged when it exceeds one cell.

### Why multiples rather than pixel values

Margin, column and gutter widths are whole numbers of cells summing to `N·u = W`, so every
edge lands on a cell line. Independent pixel values would require margin steps of `c·u/2`
(144px at the defaults) to keep the grids aligned, making small edits ineffective. **Solve
mode** accepts pixel targets and finds matching cell multiples.

`c` (columnCount) is chosen from 1, 2, 3, 4, 6, 9, 12: the divisors of 12 plus 9. The slider
steps through that list; input snaps to the nearest entry (exact ties keep the lower one, so
5 → 4). At `c = 1` there are no gutters and `N = 2m + k`.

## Cell density (0.25× – 3×)

Subdivides the displayed cell grid: 2× halves each cell, 3× divides it into thirds. At 0.5×
and 0.25×, it shows every 2nd or 4th cell line. This applies to the Figma layout grid, drawn
lines and char grid, which keeps one character per displayed cell. It does not change `u` or
the margin, column and gutter calculations. To change the grid's proportions, use the gutter
multiple.

With an odd cell count, coarse lines cannot land on both frame edges. The cell layout grid
switches from `CENTER` to an offset `MIN` grid to preserve alignment. Margin and column
edges may fall between displayed lines, but remain on 1× cell boundaries.

## Modes

**Manual**: set `m` and `g` in cells and choose a cell column count from the ladder. `k` is
derived.

**Solve**: enter target margin and gutter widths in pixels and a cell column count. The
solver finds the closest whole-cell multiples, preserving grid alignment.

| Solve input  | Meaning                                                          |
| ------------ | ---------------------------------------------------------------- |
| Margin       | target margin in px (default 50)                                 |
| Gutter       | target gutter in px (default 20)                                 |
| Cell columns | target `N`, the same quantity Manual's slider sets (default 197) |

All three inputs are weighted targets, not hard constraints. Every combination produces a
grid. Each field shows the achieved value in parentheses beside the target, such as
`50 (70) px`, `20 (20) px`, or `197 (196) cols`, and turns red when the result misses. The
editable value remains the target.

### Solver weights

Gutter width and cell column count are linked by `gutter = g·u = g·W/N`, with integer `g`.
An exact gutter match is available only at certain counts near `N = g·W/gutter`. For
example, 197 cell columns at `W = 1920` gives `u ≈ 9.75px`, so the available gutter widths
are about 9.75, 19.5, 29.2px, not 24px.

Changing the weights can shift the result substantially. Measurements across a sample of
typical targets:

| weights              | worst column error | worst gutter error |
| -------------------- | ------------------ | ------------------ |
| gutter 8, columns 4  | 20.3%              | 9.4%               |
| gutter 8, columns 16 | 1.6%               | 25.0%              |

The solver prioritises column count (`COLUMNS_WEIGHT = 16`, `GUTTER_WEIGHT = 8`) to preserve
the requested cell density, and reports any gutter mismatch. Swap the constants to
prioritise the gutter.

The margin has weight 1 and is quantised in cell-width increments.

The solver searches all combinations of `g ≤ 8`, `m ≤ 24`, `k ≤ 48`, about 10k combinations,
on every keystroke. It finds the best weighted match within these bounds.

- It snaps `u` through the same `snapUnit` as `computeGrid`, so the solved values match the
  generated grid after rounding.
- It optimises the measured margin, `m·u + (W − N·u)/2`, not `m·u`. The grid is centred, so
  each margin includes half the rounding remainder.
- Ties go to the coarsest grid.

The solved multiples are shown in the panel (`m8 k15 g3`).

Row height is controlled by a target cell aspect ratio `a` (`cellH = a × u`), with two
optional modes:

- **Snap rows** rounds the row count and derives `cellH` so rows fill the frame height
  exactly, allowing some aspect-ratio deviation. The count is calculated from the exact cell
  size before pixel snapping, so rounding 22.07px to 22px does not change a 24-row result to
  25 rows.
- **Pixel snap** (off by default) rounds `u` and `cellH` to whole pixels when they are
  within **Snap tol.**, measured in pixels per cell. For example, at 1920px wide with 12
  columns, 2 margin cells and 1 gutter cell, `u = 22.069px` snaps to 22px, producing 132px
  columns, 22px gutters and 47px effective margins. Values outside the tolerance remain
  fractional. The default tolerance of 0.5 always snaps; 0 disables snapping. The remainder,
  `W − N·u`, is split evenly between the margins, keeping both grids aligned using Figma's
  `CENTER` alignment. Rounding up can make the grid wider than the frame, extending it
  beyond both edges.

**Aspect tol.** is shown while Pixel snap is on and is measured as a percentage of the
target aspect ratio (default 5). With Snap rows on, it allows the row count to change within
that tolerance to find a row height that snaps. At the defaults, this gives 24 rows of 45px
instead of 25 rows of 43.2px, filling 1080px exactly. Among qualifying counts, the closest
aspect ratio wins. A tolerance of 0 disables the search and keeps the original row count.

The layout grids, drawn lines and char grid share `u` and an origin, so characters remain
aligned with the lines after snapping. They extend past the frame and clip where needed.
Stretching character spacing to fill the frame would break this alignment.

Drawn lines on or beyond the frame boundary are always culled. **Edge cull** (Advanced, on
by default) also removes interior lines within **Cull tol.** of the boundary (a percentage
of a step, default 20) to avoid darkening the frame edge. Lines a full step inside the frame
are retained.

Without Pixel snap the grid fills the frame exactly horizontally.

A Figma `ROWS` layout grid requires `offset ≥ 0`. With Snap rows off, the grid can start
above the frame (`rowOffset = vRemainder/2 < 0`), causing a validation error.
`buildLayoutGrids` shifts the start down by whole rows and increases the row count by the
same amount, preserving the line positions. It also clamps small negative floating-point
remainders from `H − rows·(H/rows)` when Snap rows is on.

With **Snap rows** off, the exact cell aspect is preserved and the last row extends past the
bottom edge, where it clips. With it on, rows fit exactly with an approximate aspect ratio.
Both modes fill the frame without changing column or margin calculations.

If the achieved cell aspect deviates from the target by more than 1%, the panel flags it.

## Panel

The **Grid** group contains mode, columns, margin, gutter, cell size, Snap rows, Pixel snap
and derived values. Pixel snap reveals Snap tol. and Aspect tol. The **Advanced** section is
collapsed by default and contains Edge cull, Cull tol., cell aspect, reference subdivision,
layer toggles and the `m/k/g` equation row. Its header is a `<button>` with `aria-expanded`
for keyboard access. Toggling it updates the reported panel height.

### Reapply is debounced

Reapplying updates generated layers and creates a Figma undo step. `FigSlider` emits on the
native `input` event, so writing on every event would create an undo step for each position
during a drag.

Every interaction posts an immediate preview update (`reapply: false`) that only recomputes
values. Document writes are debounced by 150ms and flushed when the interaction ends. A
capture-phase `change` listener detects pointer release or a field committed on blur/Enter.
Capture is required because `FigDropdown` stops the native change event's propagation in
`emit()`, preventing a bubbling listener from receiving it.

The listener defers the flush to a macrotask. Capture runs before the `<fig-*>` handler,
which schedules a new debounce; flushing inline would write immediately and again 150ms
later. Deferring allows the handler to run first and produces one write per commit. This
behavior is tested.

The panel is 280px wide. Its height is measured with a `ResizeObserver` on `#plugin-root`
and reported back to the plugin, which clamps it to 120–900px. Controls are `<fig-*>` custom
elements styled with Figma's `--figma-color-*` theme tokens.

## Actions

Two footer buttons, each enabled by the current selection:

| Button           | Enabled when                  | Behavior                                                                               |
| ---------------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| **Create frame** | nothing is selected           | Creates a frame at the viewport center from the "New frame" params, then applies grids |
| **Apply grids**  | exactly one frame is selected | Applies 3 layout grids + char grid, lines and specimens                                |
| **Remove grids** | that frame already has grids  | Clears the layout grids and deletes the generated layers                               |

The second button toggles its own label between _Apply grids_ and _Remove grids_, and its
status label reads `Select a frame` when disabled or `Live editing` when bound.

The panel uses the nearest frame at or above the selection that has grid data. Selecting a
layer inside a gridded frame keeps live editing active. Ancestors without grid data are
ignored, so selecting a layer inside an ungridded frame does not offer to grid its parent. A
selection spanning two frames binds to neither.

This also prevents **Apply grids** from treating the generated `Grid Lines` and
`Type Specimens` frames as target frames.

While a gridded frame is selected, editing a **Grid** parameter reapplies it automatically.
**New frame** parameters (width and aspect) only affect **Create frame**.

### Copy Mitos config

The secondary footer button serialises the previewed grid as JSON and copies it to the
clipboard. Pasting into Mitos (`../mitos`) merges just these fields into its settings,
preserving the source, code and colours. Mitos's **Load JSON** replaces the whole project
instead.

The payload carries `output.columns`/`rows` (the cell grid), an export size of the frame's
dimensions, `padding: 0` (the grid runs full bleed), and a `lineHeight` chosen so one Mitos
character cell has the same shape as one grid cell:

```
lineHeight = (frameH · cols · CHAR_WIDTH) / (frameW · rows · FONT_SIZE)
```

`CHAR_WIDTH` (7.45) and `FONT_SIZE` (12) mirror Mitos's `dimension-utils.ts`. Mitos
recalculates export height as `width × contentAspect` and, with aspect-ratio lock on, rows
from columns. This `lineHeight` preserves the pasted values through both calculations. Only
the counts and export size affect the final image; `lineHeight` keeps the preview and
derived fields consistent.

The clipboard write uses a temporary `<textarea>` and `execCommand("copy")` because
`navigator.clipboard` is unreliable in Figma's sandboxed iframe.

## Generated layers

Generated layers are unlocked children of the target frame:

- **Grid lines**: a `Grid Lines` frame containing a single `VectorNode` with a multi-segment
  path, rather than one node per line. The **Grid lines** switch sets the container's
  `visible` property without rebuilding it. Columns are represented only by a Figma layout
  grid.
- **Char grid**: `x` characters filling every cell, with font size calculated so each
  character measures `u` and auto width produces the correct box.
- **Type specimens**: a `Type Specimens` frame with grid-aligned text down the left of the
  content area, toggled with the **Specimens** switch. See below.

Lines on or beyond the frame boundary are culled. **Edge cull** also removes near-boundary
interior lines; see Modes.

The char grid and drawn lines extend in whole cells past the frame where needed to fill it
without losing alignment. The overhang is clipped. `Grid Lines` clips its own content
regardless of the target frame's clip setting.

### Layer reuse

A stored layer ID is used only if it resolves to a node inside the target frame. Otherwise,
the first child with the expected name and type is reused, and other children with that name
are deleted. This handles duplicated frames, whose copied `pluginData` still points to the
original layers, and older data without `linesId` or `specimensId`. `removeGrids` also
checks frame ownership and removes matching layers by name.

Layers and their contents are updated in place:

- The char grid's `characters` is rewritten only when the grid shape changes. This avoids an
  expensive assignment and preserves per-character styling during live edits.
- Specimens are matched by layer name. Reapplying changes size, leading, tracking and
  position, but preserves edited text. Specimens that no longer fit are removed.

Applies run through a single queue to prevent overlapping updates from creating duplicate
layers before IDs have been stored. The test suite does not currently reproduce this race.

## Type specimens

Each specimen's line height is a proportion of the frame height, rounded to a whole multiple
of cell height so baselines align to cell lines. Font size is a share of the line box, with
leading decreasing from about 1.35× at small sizes to 1.0× at display sizes. Custom sizes
interpolate between reference points.

Under **Advanced**, **Mono sizes** and **Sans sizes** accept comma-separated percentages of
frame height, one specimen per entry (defaults `2` and `6, 12, 24`). Values are sorted
ascending, duplicates removed, and invalid entries ignored. Empty or invalid lists fall back
to the built-in scale.

Sizing relative to the frame keeps the type scale largely independent of cell size. Doubling
frame height roughly doubles the type; changing cell size affects only the rounding, which
stays within half a cell of the requested line height.

Mono specimens align to the top and sans specimens to the bottom. Both use whole-cell
offsets from a cell line, preserving baseline alignment. The sans block starts at the last
cell line with enough room for it.

The bottom offset includes the largest sans specimen's measured descender, rounded up to
whole cells, plus a one-cell inset matching the mono block's top inset. This keeps
descenders inside the frame with consistent clearance. If the stack is too tall to anchor at
the bottom, it starts at the top and clips.

If the stack does not fit the available rows, the largest specimens are removed first.

Baselines are measured using `absoluteRenderBounds`, the tight ink box of the rendered
glyphs. The bottom edge of a flat-footed capital gives its baseline. A probe node is
measured at each specimen's font and size; `ASCENT_SHARE` is used only as a fallback.

- Mono: GT America Mono at about 2% of frame height by default, uppercase with 4% tracking,
  following the design system's mono scale.
- Sans: Suisse Int'l Regular at about 6%, 12% and 24% of frame height by default, tracked
  with the design system's optical curve:

  ```
  letter-spacing (em) = 0.981 / fontSize − 0.0401
  ```

  This matches the published scale (11px → 0.049em, 25px → ~0, 65px → −0.025em), increasing
  spacing at small sizes and reducing it at display sizes. Source:
  [design-system/styles/main.css](https://github.com/oxidecomputer/design-system/blob/9fddb7704188a6de69c410a1b05ba231872eef27/styles/main.css#L4)

## Fonts

Both families are editable under **Advanced**. **Mono font** sets the char grid and mono
specimen font; **Sans font** sets the sans specimen font. The plugin resolves the style for
each family, since regular styles have different names (GT America Mono uses `Regular OCC`).

The defaults are GT America Mono / Regular OCC and Suisse Int'l Regular. Font measurements
are cached per frame and font family. Changing a family triggers new measurements;
reapplying with the same family creates no temporary probe nodes. If a face is unavailable,
the plugin tries another style in the family, then a family matching `/mono/i`, then any
available regular font. It measures the resolved font to keep character cells `u` wide.

## Colours

Colours are defined as hex values at the top of `main.ts`:

| Constant      | Applies to                        | Value     |
| ------------- | --------------------------------- | --------- |
| `COLOR_BG`    | the frame fill, on _Create frame_ | `#000000` |
| `COLOR_TEXT`  | the specimens                     | `#FFFFFF` |
| `COLOR_CHAR`  | the char grid                     | `#666666` |
| `COLOR_LINES` | the drawn cell-grid strokes       | `#333333` |

Figma's own layout-grid overlay colours (the purple column grid and the cyan cell grid) are
separate, and set in `buildLayoutGrids`.

These colours are not bound to design-system `COLOR` variables because bindings have been
unreliable. Relevant API limitations:

- Layout-grid colours cannot be bound. `VariableBindableLayoutGridField` is only
  `sectionSize | count | offset | gutterSize`, which excludes overlay colours.
- Text fills must be set by range. Figma stores them per character, and the API documents
  `setRangeFills`, not the node-wide `fills` setter, as the route that "can be bound to
  color variables by using `setBoundVariableForPaint`". Assigning only `fills` drops the
  binding on text.

## State

Per-frame state (params + generated layer IDs + the font probe) is stored in the frame's
`pluginData`, so re-selecting an already-gridded frame prefills the UI and updates existing
layers in place rather than recreating them.

## Develop

```sh
npm install
npm run build   # tsc type-check + vite bundle → dist/main.js
npm run dev     # rebuild on change
npm test        # build, then run both test suites
```

Tests live in `test/` and are plain Node scripts (no framework): `plugin.test.mjs` exercises
the grid maths and generated layers against a mock Figma API, `ui.test.mjs` drives the panel
in jsdom. `npm test` builds first because the plugin suite runs the built bundle rather than
the TypeScript.

Then in Figma: **Plugins → Development → Import plugin from manifest…** and pick
`manifest.json`.
