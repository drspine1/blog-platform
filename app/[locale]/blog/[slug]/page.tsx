import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import RelatedPosts from '@/components/related-posts';
import TableOfContents, { type Heading } from '@/components/table-of-contents';
import TranslationUnavailableNotice from '@/components/translation-unavailable-notice';
import ArticleHeader from '@/components/article-header';
import ReadingProgress from '@/components/reading-progress';
import SocialShare from '@/components/social-share';
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import { getRelatedPosts } from '@/lib/content';
import { generatePostSEOMetadata, buildNextMetadata, generateArticleSchema, SITE_CONFIG } from '@/lib/seo';

interface PostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale) ?? getPostBySlug(slug, 'en');

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return buildNextMetadata(generatePostSEOMetadata(post, locale));
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of SITE_CONFIG.supportedLocales) {
    const posts = getAllPosts(locale);
    for (const post of posts) {
      params.push({ locale, slug: post.slug });
    }
  }
  return params;
}

export default async function PostPage({ params }: PostPageProps) {
  const { locale, slug } = await params;

  const localizedPost = getPostBySlug(slug, locale);
  const fallbackPost = localizedPost ?? getPostBySlug(slug, 'en');
  const isFallback = !localizedPost && !!fallbackPost;

  if (!fallbackPost) {
    notFound();
  }

  const post = fallbackPost;
  const t = await getTranslations('blog');

  const allPosts = getAllPosts(locale);
  const postIndex = allPosts.findIndex((p) => p.slug === slug);

  const formattedDate = new Date(post.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const previousPost = postIndex !== -1 && postIndex < allPosts.length - 1 ? allPosts[postIndex + 1] : null;
  const nextPost = postIndex > 0 ? allPosts[postIndex - 1] : null;

  // Extract headings server-side from rendered HTML
  const headings: Heading[] = [];
  const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(post.html)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      id: match[2],
      text: match[3].replace(/<[^>]+>/g, ''),
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateArticleSchema(post)),
        }}
      />

      <div className="flex min-h-screen flex-col">
        <ReadingProgress />
        <Header locale={locale} />

        <main className="flex-1">
          {isFallback && <TranslationUnavailableNotice locale={locale} />}

          {/* Article Header */}
          <article className="border-b border-border bg-card">
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
              {/* Back Link */}
              <Link
                href={`/${locale}/blog`}
                className="mb-8 flex w-fit items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('backToBlog')}
              </Link>

              <ArticleHeader
                title={post.title}
                category={post.category}
                author={post.author}
                date={formattedDate}
                readTime={post.readTime}
              />
            </div>
          </article>

          {/* Article Content */}
          <section className="bg-background py-12 sm:py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

              {/* Cover Image */}
              {post.coverImage && (
                <div className="mb-10 w-full overflow-hidden rounded-2xl border border-border shadow-md">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full max-w-full object-cover max-h-[420px]"
                    loading="eager"
                  />
                </div>
              )}
              <div className="grid gap-8 lg:grid-cols-4">
                <aside className="hidden lg:block lg:col-span-1">
                  <TableOfContents headings={headings} />
                </aside>
                <div className="lg:col-span-3 min-w-0">
                  <div className="prose max-w-none break-words
                    [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block
                    [&_pre]:overflow-x-auto [&_pre]:max-w-full
                    [&_code]:break-all
                    [&_img]:max-w-full [&_img]:h-auto
                    [&_iframe]:max-w-full">
                    <div
                      className="text-foreground"
                      dangerouslySetInnerHTML={{ __html: post.html }}
                    />
                  </div>
                </div>
              </div>

              {/* Article Footer */}
              <div className="mt-12 border-t border-border pt-8">
                <div className="mb-8 rounded-lg bg-card p-6">
                  <h3 className="mb-2 font-bold text-foreground">
                    {t('aboutAuthor')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('authorBio', { author: post.author })}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <SocialShare title={post.title} />
                  </div>
                </div>

                {/* Navigation */}
                <div className="grid gap-6 sm:grid-cols-2">
                  {previousPost && (
                    <Link
                      href={`/${locale}/blog/${previousPost.slug}`}
                      className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-accent hover:shadow-md"
                    >
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        {t('previousArticle')}
                      </p>
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {previousPost.title}
                      </p>
                    </Link>
                  )}
                  {nextPost && (
                    <Link
                      href={`/${locale}/blog/${nextPost.slug}`}
                      className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-accent hover:shadow-md text-right"
                    >
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        {t('nextArticle')}
                      </p>
                      <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {nextPost.title}
                      </p>
                    </Link>
                  )}
                </div>

                {/* Related Posts */}
                <RelatedPosts
                  posts={getRelatedPosts(slug, post.category, 3, locale)}
                  locale={locale}
                />
              </div>
            </div>
          </section>
        </main>

        <Footer locale={locale} />
      </div>
    </>
  );
}
