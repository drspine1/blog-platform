import { defineRouting } from 'next-intl/routing';

// Hardcoded here to avoid importing server-only lib/seo.ts into the edge runtime.
// Keep in sync with SITE_CONFIG in lib/seo.ts.
export const routing = defineRouting({
  locales: ['en', 'fr'] as const,
  defaultLocale: 'en',
});
