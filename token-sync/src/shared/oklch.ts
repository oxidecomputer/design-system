import { formatHex, formatHex8, parse, type Color } from 'culori'

export interface RGB {
  r: number
  g: number
  b: number
  a: number
}

/**
 * Parse any color string to sRGB {r,g,b,a} (0-1).
 * Handles oklch(), rgba(oklch(), alpha), hex, rgb(), etc. via culori.
 * Also handles Figma's "rgba(r, g, b, a)" with sRGB float values (0-1).
 */
export function parseColor(input: string): RGB | null {
  // Handle rgba(oklch(...), alpha) — culori can't parse this composite form
  const rgbaOklchMatch = input.match(/rgba\(\s*(oklch\([^)]+\))\s*,\s*([\d.]+)\s*\)/)
  if (rgbaOklchMatch) {
    const inner = parse(rgbaOklchMatch[1])
    if (!inner) return null
    const rgb = toSrgb(inner)
    return rgb ? { ...rgb, a: +rgbaOklchMatch[2] } : null
  }

  // Handle Figma's sRGB float format: rgba(0.123, 0.456, 0.789, 1)
  const figmaMatch = input.match(
    /rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/,
  )
  if (figmaMatch) {
    const [, r, g, b, a] = figmaMatch
    // Figma values are 0-1 floats, not 0-255
    if (+r <= 1 && +g <= 1 && +b <= 1) {
      return { r: +r, g: +g, b: +b, a: +a }
    }
  }

  // Let culori handle everything else (oklch, hex, rgb, hsl, etc.)
  const parsed = parse(input)
  if (!parsed) return null
  return toSrgb(parsed)
}

function toSrgb(color: Color): RGB | null {
  // culori's parse already gives us mode-specific channels
  // formatHex converts to sRGB, but we need float values
  const hex = formatHex(color)
  if (!hex) return null
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return { r, g, b, a: color.alpha ?? 1 }
}

/** Format a color value as hex for display. */
export function rgbToHex(rgb: RGB): string {
  const hex =
    '#' +
    Math.round(rgb.r * 255)
      .toString(16)
      .padStart(2, '0') +
    Math.round(rgb.g * 255)
      .toString(16)
      .padStart(2, '0') +
    Math.round(rgb.b * 255)
      .toString(16)
      .padStart(2, '0')
  if (rgb.a < 1) {
    return (
      hex +
      Math.round(rgb.a * 255)
        .toString(16)
        .padStart(2, '0')
    )
  }
  return hex
}

/** Compare two color values with tolerance. */
export function colorsMatch(a: RGB, b: RGB, tolerance = 0.02): boolean {
  return (
    Math.abs(a.r - b.r) < tolerance &&
    Math.abs(a.g - b.g) < tolerance &&
    Math.abs(a.b - b.b) < tolerance &&
    Math.abs(a.a - b.a) < tolerance
  )
}
