import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageLayout } from '@/components/page-layout';
import { HeroSection, FeaturesSection, FeaturedPostsSection, CTASection } from '@/components/home-animations';
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
    { iconName: 'BookOpen' as const, title: t('feature1Title'), desc: t('feature1Desc') },
    { iconName: 'TrendingUp' as const, title: t('feature2Title'), desc: t('feature2Desc') },
    { iconName: 'Sparkles' as const, title: t('feature3Title'), desc: t('feature3Desc') },
  ];

  return (
    <PageLayout locale={locale}>
      <HeroSection
        badge={t('badge')}
        heroTitle={t('heroTitle')}
        heroDesc={t('heroDesc')}
        startLearning={t('startLearning')}
        browseCategories={t('browseCategories')}
        blogHref={`/${locale}/blog`}
        categoriesHref={`/${locale}/categories`}
      />
      <FeaturesSection
        featuresTitle={t('featuresTitle')}
        features={features}
      />
      <FeaturedPostsSection
        featuredTitle={t('featuredTitle')}
        featuredDesc={t('featuredDesc')}
        viewAll={t('viewAll')}
        viewAllArticles={t('viewAllArticles')}
        blogHref={`/${locale}/blog`}
        posts={featuredPosts}
        locale={locale}
      />
      <CTASection
        ctaTitle={t('ctaTitle')}
        ctaDesc={t('ctaDesc')}
        exploreGuides={t('exploreGuides')}
        blogHref={`/${locale}/blog`}
      />
    </PageLayout>
  );
}
