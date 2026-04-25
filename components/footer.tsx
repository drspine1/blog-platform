'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SITE_CONFIG } from '@/lib/seo';

interface FooterProps {
  locale?: string;
}

export function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const activeLocale = locale ?? SITE_CONFIG.defaultLocale;

  const links = [
    {
      title: tNav('resources' as never) ?? 'Resources',
      items: [
        { name: tNav('blog'), href: `/${activeLocale}/blog` },
        { name: tNav('categories'), href: `/${activeLocale}/categories` },
        { name: tNav('search'), href: `/${activeLocale}/search` },
      ],
    },
    {
      title: tNav('company' as never) ?? 'Company',
      items: [
        { name: 'Contact', href: `/${activeLocale}/contact` },
        { name: 'Privacy', href: `/${activeLocale}/privacy` },
        { name: 'Terms', href: `/${activeLocale}/terms` },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground font-bold">
                S
              </div>
              <span className="font-bold text-foreground">SEO Blog</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('tagline')}
            </p>
          </div>

          {/* Links */}
          {links.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
              <ul className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-accent"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} SEO Blog Platform. {t('rights')}
            </p>
            <a
              href="mailto:hello@seoblog.com"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <Mail className="h-4 w-4" />
              {t('contact')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
