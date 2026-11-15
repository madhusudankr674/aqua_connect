import { useEffect, useState } from 'react';
import { BookCheck, ExternalLink } from 'lucide-react';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';
import { useLanguage } from '../contexts/LanguageContext';
import {
  AWARENESS_CATEGORIES,
  CURATED_AWARENESS_ARTICLES,
  fetchAwarenessArticles,
} from '../services/awarenessService';
import type { AwarenessArticle, AwarenessCategory } from '../types/awareness';

const REFERENCE_AUTHORITIES = [
  {
    name: 'World Health Organization (WHO)',
    detail: 'Guidelines for Drinking-water Quality & Household Water Treatment',
    url: 'https://www.who.int/teams/environment-climate-change-and-health/water-sanitation-and-health/water-safety-and-quality',
  },
  {
    name: 'BIS IS 10500:2012',
    detail: 'Bureau of Indian Standards Drinking Water Specification',
    url: 'https://www.bis.gov.in/',
  },
  {
    name: 'Jal Jeevan Mission (JJM)',
    detail: 'Har Ghar Jal — Rural Drinking Water Quality Monitoring & Surveillance',
    url: 'https://jaljeevanmission.gov.in/',
  },
  {
    name: 'Centers for Disease Control and Prevention (CDC)',
    detail: 'Safe Water Storage, Boiling & Hygiene Guidance',
    url: 'https://www.cdc.gov/water-emergency/about/how-to-make-water-safe.html',
  },
];

export function WaterAwarenessPage() {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<AwarenessArticle[]>(CURATED_AWARENESS_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState<AwarenessCategory | 'All'>('All');

  useEffect(() => {
    fetchAwarenessArticles(false)
      .then((list) => setArticles(list))
      .catch(() => setArticles(CURATED_AWARENESS_ARTICLES));
  }, []);

  const filtered =
    selectedCategory === 'All'
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-3xl space-y-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Safe Drinking-Water Awareness Centre
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
          Curated educational guidance covering safe storage, boiling, household purification,
          pipeline hygiene, warning signs, and health precautions.
        </p>
      </div>

      {/* PHED Review Governance Notice */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-start gap-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-700">
          <BookCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="text-sm text-slate-700 space-y-1">
          <p className="font-display font-bold text-slate-900">
            Local PHED &amp; Water-Supply Engineer Review Requirement
          </p>
          <p>
            All educational guidance published on Aqua Connect must be reviewed by the local PHED
            or Grama Panchayat water-supply engineer before being treated as locally approved
            guidance for your community.
          </p>
        </div>
      </div>

      <ScientificDisclaimer />

      {/* Category Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter awareness topics"
        className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2"
      >
        <button
          type="button"
          onClick={() => setSelectedCategory('All')}
          className={`min-h-[40px] rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            selectedCategory === 'All'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          All Topics ({articles.length})
        </button>
        {AWARENESS_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`min-h-[40px] rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-sky-700 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((article) => {
          const title = language === 'kn' && article.titleKn ? article.titleKn : article.title;
          const content =
            language === 'kn' && article.contentKn ? article.contentKn : article.content;

          return (
            <article
              key={article.articleId}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-sky-800">{article.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {article.approvedByPhed ? 'PHED Reviewed' : 'Pending Local Review'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Reviewed {article.lastReviewedAt}
                  </span>
                </div>

                <h2 className="font-display text-lg font-bold text-slate-900 leading-snug">
                  {title}
                </h2>
                <p className="text-sm leading-relaxed text-slate-700">{content}</p>
              </div>

              <div className="border-t border-slate-200 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-medium text-slate-700">{article.sourceName}</span>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-900 underline whitespace-nowrap"
                >
                  <span>Reference Source</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {/* Authoritative References Index */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Authoritative Reference Standards
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {REFERENCE_AUTHORITIES.map((ref) => (
            <a
              key={ref.name}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-sky-300 hover:bg-sky-50/40"
            >
              <div className="space-y-1">
                <h3 className="font-display text-sm font-bold text-slate-900">{ref.name}</h3>
                <p className="text-xs text-slate-600">{ref.detail}</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-sky-700 mt-0.5" aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
