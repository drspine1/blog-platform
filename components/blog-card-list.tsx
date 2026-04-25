'use client';

import { useEffect, useRef } from 'react';
import { BlogCard } from '@/components/blog-card';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';
import type { PostMetadata } from '@/lib/posts';

interface BlogCardListProps {
  posts: PostMetadata[];
  locale?: string;
}

export default function BlogCardList({ posts, locale }: BlogCardListProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll<HTMLElement>(':scope > *');
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 85%',
        },
      }
    );

    return () => {
      ScrollTrigger.refresh();
    };
  }, [posts]);

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No articles found. Check back soon!</p>
      </div>
    );
  }

  return (
    <div ref={gridRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} locale={locale} />
      ))}
    </div>
  );
}
