/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import asciidoctor, {
  type Block as AdBlock,
  type Document,
  type Html5Converter,
  type Inline,
  type Registry,
} from '@asciidoctor/core'
import {
  Block,
  LiteralBlock,
  prepareDocument,
  processDocument,
} from '@oxide/react-asciidoc'
import {
  type BundledLanguage,
  type BundledTheme,
  type HighlighterGeneric,
  type LanguageInput,
  bundledLanguages,
  getHighlighter,
} from 'shiki'

import oxqlLang from './langs/oxql.tmLanguage.json'
import theme from './oxide-dark.json'

let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null
const customLanguages = ['oxql']
const supportedLanguages = [...Object.keys(bundledLanguages), ...customLanguages]

async function getOrCreateHighlighter() {
  if (!highlighter) {
    const langs: LanguageInput[] = []

    langs.push({
      ...oxqlLang,
    })

    highlighter = await getHighlighter({
      themes: [theme],
      langs: langs,
    })
  }

  return highlighter
}

const highlight = async (block: Block): Promise<Block> => {
  if (block.type === 'listing') {
    const literalBlock = block as LiteralBlock

    if (!literalBlock.content) {
      return block
    }

    // Replace callouts with placeholders before highlighting
    // without this they are decoded and are no displayed as HTML
    const calloutRegex = /<i class="conum" data-value="\d+"><\/i>/g
    const callouts: string[] = []
    const placeholderContent = literalBlock.content.replace(calloutRegex, (match) => {
      callouts.push(match)
      return `__CALLOUT_PLACEHOLDER_${callouts.length - 1}__`
    })

    // If no language specified, we still want to support callouts
    if (!literalBlock.language) {
      return {
        ...block,
        content: placeholderContent.replace(
          /__CALLOUT_PLACEHOLDER_(\d+)__/g,
          (_, index) => callouts[parseInt(index)],
        ),
      }
    }

    let lang = literalBlock.language
    const h = await getOrCreateHighlighter()
    const loadedLanguages = h.getLoadedLanguages()

    if (!supportedLanguages.includes(lang)) {
      lang = 'text'
    }

    if (!loadedLanguages.includes(lang)) {
      await h.loadLanguage(lang as BundledLanguage)
    }

    const highlightedContent = h.codeToHtml(placeholderContent, {
      lang,
      theme: theme,
      structure: 'inline',
    })

    // Restore callouts in the highlighted content
    const restoredContent = highlightedContent.replace(
      /__CALLOUT_PLACEHOLDER_(\d+)__/g,
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

  /*
    For styling inline elements
    we cannot do this through the AsciiDoc tree
  */
  class InlineConverter {
    baseConverter: Html5Converter

    constructor() {
      this.baseConverter = new ad.Html5Converter()
    }

    convert(node: AdBlock, transform: string) {
      switch (node.getNodeName()) {
        case 'inline_callout':
          return convertInlineCallout(node as unknown as Inline) // We know this is always inline
        default:
          break
      }

      return this.baseConverter.convert(node, transform)
    }
  }

  extensions.forEach((extension) => ad.Extensions.register(extension))
  ad.ConverterFactory.register(new InlineConverter(), ['html5'])

  return ad
}

// These are a little nicer to style than the default
function convertInlineCallout(node: Inline): string {
  return `<i class="conum" data-value="${node.getText()}"></i>`
}

const handleDocument = async (document: Document) => {
  const doc = prepareDocument(document)
  return await processDocument(doc, highlight)
}

export { handleDocument, highlight, loadAsciidoctor, attrs }
