import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { BlogCard } from '@/components/blog-card';
import { getAllCategories, getPostsByCategory } from '@/lib/content';
import { generateSEOMetadata, buildNextMetadata, SITE_CONFIG } from '@/lib/seo';
import { PageLayout } from '@/components/page-layout';

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function getCategoryFromSlug(slug: string, locale: string): Promise<string | null> {
  const categories = getAllCategories(locale);
  const normalizedSlug = slug.toLowerCase().replace(/-/g, ' ');
  return categories.find((cat) => cat.toLowerCase() === normalizedSlug) || null;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryFromSlug(slug, locale);
  if (!category) return { title: 'Category Not Found' };
  return buildNextMetadata(
    generateSEOMetadata({
      title: `${category} | SEO Blog Platform`,
      description: `Explore articles in the ${category} category.`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/${locale}/categories/${slug}`,
    })
  );
}

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of SITE_CONFIG.supportedLocales) {
    const categories = getAllCategories(locale);
    for (const category of categories) {
      params.push({ locale, slug: category.toLowerCase().replace(/\s+/g, '-') });
    }
  }
  return params;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  const category = await getCategoryFromSlug(slug, locale);
  const t = await getTranslations('categories');

  if (!category) {
    return (
      <PageLayout locale={locale}>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">{t('notFound')}</h1>
            <p className="text-muted-foreground mb-6">{t('notFoundDesc')}</p>
            <Link
              href={`/${locale}/categories`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-medium text-accent-foreground transition-all hover:shadow-lg"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('backToCategories')}
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const posts = getPostsByCategory(category, locale);

  return (
    <PageLayout locale={locale}>
      <section className="border-b border-border bg-card py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/categories`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('backToCategories')}
          </Link>
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">{category}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('articlesInCategory', { count: posts.length })}
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
