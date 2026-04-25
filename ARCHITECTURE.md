# SEO Blog Platform - Architecture Documentation

## Overview

This is a production-ready SEO blog platform MVP built with Next.js 15, optimized for search engine visibility, performance, and scalability. The platform uses static generation where possible and client-side search for optimal performance.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Content**: Local markdown files with YAML frontmatter
- **Search**: Lunr.js (client-side full-text search)
- **SEO**: JSON-LD structured data, dynamic metadata, XML sitemap
- **Color System**: Modern Slate (grays/blacks) with Amber accents

## Project Structure

```
/vercel/share/v0-project/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Homepage with hero section
│   ├── globals.css              # Global styles + design tokens
│   ├── sitemap.ts               # Dynamic XML sitemap
│   ├── api/
│   │   └── search-index/        # Pre-built search index
│   ├── blog/
│   │   ├── page.tsx             # Blog listing page
│   │   └── [slug]/
│   │       └── page.tsx         # Individual post pages
│   ├── search/
│   │   └── page.tsx             # Search results page
│   ├── categories/
│   │   ├── page.tsx             # Categories overview
│   │   └── [slug]/
│   │       └── page.tsx         # Category detail pages
│   └── not-found.tsx            # 404 error page
├── components/                   # Reusable React components
│   ├── header.tsx               # Navigation header
│   ├── footer.tsx               # Site footer
│   ├── blog-card.tsx            # Blog post card
│   ├── related-posts.tsx        # Related posts section
│   └── table-of-contents.tsx    # Post TOC with scroll spy
├── lib/                          # Utility functions
│   ├── posts.ts                 # Post parsing and retrieval
│   ├── search-index.ts          # Lunr search index builder
│   └── seo.ts                   # SEO metadata generation
├── hooks/                        # React hooks
│   └── use-search.ts            # Search functionality hook
├── content/                      # Blog content
│   └── posts/                   # Markdown blog posts
│       ├── seo-fundamentals.md
│       ├── keyword-research-guide.md
│       ├── technical-seo-checklist.md
│       └── content-strategy-seo.md
├── public/
│   ├── robots.txt               # Search engine crawling rules
│   └── icon.svg                 # Site icon
└── Configuration Files
    ├── next.config.mjs          # Next.js configuration
    ├── tailwind.config.ts       # Tailwind CSS config
    ├── tsconfig.json            # TypeScript configuration
    └── package.json             # Dependencies

```

## Core Features

### 1. Content Management (Markdown-based)

All blog posts are stored as markdown files in `/content/posts/`. Each post includes YAML frontmatter with:

```yaml
---
title: Post Title
excerpt: Short description for preview
author: Author Name
date: 2024-01-01
readTime: 5
category: SEO
keywords: [keyword1, keyword2]
---
```

**File**: `/lib/posts.ts` - Handles parsing, validation, and retrieval of posts.

### 2. Search System (Client-side, Lunr.js)

The search system is fully client-side, meaning:
- No server queries needed for search
- Instant results with filtering
- Works offline once data is cached
- Pre-indexed at build time for performance

**Files**:
- `/lib/search-index.ts` - Builds Lunr index from posts
- `/app/api/search-index/route.ts` - Serves pre-built index
- `/hooks/use-search.ts` - React hook for search functionality
- `/app/search/page.tsx` - Search results UI

### 3. SEO Optimization

Comprehensive SEO features built in:

- **JSON-LD Structured Data**: Article schema for rich snippets
- **Dynamic Metadata**: Per-page title, description, OG tags
- **XML Sitemap**: Auto-generated from all posts and pages
- **Robots.txt**: Crawling guidelines for search engines
- **Meta Tags**: Proper OpenGraph, Twitter Card, viewport settings
- **Canonical URLs**: Prevents duplicate content issues

**Files**:
- `/lib/seo.ts` - Metadata generation and schema builders
- `/app/layout.tsx` - Root metadata configuration
- `/app/blog/[slug]/page.tsx` - Post-level metadata

### 4. Navigation & Discovery

- **Header**: Global navigation with search link
- **Blog Listing**: Paginated view of all posts
- **Categories**: Organize posts by topic
- **Related Posts**: Contextual discovery on post pages
- **Table of Contents**: Auto-generated post outline with scroll spy

### 5. Design System

**Color Palette** (Modern Slate + Amber):
- Light mode: Off-white background, slate grays, amber accents
- Dark mode: Deep slate/charcoal, bright amber accents
- All colors defined as CSS custom properties in `/app/globals.css`

**Typography**:
- Headings: Font family defined in theme
- Body: Clean sans-serif with 1.5 line height
- Code: Monospace with syntax highlighting

## Scalability Path

### Current (MVP - Markdown)
- Perfect for up to 500 posts
- Static generation = blazing fast
- No database needed
- SEO optimized

### Scale to 1000+ posts
1. Migrate to Supabase PostgreSQL database
2. Add server-side pagination
3. Keep client-side search with sync mechanism
4. Add admin dashboard for content management

### Enterprise Scale
1. Elasticsearch for full-text search
2. CDN for global distribution
3. Redis for caching
4. Analytics integration (PostHog, etc.)
5. User auth and comments system

## API Routes

### `/api/search-index` (GET)
Returns the pre-built Lunr search index as JSON.

**Response**:
```json
{
  "documents": [
    {
      "id": "post-slug",
      "title": "Post Title",
      "excerpt": "...",
      "category": "SEO",
      "slug": "post-slug"
    }
  ],
  "index": "{...lunr index JSON...}"
}
```

## Performance Optimizations

1. **Static Generation**: All pages pre-rendered at build time
2. **Image Optimization**: Next.js Image component (when used)
3. **Code Splitting**: Route-based code splitting
4. **CSS**: Tailwind v4 with tree-shaking
5. **Client-side Search**: No server roundtrip needed
6. **Caching**: Long-lived cache headers on static assets

## Development Workflow

### Adding a New Blog Post

1. Create a new markdown file in `/content/posts/`
2. Add YAML frontmatter with required fields
3. Write markdown content
4. Build/deploy - post is automatically indexed

### Customizing Colors

Edit `/app/globals.css` color tokens:
```css
:root {
  --primary: oklch(...);
  --accent: oklch(...);
  /* ... more colors ... */
}
```

### Adding a New Page

1. Create route in `/app`
2. Use `Header` and `Footer` for consistency
3. Follow existing component patterns
4. Add metadata for SEO

## Database Schema (Future Migration)

When scaling to database:

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  slug VARCHAR UNIQUE NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author VARCHAR,
  category VARCHAR,
  published_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  keywords TEXT[],
  read_time INT
);

CREATE TABLE categories (
  id UUID PRIMARY KEY,
  slug VARCHAR UNIQUE,
  name VARCHAR NOT NULL,
  description TEXT
);

CREATE TABLE post_categories (
  post_id UUID REFERENCES posts(id),
  category_id UUID REFERENCES categories(id),
  PRIMARY KEY (post_id, category_id)
);
```

## Environment Variables

Currently no env vars needed. When migrating to database:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
```

## Testing Strategy

1. **Unit Tests**: Test utility functions (posts.ts, seo.ts)
2. **Integration Tests**: Test page generation and metadata
3. **E2E Tests**: Test user flows (search, navigation, scroll)
4. **SEO Tests**: Validate metadata and schema

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Build Output
- Static files: `/public`
- Pre-rendered pages: All blog posts + home + categories
- API routes: Search index endpoint
- Sitemap: Auto-generated

### Caching Strategy
- Posts: Immutable (unless content updated)
- Search index: 24-hour cache
- Static assets: 1-year immutable cache

## Monitoring & Analytics

When scaling, integrate:
- **PostHog**: Product analytics and feature flags
- **Sentry**: Error tracking and performance monitoring
- **Google Search Console**: SEO and ranking data
- **Vercel Analytics**: Core Web Vitals monitoring

## License

This project is ready for production deployment and can be adapted to any SEO blog platform use case.
