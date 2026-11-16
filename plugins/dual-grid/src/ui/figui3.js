// The FigUI3 components and styles the panel is built from, bundled into one
// script and one stylesheet that scripts/inline-ui.mjs writes into dist/ui.html.
// The source entry, not the prebuilt dist/fig.js: the package lists only the
// source as having side effects, so the dist import is shaken out entirely.
import '@rogieking/figui3/src/fig.css'
import '@rogieking/figui3/src/fig.js'
