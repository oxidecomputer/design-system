/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { parse, type FlowchartModel, type SequenceModel } from 'pele/lazy'

// Infers node roles from diagram structure so authors write plain Mermaid.
// Roles map to `.pele-role-*` classes styled in diagram.css; a node with an
// authored `:::class` is left alone.
export type Role = 'entry' | 'good' | 'bad' | 'optional' | 'focus'
export type Roles = Map<string, Role>

const GOOD =
  /\b(succeed(s|ed)?|success(ful)?|completed?|done|pass(es|ed)?|ok|approved?|accepted?)\b/i
const BAD =
  /\b(fail(s|ed|ure)?|errors?|reject(s|ed)?|abort(s|ed)?|denied|timeout|timed out)\b/i
// branch labels only; too ambiguous inside node text
const GOOD_BRANCH = /^\s*(yes|true)\s*$/i
const BAD_BRANCH = /^\s*(no|false)\s*$/i

function tone(text: string, branch = false): Role | undefined {
  if (BAD.test(text) || (branch && BAD_BRANCH.test(text))) return 'bad'
  if (GOOD.test(text) || (branch && GOOD_BRANCH.test(text))) return 'good'
}

function flowchartRoles(model: FlowchartModel): Roles {
  const subgraphs = new Set(model.subgraphs.map((s) => s.id))
  const edges = model.edges.filter((e) => e.stroke !== 'invisible')
  const roles: Roles = new Map()
  let connected = 0

  for (const node of model.nodes.values()) {
    const { id } = node
    if (subgraphs.has(id)) continue
    const touching = edges.filter((e) => e.start === id || e.end === id)
    if (touching.length === 0) continue
    connected++
    if (node.classes.length > 0 || node.type === 'diamond') continue

    // open (---) and two-way (<-->) links have no direction
    const undirected = touching.some(
      (e) => e.type === 'arrow_open' || e.type?.startsWith('double_'),
    )
    const incoming = touching.filter((e) => e.end === id)
    const outgoing = touching.filter((e) => e.start === id)

    let role: Role | undefined
    if (!undirected && outgoing.length === 0) {
      // terminal: its own label decides, else the branch that leads to it
      role = tone(node.text ?? '')
      for (const e of incoming) role ??= tone(e.text, true)
    }
    if (!role && touching.every((e) => e.stroke === 'dotted')) role = 'optional'
    if (!role && !undirected && incoming.length === 0) role = 'entry'
    if (role) roles.set(id, role)
  }

  // emphasis only helps when it singles something out; in data-structure
  // diagrams a whole row has no incoming edges
  const entries = [...roles].filter(([, r]) => r === 'entry')
  if (entries.length > connected / 4) for (const [id] of entries) roles.delete(id)
  return roles
}

// participants grouped in a `box` are the system the diagram is about
function sequenceRoles(model: SequenceModel): Roles {
  const roles: Roles = new Map()
  for (const [key, actor] of model.actors) if (actor.box) roles.set(key, 'focus')
  return roles
}

type ParseConfig = NonNullable<Parameters<typeof parse>[1]>['config']

export function inferRoles(content: string, config: ParseConfig): Roles {
  try {
    const model = parse(content, { config })
    if (model.type === 'flowchart') return flowchartRoles(model)
    if (model.type === 'sequence') return sequenceRoles(model)
  } catch {
    // mount() reports parse errors itself
  }
  return new Map()
}

export function applyRoles(el: HTMLElement, roles: Roles) {
  for (const [id, role] of roles) {
    for (const node of el.querySelectorAll(`.pele-node[data-id="${CSS.escape(id)}"]`)) {
      node.classList.add(`pele-role-${role}`)
    }
  }
}
