import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BlogCard } from '@/components/blog-card';
import { getAllTags, getPostsByTag } from '@/lib/content';
import { generateSEOMetadata, buildNextMetadata, SITE_CONFIG } from '@/lib/seo';
import { slugifyTag } from '@/lib/utils';
import { PageLayout } from '@/components/page-layout';

interface TagPageProps {
  params: Promise<{ locale: string; tag: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { locale, tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return buildNextMetadata(
    generateSEOMetadata({
      title: `${decodedTag} Articles | SEO Blog Platform`,
      description: `Browse all articles tagged with ${decodedTag}.`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/${locale}/tag/${tag}`,
    })
  );
}

export function generateStaticParams() {
  const params: { locale: string; tag: string }[] = [];
  for (const locale of SITE_CONFIG.supportedLocales) {
    const tags = getAllTags(locale);
    for (const tag of tags) {
      params.push({ locale, tag: slugifyTag(tag) });
    }
  }
  return params;
}

export default async function TagPage({ params }: TagPageProps) {
  const { locale, tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const t = await getTranslations('tags');

  // Find posts matching this tag slug
  const allTags = getAllTags(locale);
  const matchedTag = allTags.find((t) => slugifyTag(t) === decodedTag) ?? decodedTag;
  const posts = getPostsByTag(matchedTag, locale);

  return (
    <PageLayout locale={locale}>
      <section className="border-b border-border bg-card py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            {t('articles', { tag: matchedTag })}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'}
          </p>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">{t('noArticles')}</p>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
