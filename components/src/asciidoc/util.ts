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

import oxql from './langs/oxql.tmLanguage.json'
// p4.tmLanguage.json is derived from the highlights query in
// https://github.com/oxidecomputer/tree-sitter-p4 (queries/highlights.scm).
import p4 from './langs/p4.tmLanguage.json'
import theme from './oxide-syntax.json'

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

// react-asciidoc returns verbatim block content already HTML-escaped for
// `innerHTML`. Shiki escapes again, so `&amp;` would become `&amp;amp;` and
// render literally. Decode back to raw characters before highlighting; `&amp;`
// is decoded last so escaped entity text like `&amp;lt;` survives as `&lt;`.
const decodeEntities = (content: string): string =>
  content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

const highlight = async (block: Block): Promise<Block> => {
  if (block.type === 'listing') {
    const literalBlock = block as LiteralBlock

    // Listing content is always a single string (the per-paragraph array form
    // is only used for table cells), but the type is a union — guard for it.
    if (!literalBlock.content || typeof literalBlock.content !== 'string') {
      return block
    }

    // Turn callout markers (`&lt;N&gt;`, optionally comment-prefixed) into the
    // `<i class="conum" data-value="N"></i><b>(N)</b>` markup asciidoc.css
    // styles (it hides the trailing `<b>`).
    const lineComment = literalBlock.attributes['line-comment']
    const content = Inline.subCallouts(
      literalBlock.content,
      true,
      lineComment !== undefined ? String(lineComment) : undefined,
    )

    // Replace the conum markup with placeholders before highlighting, otherwise
    // the syntax highlighter escapes it and it shows up as literal text. Cover
    // the trailing `<b>` badge too so the whole unit is restored intact.
    //
    // The placeholder must survive tokenization as a single unbroken run of
    // text, so it uses only letters and digits — no underscores. Grammars like
    // asciidoc and markdown treat `__` as bold delimiters, so two adjacent
    // placeholders (e.g. `<1> <2>`) pair up and get split across `<span>`s,
    // leaving the literal placeholder in the output.
    const calloutRegex = /<i class="conum" data-value="\d+"><\/i>(?:<b>\(\d+\)<\/b>)?/g
    const callouts: string[] = []
    const placeholderContent = content.replace(calloutRegex, (match) => {
      callouts.push(match)
      return `CALLOUTPLACEHOLDER${callouts.length - 1}END`
    })

    // If no language specified, we still want to support callouts
    if (!literalBlock.language) {
      return {
        ...block,
        content: placeholderContent.replace(
          /CALLOUTPLACEHOLDER(\d+)END/g,
          (_, index) => callouts[parseInt(index)],
        ),
      }
    }

    const highlightedContent = await highlightCode(
      decodeEntities(placeholderContent),
      literalBlock.language,
      { inline: true },
    )

    // Restore callouts in the highlighted content
    const restoredContent = highlightedContent.replace(
      /CALLOUTPLACEHOLDER(\d+)END/g,
      (_, index) => callouts[parseInt(index)],
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
