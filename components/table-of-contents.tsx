'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap, prefersReducedMotion } from '@/lib/gsap'

export interface Heading {
  id: string
  level: number
  text: string
}

interface TableOfContentsProps {
  headings: Heading[]
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())

  useEffect(() => {
    if (headings.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-50px 0px -50px 0px' }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [headings])

  // Animate active link highlight when activeId changes
  useEffect(() => {
    if (!activeId || prefersReducedMotion()) return

    const activeLink = linkRefs.current.get(activeId)
    if (!activeLink) return

    gsap.fromTo(
      activeLink,
      { opacity: 0.5 },
      { opacity: 1, duration: 0.3, ease: 'power1.out' }
    )

    return () => {
      gsap.killTweensOf(activeLink)
    }
  }, [activeId])

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className="sticky top-20 bg-card border border-border rounded-lg p-4">
      <h3 className="font-bold text-sm mb-3 text-foreground">On this page</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}>
            <Link
              href={`#${heading.id}`}
              ref={(el) => {
                if (el) linkRefs.current.set(heading.id, el)
                else linkRefs.current.delete(heading.id)
              }}
              className={`transition-colors ${
                activeId === heading.id
                  ? 'text-accent font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
