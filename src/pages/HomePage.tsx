import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Droplets,
  FileSearch,
  MapPin,
  Wrench,
} from 'lucide-react';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';
import { useLanguage } from '../contexts/LanguageContext';
import { CURATED_AWARENESS_ARTICLES } from '../services/awarenessService';
import HERO_IMG from '../assets/images/hero_community_water_1794739093987.jpg';
import STORAGE_IMG from '../assets/images/awareness_safe_storage_1794739093290.jpg';
import BOILING_IMG from '../assets/images/awareness_boiling_water_1794739094396.jpg';
import TOWER_IMG from '../assets/images/panchayat_water_tower_1794739095111.jpg';

const DEMO_STATS = [
  {
    label: 'Pilot Wards Covered',
    value: 'Ward 2 & 4',
    detail: 'Herooru Grama Panchayat',
  },
  {
    label: 'Demo Baseline Reports Logged',
    value: '42',
    detail: 'Illustrative pilot baseline',
  },
  {
    label: 'Demo Resolved Observations',
    value: '34',
    detail: 'Pipeline & supply actions',
  },
  {
    label: 'PHED Lab Referrals (Demo)',
    value: '06',
    detail: 'Sent to Tumakuru water lab',
  },
];

export function HomePage() {
  const { language, t } = useLanguage();
  const featuredArticles = CURATED_AWARENESS_ARTICLES.slice(0, 3);

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center space-y-6 lg:col-span-6">
              <p className="text-xs font-semibold tracking-wide text-sky-800">
                {t.hero.panchayatLabel}
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl text-balance leading-[1.12]">
                {t.hero.heading}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                {t.hero.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/report"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-sky-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-800 whitespace-nowrap"
                >
                  <span>{t.hero.reportBtn}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
                <Link
                  to="/track"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 whitespace-nowrap"
                >
                  <FileSearch className="h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
                  <span>{t.hero.trackBtn}</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-72 sm:h-96 lg:h-full min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-sky-950">
                <img
                  src={HERO_IMG}
                  alt="Community drinking water tap stand in Tumakuru district, Karnataka"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent p-6 text-white">
                  <p className="text-xs font-medium text-sky-200">
                    {t.brandName} · {t.tagline}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/95">
                    Centralized citizen observation registry replacing untracked phone calls and messages.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Community Statistics Strip (Demo Baseline Labelled Clearly) */}
          <div className="mt-12 border-t border-slate-200 pt-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between mb-5">
              <h2 className="font-display text-base font-bold text-slate-900">
                {t.home.statsTitle}
              </h2>
              <p className="text-xs text-slate-500">{t.home.statsDemoNote}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {DEMO_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Scientific Limitation Banner */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <ScientificDisclaimer />
      </div>

      {/* How Aqua Connect Works: Report -> Engineer Action -> Resolution */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {t.home.howItWorksTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Report &rarr; Engineer Action &rarr; Resolution: structured civic accountability for every water observation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <Droplets className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {t.home.step1Title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">{t.home.step1Desc}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {t.home.step2Title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">{t.home.step2Desc}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {t.home.step3Title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">{t.home.step3Desc}</p>
          </div>
        </div>
      </section>

      {/* Safe-Water Awareness Highlights */}
      <section className="border-y border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {t.home.awarenessTitle}
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Evidence-based guidance referencing WHO, BIS IS 10500, Jal Jeevan Mission, and CDC.
              </p>
            </div>
            <Link
              to="/awareness"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
            >
              <BookOpen className="h-4 w-4 text-sky-700" aria-hidden="true" />
              <span>{t.home.viewAllAwareness}</span>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredArticles.map((article, idx) => {
              const cardImg = idx === 0 ? STORAGE_IMG : idx === 1 ? BOILING_IMG : TOWER_IMG;
              const title = language === 'kn' && article.titleKn ? article.titleKn : article.title;
              const content =
                language === 'kn' && article.contentKn ? article.contentKn : article.content;

              return (
                <article
                  key={article.articleId}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <div className="h-44 w-full overflow-hidden bg-slate-200">
                    <img
                      src={cardImg}
                      alt={title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{article.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{article.lastReviewedAt}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                      {title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3 flex-1">{content}</p>
                    <p className="pt-2 text-xs font-medium text-sky-800">
                      Source: {article.sourceName}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Project Objectives & Pilot Scope */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 h-72 lg:h-80">
              <img
                src={TOWER_IMG}
                alt="Elevated village drinking water overhead tank in Karnataka"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-800">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Mahatma Gandhi Herooru Grama Panchayat · Pilot Wards 2 &amp; 4</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {t.home.objectivesTitle}
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              Developed under the VTU 2025 Scheme (Course 1BCP308 – Community/Societal Project) by
              Team ILLUMINATORS at Channabasaveshwara Institute of Technology, Aqua Connect replaces
              fragmented telephone calls and WhatsApp messages with an auditable civic registry.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 text-sm text-slate-700">
              <li className="rounded-lg border border-slate-200 bg-white p-3.5">
                Centralized, timestamped citizen reporting with ward and landmark indexing.
              </li>
              <li className="rounded-lg border border-slate-200 bg-white p-3.5">
                Transparent status tracking from submission through PHED lab referral and closure.
              </li>
              <li className="rounded-lg border border-slate-200 bg-white p-3.5">
                Role-protected engineer investigation notes and corrective action logs.
              </li>
              <li className="rounded-lg border border-slate-200 bg-white p-3.5">
                Bilingual English and Kannada accessibility for rural smartphones.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
