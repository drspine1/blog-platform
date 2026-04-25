'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { SITE_CONFIG } from '@/lib/seo';

function LanguageSwitcher({ locale }: { locale?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/`;
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && (SITE_CONFIG.supportedLocales as readonly string[]).includes(segments[0])) {
      segments[0] = newLocale;
      router.push('/' + segments.join('/'));
    } else {
      router.push('/' + newLocale + pathname);
    }
  };

  const currentLocale = locale ?? SITE_CONFIG.defaultLocale;

  return (
    <div className="flex items-center gap-1">
      {SITE_CONFIG.supportedLocales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLocaleChange(loc)}
          className={cn(
            'rounded px-2 py-1 text-xs font-medium uppercase transition-colors',
            currentLocale === loc
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-accent'
          )}
          aria-label={`Switch to ${loc}`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}

export function Header({ locale }: { locale?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations('nav');

  const activeLocale = locale ?? SITE_CONFIG.defaultLocale;

  const navigation = [
    { key: 'home', href: `/${activeLocale}` },
    { key: 'blog', href: `/${activeLocale}/blog` },
    { key: 'categories', href: `/${activeLocale}/categories` },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${activeLocale}/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo — "S" badge only, no text */}
          <Link href={`/${activeLocale}`} className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">
              S
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-accent',
                  pathname === item.href ? 'text-accent' : 'text-muted-foreground'
                )}
              >
                {t(item.key as 'home' | 'blog' | 'categories')}
              </Link>
            ))}
          </nav>

          {/* Desktop: Search form + Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher locale={locale} />
            <form onSubmit={handleSearch} className="flex items-center gap-1">
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-l-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                className="flex items-center rounded-r-lg border border-l-0 border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Mobile: Language Switcher + Search icon + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <Link
              href={`/${activeLocale}/search`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown — nav links only */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent',
                  pathname === item.href
                    ? 'bg-accent/10 text-accent'
                    : 'text-foreground'
                )}
              >
                {t(item.key as 'home' | 'blog' | 'categories')}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
