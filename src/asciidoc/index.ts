import mathJaxProcessor from '@djencks/asciidoctor-mathjax'
import AsciidocProcessor from 'asciidoctor'
import type { Asciidoctor } from 'asciidoctor'
import hljs from 'highlight.js'

export const setupProcessor = (): Asciidoctor => {
  const ad: Asciidoctor = AsciidocProcessor()

  return ad
}

interface NodeConverter {
  nodeName: string
  converter: (node: Asciidoctor.Block) => string
}

interface Attributes {
  [key: string]: string
}

export class DocProcessor {
  nodeConverters: NodeConverter[]
  ad: Asciidoctor
  registry: Asciidoctor.Extensions.Registry
  doc: Asciidoctor.Document | null

  constructor(nodeConverters: NodeConverter[] = []) {
    this.nodeConverters = nodeConverters
    this.ad = AsciidocProcessor()
    this.registry = mathJaxProcessor.register(this.ad.Extensions.create())
    this.doc = null

    this.registerSyntaxHighlighter()
    this.registerConverter()
  }

  registerSyntaxHighlighter() {
    // needs its own name so it doesn't get mixed up with built-in highlight.js (I think)
    this.ad.SyntaxHighlighter.register('highlight.js-server', {
      handlesHighlighting: () => true,
      highlight: (_node, source, lang) => {
        if (!lang) return source
        return hljs.getLanguage(lang)
          ? hljs.highlight(source, { language: lang }).value
          : source
      },
    })
  }

  registerConverter() {
    const ad = this.ad
    const nodeConverters = this.nodeConverters

    class CustomConverter {
      baseConverter: Asciidoctor.Html5Converter

      constructor() {
        this.baseConverter = new ad.Html5Converter()
      }

      convert(node: Asciidoctor.Block, transform: string) {
        const nodeName = node.getNodeName()

        // Check if converter has been overridden first
        for (let i = 0; i < nodeConverters.length; i++) {
          const converter = nodeConverters[i]
          if (nodeName === converter.nodeName) {
            return converter.converter(node)
          }
        }

        switch (nodeName) {
          case 'admonition':
            return convertAdmonition(node)
          case 'document':
            return convertContent(node)
          case 'section':
            return convertSection(node)
          default:
            break
        }

        return this.baseConverter.convert(node, transform)
      }
    }

    ad.ConverterFactory.register(new CustomConverter(), ['html5'])
  }

  load(content: string, attributes: Attributes) {
    this.doc = this.ad.load(content, {
      standalone: true,
      attributes: {
        'source-highlighter': 'highlight.js-server',
        sectlinks: 'true',
        icons: 'font',
        stem: 'latexmath',
        ...attributes,
      },
      extension_registry: this.registry,
    })

    return this.doc
  }

  convert(): string | null {
    if (!this.doc) {
      console.error('You need to run `load()` before trying to convert the document')
      return null
    }

    return this.doc.convert()
  }
}

const convertSection = (node: Asciidoctor.Block) => {
  const attrs = node.getDocument().getAttributes()
  const level = node.getLevel()
  let title: string | undefined
  let html: string = ''

  if (node.getCaption()) {
    title = node.getCaptionedTitle()
  } else {
    title = node.getTitle()
  }

  // Undocumented asciidoc attribute
  // @ts-ignore
  let sectNum = node.$sectnum()
  sectNum = sectNum === '.' ? '' : sectNum

  if (attrs.sectlinks) {
    title = `<a href="#${node.getId()}">${title}</a>`
  }

  if (level === 0) {
    html = `
    <a class="sectionanchor" id="${node.getId() || ''}" />
    <h1 class="sect0${node.getRole() || ''}" data-sectnum="${sectNum}">${title}</h1>
   `
  } else {
    html = `<div class="sect${level}${node.getRole() || ''}">
       <a class="sectionanchor" id="${node.getId() || ''}" />
       <h${level + 1} data-sectnum="${sectNum}">${title}</h${level + 1}>
     `
  }

  level === 0
    ? (html += `<div class="sectionbody">${node.getContent()}</div>`)
    : (html += node.getContent())

  html += '</div>'

  return html
}

const convertAdmonition = (node: Asciidoctor.Block) => {
  const attrs = node.getAttributes()
  return `
    <div class="admonitionblock ${attrs.name}">
      <div class="admonition-icon"></div>
      <div class="admonition-content">
        <div class="adomonition-content-label">${attrs.textlabel}</div>
        <p>${node.getContent()}</p>
      </div>
    </div>
  `
}

const convertContent = (node: Asciidoctor.Block) => {
  const document = node as Asciidoctor.Document

  let html = `
  <div id="content">
    ${document.getContent()}
  </div>
  `

  return html
}
