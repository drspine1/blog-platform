import Link from 'next/link';
import { Calendar, User, Clock } from 'lucide-react';
import type { PostMetadata } from '@/lib/posts';
import { formatDate, slugifyTag } from '@/lib/utils';

interface BlogCardProps {
  post: PostMetadata;
  locale?: string;
}

export function BlogCard({ post, locale }: BlogCardProps) {
  const formattedDate = formatDate(post.date, locale);

  return (
    <article className="group h-full rounded-lg border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-md">
      {/* Category Badge */}
      <div className="mb-4 inline-block">
        <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          {post.category}
        </span>
      </div>

      {/* Title */}
      <Link href={`/blog/${post.slug}`}>
        <h3 className="mb-2 line-clamp-2 text-xl font-bold text-foreground group-hover:text-accent transition-colors">
          {post.title}
        </h3>
      </Link>

      {/* Excerpt */}
      <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
        {post.excerpt}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          <span>{post.author}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{post.readTime} min read</span>
        </div>
      </div>

      {/* Tag Badges */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${slugifyTag(tag)}`}
              className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
