'use client';

import { Calendar, User, Clock } from 'lucide-react';
import { motion } from '@/components/motion';

interface ArticleHeaderProps {
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: number;
}

export default function ArticleHeader({ title, category, author, date, readTime }: ArticleHeaderProps) {
  return (
    <>
      {/* Category badge */}
      <motion.div
        className="mb-4 flex justify-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          {category}
        </span>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl text-balance"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
      >
        {title}
      </motion.h1>

      {/* Meta */}
      <motion.div
        className="flex flex-wrap gap-6 border-t border-border pt-6 text-sm text-muted-foreground"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
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
      </motion.div>
    </>
  );
}
