# Implementation Plan: Multi-Language Blog Platform Refactor

## Overview

Refactor the existing Next.js 15 App Router SEO blog into a production-grade, multi-language (i18n), SEO-first content platform. The plan follows a safe, incremental order: fix critical runtime bugs first, then refactor each layer, then add i18n, tags, animations, and tests. Each task builds on the previous and ends with all code wired together.

Stack: Next.js 15 App Router, TypeScript, Markdown, next-intl, Tailwind CSS, GSAP, Vitest, fast-check, Vercel.

---

## Tasks

- [x] 1. Fix critical runtime bugs
  - [x] 1.1 Fix `related-posts.tsx` type mismatch and double-Link bug
    - Remove the `<Link>` wrapper around each `<BlogCard>` in `components/related-posts.tsx` — `BlogCard` already renders as a `<Link>` internally, so the current code produces invalid nested anchors
    - Change `post.frontmatter.category` → `post.category` and `post.frontmatter.title` → `post.title` (the `Post` type exposes these fields directly, not via `.frontmatter`)
    - _Requirements: 4.4, 4.5_

  - [x] 1.2 Fix `app/search/page.tsx` — remove server-only `getAllPosts` import
    - Delete the `import { getAllPosts } from '@/lib/posts'` and all usage of `getAllPosts()` from the client component `app/search/page.tsx`
    - Replace the inline filter logic with a call to the `useSearch` hook (which fetches `/api/search-index`) so the page no longer imports `fs`-dependent server modules
    - _Requirements: 4.6_

  - [x] 1.3 Fix `app/blog/[slug]/page.tsx` — eliminate double `getAllPosts()` call
    - Call `getAllPosts()` exactly once, store the result, then derive both `getPostBySlug` result and prev/next neighbours from that single array
    - _Requirements: 4.3_

  - [x] 1.4 Fix `next.config.mjs` — remove unsafe build flags
    - Remove `typescript.ignoreBuildErrors: true`
    - Remove `images.unoptimized: true`
    - _Requirements: 4.7, 4.8, 11.4_

- [x] 2. Refactor the data layer (`lib/posts.ts` → `lib/posts.ts` + `lib/content.ts`)
  - [x] 2.1 Add Zod frontmatter validation and `tags` field to `lib/posts.ts`
    - Install `zod` (already in `package.json`) — no new dependency needed
    - Define `PostFrontmatterSchema` with Zod: `title`, `slug`, `excerpt`, `author`, `date`, `category`, `readTime`, `featured`, `tags: z.array(z.string()).default([])`
    - Replace the `data as PostMetadata` cast in `parsePost` with `PostFrontmatterSchema.parse(data)`, wrapping errors to include the filename
    - Export `PostMetadata = z.infer<typeof PostFrontmatterSchema>` and `Post extends PostMetadata` with `content` and `html`
    - _Requirements: 1.1, 1.6, 6.3, 6.4, 12.1_

  - [x] 2.2 Add in-memory slug map cache and `getAllPostMetadata` to `lib/posts.ts`
    - Add a module-level `Map<string, string>` (slug → filename) populated on first call
    - Rewrite `getPostBySlug` to use the map for O(1) lookup after warm-up
    - Add `getAllPostMetadata(locale?: string): PostMetadata[]` that parses only frontmatter (no HTML rendering) for list pages
    - Fix `html` return type: `marked.parse(content)` returns `string` synchronously — ensure the return type is `string`, not `string | Promise<string>`
    - Remove `lunr` import from `lib/posts.ts`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 6.2, 6.5_

  - [x] 2.3 Add locale-aware content directory support to `lib/posts.ts`
    - Accept an optional `locale` parameter on `getAllPostMetadata`, `getPostBySlug`, and `getAllPosts`
    - Resolve content from `content/[locale]/posts/` when locale is provided, falling back to `content/en/posts/` (and then `content/posts/` for backward compat) when the locale file is absent
    - Migrate existing `content/posts/*.md` files to `content/en/posts/*.md`
    - _Requirements: 5.2, 6.6, 10.4_

  - [x] 2.4 Create `lib/content.ts` with higher-level query functions
    - Move `getFeaturedPosts`, `getPostsByCategory`, `getPaginatedPosts` out of `lib/posts.ts` into `lib/content.ts`, updating them to use `getAllPostMetadata` (metadata-only) instead of `getAllPosts`
    - Add `getRelatedPosts(slug, category, limit, locale?)`, `getAllCategories(locale?)`, `getAllTags(locale?)`, `getPostsByTag(tag, locale?)`
    - Update all page imports to use `lib/content.ts` for higher-level queries
    - _Requirements: 6.1, 12.1_

  - [ ]* 2.5 Write property test for `parsePost` preserves required frontmatter fields
    - **Property 5: `parsePost` preserves required frontmatter fields**
    - **Validates: Requirements 1.1, 6.3**
    - Use fast-check to generate arbitrary valid frontmatter objects, write to a temp file, parse, assert field equality

- [x] 3. Refactor the SEO layer (`lib/seo.ts`)
  - [x] 3.1 Add `SITE_CONFIG` and environment-variable base URL
    - Export `SITE_CONFIG = { name, description, defaultLocale: 'en', supportedLocales: ['en', 'fr'] }` as the single source of truth
    - Replace all hardcoded `https://seoblog.example.com` strings with `process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'`
    - Remove duplicate title/description defaults from `app/layout.tsx` — reference `SITE_CONFIG` instead
    - _Requirements: 3.1, 3.2, 8.1, 8.2_

  - [x] 3.2 Rename `generateMetadata` → `buildNextMetadata` and fix OG image path
    - Rename the `generateMetadata` helper in `lib/seo.ts` to `buildNextMetadata` to avoid shadowing the Next.js page-level export
    - Update all call sites (`app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/categories/[slug]/page.tsx`, etc.)
    - Change `image: /og-${post.slug}.jpg` → `/og-image.jpg` fallback in `generatePostSEOMetadata`
    - Add `dateModified` to `generateArticleSchema` (use `post.date` as fallback)
    - _Requirements: 3.5, 8.3, 8.5, 8.6_

  - [x] 3.3 Add locale-aware canonical URLs and `alternates.languages`
    - Update `generatePostSEOMetadata` to accept a `locale` parameter and produce locale-prefixed canonical URLs (`/[locale]/blog/[slug]`)
    - Add `alternates.languages` entries for all supported locales
    - Add `keywords` derived from `post.tags` array (falling back to `post.category` split)
    - _Requirements: 3.3, 3.4, 3.6, 8.4, 10.5_

  - [ ]* 3.4 Write unit tests for SEO layer
    - Test `buildNextMetadata` output shape includes `title`, `description`, `openGraph`, `twitter`
    - Test `generateArticleSchema` includes `@type: BlogPosting`, `datePublished`, `dateModified`
    - Test canonical URL without locale and with locale prefix
    - _Requirements: 14.2_

- [x] 4. Refactor the search layer (`lib/search-index.ts` + `hooks/use-search.ts`)
  - [x] 4.1 Consolidate search index into `lib/search-index.ts`
    - Remove `buildSearchIndex` and `searchPosts` from `lib/posts.ts` entirely
    - Rewrite `lib/search-index.ts` to use `getAllPostMetadata()` (not full `Post` with HTML)
    - Add `tags` as an indexed field with boost 7
    - Use the `lunr(function() {...})` builder pattern consistently (not `lunr.Index.new`)
    - Export `getOrBuildSearchIndex()` with a module-level cache variable (built once per server process)
    - Fix `SearchDocument` to reference `post.title`, `post.excerpt`, `post.category`, `post.author`, `post.tags` directly (not via `.frontmatter.*`)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.2, 7.3, 7.5_

  - [x] 4.2 Fix `hooks/use-search.ts` — correct lunr import and add debounce
    - Change `import * as lunr from 'lunr'` → `import lunr from 'lunr'` (default import, consistent with CommonJS export)
    - Add 300ms debounce on the search query before executing the search
    - Update the hook to use `SearchDocument` type from `lib/search-index.ts` instead of `any[]`
    - _Requirements: 2.5, 7.4_

  - [x] 4.3 Update `/api/search-index` route to use `getOrBuildSearchIndex`
    - Replace the current `buildSearchIndex()` call with `getOrBuildSearchIndex()` so the index is cached across requests
    - _Requirements: 2.3, 7.3_

  - [ ]* 4.4 Write property test: search results are a subset of all posts
    - **Property 1: Search results are a subset of all posts**
    - **Validates: Requirements 7.6, 14.3**
    - Use fast-check to generate arbitrary non-empty query strings; assert every returned slug exists in `getAllPostMetadata().map(p => p.slug)`

  - [ ]* 4.5 Write property test: search index round-trip preserves results
    - **Property 2: Search index round-trip preserves results**
    - **Validates: Requirements 14.4**
    - Build index, serialise to JSON, deserialise, assert same query returns same slug set from both

  - [ ]* 4.6 Write integration test for `/api/search-index` route
    - Assert response body has `documents` array and non-empty `index` string
    - _Requirements: 14.5_

- [x] 5. Checkpoint — fix TypeScript errors and verify build
  - Resolve all TypeScript errors surfaced by removing `ignoreBuildErrors`
  - Run `pnpm build` (or `pnpm tsc --noEmit`) and fix any remaining type errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Refactor the component layer
  - [x] 6.1 Add `formatDate` and `slugifyTag` utilities to `lib/utils.ts`
    - Export `formatDate(dateString: string, locale?: string): string` using `Intl.DateTimeFormat`
    - Export `slugifyTag(tag: string): string` — lowercase, spaces→hyphens, strip non-alphanumeric, trim leading/trailing hyphens
    - _Requirements: 9.2, 12.6_

  - [ ]* 6.2 Write property tests for `slugifyTag` and `formatDate`
    - **Property 3: `slugifyTag` is idempotent and URL-safe**
    - **Validates: Requirements 12.6**
    - **Property 4: `formatDate` output contains the year**
    - **Validates: Requirements 9.2**
    - Use fast-check for both properties

  - [x] 6.3 Create `components/page-layout.tsx` server component
    - Render `<Header locale={locale} />`, `<main>{children}</main>`, `<Footer />`
    - Replace the repeated `<Header /><main>...</main><Footer />` pattern in all existing page files (`app/blog/page.tsx`, `app/categories/page.tsx`, `app/categories/[slug]/page.tsx`, `app/contact/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/search/page.tsx`)
    - _Requirements: 4.1, 9.1_

  - [x] 6.4 Refactor `components/blog-card.tsx`
    - Accept `PostMetadata` (not `Post`) as the `post` prop type — list pages only have metadata
    - Add optional `locale?: string` prop; pass it to `formatDate`
    - Replace inline `toLocaleDateString` with `formatDate(post.date, locale)`
    - Render tag badges linking to `/[locale]/tag/[slugifyTag(tag)]` for each tag in `post.tags`
    - _Requirements: 9.2, 9.3, 9.7, 12.4_

  - [x] 6.5 Refactor `components/table-of-contents.tsx`
    - Add a `headings: Heading[]` prop so headings are passed in from the server component (extracted from rendered HTML server-side)
    - Remove the `useEffect` that queries `document.querySelectorAll` on mount
    - Keep the `IntersectionObserver` scroll-spy logic (client-side only) for tracking the active heading
    - Export the `Heading` interface for use by the parent page
    - _Requirements: 9.4_

  - [x] 6.6 Refactor `components/related-posts.tsx` to a pure presentational server component
    - Change props to `{ posts: PostMetadata[]; locale: string }` — remove internal `getAllPosts()` call
    - Update `app/blog/[slug]/page.tsx` to call `getRelatedPosts` from `lib/content.ts` and pass the result as a prop
    - _Requirements: 9.5_

  - [x] 6.7 Add `LanguageSwitcher` sub-component to `components/header.tsx`
    - Render locale options from `SITE_CONFIG.supportedLocales`
    - On select: navigate to `/[newLocale]/[...rest]` and set `NEXT_LOCALE` cookie
    - Accept `locale: string` prop on `Header`
    - _Requirements: 9.6, 10.6_

- [x] 7. Add i18n with `next-intl`
  - [x] 7.1 Install `next-intl` and create `middleware.ts`
    - Run `pnpm add next-intl`
    - Create `middleware.ts` at project root using `createMiddleware` with `locales: ['en', 'fr']`, `defaultLocale: 'en'`, `localeDetection: true`, `localeCookie: 'NEXT_LOCALE'`
    - _Requirements: 5.1, 10.1_

  - [x] 7.2 Restructure app directory to `app/[locale]/`
    - Move all page files under `app/[locale]/` (blog, categories, search, contact, privacy, terms, not-found)
    - Create `app/[locale]/layout.tsx` that sets `lang={locale}` on `<html>` and wraps children in the `next-intl` provider
    - Remove the old root `app/layout.tsx` `lang="en"` hardcode
    - Update `generateStaticParams` in all pages to include the `locale` dimension
    - _Requirements: 5.5, 10.2_

  - [x] 7.3 Create translation message files
    - Create `messages/en.json` with keys for nav, blog, search, categories, i18n (translationUnavailable notice), tags, footer
    - Create `messages/fr.json` with French translations for the same keys
    - _Requirements: 10.3_

  - [x] 7.4 Wire `useTranslations` / `getTranslations` into components and pages
    - Replace all hardcoded UI strings in `Header`, `Footer`, `BlogCard`, `RelatedPosts`, `SearchPage`, and page headings with `t('key')` calls
    - Use `getTranslations` in server components and `useTranslations` in client components
    - _Requirements: 5.1, 10.3_

  - [x] 7.5 Add locale fallback and `TranslationUnavailableNotice` banner
    - When `content/[locale]/posts/[slug].md` does not exist, `getPostBySlug` falls back to `content/en/posts/[slug].md`
    - Render a `TranslationUnavailableNotice` banner on the post page when the fallback is used
    - _Requirements: 5.4, 10.4_

  - [x] 7.6 Update `app/[locale]/layout.tsx` to persist locale via cookie
    - Confirm `middleware.ts` sets `NEXT_LOCALE` cookie on locale selection
    - Verify `<html lang={locale}>` is set correctly in the locale layout
    - _Requirements: 5.6, 10.6_

- [x] 8. Checkpoint — verify i18n routing and locale switching
  - Ensure `pnpm build` succeeds with no TypeScript errors
  - Verify `/en/blog`, `/fr/blog`, `/en/blog/seo-fundamentals` routes resolve correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Add tags system
  - [x] 9.1 Add `tags` to existing markdown frontmatter
    - Add a `tags` array to each post in `content/en/posts/*.md` (e.g., `tags: [seo, technical, beginner]`)
    - _Requirements: 12.1_

  - [x] 9.2 Create tag pages at `app/[locale]/tag/[tag]/page.tsx`
    - Implement `generateStaticParams` using `getAllTags(locale)` + `slugifyTag`
    - Render a list of `PostMetadata` cards for the tag using `getPostsByTag`
    - Generate SEO metadata: title `"[Tag] Articles | [Site Name]"`, description with post count
    - _Requirements: 12.2, 12.3_

  - [x] 9.3 Update sitemap to include tag pages
    - Add tag page entries with `changeFrequency: 'weekly'` and `priority: 0.6`
    - Update sitemap to use `NEXT_PUBLIC_SITE_URL` from `SITE_CONFIG`
    - _Requirements: 12.5_

- [x] 10. Add GSAP animations
  - [x] 10.1 Install GSAP and register ScrollTrigger
    - Run `pnpm add gsap`
    - Create `lib/gsap.ts` client-side helper that registers `ScrollTrigger` once and exports `gsap`
    - Gate all animation code behind `window.matchMedia('(prefers-reduced-motion: reduce)').matches` check
    - _Requirements: 13.1, 13.5, 13.6_

  - [x] 10.2 Animate blog post article header on mount
    - In `app/[locale]/blog/[slug]/page.tsx` (or a new `ArticleHeader` client component), add a `useEffect` that runs a GSAP fade-in + upward translate (400ms) on the title and meta row
    - Skip animation if `prefers-reduced-motion` is set
    - _Requirements: 13.2, 13.6_

  - [x] 10.3 Animate blog cards with staggered ScrollTrigger fade-in
    - Create a `components/blog-card-list.tsx` client component that wraps the card grid and applies GSAP ScrollTrigger stagger (80ms between cards) on viewport entry
    - Call `ScrollTrigger.refresh()` after route changes
    - Skip animation if `prefers-reduced-motion` is set
    - _Requirements: 13.3, 13.5, 13.6_

  - [x] 10.4 Animate TOC active-item highlight transition
    - In `components/table-of-contents.tsx`, use GSAP to animate the colour/opacity transition when `activeId` changes instead of an instant CSS swap
    - Skip animation if `prefers-reduced-motion` is set
    - _Requirements: 13.4, 13.6_

- [x] 11. Add Vitest test infrastructure and unit tests
  - [x] 11.1 Set up Vitest
    - Run `pnpm add -D vitest @vitest/coverage-v8`
    - Create `vitest.config.ts` with `environment: 'node'` and `include: ['**/*.test.ts']`
    - Add `"test": "vitest --run"` script to `package.json`
    - _Requirements: 14.1_

  - [x] 11.2 Write unit tests for the content layer
    - `parsePost` with valid frontmatter → correct `Post` shape
    - `parsePost` with missing `title` → throws descriptive error
    - `parsePost` with missing `slug` → throws descriptive error
    - `getPostBySlug` with known slug → returns correct post
    - `getPostBySlug` with unknown slug → returns `null`
    - _Requirements: 14.1_

  - [ ]* 11.3 Write unit tests for the SEO layer
    - `buildNextMetadata` output shape
    - `generateArticleSchema` output shape
    - Canonical URL with and without locale prefix
    - _Requirements: 14.2_

  - [ ]* 11.4 Write integration test for blog post page SEO metadata
    - Assert page metadata includes `title`, `description`, `openGraph.title`, and a JSON-LD `<script>` tag with `@type: BlogPosting`
    - _Requirements: 14.6_

- [x] 12. Final checkpoint — full build and test suite
  - Run `pnpm tsc --noEmit` and fix any remaining type errors
  - Run `pnpm test` and ensure all tests pass
  - Verify sitemap includes blog posts, categories, and tag pages
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** (TypeScript-native, already compatible with Vitest)
- Checkpoints at tasks 5, 8, and 12 ensure incremental validation before moving to the next phase
- The i18n migration (task 7) preserves all existing slugs — `content/posts/` files move to `content/en/posts/`
- GSAP is loaded only in `'use client'` components to avoid SSR issues
