import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { z } from 'zod';
import { calculateReadingTime } from './utils';

export const PostFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  author: z.string(),
  date: z.string(),
  category: z.string(),
  readTime: z.number(),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
});

export type PostMetadata = z.infer<typeof PostFrontmatterSchema>;

export interface Post extends PostMetadata {
  content: string;
  html: string;
}

export interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
}

/**
 * Resolve the content directory for a given locale, with fallback chain:
 * 1. content/[locale]/posts/  (if locale provided and exists)
 * 2. content/en/posts/        (English fallback)
 * 3. content/posts/           (legacy backward-compat fallback)
 */
export function getContentDirectory(locale?: string): string {
  const cwd = process.cwd();

  if (locale) {
    const localeDir = path.join(cwd, 'content', locale, 'posts');
    if (fs.existsSync(localeDir)) {
      return localeDir;
    }
  }

  const enDir = path.join(cwd, 'content', 'en', 'posts');
  if (fs.existsSync(enDir)) {
    return enDir;
  }

  // Legacy backward-compat fallback
  return path.join(cwd, 'content', 'posts');
}

// Locale-aware slug → filename cache: keyed by "locale:slug"
const slugMap = new Map<string, string>();

/**
 * Build the cache key for the slug map
 */
function slugMapKey(locale: string | undefined, slug: string): string {
  return `${locale ?? ''}:${slug}`;
}

/**
 * Get all post files from the resolved content directory
 */
function getAllPostFiles(locale?: string): string[] {
  const dir = getContentDirectory(locale);
  const files = fs.readdirSync(dir);
  return files.filter((file) => file.endsWith('.md'));
}

/**
 * Parse only the frontmatter of a single markdown file (no HTML rendering)
 */
function parsePostMetadata(filename: string, locale?: string): PostMetadata {
  const dir = getContentDirectory(locale);
  const filePath = path.join(dir, filename);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContent);

  try {
    return PostFrontmatterSchema.parse(data);
  } catch (err) {
    throw new Error(`Invalid frontmatter in "${filename}": ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Get all post metadata (frontmatter only, no HTML rendering) for list pages.
 * Populates the locale-aware slug map cache on first call.
 */
export function getAllPostMetadata(locale?: string): PostMetadata[] {
  const files = getAllPostFiles(locale);
  const results: PostMetadata[] = [];

  for (const filename of files) {
    const metadata = parsePostMetadata(filename, locale);
    // Populate locale-aware slug map cache
    const key = slugMapKey(locale, metadata.slug);
    if (!slugMap.has(key)) {
      slugMap.set(key, filename);
    }
    results.push(metadata);
  }

  return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Parse a single markdown file into Post object
 */
export function parsePost(filename: string, locale?: string): Post {
  const dir = getContentDirectory(locale);
  const filePath = path.join(dir, filename);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  let metadata: PostMetadata;
  try {
    metadata = PostFrontmatterSchema.parse(data);
  } catch (err) {
    throw new Error(`Invalid frontmatter in "${filename}": ${err instanceof Error ? err.message : String(err)}`);
  }

  const rawHtml = marked.parse(content);
  const html: string = String(rawHtml);

  return {
    ...metadata,
    readTime: calculateReadingTime(content), // auto-calculated from word count
    content,
    html,
  };
}

/**
 * Get all posts, sorted by date (newest first)
 */
export function getAllPosts(locale?: string): Post[] {
  const files = getAllPostFiles(locale);
  const posts = files.map((filename) => parsePost(filename, locale));

  return posts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

/**
 * Get a single post by slug — uses locale-aware slug map for O(1) lookup after warm-up
 */
export function getPostBySlug(slug: string, locale?: string): Post | null {
  // Warm the cache if needed for this locale
  const key = slugMapKey(locale, slug);
  if (!slugMap.has(key)) {
    getAllPostMetadata(locale);
  }

  const filename = slugMap.get(slugMapKey(locale, slug));
  if (!filename) return null;
  return parsePost(filename, locale);
}


