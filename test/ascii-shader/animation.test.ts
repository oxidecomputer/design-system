// @vitest-environment jsdom
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { createAnimation, type AsciiAnimation } from '../src/animation.js'
import type { Context, Program, Settings } from '../src/types.js'

/**
 * Deterministic rAF + clock harness. The engine schedules everything through
 * requestAnimationFrame and measures time with performance.now(); replacing
 * both lets tests advance playback tick by tick.
 */
let now = 0
let nextRafId = 1
let rafQueue = new Map<number, FrameRequestCallback>()

/** Advance the clock by `ms` and fire the pending rAF callbacks once. */
function tick(ms = 0) {
  now += ms
  const callbacks = [...rafQueue.values()]
  rafQueue.clear()
  for (const cb of callbacks) cb(now)
}

/** Resolve `ready`, driving any rAF-based font waits that may be pending. */
async function boot(animation: AsciiAnimation) {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve()
    tick(0)
  }
  await animation.ready
}

let element: HTMLPreElement
let animations: AsciiAnimation[]

function animate(program: Program, settings: Partial<Settings> = {}, userData?: unknown) {
  const animation = createAnimation(program, { element, ...settings }, userData)
  animations.push(animation)
  return animation
}

/** A tiny program that renders its frame number and counts renders. */
function frameStamp() {
  const renders: number[] = []
  return {
    renders,
    program: {
      main({ index }: { index: number }, context: Context): string {
        if (index === 0) renders.push(context.frame)
        return String(context.frame % 10)
      },
    } satisfies Program,
  }
}

beforeEach(() => {
  now = 0
  nextRafId = 1
  rafQueue = new Map()
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    rafQueue.set(nextRafId, cb)
    return nextRafId++
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    rafQueue.delete(id)
  })
  vi.stubGlobal('performance', { now: () => now })
  element = document.createElement('pre')
  element.style.fontSize = '16px'
  element.style.lineHeight = '20px'
  document.body.appendChild(element)
  animations = []
})

afterEach(() => {
  for (const animation of animations) animation.dispose()
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// fps: 10 → one frame every 100ms, a convenient beat for tests.
const base = { cols: 4, rows: 2, fps: 10, autoplay: false }

describe('boot', () => {
  test('throws synchronously when element is missing', () => {
    expect(() => createAnimation({}, {} as Settings)).toThrow(/element is required/)
  })

  test('renders frame 0 synchronously at boot even when not autoplaying', async () => {
    const { program, renders } = frameStamp()
    const animation = animate(program, base)
    await boot(animation)

    expect(animation.playing).toBe(false)
    expect(renders).toEqual([0])
    expect(animation.text()).toBe('0000\n0000')
  })

  test('program.boot receives a sized buffer', async () => {
    let bootLength = -1
    const animation = animate(
      {
        boot(context, buffer) {
          bootLength = buffer.length
          expect(context.cols).toBe(4)
          expect(context.rows).toBe(2)
        },
      },
      base
    )
    await boot(animation)
    expect(bootLength).toBe(8)
  })

  test('emits boot then frame', async () => {
    const events: string[] = []
    const animation = animate({}, base)
    animation.on('boot', () => events.push('boot'))
    animation.on('frame', () => events.push('frame'))
    await boot(animation)
    expect(events).toEqual(['boot', 'frame'])
  })

  test('autoplay starts playback after boot', async () => {
    const animation = animate({}, { ...base, autoplay: true })
    await boot(animation)
    expect(animation.playing).toBe(true)
  })
})

describe('settings', () => {
  test('precedence: defaults < run settings < program settings', async () => {
    const animation = animate({ settings: { fps: 60 } }, { ...base, fps: 10, frames: 50 })
    const settings = animation.getSettings()
    expect(settings.fps).toBe(60) // program wins over run settings
    expect(settings.frames).toBe(50) // run settings win over defaults
    expect(settings.loop).toBe(true) // default preserved
  })

  test('explicitly-undefined keys do not clobber defaults', async () => {
    const animation = animate({ settings: { fps: undefined } }, { ...base, fps: undefined })
    expect(animation.getSettings().fps).toBe(30)
  })
})

describe('playback', () => {
  test('advances one frame per elapsed interval', async () => {
    const { program, renders } = frameStamp()
    const animation = animate(program, base)
    await boot(animation)

    animation.play()
    tick(100)
    tick(100)
    tick(100)

    expect(animation.frame).toBe(3)
    expect(renders).toEqual([0, 1, 2, 3])
  })

  test('the fps gate holds frames back and frame events fire only on renders', async () => {
    const frames: number[] = []
    const animation = animate({}, base)
    await boot(animation)
    animation.on('frame', (frame) => frames.push(frame))

    animation.play()
    tick(50) // below the 100ms interval: no render, no event
    expect(animation.frame).toBe(0)
    expect(frames).toEqual([])

    tick(50) // interval reached
    expect(animation.frame).toBe(1)
    expect(frames).toEqual([1])
  })

  test('pause stops advancing; play resumes without counting paused time', async () => {
    const animation = animate({}, base)
    await boot(animation)

    animation.play()
    tick(100)
    expect(animation.frame).toBe(1)

    animation.pause()
    tick(100)
    tick(100)
    expect(animation.frame).toBe(1)

    animation.play()
    // The beat is re-baselined at play(): a due tick needs a full interval.
    tick(50)
    expect(animation.frame).toBe(1)
    tick(50)
    expect(animation.frame).toBe(2)
  })

  test('play/pause events fire once per transition', async () => {
    const events: string[] = []
    const animation = animate({}, base)
    await boot(animation)
    animation.on('play', () => events.push('play'))
    animation.on('pause', () => events.push('pause'))

    animation.play()
    animation.play() // no-op
    animation.pause()
    animation.pause() // no-op
    animation.toggle()
    animation.toggle(false)
    expect(events).toEqual(['play', 'pause', 'play', 'pause'])
  })

  test('repeated play/seek calls never stack rAF chains', async () => {
    const { program, renders } = frameStamp()
    const animation = animate(program, base)
    await boot(animation)

    animation.play()
    animation.play()
    animation.seek(0)
    animation.seek(0)
    animation.updateSettings({ fps: 10 })
    expect(rafQueue.size).toBe(1)

    renders.length = 0
    tick(100)
    // One tick renders exactly once, and only one follow-up is scheduled.
    expect(renders.length).toBe(1)
    expect(rafQueue.size).toBe(1)
  })

  test('context.time accumulates only while playing, capped per tick', async () => {
    let lastTime = -1
    const animation = animate(
      {
        post(context) {
          lastTime = context.time
        },
      },
      base
    )
    await boot(animation)
    expect(lastTime).toBe(0)

    animation.play()
    tick(100)
    expect(lastTime).toBe(100)

    // A backgrounded-tab-sized gap is capped at 1000ms.
    tick(5000)
    expect(lastTime).toBe(1100)

    // Paused seeks render but do not advance time.
    animation.pause()
    animation.seek(0)
    tick(500)
    expect(lastTime).toBe(1100)
  })

  test('context.time does not overrun when rAF ticks sit off the interval beat', async () => {
    // Regression: the loop keeps the beat by leaving elapsed % interval in
    // lastTick for the next tick — playTime must not also count it, or time
    // accumulates the remainder twice per frame and runs fast (a 60fps
    // animation on a ~60Hz display drifted to ~1.5× wall-clock speed).
    let lastTime = -1
    const animation = animate(
      {
        post(context) {
          lastTime = context.time
        },
      },
      base // fps 10 → 100ms interval
    )
    await boot(animation)
    animation.play()

    // 90ms rAF ticks: every render is due after 180/170/… elapsed, always
    // carrying a large remainder into the next beat.
    for (let i = 0; i < 20; i++) tick(90)

    // 1800ms of wall time at 10fps consumes exactly frame × 100ms of beat
    // (the old accounting summed the raw elapsed values → 2520ms).
    expect(animation.frame).toBe(18)
    expect(lastTime).toBe(1800)
  })
})

describe('seeking', () => {
  test('paused seeks render immediately, bypassing the fps gate', async () => {
    const { program, renders } = frameStamp()
    const animation = animate(program, base)
    await boot(animation)
    renders.length = 0

    animation.seek(5)
    tick(0) // no time passes at all — the render must still happen
    expect(renders).toEqual([5])
    expect(animation.frame).toBe(5)
    expect(animation.playing).toBe(false)

    // Rapid scrubbing: every seek renders even though 0ms elapsed.
    animation.seek(6)
    tick(0)
    animation.seek(7)
    tick(0)
    expect(renders).toEqual([5, 6, 7])
  })

  test('seek wraps into [0, frames) when a loop length is set', async () => {
    const animation = animate({}, { ...base, frames: 10 })
    await boot(animation)

    animation.seek(-1)
    tick(0)
    expect(animation.frame).toBe(9)

    animation.seek(15)
    tick(0)
    expect(animation.frame).toBe(5)
  })

  test('step seeks relative to the current frame', async () => {
    const animation = animate({}, { ...base, frames: 10 })
    await boot(animation)

    animation.step()
    tick(0)
    expect(animation.frame).toBe(1)
    animation.step(-2)
    tick(0)
    expect(animation.frame).toBe(9)
  })

  test('a seek never advances the frame on a due playing tick', async () => {
    const animation = animate({}, base)
    await boot(animation)
    animation.play()
    tick(100)
    expect(animation.frame).toBe(1)

    // Seek right before a tick that would otherwise be due: the seeked
    // frame must render as-is, not frame+1.
    now += 99
    animation.seek(7)
    tick(1)
    expect(animation.frame).toBe(7)
  })
})

describe('non-looping playback', () => {
  test('stops on the last frame and emits pause + ended', async () => {
    const events: string[] = []
    const animation = animate({}, { ...base, frames: 3, loop: false, autoplay: true })
    await boot(animation)
    animation.on('pause', () => events.push('pause'))
    animation.on('ended', () => events.push('ended'))

    tick(100) // frame 1
    tick(100) // frame 2 (last)
    expect(events).toEqual([])

    tick(100) // would advance past the end → stops
    expect(animation.frame).toBe(2)
    expect(animation.playing).toBe(false)
    expect(events).toEqual(['pause', 'ended'])

    tick(100)
    expect(animation.frame).toBe(2)
  })

  test('looping wraps back to frame 0', async () => {
    const animation = animate({}, { ...base, frames: 3, autoplay: true })
    await boot(animation)

    tick(100)
    tick(100)
    expect(animation.frame).toBe(2)
    tick(100)
    expect(animation.frame).toBe(0)
    expect(animation.playing).toBe(true)
  })
})

describe('updateSettings', () => {
  test('fps changes take effect without recreating the animation', async () => {
    const animation = animate({}, base)
    await boot(animation)
    animation.play()
    tick(0) // absorb the update-triggered needsRender render

    tick(100)
    expect(animation.frame).toBe(1)

    animation.updateSettings({ fps: 100 })
    tick(0)
    tick(10)
    expect(animation.frame).toBe(2)
    tick(10)
    expect(animation.frame).toBe(3)
  })

  test('undefined values in a patch are ignored', async () => {
    const animation = animate({}, base)
    await boot(animation)
    animation.play()

    animation.updateSettings({ fps: undefined, frames: undefined })
    tick(0)
    expect(animation.getSettings().fps).toBe(10)
    tick(100) // a NaN interval would never be due again
    expect(animation.frame).toBe(1)
  })

  test('shrinking frames reclamps the current frame and re-renders while paused', async () => {
    const { program, renders } = frameStamp()
    const animation = animate(program, { ...base, frames: 100 })
    await boot(animation)
    animation.seek(50)
    tick(0)
    renders.length = 0

    animation.updateSettings({ frames: 10 })
    tick(0)
    expect(animation.frame).toBe(0) // 50 wrapped into [0, 10)
    expect(renders).toEqual([0])
  })

  test('grid changes resize the buffer on the next render', async () => {
    const animation = animate({}, base)
    await boot(animation)
    expect(animation.getBuffer().length).toBe(8)

    animation.updateSettings({ cols: 3, rows: 3 })
    tick(0)
    expect(animation.getBuffer().length).toBe(9)
    expect(animation.text()).toBe('   \n   \n   ')
  })
})

describe('renderFrame', () => {
  test('renders synchronously for export without touching playback', async () => {
    const { program, renders } = frameStamp()
    const animation = animate(program, base)
    await boot(animation)
    renders.length = 0

    animation.renderFrame(42)
    expect(renders).toEqual([42])
    expect(animation.text()).toBe('2222\n2222')
    expect(animation.playing).toBe(false)
    expect(rafQueue.size).toBe(0) // nothing scheduled
  })

  test('is a no-op before boot completes', () => {
    const { program, renders } = frameStamp()
    const animation = animate(program, base)
    animation.renderFrame(5)
    expect(renders).toEqual([])
  })
})

describe('program hooks and userData', () => {
  test('pre/main/post run in order with the same userData', async () => {
    const calls: string[] = []
    const data = { marker: 'a' }
    const animation = animate(
      {
        pre: (_c, _cursor, _b, userData) => calls.push(`pre:${userData.marker}`),
        main: () => {
          if (calls[calls.length - 1] !== 'main') calls.push('main')
          return '.'
        },
        post: (_c, _cursor, _b, userData) => calls.push(`post:${userData.marker}`),
      },
      base,
      data
    )
    await boot(animation)
    expect(calls).toEqual(['pre:a', 'main', 'post:a'])
  })

  test('setUserData swaps the object for subsequent renders', async () => {
    const seen: string[] = []
    const animation = animate(
      { post: (_c, _cursor, _b, userData) => seen.push(userData.marker) },
      base,
      { marker: 'first' }
    )
    await boot(animation)
    animation.setUserData({ marker: 'second' })
    animation.seek(1)
    tick(0)
    expect(seen).toEqual(['first', 'second'])
  })

  test('pointer events dispatch to same-named program hooks on the next render', async () => {
    const hooks: string[] = []
    const animation = animate(
      {
        pointerDown: () => hooks.push('down'),
        pointerUp: () => hooks.push('up'),
        pointerMove: () => hooks.push('move'),
      },
      { ...base, autoplay: true }
    )
    await boot(animation)

    element.dispatchEvent(new Event('pointerdown'))
    window.dispatchEvent(new Event('pointerup'))
    const move = new Event('pointermove')
    Object.assign(move, { clientX: 8, clientY: 4 })
    element.dispatchEvent(move)

    tick(100)
    expect(hooks).toEqual(['down', 'up', 'move'])
  })
})

describe('dispose', () => {
  test('cancels the loop, removes listeners, and clears the renderer', async () => {
    const elementRemove = vi.spyOn(element, 'removeEventListener')
    const windowRemove = vi.spyOn(window, 'removeEventListener')
    let cleaned = false
    const animation = animate(
      { main: () => '#', cleanup: () => (cleaned = true) },
      { ...base, autoplay: true }
    )
    await boot(animation)
    expect(animation.text()).toBe('####\n####')

    animation.dispose()
    expect(rafQueue.size).toBe(0)
    expect(element.innerHTML).toBe('')
    expect(cleaned).toBe(true)
    expect(elementRemove).toHaveBeenCalledWith('pointermove', expect.any(Function))
    expect(elementRemove).toHaveBeenCalledWith('pointerdown', expect.any(Function))
    expect(windowRemove).toHaveBeenCalledWith('pointerup', expect.any(Function))

    // Playback controls are inert afterwards.
    animation.play()
    expect(animation.playing).toBe(false)
    expect(rafQueue.size).toBe(0)
  })

  test('disposing before boot completes prevents the boot render', async () => {
    const { program, renders } = frameStamp()
    const animation = animate(program, base)
    animation.dispose()
    await boot(animation)
    expect(renders).toEqual([])
  })
})

describe('events', () => {
  test('on() returns an unsubscribe function', async () => {
    const frames: number[] = []
    const animation = animate({}, base)
    await boot(animation)
    const off = animation.on('frame', (frame) => frames.push(frame))

    animation.seek(1)
    tick(0)
    off()
    animation.seek(2)
    tick(0)
    expect(frames).toEqual([1])
  })
})
