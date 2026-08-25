/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import asciidoctor, { type Document, type Registry } from '@asciidoctor/core'
import {
  Block,
  Inline,
  LiteralBlock,
  prepareDocument,
  processDocument,
} from '@oxide/react-asciidoc'
import {
  bundledLanguages,
  createHighlighter,
  type BundledLanguage,
  type BundledTheme,
  type HighlighterGeneric,
  type LanguageInput,
} from 'shiki'

import { oxqlGrammar as oxql, p4Grammar as p4, oxideTheme as theme } from '../syntax'

let highlighterPromise: Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> | null =
  null
const customLanguages = ['oxql', 'p4']
const supportedLanguages = [...Object.keys(bundledLanguages), ...customLanguages]

export function getHighlighter() {
  if (!highlighterPromise) {
    const langs: LanguageInput[] = [{ ...oxql }, { ...p4 }]
    highlighterPromise = createHighlighter({ themes: [theme], langs })
  }
  return highlighterPromise
}

export async function highlightCode(
  code: string,
  lang: string,
  { inline = false }: { inline?: boolean } = {},
): Promise<string> {
  const h = await getHighlighter()
  const resolved = supportedLanguages.includes(lang) ? lang : 'text'
  if (!h.getLoadedLanguages().includes(resolved)) {
    await h.loadLanguage(resolved as BundledLanguage)
  }
  return h.codeToHtml(code, {
    lang: resolved,
    theme,
    ...(inline ? { structure: 'inline' as const } : {}),
  })
}

const highlight = async (block: Block): Promise<Block> => {
  if (block.type === 'listing') {
    const literalBlock = block as LiteralBlock

    // Highlight `subbedSource`: `source` with react-asciidoc's text-level subs
    // (notably `attributes`) resolved, but still un-escaped and with raw `<N>`
    // callouts — the plain code to tokenize. Highlighting re-escapes, so feeding
    // it the specialchars-escaped `content` would double-escape (`&` -> `&amp;`).
    if (typeof literalBlock.subbedSource !== 'string') {
      return block
    }
    const source = literalBlock.subbedSource

    // Turn raw callout markers (`<N>`, optionally comment-prefixed) into the
    // `<i class="conum" data-value="N"></i><b>(N)</b>` markup asciidoc.css
    // styles (it hides the trailing `<b>`). Keyed to the raw `<N>` form because
    // it runs on `source`, not the escaped `&lt;N&gt;` of `content`.
    const lineComment = literalBlock.attributes['line-comment']
    const content = Inline.subCalloutsRaw(
      source,
      true,
      lineComment !== undefined ? String(lineComment) : undefined,
    )

    // Replace the conum markup with placeholders before highlighting, otherwise
    // the syntax highlighter escapes it and it shows up as literal text. Cover
    // the trailing `<b>` badge too so the whole unit is restored intact.
    //
    // The placeholder must survive tokenization as a single unbroken run of
    // text — anything a grammar can tokenize (digits, underscores) gets split
    // across `<span>`s, leaving the placeholder literal in the output — so the
    // index is spelled with letters only (0–9 mapped to A–J).
    const calloutRegex = /<i class="conum" data-value="\d+"><\/i>(?:<b>\(\d+\)<\/b>)?/g
    const decodeIndex = (letters: string) =>
      parseInt(
        letters.replace(/[A-J]/g, (c) => String('ABCDEFGHIJ'.indexOf(c))),
        10,
      )
    const callouts: string[] = []
    const placeholderContent = content.replace(calloutRegex, (match) => {
      callouts.push(match)
      const index = String(callouts.length - 1).replace(/\d/g, (d) => 'ABCDEFGHIJ'[+d])
      return `CALLOUTPLACEHOLDER${index}END`
    })

    // If no language specified, we still want to support callouts. This content
    // skips the highlighter and goes straight to `innerHTML`, so escape the raw
    // text ourselves; the conum markup is held out as placeholders and restored
    // un-escaped after.
    if (!literalBlock.language) {
      return {
        ...block,
        content: Inline.subSpecialchars(placeholderContent).replace(
          /CALLOUTPLACEHOLDER([A-J]+)END/g,
          (_, index) => callouts[decodeIndex(index)],
        ),
      }
    }

    const highlightedContent = await highlightCode(
      placeholderContent,
      literalBlock.language,
      { inline: true },
    )

    // Restore callouts in the highlighted content
    const restoredContent = highlightedContent.replace(
      /CALLOUTPLACEHOLDER([A-J]+)END/g,
      (_, index) => callouts[decodeIndex(index)],
    )

    return {
      ...block,
      content: restoredContent,
    }
  }
  return block
}

const attrs = {
  sectlinks: 'true',
  stem: 'latexmath',
  stylesheet: false,
  icons: 'font',
}

const loadAsciidoctor = ({
  extensions = [],
}: {
  extensions?: ((this: Registry) => void)[]
}) => {
  const ad = asciidoctor()

  // Rendering goes through `prepareDocument` + React templates, so only
  // extensions need registering; they run at `ad.load` time (e.g. include
  // processing). Inline content (callouts, quotes, etc.) is produced by the
  // renderer's inline parser.
  extensions.forEach((extension) => ad.Extensions.register(extension))

  return ad
}

const handleDocument = async (document: Document) => {
  const doc = prepareDocument(document)
  return await processDocument(doc, highlight)
}

export { handleDocument, highlight, loadAsciidoctor, attrs }
