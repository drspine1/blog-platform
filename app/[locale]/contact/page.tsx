import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Mail, MessageSquare } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { buildNextMetadata, generateSEOMetadata, SITE_CONFIG } from '@/lib/seo';
import { PageLayout } from '@/components/page-layout';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  return buildNextMetadata(
    generateSEOMetadata({
      title: 'Contact Us - SEO Blog Platform',
      description: "Get in touch with our team.",
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/${locale}/contact`,
    })
  );
}

export function generateStaticParams() {
  return SITE_CONFIG.supportedLocales.map((locale) => ({ locale }));
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const t = await getTranslations('contact');

  return (
    <PageLayout locale={locale}>
      <section className="border-b border-border bg-card py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('backToHome')}
          </Link>
          <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">{t('title')}</h1>
          <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-8 text-2xl font-bold text-foreground">{t('infoTitle')}</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Mail className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-foreground">{t('email')}</h3>
                    <a href="mailto:hello@seoblog.com" className="text-accent transition-colors hover:text-accent/80">
                      hello@seoblog.com
                    </a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <MessageSquare className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-foreground">{t('responseTime')}</h3>
                    <p className="text-sm text-muted-foreground">{t('responseTimeDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-8 text-2xl font-bold text-foreground">{t('formTitle')}</h2>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">{t('name')}</label>
                  <input type="text" id="name" placeholder={t('namePlaceholder')}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" required />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">{t('email')}</label>
                  <input type="email" id="email" placeholder={t('emailPlaceholder')}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" required />
                </div>
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium text-foreground">{t('subject')}</label>
                  <input type="text" id="subject" placeholder={t('subjectPlaceholder')}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" required />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">{t('message')}</label>
                  <textarea id="message" placeholder={t('messagePlaceholder')} rows={5}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none" required />
                </div>
                <button type="submit"
                  className="w-full rounded-lg bg-accent px-6 py-3 font-medium text-accent-foreground transition-all hover:shadow-lg active:scale-95">
                  {t('send')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
