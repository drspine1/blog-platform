'use client';

import { BlogCard } from '@/components/blog-card';
import { motion, staggerContainer, staggerItem, viewport } from '@/components/motion';
import type { PostMetadata } from '@/lib/posts';

interface BlogCardListProps {
  posts: PostMetadata[];
  locale?: string;
}

export default function BlogCardList({ posts, locale }: BlogCardListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No articles found. Check back soon!</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
    >
      {posts.map((post) => (
        <motion.div key={post.slug} variants={staggerItem}>
          <BlogCard post={post} locale={locale} />
        </motion.div>
      ))}
    </motion.div>
  );
}
