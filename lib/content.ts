import { getAllPostMetadata } from '@/lib/posts';
import type { PostMetadata } from '@/lib/posts';

export type { PostMetadata } from '@/lib/posts';
export type { Post } from '@/lib/posts';

export interface PaginationResult {
  posts: PostMetadata[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Get featured posts (metadata only)
 */
export function getFeaturedPosts(locale?: string): PostMetadata[] {
  return getAllPostMetadata(locale).filter((post) => post.featured).slice(0, 3);
}

/**
 * Get posts by category (metadata only)
 */
export function getPostsByCategory(category: string, locale?: string): PostMetadata[] {
  return getAllPostMetadata(locale).filter((post) => post.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(locale?: string): string[] {
  const posts = getAllPostMetadata(locale);
  const categories = new Set(posts.map((post) => post.category));
  return Array.from(categories).sort();
}

/**
 * Get all unique tags
 */
export function getAllTags(locale?: string): string[] {
  const posts = getAllPostMetadata(locale);
  const tags = new Set(posts.flatMap((post) => post.tags));
  return Array.from(tags).sort();
}

/**
 * Get posts matching a tag (metadata only)
 */
export function getPostsByTag(tag: string, locale?: string): PostMetadata[] {
  return getAllPostMetadata(locale).filter((post) => post.tags.includes(tag));
}

/**
 * Get related posts — same category excluding current slug, padded with other posts if needed
 */
export function getRelatedPosts(
  slug: string,
  category: string,
  limit: number = 3,
  locale?: string
): PostMetadata[] {
  const allPosts = getAllPostMetadata(locale);
  const sameCategoryPosts = allPosts.filter(
    (post) => post.category === category && post.slug !== slug
  );

  if (sameCategoryPosts.length >= limit) {
    return sameCategoryPosts.slice(0, limit);
  }

  // Pad with other posts (different category, excluding current slug)
  const otherPosts = allPosts.filter(
    (post) => post.category !== category && post.slug !== slug
  );

  return [...sameCategoryPosts, ...otherPosts].slice(0, limit);
}

/**
 * Get paginated posts (metadata only)
 */
export function getPaginatedPosts(
  page: number,
  postsPerPage: number = 6,
  locale?: string
): PaginationResult {
  const allPosts = getAllPostMetadata(locale);
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    currentPage: page,
    totalPages,
    totalPosts,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
