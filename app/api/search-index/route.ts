import { getOrBuildSearchIndex } from '@/lib/search-index'
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

/**
 * GET /api/search-index
 * Returns the pre-built search index for client-side search.
 * Generated at build time and served as a static file.
 */
export async function GET() {
  try {
    const payload = getOrBuildSearchIndex()

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, max-age=86400, immutable',
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error building search index:', error)
    return NextResponse.json(
      { error: 'Failed to build search index' },
      { status: 500 }
    )
  }
}
