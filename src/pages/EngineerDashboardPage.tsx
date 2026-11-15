import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FlaskConical,
  Lock,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import { EngineerComplaintsMap } from '../components/EngineerComplaintsMap';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  AWARENESS_CATEGORIES,
  CURATED_AWARENESS_ARTICLES,
  fetchAwarenessArticles,
  saveAwarenessArticle,
} from '../services/awarenessService';
import {
  fetchComplaintHistory,
  formatTimestamp,
  subscribeAllComplaints,
  toMillis,
  updateComplaintByEngineer,
} from '../services/complaintService';
import { VALID_CATEGORIES, VALID_WARDS } from '../services/validation';
import {
  COMPLAINT_STATUS_ORDER,
  getAllowedNextStatuses,
  getStatusStyle,
} from '../services/workflow';
import type { AwarenessArticle, AwarenessCategory } from '../types/awareness';
import type {
  Complaint,
  ComplaintHistoryEntry,
  ComplaintStatus,
} from '../types/complaint';

export function EngineerDashboardPage() {
  const { t } = useLanguage();
  const { firebaseUser, profile, authReady, isEngineerOrAdmin, isAdmin, signInWithGoogle } =
    useAuth();

  const [activeTab, setActiveTab] = useState<'complaints' | 'awareness'>('complaints');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [wardFilter, setWardFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Selected Complaint Inspector
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Action Form State
  const [nextStatus, setNextStatus] = useState<ComplaintStatus>('Submitted');
  const [assignedEngineer, setAssignedEngineer] = useState('');
  const [engineerRemarks, setEngineerRemarks] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [historyNote, setHistoryNote] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Awareness Manager State
  const [articles, setArticles] = useState<AwarenessArticle[]>(CURATED_AWARENESS_ARTICLES);
  const [editingArticle, setEditingArticle] = useState<AwarenessArticle | null>(null);
  const [articleSaveMsg, setArticleSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady || !firebaseUser || !isEngineerOrAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    const unsub = subscribeAllComplaints(
      (list) => {
        setComplaints(list);
        setLoading(false);
        setSelected((prev) =>
          prev ? list.find((c) => c.complaintId === prev.complaintId) || prev : null
        );
      },
      (err) => {
        setLoadError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [authReady, firebaseUser, isEngineerOrAdmin]);

  useEffect(() => {
    if (activeTab === 'awareness' && isEngineerOrAdmin) {
      fetchAwarenessArticles(true)
        .then((list) => setArticles(list))
        .catch(() => setArticles(CURATED_AWARENESS_ARTICLES));
    }
  }, [activeTab, isEngineerOrAdmin]);

  useEffect(() => {
    if (!selected) {
      setHistory([]);
      return;
    }
    setNextStatus(selected.status);
    setAssignedEngineer(selected.assignedEngineer || profile?.name || '');
    setEngineerRemarks(selected.engineerRemarks || '');
    setCorrectiveAction(selected.correctiveAction || '');
    setHistoryNote('');
    setActionMessage(null);
    setActionError(null);

    setHistoryLoading(true);
    fetchComplaintHistory(selected.complaintId)
      .then((entries) => setHistory(entries))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [selected, profile?.name]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const submitted = complaints.filter((c) => c.status === 'Submitted').length;
    const pending = complaints.filter(
      (c) => c.status === 'Acknowledged' || c.status === 'Referred for Laboratory Testing'
    ).length;
    const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
    const resolved = complaints.filter(
      (c) => c.status === 'Resolved' || c.status === 'Closed'
    ).length;
    return { total, submitted, pending, inProgress, resolved };
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const fromMs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toMs = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return complaints.filter((c) => {
      if (wardFilter !== 'All' && c.ward !== wardFilter) return false;
      if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;

      if (fromMs !== null || toMs !== null) {
        const createdMs = toMillis(c.createdAt) || Date.parse(c.observationDate) || 0;
        if (fromMs !== null && createdMs < fromMs) return false;
        if (toMs !== null && createdMs > toMs) return false;
      }

      if (term) {
        const hay = [
          c.complaintId,
          c.citizenName,
          c.mobile,
          c.locality,
          c.landmark,
          c.description,
          c.assignedEngineer,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }

      return true;
    });
  }, [complaints, searchTerm, wardFilter, categoryFilter, statusFilter, dateFrom, dateTo]);

  const handleSaveUpdate = async (overrideStatus?: ComplaintStatus, quickNote?: string) => {
    if (!selected || !firebaseUser) return;
    const targetStatus = overrideStatus || nextStatus;

    setSavingUpdate(true);
    setActionMessage(null);
    setActionError(null);

    try {
      await updateComplaintByEngineer({
        complaint: selected,
        nextStatus: targetStatus,
        assignedEngineer: assignedEngineer || profile?.name || 'PHED Engineer',
        engineerRemarks,
        correctiveAction,
        historyNote: quickNote || historyNote || `Status set to ${targetStatus}.`,
        engineerName: profile?.name || firebaseUser.displayName || 'Authorized Engineer',
        engineerUid: firebaseUser.uid,
        isAdmin,
      });

      const refreshedHistory = await fetchComplaintHistory(selected.complaintId);
      setHistory(refreshedHistory);
      setHistoryNote('');
      setActionMessage(`Updated ${selected.complaintId} to "${targetStatus}".`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update complaint.');
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleSaveArticle = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editingArticle) return;
    setArticleSaveMsg(null);
    try {
      await saveAwarenessArticle(editingArticle);
      const updated = await fetchAwarenessArticles(true);
      setArticles(updated);
      setEditingArticle(null);
      setArticleSaveMsg('Educational article saved and synced to Firestore.');
    } catch (err) {
      setArticleSaveMsg(
        err instanceof Error ? err.message : 'Failed to save awareness article.'
      );
    }
  };

  if (!authReady) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm text-slate-600">Verifying engineer credentials...</p>
      </div>
    );
  }

  if (!firebaseUser || !isEngineerOrAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Authorized Engineer &amp; Admin Access Only
          </h1>
          <p className="text-sm leading-relaxed text-slate-600">
            {firebaseUser
              ? `Signed in as ${firebaseUser.email} (Role: ${
                  profile?.role || 'citizen'
                }). This dashboard is restricted to authorized local water-supply and PHED engineers.`
              : 'Please sign in with an authorized Engineer or Administrator Google account to view citizen PII, update complaint workflows, and manage educational articles.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!firebaseUser ? (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="min-h-[44px] rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 cursor-pointer"
              >
                Sign in with Google
              </button>
            ) : (
              <Link
                to="/track"
                className="min-h-[44px] inline-flex items-center rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800"
              >
                Go to Citizen Complaint Tracking
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Workspace Switch */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold text-sky-800">
            Authorized Official · {profile?.name || firebaseUser.email} ({profile?.role})
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Engineer &amp; Panchayat Operations Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('complaints')}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'complaints'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            <span>Complaints Registry</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('awareness')}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'awareness'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Awareness Articles</span>
          </button>
        </div>
      </div>

      {activeTab === 'awareness' ? (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Manage PHED-Reviewed Awareness Articles
              </h2>
              <p className="text-sm text-slate-600">
                Create or review safe drinking-water educational articles before public display.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingArticle({
                  articleId: `art-custom-${Date.now()}`,
                  title: '',
                  titleKn: '',
                  category: AWARENESS_CATEGORIES[0],
                  content: '',
                  contentKn: '',
                  sourceName: 'Local PHED & Water Supply Authority',
                  sourceUrl: 'https://jaljeevanmission.gov.in/',
                  lastReviewedAt: new Date().toISOString().slice(0, 10),
                  approvedByPhed: true,
                })
              }
              className="min-h-[44px] rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 cursor-pointer whitespace-nowrap"
            >
              Add New Article
            </button>
          </div>

          {articleSaveMsg && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              {articleSaveMsg}
            </p>
          )}

          {editingArticle && (
            <form
              onSubmit={handleSaveArticle}
              className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Edit Educational Article
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={5}
                    maxLength={200}
                    value={editingArticle.title}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, title: e.target.value })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Title (Kannada)
                  </label>
                  <input
                    type="text"
                    maxLength={250}
                    value={editingArticle.titleKn || ''}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, titleKn: e.target.value })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={editingArticle.category}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        category: e.target.value as AwarenessCategory,
                      })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {AWARENESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Last Reviewed Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingArticle.lastReviewedAt}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, lastReviewedAt: e.target.value })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Source Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingArticle.sourceName}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, sourceName: e.target.value })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Source URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={editingArticle.sourceUrl}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, sourceUrl: e.target.value })
                    }
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Content (English) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    minLength={20}
                    value={editingArticle.content}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, content: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Content (Kannada)
                  </label>
                  <textarea
                    rows={3}
                    value={editingArticle.contentKn || ''}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, contentKn: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={editingArticle.approvedByPhed}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      approvedByPhed: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Approved by local PHED / water-supply engineer for public display</span>
              </label>
              <button
                type="submit"
                className="min-h-[44px] rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-800 cursor-pointer"
              >
                Save Article
              </button>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((art) => (
              <div
                key={art.articleId}
                className="rounded-xl border border-slate-200 bg-white p-5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>{art.category}</span>
                  <span className="font-mono tabular-nums">{art.lastReviewedAt}</span>
                </div>
                <h3 className="font-display text-base font-bold text-slate-900">{art.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{art.content}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-sky-800">
                    {art.approvedByPhed ? 'PHED Approved' : 'Draft / Pending Review'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingArticle(art)}
                    className="text-xs font-semibold text-slate-800 underline hover:text-sky-700 cursor-pointer"
                  >
                    Edit Article
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <>
          {/* 5 KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Total Complaints</p>
              <p className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums">
                {stats.total}
              </p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4">
              <p className="text-xs font-medium text-sky-900">New Complaints</p>
              <p className="mt-1 font-display text-2xl font-bold text-sky-900 tabular-nums">
                {stats.submitted}
              </p>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
              <p className="text-xs font-medium text-indigo-900">Pending / Lab</p>
              <p className="mt-1 font-display text-2xl font-bold text-indigo-900 tabular-nums">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-xs font-medium text-amber-900">In Progress</p>
              <p className="mt-1 font-display text-2xl font-bold text-amber-900 tabular-nums">
                {stats.inProgress}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-xs font-medium text-emerald-900">Resolved / Closed</p>
              <p className="mt-1 font-display text-2xl font-bold text-emerald-900 tabular-nums">
                {stats.resolved}
              </p>
            </div>
          </div>

          {loadError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-700" aria-hidden="true" />
              <span>{loadError}</span>
            </div>
          )}

          {/* Map Toggle & Google Map View */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-700" aria-hidden="true" />
                <span>Ward Geographical Overview</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowMap((v) => !v)}
                className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>
            {showMap && (
              <EngineerComplaintsMap
                complaints={filteredComplaints}
                onSelectComplaint={(c) => setSelected(c)}
              />
            )}
          </div>

          {/* Search & Filters Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <div className="lg:col-span-2">
                <label htmlFor="eng-search" className="block text-xs font-medium text-slate-600 mb-1">
                  Search ID, Citizen, Locality
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="eng-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="AQ-2026... or landmark"
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="eng-ward" className="block text-xs font-medium text-slate-600 mb-1">
                  Ward
                </label>
                <select
                  id="eng-ward"
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                >
                  <option value="All">All Wards</option>
                  {VALID_WARDS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="eng-cat" className="block text-xs font-medium text-slate-600 mb-1">
                  Category
                </label>
                <select
                  id="eng-cat"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                >
                  <option value="All">All Categories</option>
                  {VALID_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="eng-status" className="block text-xs font-medium text-slate-600 mb-1">
                  Status
                </label>
                <select
                  id="eng-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                >
                  <option value="All">All Statuses</option>
                  {COMPLAINT_STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="eng-from" className="block text-xs font-medium text-slate-600 mb-1">
                    From
                  </label>
                  <input
                    id="eng-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="eng-to" className="block text-xs font-medium text-slate-600 mb-1">
                    To
                  </label>
                  <input
                    id="eng-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full min-h-[40px] rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Complaints Table + Inspector Split */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className={`${selected ? 'lg:col-span-7' : 'lg:col-span-12'} rounded-2xl border border-slate-200 bg-white overflow-hidden`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Complaint ID</th>
                      <th className="px-4 py-3">Ward / Locality</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Citizen</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                          Loading complaints from Firestore...
                        </td>
                      </tr>
                    ) : filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                          No complaints match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((c) => {
                        const style = getStatusStyle(c.status);
                        const isSelected = selected?.complaintId === c.complaintId;
                        return (
                          <tr
                            key={c.complaintId}
                            className={`transition-colors hover:bg-slate-50 ${
                              isSelected ? 'bg-sky-50/70' : ''
                            }`}
                          >
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900 whitespace-nowrap">
                              {c.complaintId}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-700">
                              <span className="font-semibold text-slate-900">{c.ward}</span>
                              <br />
                              <span className="text-slate-500">{c.locality}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-800">{c.category}</td>
                            <td className="px-4 py-3 text-xs text-slate-700">
                              <span>{c.citizenName}</span>
                              <br />
                              <span className="font-mono text-slate-500 tabular-nums">{c.mobile}</span>
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap">
                              <span className={style.textColor}>{t.statuses[c.status]}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelected(c)}
                                className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Complaint Inspector & Workflow Panel */}
            {selected && (
              <aside className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <p className="font-mono text-xs font-semibold text-sky-800">
                      {selected.complaintId}
                    </p>
                    <h2 className="mt-1 font-display text-lg font-bold text-slate-900">
                      {selected.category}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submitted {formatTimestamp(selected.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label="Close inspector"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Citizen & Location Details */}
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-slate-500">Citizen</dt>
                    <dd className="font-semibold text-slate-900">{selected.citizenName}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Mobile</dt>
                    <dd className="font-mono font-semibold text-slate-900 tabular-nums">
                      {selected.mobile}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Ward &amp; Locality</dt>
                    <dd className="font-semibold text-slate-900">
                      {selected.ward} · {selected.locality}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Observed</dt>
                    <dd className="font-mono text-slate-800">{selected.observationDate}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-500">Landmark</dt>
                    <dd className="text-slate-900 font-medium">{selected.landmark}</dd>
                  </div>
                  {selected.latitude !== null && selected.longitude !== null && (
                    <div className="col-span-2">
                      <dt className="text-slate-500">GPS Coordinates</dt>
                      <dd className="flex items-center gap-2 font-mono text-slate-800 tabular-nums">
                        <span>
                          {selected.latitude.toFixed(6)}, {selected.longitude.toFixed(6)}
                        </span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${selected.latitude},${selected.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sky-700 underline"
                        >
                          <span>Open in Maps</span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-800">
                  <p className="text-xs font-semibold text-slate-500 mb-1">
                    Citizen Description ({selected.continuingIssue ? 'Continuing' : 'Resolved/Intermittent'})
                  </p>
                  <p>{selected.description}</p>
                </div>

                {/* Uploaded Photographs */}
                {selected.imageUrls && selected.imageUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-700">
                      Citizen Photographs ({selected.imageUrls.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selected.imageUrls.map((url, idx) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setLightboxImg(url)}
                          className="h-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 cursor-pointer"
                        >
                          <img
                            src={url}
                            alt={`Complaint photo ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Action Shortcuts */}
                {selected.status === 'Submitted' && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={savingUpdate}
                      onClick={() =>
                        void handleSaveUpdate(
                          'Acknowledged',
                          'Complaint acknowledged by Panchayat engineer.'
                        )
                      }
                      className="min-h-[40px] rounded-lg bg-indigo-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-800 cursor-pointer"
                    >
                      Acknowledge Complaint
                    </button>
                    <button
                      type="button"
                      disabled={savingUpdate}
                      onClick={() =>
                        void handleSaveUpdate(
                          'Referred for Laboratory Testing',
                          'Water sample referred to authorized PHED laboratory.'
                        )
                      }
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-900 hover:bg-rose-100 cursor-pointer"
                    >
                      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Refer for Lab Testing</span>
                    </button>
                  </div>
                )}

                {/* Workflow Form */}
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Update Status &amp; Investigation Record
                  </h3>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Assigned Engineer / Official
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={assignedEngineer}
                      onChange={(e) => setAssignedEngineer(e.target.value)}
                      placeholder="Engineer name"
                      className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Workflow Status
                    </label>
                    <select
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value as ComplaintStatus)}
                      disabled={selected.status === 'Closed' && !isAdmin}
                      className="w-full min-h-[40px] rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                    >
                      {getAllowedNextStatuses(selected.status, isAdmin).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Investigation Notes &amp; Engineer Remarks
                    </label>
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={engineerRemarks}
                      onChange={(e) => setEngineerRemarks(e.target.value)}
                      placeholder="Record field inspection findings, valve checks, or lab referral ID..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Corrective Action / Resolution Details
                    </label>
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={correctiveAction}
                      onChange={(e) => setCorrectiveAction(e.target.value)}
                      placeholder="Describe pipeline flushing, leak repair, or corrective measures..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Audit Log Entry Note
                    </label>
                    <input
                      type="text"
                      maxLength={1000}
                      value={historyNote}
                      onChange={(e) => setHistoryNote(e.target.value)}
                      placeholder="Short summary for public complaint history timeline"
                      className="w-full min-h-[40px] rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                    />
                  </div>

                  {actionMessage && (
                    <p className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{actionMessage}</span>
                    </p>
                  )}

                  {actionError && (
                    <p className="text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                      {actionError}
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={savingUpdate || (selected.status === 'Closed' && !isAdmin)}
                    onClick={() => void handleSaveUpdate()}
                    className="w-full min-h-[44px] rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50 cursor-pointer"
                  >
                    {savingUpdate ? 'Saving Update...' : 'Save Engineer Update'}
                  </button>
                </div>

                {/* Audit History */}
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <h3 className="font-display text-sm font-bold text-slate-900">
                    Audit History ({history.length})
                  </h3>
                  {historyLoading ? (
                    <p className="text-xs text-slate-500">Loading audit history...</p>
                  ) : history.length === 0 ? (
                    <p className="text-xs text-slate-500">No audit history entries found.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {history.map((h) => (
                        <li
                          key={h.historyId}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2 font-semibold text-slate-800">
                            <span>
                              {h.previousStatus} &rarr; {h.newStatus}
                            </span>
                            <span className="font-mono text-slate-500 tabular-nums">
                              {formatTimestamp(h.timestamp)}
                            </span>
                          </div>
                          <p className="text-slate-700">{h.remarks}</p>
                          <p className="text-slate-500">Updated by: {h.updatedBy}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </aside>
            )}
          </div>
        </>
      )}

      {/* Photo Lightbox */}
      {lightboxImg && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white p-2">
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              aria-label="Close photograph preview"
              className="absolute right-4 top-4 rounded-lg bg-slate-900/80 p-2 text-white hover:bg-slate-900 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={lightboxImg}
              alt="Full size water observation photograph"
              className="max-h-[85vh] w-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
