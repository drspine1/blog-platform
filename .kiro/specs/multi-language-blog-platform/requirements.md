# Requirements Document

## Introduction

This spec covers the refactor and evolution of an existing Next.js 15 (App Router) SEO blog platform into a production-grade, multi-language (i18n), SEO-first content platform. The current codebase is a single-locale English blog with markdown content, client-side Lunr search, and basic SEO metadata. The goal is to identify structural issues, duplicated logic, performance bottlenecks, and maintainability risks in the existing code, then propose and implement a refactored architecture that adds full i18n support, improves code quality, and keeps all existing functionality identical.

The refactor covers: architecture overview, problem areas, refactor strategy, improved architecture design, and the rewritten/improved code approach. No net-new user-facing features are introduced beyond what the PRD specifies; the focus is quality, correctness, and i18n readiness.

---

## Glossary

- **Platform**: The Next.js 15 App Router blog application being refactored.
- **Post**: A single markdown blog article stored under `content/posts/`.
- **PostMetadata**: The YAML frontmatter fields of a Post (title, slug, excerpt, author, date, category, readTime, featured).
- **Locale**: A BCP-47 language tag (e.g., `en`, `fr`) identifying the language variant of content and UI.
- **i18n**: Internationalisation — the mechanism for serving content and UI strings in multiple locales.
- **Slug**: A URL-safe, kebab-case identifier for a Post (e.g., `seo-fundamentals`).
- **SSG**: Static Site Generation — pages pre-rendered at build time.
- **ISR**: Incremental Static Regeneration — pages re-generated on demand after a revalidation interval.
- **SEO_Head**: The collection of `<meta>`, Open Graph, Twitter Card, and JSON-LD tags rendered per page.
- **Search_Index**: The Lunr.js full-text index built from all posts and served via `/api/search-index`.
- **TOC**: Table of Contents — the auto-generated in-page navigation component.
- **Layout**: The shared `app/layout.tsx` root layout wrapping all pages.
- **Content_Layer**: The `lib/posts.ts` module responsible for reading, parsing, and returning Post objects.
- **SEO_Layer**: The `lib/seo.ts` module responsible for generating metadata and JSON-LD schemas.
- **Search_Layer**: The `lib/search-index.ts` + `hooks/use-search.ts` modules responsible for indexing and querying posts.
- **Category_Slug**: The URL-safe version of a category name (lowercase, spaces replaced with hyphens).
- **Frontmatter**: YAML metadata block at the top of a markdown file parsed by `gray-matter`.
- **Marked**: The markdown-to-HTML library (`marked` npm package) used to render post content.
- **Lunr**: The client-side full-text search library (`lunr` npm package).
- **next-intl**: The recommended i18n library for Next.js App Router used to manage locale routing and UI translations.

---

## Requirements

### Requirement 1: Architecture Audit — Content Layer

**User Story:** As a senior engineer onboarding into the codebase, I want a clear understanding of how posts are loaded and parsed, so that I can identify structural issues before making changes.

#### Acceptance Criteria

1. THE Content_Layer SHALL expose a typed `Post` interface with all frontmatter fields explicitly declared (title, slug, excerpt, author, date, category, readTime, featured) and no use of `as PostMetadata` type casting from unvalidated `gray-matter` output.
2. WHEN `getPostBySlug` is called, THE Content_Layer SHALL locate the post by matching the `slug` frontmatter field, not by assuming the filename equals the slug, to avoid O(n) re-parsing of all files on every lookup.
3. THE Content_Layer SHALL NOT import `lunr` — search index construction is the responsibility of the Search_Layer, not the Content_Layer.
4. WHEN `getAllPosts` is called, THE Content_Layer SHALL read each file exactly once per call and SHALL NOT call `parsePost` twice for the same file within a single `getPostBySlug` invocation.
5. THE Content_Layer SHALL return `html` as `string` (not `string | Promise<string>`) because `marked.parse` with synchronous input returns a string synchronously; the return type SHALL be explicit.
6. IF a markdown file is missing a required frontmatter field (title, slug, date), THEN THE Content_Layer SHALL throw a descriptive error identifying the filename and the missing field.

---

### Requirement 2: Architecture Audit — Search Layer

**User Story:** As a senior engineer, I want to understand the search architecture, so that I can identify duplication and correctness issues between `lib/posts.ts` and `lib/search-index.ts`.

#### Acceptance Criteria

1. THE Search_Layer SHALL be the single source of truth for building the Lunr index; THE Content_Layer SHALL NOT contain a `buildSearchIndex` function or import `lunr`.
2. THE Search_Layer (`lib/search-index.ts`) SHALL reference `post.title`, `post.excerpt`, `post.category`, and `post.author` directly from the `Post` type returned by `getAllPosts`, not via a `post.frontmatter.*` accessor that does not exist on the current `Post` type.
3. WHEN the search API route (`/api/search-index`) is called, THE Search_Layer SHALL return a cached index built once per server process lifetime, not rebuild the index on every HTTP request.
4. THE Search_Layer SHALL use a consistent Lunr API — either the `lunr(function() {...})` builder pattern or `lunr.Index.new(builder => {...})`, not both in different files.
5. THE `use-search` hook SHALL import `lunr` as a default import (`import lunr from 'lunr'`) consistent with the package's CommonJS export, not as a namespace import (`import * as lunr from 'lunr'`).

---

### Requirement 3: Architecture Audit — SEO Layer

**User Story:** As a senior engineer, I want to understand the SEO metadata pipeline, so that I can identify hardcoded values and missing i18n hooks.

#### Acceptance Criteria

1. THE SEO_Layer SHALL NOT hardcode the base URL (`https://seoblog.example.com`) as a string literal in multiple functions; THE SEO_Layer SHALL read the base URL from a single `NEXT_PUBLIC_SITE_URL` environment variable with a documented fallback.
2. THE SEO_Layer SHALL NOT duplicate the site title and description strings between `lib/seo.ts` defaults and `app/layout.tsx` metadata — one SHALL be the source of truth.
3. WHEN `generatePostSEOMetadata` is called, THE SEO_Layer SHALL derive `keywords` from `post.tags` (an array) if present, falling back to splitting `post.category`; the current implementation splits a single category string which produces single-word keywords.
4. THE SEO_Layer SHALL generate canonical URLs that include the locale prefix once i18n routing is active (e.g., `https://example.com/en/blog/slug`).
5. THE `generateMetadata` function in `lib/seo.ts` SHALL NOT shadow the Next.js built-in `generateMetadata` export name used in page files; it SHALL be renamed to `buildNextMetadata` or similar to avoid confusion.
6. THE SEO_Layer SHALL include `alternates.languages` in per-post metadata once multiple locales are supported, pointing to equivalent posts in other locales.

---

### Requirement 4: Architecture Audit — Page & Component Layer

**User Story:** As a senior engineer, I want to identify structural issues in page components, so that I can reduce duplication and improve maintainability.

#### Acceptance Criteria

1. THE Platform SHALL NOT repeat the `<Header /><Footer />` wrapper pattern inline in every page file; a shared `PageLayout` server component SHALL wrap all content pages.
2. WHEN `BlogCard` renders a date, THE BlogCard component SHALL NOT call `new Date(post.date).toLocaleDateString` inline; date formatting SHALL be extracted to a shared `formatDate` utility in `lib/utils.ts` to avoid the same logic appearing in `blog-card.tsx`, `app/blog/[slug]/page.tsx`, and `app/search/page.tsx`.
3. THE `app/blog/[slug]/page.tsx` page SHALL NOT call `getAllPosts()` twice (once for the post lookup via `getPostBySlug` and once for prev/next navigation); it SHALL call `getAllPosts()` once and derive both the current post and its neighbours from the single result.
4. THE `related-posts.tsx` component SHALL NOT access `post.frontmatter.category` — the `Post` type returned by `getAllPosts` exposes `post.category` directly; this is a type mismatch that causes a runtime error.
5. THE `related-posts.tsx` component SHALL NOT wrap each `<BlogCard>` in an additional `<Link>` — `BlogCard` already renders as a full `<Link>` internally, producing invalid nested anchor elements.
6. THE `app/search/page.tsx` SHALL NOT call `getAllPosts()` on the client side; client components SHALL NOT import server-only `fs`-dependent modules. Search SHALL be performed via the existing `/api/search-index` endpoint and the `use-search` hook.
7. THE `next.config.mjs` SHALL NOT set `typescript.ignoreBuildErrors: true`; TypeScript errors SHALL be resolved so the build is type-safe.
8. THE `next.config.mjs` SHALL NOT set `images.unoptimized: true`; Next.js image optimisation SHALL be enabled for production performance.

---

### Requirement 5: Architecture Audit — i18n Readiness

**User Story:** As a senior engineer, I want to assess how ready the codebase is for multi-language support, so that I can plan the i18n migration.

#### Acceptance Criteria

1. THE Platform SHALL NOT have any locale-specific content or UI strings hardcoded in component files without an i18n abstraction layer.
2. THE Content_Layer SHALL support locale-scoped content directories (`content/en/`, `content/fr/`) in addition to the current flat `content/posts/` structure, with a migration path that does not break existing slugs.
3. THE Platform SHALL use `next-intl` for locale routing, producing URL structures of the form `/[locale]/blog`, `/[locale]/blog/[slug]`, and `/[locale]/tag/[tag]`.
4. WHEN a locale is not available for a requested post, THE Platform SHALL fall back to the default locale (`en`) content and render a visible "translation unavailable" notice rather than a 404.
5. THE Layout SHALL set the `lang` attribute on the `<html>` element to the active locale, not the hardcoded `lang="en"` present in the current `app/layout.tsx`.
6. THE Platform SHALL persist the user's selected locale via a cookie so that subsequent visits default to the previously chosen language.

---

### Requirement 6: Refactor Strategy — Content Layer

**User Story:** As a senior engineer, I want a concrete refactor plan for `lib/posts.ts`, so that I can implement it without breaking existing functionality.

#### Acceptance Criteria

1. THE Content_Layer SHALL be split into two modules: `lib/posts.ts` (pure data access — read, parse, sort) and `lib/content.ts` (higher-level queries — getFeaturedPosts, getPostsByCategory, getPaginatedPosts, getRelatedPosts) to separate concerns.
2. THE Content_Layer SHALL build an in-memory slug-to-filename map on first call and cache it for the process lifetime, so that `getPostBySlug` is O(1) after the first call rather than O(n) file reads.
3. THE Content_Layer SHALL validate frontmatter using a Zod schema so that missing or malformed fields produce actionable build-time errors rather than silent `undefined` values at runtime.
4. THE Content_Layer SHALL export `PostMetadata` (frontmatter only, no `html`/`content`) and `Post` (extends PostMetadata with `html` and `content`) as distinct types, enabling list pages to avoid parsing markdown HTML for cards that only need metadata.
5. WHEN `getAllPostMetadata` is called, THE Content_Layer SHALL parse only frontmatter (not render HTML) for all posts, so that list pages and the search index do not pay the cost of HTML rendering for every post.
6. THE Content_Layer SHALL support an optional `locale` parameter on `getAllPosts`, `getPostBySlug`, and related functions, reading from `content/[locale]/` when provided and falling back to `content/posts/` for the default locale.

---

### Requirement 7: Refactor Strategy — Search Layer

**User Story:** As a senior engineer, I want a concrete refactor plan for the search system, so that it is correct, non-duplicated, and performant.

#### Acceptance Criteria

1. THE Search_Layer SHALL remove the `buildSearchIndex` and `searchPosts` functions from `lib/posts.ts` entirely; these SHALL exist only in `lib/search-index.ts`.
2. THE Search_Layer SHALL build the Lunr index from `PostMetadata` objects (not full `Post` objects with HTML), since the index only needs title, excerpt, category, and author fields.
3. THE Search_Layer SHALL export a `getOrBuildSearchIndex` function that uses a module-level cache variable, ensuring the index is built at most once per server process.
4. THE `use-search` hook SHALL debounce the search query by 300ms before executing the search to avoid excessive re-renders on keystroke.
5. THE Search_Layer SHALL include `tags` as an indexed field with a boost of 7, between title (10) and excerpt (5), since tags are high-signal keywords.
6. FOR ALL valid non-empty search queries, the search results returned by the Search_Layer SHALL be a subset of all posts (metamorphic property: filtering never adds posts).

---

### Requirement 8: Refactor Strategy — SEO Layer

**User Story:** As a senior engineer, I want a concrete refactor plan for `lib/seo.ts`, so that it is DRY, configurable, and i18n-aware.

#### Acceptance Criteria

1. THE SEO_Layer SHALL read the site base URL from `process.env.NEXT_PUBLIC_SITE_URL`, defaulting to `http://localhost:3000` in development and requiring the variable to be set in production.
2. THE SEO_Layer SHALL export a `SITE_CONFIG` constant containing `name`, `description`, `defaultLocale`, and `supportedLocales` so that all modules reference a single source of truth.
3. THE `generateMetadata` helper in `lib/seo.ts` SHALL be renamed to `buildNextMetadata` to avoid shadowing the Next.js page-level `generateMetadata` export.
4. THE SEO_Layer SHALL generate `alternates.canonical` and `alternates.languages` entries for every page, using the locale-prefixed URL structure.
5. THE SEO_Layer SHALL include `dateModified` in `generateArticleSchema` output, using `post.date` as a fallback when no explicit modification date is available.
6. THE SEO_Layer SHALL NOT generate OG image paths as `/og-${post.slug}.jpg` (files that do not exist); it SHALL use a single fallback `/og-image.jpg` or a dynamic OG image route until per-post images are available.

---

### Requirement 9: Refactor Strategy — Component Layer

**User Story:** As a senior engineer, I want a concrete refactor plan for shared components, so that duplication is eliminated and components are correctly typed.

#### Acceptance Criteria

1. THE Platform SHALL introduce a `PageLayout` server component (`components/page-layout.tsx`) that renders `<Header />`, `<main>`, and `<Footer />`, eliminating the repeated wrapper pattern across all page files.
2. THE `lib/utils.ts` SHALL export a `formatDate(dateString: string, locale?: string): string` function used by all components that display dates, replacing the three inline `toLocaleDateString` calls.
3. THE `BlogCard` component SHALL accept an optional `locale` prop and pass it to `formatDate` so that dates render in the correct locale format.
4. THE `TableOfContents` component SHALL receive headings as a prop (extracted server-side from the rendered HTML) rather than querying the DOM via `document.querySelectorAll` on mount, eliminating the flash of empty TOC and making the component testable.
5. THE `RelatedPosts` component SHALL be a server component that receives `Post[]` as a prop rather than calling `getAllPosts()` internally, so the parent page controls data fetching.
6. THE `Header` component SHALL include a `LanguageSwitcher` sub-component that renders locale options and updates the URL prefix when a new locale is selected.
7. THE `BlogCard` component SHALL use `<article>` as its root element (currently correct) and SHALL NOT be wrapped in an additional `<Link>` by parent components — the internal `<Link>` is sufficient.

---

### Requirement 10: Improved Architecture — i18n Implementation

**User Story:** As a senior engineer, I want a clear implementation plan for adding `next-intl` i18n support, so that the platform can serve content in multiple languages.

#### Acceptance Criteria

1. THE Platform SHALL add `next-intl` as a dependency and configure a `middleware.ts` at the project root that intercepts all requests and redirects to the appropriate locale prefix.
2. THE Platform SHALL restructure the app directory to `app/[locale]/` so that all page routes are locale-scoped, with `app/[locale]/layout.tsx` setting `lang={locale}` on the `<html>` element.
3. THE Platform SHALL store UI translation strings in `messages/[locale].json` files (e.g., `messages/en.json`, `messages/fr.json`) and access them via `next-intl`'s `useTranslations` hook in client components and `getTranslations` in server components.
4. THE Content_Layer SHALL resolve post content from `content/[locale]/posts/[slug].md`, falling back to `content/en/posts/[slug].md` when the locale-specific file does not exist.
5. THE Platform SHALL generate `hreflang` alternate link tags for every blog post page pointing to all available locale variants of that post.
6. WHEN a user selects a different locale via the LanguageSwitcher, THE Platform SHALL redirect to the equivalent page in the new locale (e.g., `/en/blog/seo-fundamentals` → `/fr/blog/seo-fundamentals`) and set a `NEXT_LOCALE` cookie.

---

### Requirement 11: Improved Architecture — Performance

**User Story:** As a senior engineer, I want the refactored platform to meet or exceed the current performance characteristics, so that the refactor does not regress Core Web Vitals.

#### Acceptance Criteria

1. THE Platform SHALL use SSG (`generateStaticParams`) for all blog post pages and category pages, pre-rendering them at build time.
2. WHERE ISR is configured, THE Platform SHALL set `revalidate = 3600` (1 hour) on blog listing and category pages so that content updates propagate without a full rebuild.
3. THE Platform SHALL NOT render markdown HTML on the client side; all `marked.parse` calls SHALL occur in server components or at build time.
4. THE Platform SHALL enable Next.js image optimisation (`next/image`) for all post cover images and OG images, removing the `images.unoptimized: true` flag from `next.config.mjs`.
5. THE Platform SHALL lazy-load the `TableOfContents` component on mobile viewports using `next/dynamic` with `ssr: false` to avoid shipping the scroll-spy logic to mobile clients that do not display the sidebar.
6. THE Platform SHALL NOT call `getAllPosts()` more than once per page render; data SHALL be fetched once and passed down as props.

---

### Requirement 12: Improved Architecture — Tags System

**User Story:** As a content creator, I want posts to be tagged and browsable by tag, so that readers can discover related content across categories.

#### Acceptance Criteria

1. THE Post frontmatter SHALL include a `tags` field of type `string[]`; THE Content_Layer SHALL parse and expose this field on the `PostMetadata` type.
2. THE Platform SHALL generate tag pages at `/[locale]/tag/[tag]` listing all posts with that tag, with SSG via `generateStaticParams`.
3. THE SEO_Layer SHALL generate metadata for tag pages with a title of `"[Tag] Articles | [Site Name]"` and a description listing the number of posts.
4. THE Platform SHALL render tag badges on `BlogCard` and on the blog post detail page, each linking to the corresponding tag page.
5. THE sitemap SHALL include all tag pages with `changeFrequency: 'weekly'` and `priority: 0.6`.
6. WHEN a tag contains spaces or special characters, THE Platform SHALL normalise it to a URL-safe slug (lowercase, spaces to hyphens, non-alphanumeric characters removed) consistently across all link generation and `generateStaticParams`.

---

### Requirement 13: Improved Architecture — GSAP Animations

**User Story:** As a developer, I want subtle GSAP animations integrated into the platform, so that the reading experience feels polished without distracting from content.

#### Acceptance Criteria

1. THE Platform SHALL add `gsap` as a dependency and load it only in client components to avoid SSR issues.
2. WHEN a blog post page mounts, THE Platform SHALL animate the article header (title, meta row) with a fade-in and slight upward translate over 400ms using GSAP.
3. WHEN blog cards enter the viewport, THE Platform SHALL animate them with a staggered fade-in using GSAP ScrollTrigger, with a stagger of 80ms between cards.
4. WHEN the TOC active item changes, THE Platform SHALL animate the highlight transition smoothly rather than an instant colour swap.
5. WHERE GSAP animations are used, THE Platform SHALL register only the required GSAP plugins (ScrollTrigger) and SHALL call `ScrollTrigger.refresh()` after route changes to avoid stale trigger positions.
6. IF a user has `prefers-reduced-motion: reduce` set, THEN THE Platform SHALL skip all GSAP animations and render content in its final state immediately.

---

### Requirement 14: Testing Strategy

**User Story:** As a senior engineer, I want a testing strategy that covers the refactored modules, so that regressions are caught automatically.

#### Acceptance Criteria

1. THE Content_Layer SHALL have unit tests covering: `parsePost` with valid frontmatter, `parsePost` with missing required fields (expects thrown error), `getPostBySlug` with a known slug, and `getPostBySlug` with an unknown slug (expects null).
2. THE SEO_Layer SHALL have unit tests covering: `buildNextMetadata` output shape, `generateArticleSchema` output shape, and canonical URL generation with and without locale prefix.
3. THE Search_Layer SHALL have a property-based test asserting that for any non-empty query string, the number of search results is less than or equal to the total number of posts (metamorphic: search only filters, never adds).
4. THE Search_Layer SHALL have a round-trip test: build the index, serialise it to JSON, deserialise it, and assert that a known query returns the same results from both the original and deserialised index.
5. THE Platform SHALL have integration tests for the `/api/search-index` route asserting that the response contains a `documents` array and a non-empty `index` string.
6. THE Platform SHALL have SEO validation tests asserting that the blog post page metadata includes `title`, `description`, `openGraph.title`, and a JSON-LD script tag of type `BlogPosting`.
