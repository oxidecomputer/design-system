/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useRef } from 'react'

import { createAnimation, type AsciiAnimation } from './animation.js'
import type { Program } from './types.js'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia(REDUCED_MOTION_QUERY).matches

export interface AsciiAnimationProps {
  program: Program
  /** Override the program's grid (e.g. a smaller grid on mobile). */
  cols?: number
  rows?: number
  fps?: number
  frames?: number
  renderer?: 'text' | 'canvas'
  /**
   * Play only while the element is on screen (default true). The animation
   * starts once at least `visibleThreshold` of it is visible and pauses when
   * it leaves the viewport.
   */
  playOnVisible?: boolean
  /** Intersection ratio required to start playing. Default 0.25. */
  visibleThreshold?: number
  className?: string
  /** Accessible description of the animation. */
  alt?: string
  /** Passed as the last argument to every program function. */
  userData?: unknown
  /** Access the controller (seek, events, export) after mount. */
  onReady?: (animation: AsciiAnimation) => void
}

/**
 * Mounts a program into a <pre> (text renderer) or <canvas>. When cols/rows
 * are known and the text renderer is used, an invisible spacer <pre> reserves
 * the exact final size so the font-loading boot delay causes no layout shift.
 *
 * Honors prefers-reduced-motion by setting `settings.reducedMotion`, which
 * programs are expected to branch on (e.g. jump to their final state).
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
  const animationRef = useRef<AsciiAnimation | null>(null)
  // Visibility-playback bookkeeping: whether the observer has started playback
  // yet, and whether the current pause is the observer's own doing (so it may
  // undo it) rather than a controller pause or a `loop: false` ending.
  const startedByObserverRef = useRef(false)
  const pausedByObserverRef = useRef(false)

  // (Re)create the animation when the program or renderer changes (the
  // renderer decides which DOM element is mounted). Everything else is pushed
  // in via updateSettings so a prop tweak doesn't re-boot the program.
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
      userData
    )
    animationRef.current = animation
    startedByObserverRef.current = false
    pausedByObserverRef.current = false
    onReady?.(animation)

    return () => {
      animation.dispose()
      animationRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, renderer])

  // Keep the program's userData in sync with the prop.
  useEffect(() => {
    animationRef.current?.setUserData(userData)
  }, [userData])

  // Live-update the grid/timing overrides without recreating the animation.
  useEffect(() => {
    animationRef.current?.updateSettings({ cols, rows, fps, frames })
  }, [cols, rows, fps, frames])

  // Track prefers-reduced-motion for the lifetime of the mount.
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const query = matchMedia(REDUCED_MOTION_QUERY)
    const apply = () =>
      animationRef.current?.updateSettings({ reducedMotion: query.matches })
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  // Visibility-gated playback.
  useEffect(() => {
    const container = containerRef.current
    if (!playOnVisible) return
    if (!container || typeof IntersectionObserver === 'undefined') {
      // No way to observe visibility (jsdom, older WebViews) — play
      // immediately rather than never starting.
      animationRef.current?.play()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        const animation = animationRef.current
        if (!animation) return
        if (entry.isIntersecting && entry.intersectionRatio >= visibleThreshold) {
          // Only start playback once, or undo the observer's own pause —
          // never override a controller pause or an ended animation.
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
      { threshold: [0, visibleThreshold, 1] }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [playOnVisible, visibleThreshold])

  const gridCols = cols ?? program.settings?.cols
  const gridRows = rows ?? program.settings?.rows
  const isCanvas = renderer === 'canvas'
  const showSpacer = !isCanvas && !!gridCols && !!gridRows

  // The rendered output is an image of text, not an <img> — role="img" on
  // the wrapper is the correct semantics for AT.
  /* oxlint-disable jsx-a11y/prefer-tag-over-role */
  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label={alt}
      style={{ display: 'grid' }}
    >
      {showSpacer && (
        <pre aria-hidden style={{ gridArea: '1 / 1', visibility: 'hidden', margin: 0 }}>
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
