import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Search } from 'lucide-react';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';
import { StatusTimeline } from '../components/StatusTimeline';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  fetchCitizenComplaints,
  formatTimestamp,
  lookupPublicComplaint,
} from '../services/complaintService';
import { extractMobileLast4 } from '../services/validation';
import { getStatusStyle } from '../services/workflow';
import type { Complaint, PublicTrackingRecord } from '../types/complaint';

export function TrackComplaintPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { firebaseUser, authReady } = useAuth();

  const [complaintId, setComplaintId] = useState(searchParams.get('id') || '');
  const [mobileLast4, setMobileLast4] = useState(searchParams.get('last4') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<PublicTrackingRecord | null>(null);
  const [searchedOnce, setSearchedOnce] = useState(false);

  const [myComplaints, setMyComplaints] = useState<Complaint[]>([]);
  const [loadingMine, setLoadingMine] = useState(false);

  const runLookup = async (idToLookup: string, last4ToVerify: string) => {
    setLoading(true);
    setError(null);
    setSearchedOnce(true);
    try {
      const result = await lookupPublicComplaint(idToLookup, last4ToVerify);
      setRecord(result);
    } catch (err) {
      setRecord(null);
      setError(err instanceof Error ? err.message : 'Unable to verify complaint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idParam = searchParams.get('id');
    const last4Param = searchParams.get('last4');
    if (idParam && last4Param && last4Param.length === 4) {
      void runLookup(idParam, last4Param);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authReady || !firebaseUser) {
      setMyComplaints([]);
      return;
    }
    setLoadingMine(true);
    fetchCitizenComplaints(firebaseUser.uid)
      .then((list) => setMyComplaints(list))
      .catch(() => setMyComplaints([]))
      .finally(() => setLoadingMine(false));
  }, [authReady, firebaseUser]);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    void runLookup(complaintId, mobileLast4);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t.track.title}
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">{t.track.subtitle}</p>
      </div>

      {/* Verification Search Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <label htmlFor="track-id" className="block text-sm font-medium text-slate-800 mb-1.5">
              {t.track.complaintIdLabel}
            </label>
            <input
              id="track-id"
              type="text"
              required
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value.toUpperCase())}
              placeholder="e.g. AQ-2026-W2-4819"
              className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 font-mono text-sm uppercase text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="track-last4" className="block text-sm font-medium text-slate-800 mb-1.5">
              {t.track.mobileLast4Label}
            </label>
            <input
              id="track-last4"
              type="text"
              inputMode="numeric"
              maxLength={4}
              required
              value={mobileLast4}
              onChange={(e) => setMobileLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60 cursor-pointer whitespace-nowrap"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{loading ? t.track.searchingBtn : t.track.searchBtn}</span>
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-900"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-700" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Signed-in Citizen's Own Submitted Complaints */}
      {firebaseUser && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-slate-900">
              {t.track.myReportsTitle}
            </h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {myComplaints.length} records
            </span>
          </div>

          {loadingMine ? (
            <p className="text-sm text-slate-500">Loading your submitted reports...</p>
          ) : myComplaints.length === 0 ? (
            <p className="text-sm text-slate-500">
              You have not submitted any complaints from this account yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-200">
              {myComplaints.map((c) => {
                const last4 = extractMobileLast4(c.mobile);
                const statusStyle = getStatusStyle(c.status);
                return (
                  <div
                    key={c.complaintId}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-semibold text-slate-900">
                          {c.complaintId}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{c.ward}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-semibold ${statusStyle.textColor}`}>
                          {t.statuses[c.status]}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800">
                        {t.categories[c.category]} — {c.landmark}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setComplaintId(c.complaintId);
                        setMobileLast4(last4);
                        void runLookup(c.complaintId, last4);
                      }}
                      className="min-h-[40px] shrink-0 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                    >
                      View Progress
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Lookup Results */}
      {searchedOnce && !loading && !error && !record && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">{t.track.notFound}</p>
        </div>
      )}

      {record && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-8">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">{t.track.detailsTitle}</p>
              <h2 className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                {record.complaintId}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-500">Current Status</p>
              <p
                className={`mt-1 inline-block rounded-lg border px-3 py-1.5 text-sm font-bold ${
                  getStatusStyle(record.status).bgColor
                } ${getStatusStyle(record.status).borderColor} ${
                  getStatusStyle(record.status).textColor
                }`}
              >
                {t.statuses[record.status]}
              </p>
            </div>
          </div>

          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div>
              <dt className="text-xs font-medium text-slate-500">Complaint Category</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {t.categories[record.category]}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Ward &amp; Locality</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {record.ward} · {record.locality}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Landmark</dt>
              <dd className="mt-1 text-slate-800">{record.landmark}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Submission Date</dt>
              <dd className="mt-1 font-mono text-xs tabular-nums text-slate-800">
                {formatTimestamp(record.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Last Updated</dt>
              <dd className="mt-1 font-mono text-xs tabular-nums text-slate-800">
                {formatTimestamp(record.updatedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">
                {t.track.assignedEngineerLabel}
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {record.assignedEngineer || 'Pending assignment'}
              </dd>
            </div>
          </dl>

          <div className="grid gap-6 sm:grid-cols-2 border-t border-slate-200 pt-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
              <h3 className="text-xs font-semibold text-slate-700">{t.track.remarksLabel}</h3>
              <p className="text-sm text-slate-800">
                {record.engineerRemarks || 'Awaiting engineer investigation notes.'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
              <h3 className="text-xs font-semibold text-slate-700">
                {t.track.correctiveActionLabel}
              </h3>
              <p className="text-sm text-slate-800">
                {record.correctiveAction || 'No corrective action recorded yet.'}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <StatusTimeline currentStatus={record.status} timeline={record.timeline || []} />
          </div>
        </section>
      )}

      <ScientificDisclaimer compact />
    </div>
  );
}
