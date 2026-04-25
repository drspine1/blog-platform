import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SITE_CONFIG } from '@/lib/seo'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} - Master Search Engine Optimization`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: ['SEO', 'search engine optimization', 'digital marketing', 'content strategy', 'technical SEO'],
  authors: [{ name: 'SEO Blog Team' }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - Master Search Engine Optimization`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SEO Blog Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@seoblogplatform',
    creator: '@seoblogplatform',
  },
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  alternates: {
    canonical: siteUrl,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f3f0' },
    { media: '(prefers-color-scheme: dark)', color: '#262420' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased bg-background">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
