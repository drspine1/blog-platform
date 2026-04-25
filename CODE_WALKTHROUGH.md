# Code Walkthrough - SEO Blog Platform

## How the System Works (Under the Hood)

---

## 1. Content Pipeline: From Markdown to Browser

### Step 1: Write Markdown File
```markdown
# content/posts/seo-fundamentals.md
---
title: "SEO Fundamentals"
category: "Fundamentals"
---

## Introduction
Your content...
```

### Step 2: Parse with Gray-Matter
**File**: `lib/posts.ts`

```typescript
import matter from 'gray-matter';
import fs from 'fs';

export function getPostBySlug(slug: string): Post {
  const filePath = path.join(process.cwd(), 'content', 'posts', `${slug}.md`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Gray-matter separates frontmatter from content
  const { data, content } = matter(fileContent);
  
  // Convert markdown to HTML
  const html = marked(content);
  
  return {
    slug,
    title: data.title,
    description: data.description,
    category: data.category,
    html,
    ...data
  };
}
```

**What happens**:
- `gray-matter` parses YAML frontmatter into JavaScript object
- `marked.js` converts markdown content to HTML
- Returns a `Post` object with all metadata + rendered HTML

### Step 3: Render in React Component
**File**: `app/blog/[slug]/page.tsx`

```typescript
export default async function PostPage({ params }: Props) {
  const post = getPostBySlug(params.slug); // Get parsed post
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div 
        className="prose"
        // Dangerously insert HTML because we control the source
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}
```

**Security Note**: `dangerouslySetInnerHTML` is safe here because we control the markdown source (not user-generated).

### Step 4: Style with Prose CSS
**File**: `app/globals.css`

```css
.prose {
  h1 { @apply text-3xl mt-8 mb-4; }
  h2 { @apply text-2xl mt-6 mb-3; }
  p { @apply mb-4 leading-relaxed; }
  a { @apply text-accent hover:text-accent/80 underline; }
  /* ... 100+ more rules for markdown elements ... */
}
```

**Result**: Beautiful, semantic HTML styling from markdown ✨

---

## 2. Search: Building the Index

### Step 1: Create Search Index
**File**: `lib/search-index.ts`

```typescript
import lunr from 'lunr';

export function buildSearchIndex(posts: Post[]) {
  // Build Lunr index from posts
  const idx = lunr(function() {
    this.ref('slug');
    this.field('title', { boost: 10 });
    this.field('description', { boost: 5 });
    this.field('content');
    this.field('category');
    this.field('tags');
    
    // Add each post to the index
    posts.forEach(post => {
      this.add({
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.raw, // Raw markdown
        category: post.category,
        tags: post.tags.join(' ')
      });
    });
  });
  
  // Serialize index to JSON for client-side use
  return JSON.stringify(idx);
}
```

**What it does**:
- Tokenizes all text (splits into words)
- Applies stemming (root → root, roots → root)
- Creates searchable index with field weights
- Title matches weighted 10x higher than content

### Step 2: Expose via API
**File**: `app/api/search-index/route.ts`

```typescript
export async function GET() {
  const posts = getAllPosts();
  const searchIndex = buildSearchIndex(posts);
  
  return Response.json({
    posts: posts.map(p => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      category: p.category
    })),
    index: searchIndex
  });
}
```

### Step 3: Use in Browser
**File**: `hooks/use-search.ts`

```typescript
export function useSearch() {
  const [index, setIndex] = useState(null);
  
  useEffect(() => {
    // Lazy load search index on first use
    fetch('/api/search-index')
      .then(r => r.json())
      .then(data => {
        // Deserialize Lunr index
        const idx = lunr.Index.load(JSON.parse(data.index));
        setIndex(idx);
      });
  }, []);
  
  const search = (query: string) => {
    if (!index) return [];
    
    // Execute search (this is INSTANT, no network call)
    const results = index.search(query);
    
    return results.map(result => {
      // Match result.ref against posts
      const post = posts.find(p => p.slug === result.ref);
      return {
        ...post,
        relevance: result.score
      };
    });
  };
  
  return { search, isLoading: !index };
}
```

**Performance**: Search results appear instantly as user types (no server latency)

---

## 3. SEO: Metadata Generation

### Step 1: Per-Page Metadata
**File**: `app/blog/[slug]/page.tsx`

```typescript
export async function generateMetadata({ params }): Metadata {
  const post = getPostBySlug(params.slug);
  
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    
    // Social media cards
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date.toISOString(),
      authors: [post.author],
      tags: post.tags,
    },
    
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    }
  };
}
```

**Generated HTML**:
```html
<title>SEO Fundamentals | SEO Blog Platform</title>
<meta name="description" content="Learn SEO fundamentals...">
<meta property="og:title" content="SEO Fundamentals">
<meta property="og:description" content="Learn SEO fundamentals...">
<meta name="twitter:card" content="summary_large_image">
```

### Step 2: Structured Data
**File**: `lib/seo.ts`

```typescript
export function generateArticleSchema(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image || '/default-og.jpg',
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author
    },
    keywords: post.tags.join(', ')
  };
}
```

**In HTML** (via `next/head` or script):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "SEO Fundamentals",
  ...
}
</script>
```

Google uses this to understand page content and show rich snippets! 📌

### Step 3: Sitemap Generation
**File**: `app/sitemap.ts`

```typescript
export default async function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  
  return [
    // Homepage
    {
      url: 'https://yourblog.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    
    // All blog posts
    ...posts.map(post => ({
      url: `https://yourblog.com/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    
    // All categories
    ...getCategories().map(category => ({
      url: `https://yourblog.com/categories/${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  ];
}
```

**Generated `/sitemap.xml`**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourblog.com/blog/seo-fundamentals</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

Google crawls `/sitemap.xml` to discover all your content! 🤖

---

## 4. Component Patterns

### Pattern 1: Server-Side Data Fetching
**File**: `app/blog/page.tsx`

```typescript
// This runs on SERVER (not in browser)
async function BlogListingPage() {
  // No useEffect needed - runs at build/request time
  const posts = getAllPosts(); // Read from filesystem
  const categories = getCategories(); // Derived data
  
  // Client component for interactivity
  return (
    <div>
      <ClientSideFilter 
        posts={posts} 
        categories={categories}
      />
    </div>
  );
}
```

**Why**: SEO benefits + no JavaScript loading data

### Pattern 2: Reusable Component
**File**: `components/blog-card.tsx`

```typescript
interface BlogCardProps {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  readingTime: number;
  tags: string[];
}

export function BlogCard({
  slug,
  title,
  description,
  category,
  readingTime,
  tags
}: BlogCardProps) {
  return (
    <article className="border border-border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-4">{description}</p>
      
      <div className="flex gap-2 mb-4">
        {tags.map(tag => (
          <span key={tag} className="bg-secondary px-2 py-1 rounded text-sm">
            {tag}
          </span>
        ))}
      </div>
      
      <Link href={`/blog/${slug}`} className="text-accent hover:underline">
        Read Article →
      </Link>
    </article>
  );
}
```

**Used in**: Home page + Blog listing page + Category pages + Search results

### Pattern 3: Custom Hook for State
**File**: `hooks/use-search.ts`

```typescript
export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    // Search happens instantly (client-side)
    const matches = index.search(searchQuery);
    setResults(matches);
  }, [index]);
  
  return {
    query,
    results,
    isLoading,
    setQuery: handleSearch,
    clearResults: () => setResults([])
  };
}
```

**Used in**: Search page + Blog listing filters

---

## 5. Styling System

### Design Tokens (CSS Variables)
**File**: `app/globals.css`

```css
:root {
  /* Primary colors */
  --primary: oklch(0.35 0.1 215);      /* Slate blue */
  --primary-foreground: oklch(0.98 0); /* Light text */
  
  /* Accent colors */
  --accent: oklch(0.65 0.15 70);       /* Amber */
  --accent-foreground: oklch(0.2 0);   /* Dark text */
  
  /* Neutral palette */
  --background: oklch(0.98 0 0);       /* Off-white */
  --foreground: oklch(0.2 0 0);        /* Charcoal */
  --border: oklch(0.92 0 0);           /* Light gray */
  
  /* Radius for consistency */
  --radius: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: oklch(0.15 0 0);     /* Deep charcoal */
    --foreground: oklch(0.93 0 0);     /* Off-white */
    --border: oklch(0.3 0 0);          /* Dark gray */
  }
}
```

### Using in Components
```typescript
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  {/* Automatically respects light/dark mode */}
</button>
```

### Markdown Prose Styling
```css
.prose {
  /* Targeted styles for markdown elements */
  h1 { @apply text-3xl font-bold mt-8 mb-4; }
  h2 { @apply text-2xl font-bold mt-6 mb-3; }
  p { @apply mb-4 leading-relaxed; }
  a { @apply text-accent hover:underline; }
  code { @apply bg-card px-1.5 py-0.5 rounded; }
  pre { @apply bg-card p-4 overflow-auto; }
  blockquote { @apply border-l-4 border-accent pl-4 italic; }
}
```

**Benefit**: One style rule applies to all markdown-rendered content!

---

## 6. Routing & Navigation

### File-Based Routing
```
Routes are automatically created from file structure:

app/page.tsx                    → /
app/blog/page.tsx              → /blog
app/blog/[slug]/page.tsx       → /blog/any-post-slug
app/categories/page.tsx        → /categories
app/categories/[slug]/page.tsx → /categories/fundamentals
app/search/page.tsx            → /search
```

### Dynamic Route Generation
**File**: `app/blog/[slug]/page.tsx`

```typescript
// Tell Next.js which dynamic routes exist (for static generation)
export async function generateStaticParams() {
  const posts = getAllPosts();
  
  return posts.map(post => ({
    slug: post.slug
  }));
}

// This is called for each slug
export default function PostPage({ params }) {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    notFound(); // Triggers 404 page
  }
  
  return <PostContent post={post} />;
}
```

**Result**: Static HTML generated for every post at build time ⚡

---

## 7. Build-Time vs Runtime

### Build Time (Static Generation)
```
$ pnpm build

1. getAllPosts() reads all markdown files
2. Each post converted to HTML
3. Static HTML files created in .next/
4. Search index pre-generated
5. Sitemap.xml created
6. Done in ~2 seconds ✨
```

### Runtime (First Request)
```
User visits /blog/seo-fundamentals
  ↓
Next.js serves pre-generated HTML (instant)
  ↓
Browser downloads React components (hydration)
  ↓
Page is interactive
```

### On-Demand Revalidation
```typescript
// If you add a new post, trigger rebuild:
import { revalidateTag } from 'next/cache';

// In an admin API route:
export async function POST(req) {
  // Create new post
  await createPost(req.json());
  
  // Trigger rebuild of affected pages
  revalidateTag('posts');
  revalidateTag('homepage');
  
  return Response.json({ success: true });
}
```

---

## 8. Type Safety Throughout

### Post Type Definition
**File**: `lib/posts.ts`

```typescript
export interface Post {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: Date;
  category: string;
  tags: string[];
  featured: boolean;
  readingTime: number;
  html: string;
  raw: string;
}

// Type-safe post retrieval
const post: Post = getPostBySlug('seo-fundamentals');
//   ↑ IDE knows all properties are available

// TS Error: Property 'invalidField' does not exist
post.invalidField; // ❌
```

### Component Props
```typescript
interface PostPageProps {
  params: {
    slug: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  // params.slug is typed as string ✓
  // params.invalid would be a TS error ✗
}
```

**Benefit**: Catch bugs at compile time, not runtime!

---

## Summary: Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                 Development (You)                        │
│                                                          │
│  Write markdown in /content/posts/blog-post.md          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  Build Time (pnpm build)                 │
│                                                          │
│  1. Gray-matter parses frontmatter                      │
│  2. Marked.js converts to HTML                          │
│  3. Lunr.js builds search index                         │
│  4. Next.js generates static HTML pages                 │
│  5. Sitemap.xml created                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│               Production (Vercel)                        │
│                                                          │
│  Static HTML served globally via CDN                    │
│  React hydrates for interactivity                       │
│  Search runs client-side (no API needed)                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   User's Browser                         │
│                                                          │
│  Visits /blog/seo-fundamentals                          │
│  Instant page load (pre-rendered HTML)                  │
│  Search in real-time (Lunr.js)                          │
│  All interactive features work                          │
└─────────────────────────────────────────────────────────┘
```

---

## Extending the System

### Add a New Feature: Comments
```typescript
// 1. Add to Post type
interface Post {
  // ... existing fields
  comments: Comment[];
}

// 2. Update getPostBySlug() to fetch comments
const comments = await supabase
  .from('comments')
  .select('*')
  .eq('post_id', post.id);

post.comments = comments;

// 3. Add CommentSection component
export function CommentSection({ post }: Props) {
  return (
    <section>
      {post.comments.map(comment => (
        <Comment key={comment.id} {...comment} />
      ))}
    </section>
  );
}

// 4. Add to post detail page
<PostContent post={post} />
<CommentSection post={post} />
```

That's it! 5-minute feature addition.

---

## Key Takeaways

1. **Content Pipeline**: Markdown → Gray-matter → Marked.js → React → Browser
2. **Search**: Built at build-time, runs client-side (instant)
3. **SEO**: Dynamic metadata + JSON-LD + Sitemap
4. **Styling**: CSS variables + Tailwind classes
5. **Components**: Server-side data, client-side interactivity
6. **Type Safety**: Full TypeScript coverage
7. **Performance**: Static generation + minimal JavaScript
8. **Scalability**: Ready to migrate to database when needed

Happy coding! 🚀
