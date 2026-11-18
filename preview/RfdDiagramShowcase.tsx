/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { RfdDiagram } from '../scripts/fetch-rfd-diagrams'
import { MermaidBlock } from './DiagramShowcase'

// glob so the preview still builds when the gitignored file hasn't been fetched
const data = Object.values(
  import.meta.glob<RfdDiagram[]>('./rfd-diagrams.json', { eager: true, import: 'default' }),
)[0]

const diagramType = (source: string) =>
  source
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('%%'))
    ?.split(/[\s;]/)[0]

export function RfdDiagramShowcase() {
  if (!data) {
    return (
      <div className="text-sans-md text-secondary mx-auto max-w-5xl p-8">
        No RFD diagrams found. Run{' '}
        <code className="text-mono-sm text-default">npm run fetch-rfd-diagrams</code> (needs
        an authenticated <code className="text-mono-sm text-default">gh</code>) and reload.
      </div>
    )
  }

  const byRfd = Map.groupBy(data, (d) => d.rfd)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 p-8">
      <p className="text-sans-md text-secondary">
        {data.length} diagrams from {byRfd.size} RFDs
      </p>
      {[...byRfd].map(([rfd, diagrams]) => (
        <section key={rfd} id={`rfd-${rfd}`} className="flex flex-col gap-6">
          <h2 className="text-sans-xl text-raise">
            <a
              href={`https://rfd.shared.oxide.computer/rfd/${String(rfd).padStart(4, '0')}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              RFD {rfd}
            </a>{' '}
            <span className="text-secondary">{diagrams[0].title}</span>
          </h2>
          {diagrams.map((d, i) => (
            <div key={i}>
              <h3 className="text-mono-sm text-secondary mb-2">
                {i + 1}/{diagrams.length} · {diagramType(d.source)}
                {d.file.endsWith('README.adoc') ? '' : ` · ${d.file.split('/').pop()}`}
                {d.state && d.state !== 'published' ? ` · ${d.state}` : ''}
              </h3>
              <MermaidBlock source={d.source} />
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
