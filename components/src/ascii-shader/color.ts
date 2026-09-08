/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// Resolved values are stable for a session (theme CSS is statically imported),
// so cache them — cell colors resolve per cell per frame.
const resolvedColorCache = new Map<string, string>()

/**
 * Normalize a color for use as a CSS value: bare custom property names
 * ('--accent') become var() references. Shared by the text renderer (the DOM
 * dereferences the var natively) and resolveColor (which must precompute).
 */
export function cssColorValue(color: string): string {
  const trimmed = color.trim()
  return trimmed.startsWith('--') ? `var(${trimmed})` : trimmed
}

/**
 * Resolve CSS custom property references in a color — a bare name
 * ('--color-green-800') or any value containing var() ('var(--color-green-800)',
 * 'rgb(var(--color-green-800-rgb))') — to the concrete color the document
 * computes for it. Canvas fillStyle and standalone exports (SVG/PNG/video)
 * can't dereference variables themselves. Plain colors pass through untouched;
 * unresolvable values are returned as-is.
 */
export function resolveColor(color: string): string {
  if (!color || typeof document === 'undefined') return color

  const value = cssColorValue(color)
  if (!value.includes('var(')) return color

  const cached = resolvedColorCache.get(value)
  if (cached !== undefined) return cached

  // A probe inside a sentinel-colored wrapper: if the var is undefined, color
  // becomes invalid at computed-value time and inherits the sentinel, which we
  // detect and treat as unresolvable.
  const sentinel = 'rgb(1, 2, 3)'
  const wrapper = document.createElement('span')
  wrapper.style.color = sentinel
  const probe = document.createElement('span')
  probe.style.color = value
  wrapper.appendChild(probe)
  document.documentElement.appendChild(wrapper)
  const computed = getComputedStyle(probe).color
  wrapper.remove()

  // On failure cache the normalized form — the cache is keyed on it, so
  // storing the raw input would hand '--x' to a later 'var(--x)' lookup.
  const resolved = probe.style.color !== '' && computed !== sentinel ? computed : value
  resolvedColorCache.set(value, resolved)
  return resolved
}

/** Drop cached var() resolutions, e.g. after a theme change. */
export function clearResolvedColorCache(): void {
  resolvedColorCache.clear()
}

/**
 * Prefer a Display P3 canvas so wide-gamut colors (e.g. oklch) survive
 * rendering and export. The first getContext call on a canvas fixes its color
 * space, so every render/export canvas must go through this helper.
 */
export function get2dContext(
  canvas: HTMLCanvasElement,
  options?: CanvasRenderingContext2DSettings
): CanvasRenderingContext2D | null {
  try {
    return canvas.getContext('2d', { colorSpace: 'display-p3', ...options })
  } catch {
    // Browsers without display-p3 support throw — fall back to sRGB
    return canvas.getContext('2d', options)
  }
}
