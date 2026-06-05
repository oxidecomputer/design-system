/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/*
 * Renders the custom AsciiDoc overrides through the real renderer and checks
 * the behaviours that diverge from / extend the stock HTML5 output.
 */
import asciidoctor from '@asciidoctor/core'
import { Asciidoc, prepareDocument } from '@oxide/react-asciidoc'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  AsciiDocBlocks,
  attrs,
  handleDocument,
  inlineOverrides,
  loadAsciidoctor,
} from '../components/src/asciidoc/index'

const options = {
  overrides: {
    admonition: AsciiDocBlocks.Admonition,
    section: AsciiDocBlocks.Section,
    table: AsciiDocBlocks.Table,
  },
  customDocument: AsciiDocBlocks.MinimalDocument,
  inlineOverrides,
}

const render = (source: string) => {
  const doc = asciidoctor().load(source, { standalone: true, attributes: attrs })
  return renderToStaticMarkup(<Asciidoc document={prepareDocument(doc)} options={options} />)
}

const renderHighlighted = async (source: string) => {
  const doc = loadAsciidoctor({}).load(source, { standalone: true, attributes: attrs })
  return renderToStaticMarkup(<Asciidoc document={await handleDocument(doc)} options={options} />)
}

describe('Admonition', () => {
  it('renders simple (single-paragraph) body content', () => {
    const html = render(`[NOTE]\nThis is a *note* with body text.`)
    expect(html).toContain('admonitionblock')
    expect(html).toContain('green-theme')
    expect(html).toContain('admonition-icon')
    expect(html).toContain('with body text')
    expect(html).toContain('<strong>note</strong>')
  })

  it('renders multi-block body content', () => {
    const html = render(`[WARNING]\n====\nFirst para.\n\nSecond para.\n====`)
    expect(html).toContain('red-theme')
    expect(html).toContain('First para.')
    expect(html).toContain('Second para.')
  })

  it('renders a block title and keeps custom SVG icons (ignores icons=font)', () => {
    const html = render(`.My Title\n[TIP]\nBody here.`)
    expect(html).toContain('admonition-title')
    expect(html).toContain('My Title')
    expect(html).toContain('Body here.')
    expect(html).not.toContain('fa icon-tip')
  })
})

describe('Section', () => {
  it('wraps the heading in a link with no nested anchors', () => {
    const html = render(`== Hello World\n\nSome content.`)
    expect(html).toContain('class="link group"')
    expect(html).toContain('href="#_hello_world"')
    expect(html).toContain('Hello World')
    expect(html).toContain('class="sect1"')
    expect(html).toContain('sectionbody')
    // the link wrapper must not contain another anchor
    expect(html).not.toMatch(/<a class="link group"[^>]*>[^]*?<a /)
  })

  it('strips a link in the heading to its text (no nested anchors)', () => {
    const html = render(`== See https://oxide.computer[the site] now\n\nBody.`)
    // link text is kept, but its anchor is unwrapped so it can't nest
    expect(html).toContain('the site')
    expect(html).not.toContain('href="https://oxide.computer"')
    expect(html).not.toMatch(/<a class="link group"[^>]*>[^]*?<a /)
  })

  it('keeps a footnote marker in the heading but strips its anchor', () => {
    const html = render(`== Heading footnote:[A note]\n\nBody.`)
    // the stock superscript marker stays, but with no nested anchor
    expect(html).toContain('class="footnote"')
    expect(html).not.toMatch(/<a class="link group"[^>]*>[^]*?<a /)
  })
})

describe('inline overrides', () => {
  it('inserts <wbr/> into inline monospaced spans', () => {
    const html = render('See the `/v1/disks/{disk}` endpoint.')
    expect(html).toContain('<code>')
    expect(html).toContain('/<wbr/>v1/<wbr/>disks/<wbr/>{disk}')
  })

  it('leaves slashes in regular prose alone', () => {
    const html = render('Plain a/b/c text here.')
    expect(html).not.toContain('<wbr')
  })

  it('renders other quoted subtypes unchanged', () => {
    const html = render('This is *bold* and _italic_ text.')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
  })
})

describe('Table', () => {
  it('wraps tables in a table-wrapper', () => {
    const html = render(`|===\n| A | B\n| 1 | 2\n|===`)
    expect(html).toContain('table-wrapper')
    expect(html).toContain('<table')
  })
})

describe('callouts + syntax highlighting', () => {
  it('renders conum callout markup in a highlighted listing', async () => {
    const html = await renderHighlighted(
      `[source,javascript]\n----\nconst x = 1 // <1>\n----\n<1> a number`,
    )
    expect(html).toContain('language-javascript')
    expect(html).toContain('<i class="conum" data-value="1"></i><b>(1)</b>')
    // the badge must not be escaped into visible text by the highlighter
    expect(html).not.toContain('&#x3C;b&#x3E;')
    // the comment prefix is dropped, not left dangling before the conum
    expect(html).not.toMatch(/\/\/\s*<i class="conum"/)
  })

  it('renders conum callout markup in a plain (unhighlighted) listing', async () => {
    const html = await renderHighlighted(`----\nplain text # <1>\n----\n<1> a number`)
    expect(html).toContain('<i class="conum" data-value="1"></i><b>(1)</b>')
  })

  it('renders inline icon: macros as font icons (icons=font)', () => {
    const html = render('An inline icon:heart[] here.')
    expect(html).toContain('class="icon"')
    expect(html).toContain('<i class="fa fa-heart">')
  })
})
