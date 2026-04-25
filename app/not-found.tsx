import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
          <h2 className="text-3xl font-bold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Sorry, the page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on track.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="inline-block px-6 py-3 border border-border rounded-lg hover:bg-card transition-colors font-medium text-foreground"
            >
              Blog
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
