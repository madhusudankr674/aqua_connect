import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function ScientificDisclaimer({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();

  return (
    <section
      aria-label={t.disclaimer.heading}
      className={`rounded-xl border border-sky-200 bg-sky-50/75 text-slate-800 ${
        compact ? 'p-4' : 'p-5 md:p-6'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-200 bg-white text-sky-700">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-display text-sm font-bold tracking-tight text-slate-900 md:text-base">
            {t.disclaimer.heading}
          </h2>
          <p className="text-sm leading-relaxed text-slate-700">{t.disclaimer.body}</p>
        </div>
      </div>
    </section>
  );
}
