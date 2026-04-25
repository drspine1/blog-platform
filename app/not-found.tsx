import Link from 'next/link'

// This page renders outside the [locale] layout so it must NOT use
// any next-intl hooks (no useTranslations, no Header/Footer that use them).
export default function NotFound() {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground text-2xl font-bold">
            S
          </div>
          <h1 className="mt-6 text-6xl font-bold text-accent">404</h1>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Page Not Found</h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Sorry, the page you&apos;re looking for doesn&apos;t exist.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/en"
              className="rounded-lg bg-accent px-6 py-3 font-medium text-accent-foreground transition-all hover:shadow-lg hover:scale-105"
            >
              Go Home
            </Link>
            <Link
              href="/en/blog"
              className="rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-card"
            >
              Browse Blog
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
