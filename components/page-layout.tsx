import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

interface PageLayoutProps {
  children: React.ReactNode;
  locale?: string;
}

export function PageLayout({ children, locale }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
