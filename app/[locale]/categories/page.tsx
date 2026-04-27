import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getAllCategories, getPostsByCategory } from '@/lib/content';
import { generateSEOMetadata, buildNextMetadata, SITE_CONFIG } from '@/lib/seo';
import { PageLayout } from '@/components/page-layout';
import AnimatedCategoryGrid from '@/components/animated-category-grid';

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
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">{t('title')}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t('description')}</p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedCategoryGrid
            categories={categories.map((category) => ({
              name: category,
              count: getPostsByCategory(category, locale).length,
              href: `/${locale}/categories/${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}`,
              label: t('articles', { count: getPostsByCategory(category, locale).length }),
            }))}
          />
        </div>
      </section>
    </PageLayout>
  );
}
