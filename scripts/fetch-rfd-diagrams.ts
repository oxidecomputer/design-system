/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// Pulls every Mermaid block out of oxidecomputer/rfd for the preview's RFD tab.
// The RFD repo is internal, so the output is gitignored; needs an authed `gh`.
// Code search only indexes the default branch, so unmerged RFDs are skipped.
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

export type RfdDiagram = {
  rfd: number
  title: string
  state: string
  file: string
  source: string
}

const REPO = 'oxidecomputer/rfd'
const OUT = path.resolve(import.meta.dirname, '../preview/rfd-diagrams.json')

const gh = (...args: string[]) =>
  execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

const readFile = (file: string) =>
  gh('api', `repos/${REPO}/contents/${file}`, '-H', 'Accept: application/vnd.github.raw')

// handles `[source,mermaid]` / `[mermaid]` with `----` or `....`, and ```mermaid
function extract(text: string): string[] {
  const lines = text.split('\n')
  const blocks: string[] = []
  for (let i = 0; i < lines.length; i++) {
    let close: string | undefined
    if (/^```mermaid\s*$/.test(lines[i])) close = '```'
    else if (/^\[(source,\s*)?mermaid\b.*\]\s*$/.test(lines[i])) {
      const delim = lines[i + 1]?.trim()
      if (delim !== '----' && delim !== '....') continue
      close = delim
      i++
    }
    if (!close) continue
    const body: string[] = []
    while (++i < lines.length && lines[i].trim() !== close) body.push(lines[i])
    blocks.push(body.join('\n'))
  }
  return blocks
}

const files = gh(
  'search',
  'code',
  'mermaid',
  '--repo',
  REPO,
  '--limit',
  '200',
  '--json',
  'path',
  '--jq',
  '.[].path',
)
  .split('\n')
  .filter((f) => /^rfd\/\d+\/.+\.adoc$/.test(f))
  .sort()

const diagrams: RfdDiagram[] = []
const readmes = new Map<string, string>()
for (const file of [...new Set(files)]) {
  const dir = path.dirname(file)
  const text = readFile(file)
  // title and state live in the README even when diagrams are elsewhere
  if (!readmes.has(dir)) {
    readmes.set(dir, file.endsWith('README.adoc') ? text : readFile(`${dir}/README.adoc`))
  }
  const readme = readmes.get(dir)!
  const title = (readme.match(/^= (.+)$/m)?.[1] ?? '').replace(/^RFD \d+:?\s*/, '')
  const state = readme.match(/^:state:\s*(\S+)/m)?.[1] ?? ''
  const rfd = Number(path.basename(dir))
  for (const source of extract(text)) {
    diagrams.push({ rfd, title, state, file, source })
  }
  console.log(`${file}: ${extract(text).length}`)
}

writeFileSync(OUT, JSON.stringify(diagrams, null, 2) + '\n')
console.log(`wrote ${diagrams.length} diagrams to ${path.relative(process.cwd(), OUT)}`)
