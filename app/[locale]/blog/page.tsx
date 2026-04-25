import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getAllPostMetadata } from '@/lib/posts';
import { generateSEOMetadata, buildNextMetadata, SITE_CONFIG } from '@/lib/seo';
import { PageLayout } from '@/components/page-layout';
import BlogCardList from '@/components/blog-card-list';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildNextMetadata(
    generateSEOMetadata({
      title: 'Blog | SEO Blog Platform',
      description: 'Browse all SEO articles and guides. Learn about keyword research, technical SEO, content strategy, and more.',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/${locale}/blog`,
    })
  );
}

export function generateStaticParams() {
  return SITE_CONFIG.supportedLocales.map((locale) => ({ locale }));
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const posts = getAllPostMetadata(locale);
  const t = await getTranslations('blog');

  return (
    <PageLayout locale={locale}>
      {/* Header Section */}
      <section className="border-b border-border bg-card py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            {t('allArticles')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('allArticlesDesc')}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BlogCardList posts={posts} locale={locale} />
        </div>
      </section>
    </PageLayout>
  );
}
