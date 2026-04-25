'use client';

import { useTranslations } from 'next-intl';

interface TranslationUnavailableNoticeProps {
  locale: string;
}

export default function TranslationUnavailableNotice({ locale }: TranslationUnavailableNoticeProps) {
  const t = useTranslations('i18n');

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
      {t('translationUnavailable', { locale })}
    </div>
  );
}
