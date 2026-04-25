import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, BookOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { BlogCard } from '@/components/blog-card';
import { PageLayout } from '@/components/page-layout';
import { getFeaturedPosts } from '@/lib/content';
import { buildNextMetadata, generateSEOMetadata, SITE_CONFIG } from '@/lib/seo';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildNextMetadata(
    generateSEOMetadata({
      title: `${SITE_CONFIG.name} - Master Search Engine Optimization`,
      description: SITE_CONFIG.description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/${locale}`,
    })
  );
}

export function generateStaticParams() {
  return SITE_CONFIG.supportedLocales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const featuredPosts = getFeaturedPosts(locale);
  const t = await getTranslations('home');

  const features = [
    { icon: BookOpen, titleKey: 'feature1Title' as const, descKey: 'feature1Desc' as const },
    { icon: TrendingUp, titleKey: 'feature2Title' as const, descKey: 'feature2Desc' as const },
    { icon: Sparkles, titleKey: 'feature3Title' as const, descKey: 'feature3Desc' as const },
  ];

  return (
    <PageLayout locale={locale}>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — text */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">{t('badge')}</span>
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance">
                {t('heroTitle')}
              </h1>

              <p className="mb-8 text-lg text-muted-foreground text-balance">
                {t('heroDesc')}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/${locale}/blog`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-accent-foreground transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {t('startLearning')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/${locale}/categories`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {t('browseCategories')}
                </Link>
              </div>
            </div>

            {/* Right — hero image */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                {/* Decorative glow */}
                <div className="absolute -inset-4 rounded-2xl bg-accent/10 blur-2xl" />
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                  alt="SEO analytics dashboard showing search rankings and traffic growth"
                  width={800}
                  height={533}
                  className="relative rounded-2xl border border-border shadow-2xl object-cover w-full"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b border-border bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            {t('featuresTitle')}
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, titleKey, descKey }) => (
              <div
                key={titleKey}
                className="rounded-lg border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-md"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-accent/10 p-3">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 font-bold text-foreground">{t(titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="border-b border-border bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">{t('featuredTitle')}</h2>
              <p className="mt-2 text-muted-foreground">{t('featuredDesc')}</p>
            </div>
            <Link
              href={`/${locale}/blog`}
              className="hidden items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80 sm:flex"
            >
              {t('viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} locale={locale} />
            ))}
          </div>

          <div className="mt-8 flex sm:hidden">
            <Link
              href={`/${locale}/blog`}
              className="w-full rounded-lg border border-border bg-background px-6 py-3 text-center font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {t('viewAllArticles')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-foreground">{t('ctaTitle')}</h2>
          <p className="mb-8 text-lg text-muted-foreground">{t('ctaDesc')}</p>
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-8 py-4 font-medium text-accent-foreground transition-all hover:shadow-lg hover:scale-105 active:scale-95"
          >
            {t('exploreGuides')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
