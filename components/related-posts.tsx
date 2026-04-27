'use client';

import type { PostMetadata } from '@/lib/posts';
import { BlogCard } from './blog-card';
import { motion, fadeUp, staggerContainer, staggerItem, viewport } from '@/components/motion';

interface RelatedPostsProps {
  posts: PostMetadata[];
  locale?: string;
}

export default function RelatedPosts({ posts, locale }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-12 border-t border-border">
      <motion.h2
        className="text-2xl font-bold mb-6 text-foreground"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        Related Posts
      </motion.h2>
      <motion.div
        className="grid md:grid-cols-3 gap-6"
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
    </section>
  );
}
