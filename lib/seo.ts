import { Post, PostMetadata } from './posts';

export const SITE_CONFIG = {
  name: 'SEO Blog Platform',
  description: 'A high-performance, SEO-optimized, multi-language blog platform.',
  defaultLocale: 'en',
  supportedLocales: ['en', 'fr'],
} as const;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  author?: string;
  image?: string;
  url: string;
  type: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
}

/**
 * Generate SEO metadata for a page
 */
export function generateSEOMetadata(overrides: Partial<SEOMetadata>): SEOMetadata {
  return {
    title: `${SITE_CONFIG.name} - Master Search Engine Optimization`,
    description: 'Learn SEO fundamentals, keyword research, technical optimization, and content strategy to improve your search rankings.',
    keywords: ['seo', 'search engine optimization', 'digital marketing', 'content strategy'],
    image: '/og-image.jpg',
    url: baseUrl,
    type: 'website',
    ...overrides,
  };
}

/**
 * Generate SEO metadata for a blog post
 */
export function generatePostSEOMetadata(post: Post, locale: string = 'en'): SEOMetadata {
  const canonical = `${baseUrl}/${locale}/blog/${post.slug}`;

  const languages: Record<string, string> = {};
  for (const loc of SITE_CONFIG.supportedLocales) {
    languages[loc] = `${baseUrl}/${loc}/blog/${post.slug}`;
  }

  // Derive keywords from tags if present, falling back to category
  const keywords: string[] =
    post.tags && post.tags.length > 0
      ? post.tags
      : post.category.toLowerCase().split(' ');

  return {
    title: post.title,
    description: post.excerpt,
    keywords,
    author: post.author,
    url: canonical,
    type: 'article',
    publishedTime: post.date,
    image: '/og-image.jpg',
    alternates: {
      canonical,
      languages,
    },
  };
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    description: 'Your guide to mastering search engine optimization',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      'https://twitter.com/seoblog',
      'https://linkedin.com/company/seoblog',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@seoblog.example.com',
    },
  };
}

/**
 * Generate JSON-LD structured data for a blog article
 */
export function generateArticleSchema(post: Post): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: '/og-image.jpg',
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  };
}

/**
 * Generate JSON-LD structured data for FAQPage
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /
Allow: /blog/
Allow: /categories/
Allow: /search

Disallow: /admin/
Disallow: /private/

Sitemap: ${baseUrl}/sitemap.xml
`;
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Generate meta tags object for Next.js metadata API
 * (renamed from generateMetadata to avoid shadowing the Next.js page-level export)
 */
export function buildNextMetadata(seo: SEOMetadata) {
  const image = seo.image ?? '/og-image.jpg';

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.join(', '),
    author: seo.author,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.url,
      type: seo.type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: seo.title,
      description: seo.description,
      images: [image],
    },
    ...(seo.alternates
      ? {
          alternates: {
            canonical: seo.alternates.canonical,
            languages: seo.alternates.languages,
          },
        }
      : {}),
  };
}
