import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handler = createMiddleware(routing);

// Next.js 16: export named "proxy" instead of "default"
export const proxy = handler;

// Keep default export for compatibility
export default handler;

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
