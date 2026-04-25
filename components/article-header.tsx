'use client';

import { useEffect, useRef } from 'react';
import { Calendar, User, Clock } from 'lucide-react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

interface ArticleHeaderProps {
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: number;
}

export default function ArticleHeader({ title, category, author, date, readTime }: ArticleHeaderProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const targets = [titleRef.current, metaRef.current].filter(Boolean);
    if (targets.length === 0) return;

    gsap.fromTo(
      targets,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
    );

    return () => {
      gsap.killTweensOf(targets);
    };
  }, []);

  return (
    <>
      {/* Category */}
      <div className="mb-4 flex justify-center">
        <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          {category}
        </span>
      </div>

      {/* Title */}
      <h1
        ref={titleRef}
        className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl text-balance"
      >
        {title}
      </h1>

      {/* Meta */}
      <div
        ref={metaRef}
        className="flex flex-wrap gap-6 border-t border-border pt-6 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{author}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{readTime} min read</span>
        </div>
      </div>
    </>
  );
}
