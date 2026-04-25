'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearch } from '@/hooks/use-search';
import { PageLayout } from '@/components/page-layout';

// Inner component that uses useSearchParams — must be inside Suspense
function SearchContent() {
  const searchParams = useSearchParams();
  const { locale } = useParams<{ locale: string }>();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [hasSearched, setHasSearched] = useState(!!queryParam);

  const { search, results, isLoading } = useSearch();
  const t = useTranslations('search');

  useEffect(() => {
    if (queryParam && !isLoading) {
      search(queryParam);
      setHasSearched(true);
    }
  }, [queryParam, isLoading, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', query);
      window.history.pushState({}, '', url);
      search(query);
      setHasSearched(true);
    }
  };

  return (
    <PageLayout>
      {/* Search Header */}
      <section className="border-b border-border bg-card py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('back')}
          </Link>

          <h1 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">
            {t('title')}
          </h1>

          <form onSubmit={handleSearch} className="mt-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-accent px-6 py-3 font-medium text-accent-foreground transition-all hover:shadow-lg hover:scale-105 active:scale-95"
              >
                {t('button')}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full border-2 border-border border-t-accent h-8 w-8" />
              <p className="mt-4 text-muted-foreground">{t('searching')}</p>
            </div>
          ) : !hasSearched ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t('enterQuery')}</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="mb-8 text-muted-foreground">
                {t('results', { count: results.length, query })}
              </p>
              <div className="space-y-4">
                {results.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/${locale}/blog/${post.slug}`}
                    className="group block rounded-lg border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-md"
                  >
                    <div className="mb-2 inline-block">
                      <span className="rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">{t('noResults', { query })}</p>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}

// Outer page wraps SearchContent in Suspense (required for useSearchParams in Next.js)
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block animate-spin rounded-full border-2 border-border border-t-accent h-8 w-8" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
