/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { DirectionRightIcon } from '@/icons/react'
import { type DocumentSection, parse } from '@oxide/react-asciidoc'
import * as Accordion from '@radix-ui/react-accordion'
import cn from 'classnames'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { stripAnchors } from './Section'

export function useIntersectionObserver(
  elements: Element[],
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit,
) {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null)

  // Create the observer in an effect so we can tear it down when this unmounts
  useEffect(() => {
    const observer = new IntersectionObserver(callback, options)
    setObserver(observer)

    return () => {
      observer.disconnect()
    }
  }, [callback, options])

  // Bind the elements that should be listened for
  useEffect(() => {
    if (observer) {
      for (const element of elements) {
        observer.observe(element)
      }
    }

    return () => {
      if (observer) {
        for (const element of elements) {
          observer.unobserve(element)
        }
      }
    }
  }, [elements, observer])

  return observer
}

// Create threshold steps that trigger intersection events every 0.05%. This is needed to provide
// decent measurements on very tall elements. In the future we could instead compute the needed
// thresholds on a per element basis so that we are measuring per pixel instead of per percent.
const THRESHOLD = [...Array(2000).keys()].map((n) => n / 2000)

function isTopLevelSection(element: Element): boolean {
  return element.classList.contains('sect1')
}

// Uses the asciidoc generated classes to find the closest section wrapping parent element
function findParentSection(element: Element): Element | null {
  const sect2Wrapper = element.closest('.sect2')
  return sect2Wrapper ? sect2Wrapper : element.closest('.sect1')
}

function newSection(
  node: number,
  element: Element,
  wrapper: Element,
  parent: number | null,
): Section {
  return {
    node,
    element,
    wrapper,
    parent,
    children: [],
  }
}

function buildSectionTree(elements: Element[]): Section[] {
  const sections = []
  let parent = null

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]
    const parentWrapper = findParentSection(element)

    if (parentWrapper) {
      if (parentWrapper && isTopLevelSection(parentWrapper)) {
        const section = newSection(i, element, parentWrapper, null)
        sections.push(section)
        parent = section
      } else {
        if (parent === null) {
          // Fail to construct a tree if the provided elements are invalid
          return []
        } else {
          const section = newSection(i, element, parentWrapper, parent.node)
          parent.children.push(i)
          sections.push(section)
        }
      }
    } else {
      // Fail to construct a tree if the provided elements are invalid
      return []
    }
  }

  return sections
}

function maxIndex(nums: number[]): number | undefined {
  return nums.reduce<number | undefined>((maxIndex, current, currentIndex) => {
    const currentMax = maxIndex !== undefined ? nums[maxIndex] : 0
    return current > currentMax ? currentIndex : maxIndex
  }, undefined)
}

type Section = {
  node: number
  element: Element
  wrapper: Element
  parent: number | null
  children: number[]
}
// This hook will call the provided callback whenever a section that is identified by a heading is
// determined to be "active". A section is considered to be the "active" section when covers more
// space of the specified measuring area than any other section.
export function useActiveSectionTracking(
  initialSections: Element[],
  onSectionChange: (element: Element) => void,
  debug = false,
) {
  // Construct a tree in the form of a basic array that will allow for traversing between parent
  // an child nodes quickly
  const [sectionWrappers, setSectionWrappers] = useState<Section[]>(
    buildSectionTree(initialSections),
  )

  // Internally we need to track the coverage percentage for each element without triggering
  // renders
  const sectionMeasurements = useRef<number[]>([])

  // The caller only provides the hook with section headers and so we need to map those to their
  // relevant containing sections
  const setSections = useCallback(
    (sections: Element[]) => {
      setSectionWrappers(buildSectionTree(sections))

      // When sections change we need to also zero out our section visibility measurements
      sectionMeasurements.current = []
    },
    [setSectionWrappers],
  )

  // Create the section tracker
  const wrapperActivator = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      // For each observed element that has interacted with our intersection window we want to
      // compute and record the percentage of space that is covered by the element. This work is all
      // performed off of the main thread
      for (const entry of entries) {
        // Find where in our list of section wrapper elements the entry that changed is
        const index = sectionWrappers.findIndex((node) => node.wrapper === entry.target)

        // We are only trying to detect vertical scroll changes and therefore only need to use the
        // heigh to compute the coverage percentage
        const covered = entry.intersectionRect.height / (entry.rootBounds?.height || 1)
        sectionMeasurements.current[index] = covered
      }

      // For each section element, compute the amount of space that is "owned" by that element. In
      // this check, space is considered "owned" by the element furthest down the tree.
      //
      // Example:
      //   A parent element covers 70% of the measured space. This element has two child elements,
      //   one that covers 30%, and another that covers 25%. In this case both of the child elements
      //   own their respective spaces, and the parent owns 15% (70 - (30 + 25)) of the space.
      //
      // Because we are only trying to determine the space owned by a single element, we do not need
      // to traverse further than that elements direct descendants
      const ownedSectionSizes = sectionWrappers.map((section) => {
        const childSizes = section.children
          .map((c) => sectionMeasurements.current[c])
          .reduce((c, a) => c + a, 0)
        return sectionMeasurements.current[section.node] - childSizes
      })

      // Now that we have a list of how much of the measured space each element takes up, we simply
      // find the element that is taking up the most space, and assign it to be the current section
      const activeSectionIndex = maxIndex(ownedSectionSizes)

      if (activeSectionIndex !== undefined) {
        onSectionChange(sectionWrappers[activeSectionIndex].element)
      }
    },
    [sectionWrappers, onSectionChange],
  )

  // Define our measurement area. This space is relative to the root element (i.e. the screen). It
  // is a band that starts at 5% down from the top, and ends at 80% up from the bottom of the
  // screen.
  const wrapperSettings = useMemo(
    () => ({ threshold: THRESHOLD, rootMargin: `-15% 0px -70% 0px` }),
    [],
  )

  // We need to ensure that we are only sending valid sections to be observed
  const bindableWrappers = useMemo(
    () => sectionWrappers.map((s) => s.wrapper),
    [sectionWrappers],
  )

  // Generate the intersection observer based on the above configuration
  const sectionObserver = useIntersectionObserver(
    bindableWrappers,
    wrapperActivator,
    wrapperSettings,
  )

  let debugNode = null
  if (debug && sectionObserver?.root === null) {
    // Parse and invert the margins
    const edges = sectionObserver.rootMargin.split(' ').map((margin) => {
      if (margin.endsWith('%')) {
        return parseInt(margin) * -1 + '%'
      } else if (margin.endsWith('px')) {
        return parseInt(margin) * -1 + 'px'
      } else {
        return '0px'
      }
    })

    debugNode = (
      <div
        style={{
          position: 'fixed',
          top: edges[0],
          right: edges[1],
          bottom: edges[2],
          left: edges[3],
          background: 'rgba(255, 92, 170, 0.2)',
          border: '1px solid rgba(255, 92, 170)',
          pointerEvents: 'none',
          zIndex: 500,
        }}
      />
    )
  }

  return {
    setSections,
    debugNode,
  }
}

export const DesktopOutline = ({
  toc,
  activeItem,
  className,
}: {
  toc: DocumentSection[]
  activeItem: string
  className?: string
}) => {
  const renderToc = (sections: DocumentSection[]) => {
    return sections.map((item) => (
      <Fragment key={item.id}>
        <li
          data-level={item.level}
          className={cn('mb-0 list-none text-sans-sm', item.level > 2 && 'hidden')}
        >
          <a
            href={`#${item.id}`}
            className={cn(
              'block border-l py-[4px] pr-4',
              activeItem === item.id
                ? 'active text-accent-secondary border-accent-secondary hover:text-accent'
                : 'text-tertiary border-secondary hover:text-secondary',
            )}
            style={{
              paddingLeft: `${0.5 + item.level * 0.5}rem`,
            }}
          >
            {parse(stripAnchors(item.title))}
          </a>
        </li>
        {item.sections && renderToc(item.sections)}
      </Fragment>
    ))
  }

  if (toc && toc.length > 0) {
    return <ul className={cn('toc w-[--toc-width]', className)}>{renderToc(toc)}</ul>
  }

  return null
}
export const SmallScreenOutline = ({
  toc,
  activeItem,
  className,
}: {
  toc: DocumentSection[]
  activeItem: string
  className?: string
}) => {
  const [value, setValue] = useState('')

  const renderToc = (sections: DocumentSection[]) => {
    return sections.map((item) => (
      <Fragment key={item.id}>
        <li
          data-level={item.level}
          className={cn('list-none text-sans-sm', item.level > 2 && 'hidden')}
        >
          <a
            href={`#${item.id}`}
            onClick={() => setValue('')}
            className={cn(
              'block border-l py-[4px]',
              activeItem === item.id
                ? 'active text-accent-secondary border-accent-secondary hover:text-accent'
                : 'text-tertiary border-secondary hover:text-secondary',
            )}
            style={{
              paddingLeft: `${0.5 + item.level * 0.5}rem`,
            }}
          >
            {parse(stripAnchors(item.title))}
          </a>
        </li>
        {item.sections && renderToc(item.sections)}
      </Fragment>
    ))
  }

  if (toc && toc.length > 0) {
    return (
      <Accordion.Root
        type="single"
        className={cn(
          'toc sticky top-[calc(var(--header-height)-1px)] z-10 -mt-px mb-10 block w-full border-b border-t bg-default border-secondary print:hidden',
          className,
        )}
        collapsible
        value={value}
        onValueChange={setValue}
      >
        <Accordion.Item value="toc">
          <Accordion.Header>
            <Accordion.Trigger className="flex h-12 w-full items-center justify-between text-sans-md text-default hover:bg-hover px-[--container-px] [&>svg]:data-[state=open]:rotate-90">
              Table of Contents{' '}
              <DirectionRightIcon className="transition-all text-tertiary" />
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Content className="animated-accordion hydrated max-h-[60vh] overflow-y-scroll w-full border-t border-secondary px-[--container-px]">
            <div className="py-4">{renderToc(toc)}</div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    )
  }

  return null
}
