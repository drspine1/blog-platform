'use client'

import { useEffect, useState, useCallback } from 'react'
import type { SearchIndexPayload, SearchDocument } from '@/lib/search-index'
import lunr from 'lunr'

export function useSearch() {
  const [index, setIndex] = useState<lunr.Index | null>(null)
  const [documents, setDocuments] = useState<SearchDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load the search index on mount
  useEffect(() => {
    const loadSearchIndex = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/search-index')
        if (!response.ok) throw new Error('Failed to load search index')

        const data: SearchIndexPayload = await response.json()
        setDocuments(data.documents)

        // Load Lunr index from serialised JSON
        const lunrIndex = lunr.Index.load(JSON.parse(data.index))
        setIndex(lunrIndex)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    loadSearchIndex()
  }, [])

  // Search function with 300ms debounce
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchDocument[]>([])

  useEffect(() => {
    if (!index || !query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      try {
        const hits = index.search(query)
        const matched = hits
          .map((hit) => documents.find((doc) => doc.slug === hit.ref))
          .filter((doc): doc is SearchDocument => doc !== undefined)
        setResults(matched)
      } catch {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, index, documents])

  const search = useCallback((q: string) => {
    setQuery(q)
  }, [])

  return {
    search,
    results,
    isLoading,
    error,
    documents,
  }
}
