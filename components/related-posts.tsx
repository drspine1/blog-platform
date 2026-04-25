import type { PostMetadata } from '@/lib/posts'
import { BlogCard } from './blog-card'

interface RelatedPostsProps {
  posts: PostMetadata[]
  locale?: string
}

export default function RelatedPosts({ posts, locale }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <section className="py-12 border-t border-border">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Related Posts</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}
