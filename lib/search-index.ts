import { getAllPostMetadata } from './posts'
import lunr from 'lunr'

export interface SearchDocument {
  id: string
  title: string
  excerpt: string
  category: string
  author: string
  tags: string
  slug: string
}

export interface SearchIndexPayload {
  documents: SearchDocument[]
  index: string
}

let _cachedPayload: SearchIndexPayload | null = null

/**
 * Build the search index once and cache it for subsequent calls.
 */
export function getOrBuildSearchIndex(): SearchIndexPayload {
  if (_cachedPayload) {
    return _cachedPayload
  }

  const posts = getAllPostMetadata()

  const documents: SearchDocument[] = posts.map((post) => ({
    id: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    author: post.author,
    tags: post.tags.join(' '),
    slug: post.slug,
  }))

  const idx = lunr(function () {
    this.ref('slug')
    this.field('title', { boost: 10 })
    this.field('tags', { boost: 7 })
    this.field('excerpt', { boost: 5 })
    this.field('category', { boost: 3 })
    this.field('author')

    documents.forEach((doc) => {
      this.add(doc)
    })
  })

  _cachedPayload = {
    documents,
    index: JSON.stringify(idx.toJSON()),
  }

  return _cachedPayload
}

/**
 * Search posts using the cached Lunr index.
 */
export function searchPosts(query: string): SearchDocument[] {
  const { documents, index } = getOrBuildSearchIndex()
  const idx = lunr.Index.load(JSON.parse(index))

  try {
    const results = idx.search(query)
    return results
      .map((result) => documents.find((doc) => doc.slug === result.ref))
      .filter((doc): doc is SearchDocument => doc !== undefined)
  } catch {
    return []
  }
}
