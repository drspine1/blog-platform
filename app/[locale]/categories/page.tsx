import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getAllCategories, getPostsByCategory } from '@/lib/content';
import { generateSEOMetadata, buildNextMetadata, SITE_CONFIG } from '@/lib/seo';
import { PageLayout } from '@/components/page-layout';

interface CategoriesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CategoriesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildNextMetadata(
    generateSEOMetadata({
      title: 'Categories | SEO Blog Platform',
      description: 'Browse articles by category. Explore SEO basics, technical SEO, content strategy, and more.',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/${locale}/categories`,
    })
  );
}

export function generateStaticParams() {
  return SITE_CONFIG.supportedLocales.map((locale) => ({ locale }));
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = await params;
  const categories = getAllCategories(locale);
  const t = await getTranslations('categories');

  return (
    <PageLayout locale={locale}>
      {/* Header Section */}
      <section className="border-b border-border bg-card py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {categories.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {categories.map((category) => {
                const posts = getPostsByCategory(category, locale);
                return (
                  <Link
                    key={category}
                    href={`/${locale}/categories/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="group rounded-lg border border-border bg-card p-8 transition-all hover:border-accent hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                          {category}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t('articles', { count: posts.length })}
                        </p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No categories found.</p>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
