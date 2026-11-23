/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useRef } from 'react'

// Aliased: the component below shares the controller type's name, which
// the declaration bundler (rollup-plugin-dts) can't parse.
import {
  createAnimation,
  DEFAULT_FPS,
  type AsciiAnimation as Controller,
} from './animation'
import type { Program } from './types'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia(REDUCED_MOTION_QUERY).matches

export interface AsciiAnimationProps {
  program: Program
  /** Override the program's grid. */
  cols?: number
  rows?: number
  fps?: number
  frames?: number
  renderer?: 'text' | 'canvas'
  /**
   * Play only while on screen (default true). Starts once at least
   * `visibleThreshold` is visible; pauses when it leaves the viewport.
   */
  playOnVisible?: boolean
  /** Intersection ratio to start playing. Default 0.25. */
  visibleThreshold?: number
  className?: string
  alt?: string
  /** Passed to every program hook. */
  userData?: unknown
  /** Controller after mount (seek, events, export). */
  onReady?: (animation: Controller) => void
}

/**
 * Mount a program into a <pre> or <canvas>. When cols/rows are known on the
 * text renderer, a hidden spacer <pre> reserves the final size while fonts
 * load. Sets `settings.reducedMotion` from `prefers-reduced-motion`.
 */
export function AsciiAnimation({
  program,
  cols,
  rows,
  fps,
  frames,
  renderer = 'text',
  playOnVisible = true,
  visibleThreshold = 0.25,
  className,
  alt,
  userData,
  onReady,
}: AsciiAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementRef = useRef<HTMLElement>(null)
  const animationRef = useRef<Controller | null>(null)
  // Observer may undo its own pause, but not a controller pause or `loop: false`.
  const startedByObserverRef = useRef(false)
  const pausedByObserverRef = useRef(false)

  // Recreate only when program or renderer changes; other props go through
  // updateSettings below. Effects that configure the controller list
  // program/renderer as deps so they re-apply to a recreated one.
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const animation = createAnimation(
      program,
      {
        element,
        cols,
        rows,
        fps,
        frames,
        renderer,
        autoplay: !playOnVisible,
        reducedMotion: prefersReducedMotion(),
      },
      userData,
    )
    animationRef.current = animation
    startedByObserverRef.current = false
    pausedByObserverRef.current = false
    onReady?.(animation)

    return () => {
      animation.dispose()
      animationRef.current = null
    }
    // Deliberately keyed on program/renderer only (see above).
  }, [program, renderer])

  useEffect(() => {
    animationRef.current?.setUserData(userData)
  }, [userData])

  // Props override the program's settings. A removed prop falls back to the
  // program's value, then the engine default (0 = follow the element for
  // cols/rows, endless for frames), since updateSettings ignores undefined.
  useEffect(() => {
    const s = program.settings
    animationRef.current?.updateSettings({
      cols: cols ?? s?.cols ?? 0,
      rows: rows ?? s?.rows ?? 0,
      fps: fps ?? s?.fps ?? DEFAULT_FPS,
      frames: frames ?? s?.frames ?? 0,
    })
  }, [program, renderer, cols, rows, fps, frames])

  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const query = matchMedia(REDUCED_MOTION_QUERY)
    const apply = () =>
      animationRef.current?.updateSettings({ reducedMotion: query.matches })
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!playOnVisible) return
    if (!container || typeof IntersectionObserver === 'undefined') {
      // jsdom / older WebViews: play rather than never start.
      animationRef.current?.play()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        const animation = animationRef.current
        if (!animation) return
        if (entry.isIntersecting && entry.intersectionRatio >= visibleThreshold) {
          if (!startedByObserverRef.current || pausedByObserverRef.current) {
            startedByObserverRef.current = true
            pausedByObserverRef.current = false
            animation.play()
          }
        } else if (!entry.isIntersecting && animation.playing) {
          pausedByObserverRef.current = true
          animation.pause()
        }
      },
      { threshold: [0, visibleThreshold, 1] },
    )
    // observe() reports the current intersection, so a recreated controller
    // that's already on screen starts playing.
    observer.observe(container)
    return () => observer.disconnect()
  }, [program, renderer, playOnVisible, visibleThreshold])

  const gridCols = cols ?? program.settings?.cols
  const gridRows = rows ?? program.settings?.rows
  const isCanvas = renderer === 'canvas'
  const showSpacer = !isCanvas && !!gridCols && !!gridRows

  // Output is an image of text, not an <img>.
  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label={alt}
      style={{ display: 'grid' }}
    >
      {showSpacer && (
        <pre
          aria-hidden
          style={{
            gridArea: '1 / 1',
            visibility: 'hidden',
            margin: 0,
            // Match the engine's styles on the real <pre> so the sizes agree.
            fontStretch: 'normal',
            fontKerning: 'none',
            fontVariantLigatures: 'none',
          }}
        >
          {('.'.repeat(gridCols) + '\n').repeat(gridRows).trimEnd()}
        </pre>
      )}
      {isCanvas ? (
        <canvas
          ref={elementRef as React.RefObject<HTMLCanvasElement>}
          style={{ gridArea: '1 / 1' }}
        />
      ) : (
        <pre
          ref={elementRef as React.RefObject<HTMLPreElement>}
          style={{ gridArea: '1 / 1', margin: 0 }}
        />
      )}
    </div>
  )
}
