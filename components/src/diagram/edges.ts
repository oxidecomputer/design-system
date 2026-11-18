/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

const SVG_NS = 'http://www.w3.org/2000/svg'
const CORNER_RADIUS = 6
const DOT_RADIUS = 3.25

type Pt = [number, number]
const toward = ([cx, cy]: Pt, [x, y]: Pt): Pt => {
  const k = Math.min(1, CORNER_RADIUS / (Math.hypot(x - cx, y - cy) || 1))
  return [cx + (x - cx) * k, cy + (y - cy) * k]
}

// Pele hardcodes 12px corners as `Q`; pull both ends of each curve toward its
// corner. Following segments start from the new end but stay on the same leg.
function tightenCorners(d: string) {
  const cmds = [...d.matchAll(/([MLQC])([^MLQC]*)/g)].map(([, c, args]) => ({
    c,
    n: args
      .trim()
      .split(/[\s,]+/)
      .map(Number),
  }))
  let prev: Pt = [0, 0]
  let prevWasQ = false
  let out = ''
  for (const { c, n } of cmds) {
    const end: Pt = [n[n.length - 2], n[n.length - 1]]
    if (c === 'Q') {
      const corner: Pt = [n[0], n[1]]
      out += `L${toward(corner, prev)}Q${corner} ${toward(corner, end)}`
    } else {
      if (c === 'C' && prevWasQ) out += `L${prev}`
      const pts = []
      for (let i = 0; i < n.length; i += 2) pts.push(`${n[i]},${n[i + 1]}`)
      out += c + pts.join(' ')
    }
    prev = end
    prevWasQ = c === 'Q'
  }
  return out
}

// flowchart only: tighter corners, and a dot where a one-way edge leaves its
// source, drawn in a top layer so nodes don't cover it
export function decorateEdges(el: HTMLElement) {
  const svg = el.querySelector('svg.pele-flowchart')
  if (!svg) return
  const dots = document.createElementNS(SVG_NS, 'g')
  dots.setAttribute('class', 'pele-edge-dots')
  // edges fanning out of one port start a few px apart; one dot covers them
  const placed: Pt[] = []
  for (const edge of svg.querySelectorAll('.pele-edge')) {
    const path = edge.querySelector('path:not(.pele-marker)')
    const d = path?.getAttribute('d')
    if (!path || !d) continue
    if (d.includes('Q')) path.setAttribute('d', tightenCorners(d))
    if (edge.querySelectorAll('.pele-marker').length !== 1) continue
    const m = d.match(/^M\s*(-?[\d.]+)[ ,]\s*(-?[\d.]+)/)
    if (!m) continue
    const [x, y] = [Number(m[1]), Number(m[2])]
    if (placed.some(([px, py]) => Math.hypot(px - x, py - y) < DOT_RADIUS * 3)) continue
    placed.push([x, y])
    const dot = document.createElementNS(SVG_NS, 'circle')
    dot.setAttribute('cx', `${x}`)
    dot.setAttribute('cy', `${y}`)
    dot.setAttribute('r', `${DOT_RADIUS}`)
    dots.append(dot)
  }
  svg.append(dots)
}
