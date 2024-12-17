/**
 * MIT License
 *
 * Copyright (c) React Training LLC 2015-2021
 * Copyright (c) Shopify Inc. 2022-2023
 * From https://github.com/remix-run/react-router-website/blob/main/app/ui/delegate-markdown-links.ts
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */
import { useNavigate } from '@remix-run/react'
import { useEffect } from 'react'

// Converts regular AsciiDoc a tags and makes them React Routery
// Added key so that this is reloaded when the user routes from one document to another directly
function useDelegatedReactRouterLinks(nodeRef: React.RefObject<HTMLElement>, key: string) {
  const navigate = useNavigate()

  useEffect(() => {
    const node = nodeRef.current
    const handler = (event: MouseEvent) => {
      if (!nodeRef.current) return

      if (!(event.target instanceof HTMLElement)) return

      const a = event.target.closest('a')

      if (
        a && // is anchor or has anchor parent
        a.hasAttribute('href') && // has an href
        a.host === window.location.host && // is internal
        event.button === 0 && // left click
        (!a.target || a.target === '_self') && // Let browser handle "target=_blank" etc.
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) // not modified
      ) {
        event.preventDefault()
        const { pathname, search, hash } = a
        navigate({ pathname, search, hash })
      }
    }

    if (!node) return
    node.addEventListener('click', handler)

    return () => {
      node?.removeEventListener('click', handler)
    }
  }, [navigate, nodeRef, key])
}

export { useDelegatedReactRouterLinks }
