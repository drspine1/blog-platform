import { redirect } from 'next/navigation';

// Root "/" redirects to the default locale.
// All content lives under app/[locale]/.
export default function RootPage() {
  redirect('/en');
}
