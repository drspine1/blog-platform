import type { MetadataRoute } from 'next';
import { getAllPostMetadata } from '@/lib/posts';
import { getAllCategories, getAllTags } from '@/lib/content';
import { SITE_CONFIG } from '@/lib/seo';
import { slugifyTag } from '@/lib/utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const posts = getAllPostMetadata();
  const categories = getAllCategories();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const tagPages: MetadataRoute.Sitemap = SITE_CONFIG.supportedLocales.flatMap((locale) => {
    const tags = getAllTags(locale);
    return tags.map((tag) => ({
      url: `${baseUrl}/${locale}/tag/${slugifyTag(tag)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  });

  return [...staticPages, ...postPages, ...categoryPages, ...tagPages];
}
