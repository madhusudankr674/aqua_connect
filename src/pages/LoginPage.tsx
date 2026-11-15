import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
} from 'lucide-react';
import { FIREBASE_PROJECT_ID } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  authorizeOfficial,
  formatAuthError,
  isEmbeddedIframe,
  listAuthorizedOfficials,
  revokeOfficial,
} from '../services/authService';
import { sanitizeMobile } from '../services/validation';
import type { LoginPortal, RoleMarkerRecord } from '../types/user';

interface PortalMeta {
  id: LoginPortal;
  tabLabel: string;
  title: string;
  subtitle: string;
  roleRequirement: string;
  signInLabel: string;
  capabilities: string[];
}

const PORTALS: Record<LoginPortal, PortalMeta> = {
  resident: {
    id: 'resident',
    tabLabel: 'Residents Login',
    title: 'Residents & Citizen Portal Login',
    subtitle:
      'For community residents reporting drinking-water issues and tracking local resolution updates.',
    roleRequirement: 'Citizen Account (Automatic upon Google Sign-In)',
    signInLabel: 'Sign in as Resident with Google',
    capabilities: [
      'Submit structured drinking-water observations with ward, landmark, and photos',
      'Track live complaint status and view engineer investigation updates',
      'Save default contact details for faster reporting',
    ],
  },
  engineer: {
    id: 'engineer',
    tabLabel: 'Engineer Login',
    title: 'Water-Supply & PHED Engineer Login',
    subtitle:
      'For authorized field engineers managing water complaints, inspections, corrective actions, and lab referrals.',
    roleRequirement: 'Authorized Engineer or PDO Account',
    signInLabel: 'Sign in as Engineer with Google',
    capabilities: [
      'View all ward complaints on the interactive map and searchable registry',
      'Acknowledge issues, record field inspection notes, and log corrective actions',
      'Refer samples for authorized water-testing laboratory evaluation',
    ],
  },
  pdo: {
    id: 'pdo',
    tabLabel: 'PDO Login',
    title: 'Panchayat Development Officer (PDO) Login',
    subtitle:
      'For the PDO and portal administrators overseeing water governance, awareness reviews, and official role approvals.',
    roleRequirement: 'Authorized PDO / Administrator Account',
    signInLabel: 'Sign in as PDO with Google',
    capabilities: [
      'Full oversight of all complaints, including closing and reopening cases',
      'Publish and approve PHED-reviewed safe drinking-water awareness articles',
      'Authorize or revoke Engineer and PDO access permissions',
    ],
  },
};

export function LoginPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    firebaseUser,
    profile,
    authReady,
    signingIn,
    authError,
    loginPortal,
    isEngineerOrAdmin,
    isAdmin,
    setLoginPortal,
    clearAuthError,
    signInWithGoogle,
    signInWithRedirectFallback,
    refreshProfile,
    logout,
    updateProfile,
  } = useAuth();

  const portalParam = searchParams.get('portal');
  const activePortal: LoginPortal =
    portalParam === 'resident' || portalParam === 'engineer' || portalParam === 'pdo'
      ? portalParam
      : loginPortal;

  const portalMeta = PORTALS[activePortal];

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [locality, setLocality] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<'domain' | 'uid' | null>(null);

  // PDO Role Management state
  const [officials, setOfficials] = useState<RoleMarkerRecord[]>([]);
  const [officialsLoading, setOfficialsLoading] = useState(false);
  const [targetUid, setTargetUid] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [targetRole, setTargetRole] = useState<'engineer' | 'admin'>('engineer');
  const [roleActionBusy, setRoleActionBusy] = useState(false);
  const [roleActionMsg, setRoleActionMsg] = useState<string | null>(null);
  const [roleActionErr, setRoleActionErr] = useState<string | null>(null);

  useEffect(() => {
    if (portalParam === 'resident' || portalParam === 'engineer' || portalParam === 'pdo') {
      setLoginPortal(portalParam);
    }
  }, [portalParam, setLoginPortal]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || firebaseUser?.displayName || '');
      setMobile(profile.mobile || '');
      setLocality(profile.locality || '');
    } else if (firebaseUser) {
      setName(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '');
    }
  }, [profile, firebaseUser]);

  useEffect(() => {
    if (firebaseUser && isAdmin && activePortal === 'pdo') {
      setOfficialsLoading(true);
      listAuthorizedOfficials()
        .then((list) => setOfficials(list))
        .catch(() => setOfficials([]))
        .finally(() => setOfficialsLoading(false));
    }
  }, [firebaseUser, isAdmin, activePortal]);

  const selectPortal = (next: LoginPortal) => {
    setErrorMsg(null);
    clearAuthError();
    setLoginPortal(next);
    setSearchParams({ portal: next }, { replace: true });
  };

  const activeError = errorMsg || authError;
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '/login';
  const embedded = isEmbeddedIframe();
  const isUnauthorizedDomain = Boolean(
    activeError && activeError.includes('Authorized domains')
  );

  const handleLogin = async () => {
    setErrorMsg(null);
    clearAuthError();
    try {
      await signInWithGoogle(activePortal);
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    }
  };

  const handleRedirectLogin = async () => {
    setErrorMsg(null);
    clearAuthError();
    try {
      await signInWithRedirectFallback(activePortal);
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    }
  };

  const handleSwitchAccount = async () => {
    setErrorMsg(null);
    clearAuthError();
    try {
      await signInWithGoogle(activePortal);
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    }
  };

  const handleSaveProfile = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSavedMsg(null);
    setErrorMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('Please enter your display name before saving.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: trimmedName,
        mobile,
        locality,
      });
      setSavedMsg('Profile details saved.');
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAuthorizeOfficial = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setRoleActionMsg(null);
    setRoleActionErr(null);
    setRoleActionBusy(true);
    try {
      await authorizeOfficial({
        uid: targetUid,
        email: targetEmail,
        roleType: targetRole,
      });
      const updated = await listAuthorizedOfficials();
      setOfficials(updated);
      setRoleActionMsg(
        `Authorized ${targetEmail.trim()} as ${targetRole === 'admin' ? 'PDO / Admin' : 'Engineer'}.`
      );
      setTargetUid('');
      setTargetEmail('');
    } catch (err) {
      setRoleActionErr(formatAuthError(err));
    } finally {
      setRoleActionBusy(false);
    }
  };

  const handleRevokeOfficial = async (record: RoleMarkerRecord) => {
    setRoleActionMsg(null);
    setRoleActionErr(null);
    setRoleActionBusy(true);
    try {
      await revokeOfficial({ uid: record.uid, roleType: record.roleType });
      const updated = await listAuthorizedOfficials();
      setOfficials(updated);
      setRoleActionMsg(`Removed ${record.roleType} access for ${record.email}.`);
    } catch (err) {
      setRoleActionErr(formatAuthError(err));
    } finally {
      setRoleActionBusy(false);
    }
  };

  const handleCopyText = async (value: string, key: 'domain' | 'uid') => {
    if (!value || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const hasPortalAccess =
    activePortal === 'resident' ||
    (activePortal === 'engineer' && isEngineerOrAdmin) ||
    (activePortal === 'pdo' && isAdmin);

  const displayRoleLabel =
    profile?.role === 'admin'
      ? 'PDO / Administrator'
      : profile?.role === 'engineer'
        ? 'PHED / Water Engineer'
        : 'Resident (Citizen)';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-balance">
          Aqua Connect Portal Login
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Select your login portal below for Residents, Engineers, or Panchayat Development Officer
          (PDO) access.
        </p>
      </div>

      {/* 3 Separate Login Portal Tabs */}
      <div
        role="tablist"
        aria-label="Select login portal"
        className="grid gap-2 rounded-xl border border-slate-200 bg-white p-1.5 sm:grid-cols-3"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activePortal === 'resident'}
          onClick={() => selectPortal('resident')}
          className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activePortal === 'resident'
              ? 'bg-sky-700 text-white'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{PORTALS.resident.tabLabel}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activePortal === 'engineer'}
          onClick={() => selectPortal('engineer')}
          className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activePortal === 'engineer'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Wrench className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{PORTALS.engineer.tabLabel}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activePortal === 'pdo'}
          onClick={() => selectPortal('pdo')}
          className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activePortal === 'pdo'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{PORTALS.pdo.tabLabel}</span>
        </button>
      </div>

      {!authReady ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Checking authentication status...
        </div>
      ) : !firebaseUser ? (
        <section
          role="tabpanel"
          className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6"
        >
          <div className="space-y-2 border-b border-slate-200 pb-5">
            <p className="text-xs font-semibold text-sky-800">{portalMeta.roleRequirement}</p>
            <h2 className="font-display text-xl font-bold text-slate-900">{portalMeta.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{portalMeta.subtitle}</p>
          </div>

          <ul className="grid gap-2.5 sm:grid-cols-3 text-xs text-slate-700">
            {portalMeta.capabilities.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>

          {activeError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-700 mt-0.5" aria-hidden="true" />
                  <span>{activeError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    clearAuthError();
                  }}
                  className="text-xs font-semibold text-rose-700 underline hover:text-rose-900 shrink-0 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              {isUnauthorizedDomain && currentHost && (
                <div className="flex flex-wrap items-center gap-2 pl-7">
                  <code className="rounded border border-rose-200 bg-white px-2.5 py-1 font-mono text-xs text-slate-900">
                    {currentHost}
                  </code>
                  <button
                    type="button"
                    onClick={() => void handleCopyText(currentHost, 'domain')}
                    className="inline-flex items-center gap-1 rounded border border-rose-300 bg-white px-2.5 py-1 text-xs font-semibold text-rose-900 hover:bg-rose-100 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{copiedKey === 'domain' ? 'Copied' : 'Copy domain'}</span>
                  </button>
                  <a
                    href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-800 underline hover:text-sky-950"
                  >
                    <span>Open Firebase Auth Settings</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col items-start gap-3 pt-1">
            <button
              type="button"
              disabled={signingIn}
              onClick={() => void handleLogin()}
              className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg bg-sky-700 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer whitespace-nowrap"
            >
              <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{signingIn ? 'Signing in with Google...' : portalMeta.signInLabel}</span>
            </button>

            {embedded ? (
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 underline hover:text-sky-900"
              >
                <span>Having trouble with popup sign-in? Open portal in a new tab</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : (
              <button
                type="button"
                disabled={signingIn}
                onClick={() => void handleRedirectLogin()}
                className="text-xs font-medium text-sky-700 underline hover:text-sky-900 disabled:opacity-50 cursor-pointer"
              >
                Having trouble with popups? Sign in using page redirect instead
              </button>
            )}
          </div>
        </section>
      ) : (
        <div className="space-y-6">
          {/* Active Portal & Role Verification Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 pb-5">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-sky-800">{portalMeta.tabLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{displayRoleLabel}</span>
                </div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  {profile?.name || firebaseUser.displayName || 'Community Member'}
                </h2>
                <p className="text-sm text-slate-600">{firebaseUser.email}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                  <span>User UID:</span>
                  <code className="font-mono text-slate-800 select-all">{firebaseUser.uid}</code>
                  <button
                    type="button"
                    onClick={() => void handleCopyText(firebaseUser.uid, 'uid')}
                    className="inline-flex items-center gap-1 text-sky-700 underline hover:text-sky-900 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" aria-hidden="true" />
                    <span>{copiedKey === 'uid' ? 'Copied' : 'Copy UID'}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => void refreshProfile()}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Refresh Role</span>
                </button>
                <button
                  type="button"
                  disabled={signingIn}
                  onClick={() => void handleSwitchAccount()}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                >
                  <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Switch Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {activeError && (
              <div
                role="alert"
                className="flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-700 mt-0.5" aria-hidden="true" />
                  <span>{activeError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    clearAuthError();
                  }}
                  className="font-semibold text-rose-700 underline hover:text-rose-900 shrink-0 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {hasPortalAccess ? (
              <div className="space-y-4">
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                  <span>
                    Verified for {portalMeta.tabLabel} ({displayRoleLabel}).
                  </span>
                </p>

                <div className="flex flex-wrap gap-3">
                  {activePortal === 'resident' && (
                    <>
                      <Link
                        to="/report"
                        className="inline-flex min-h-[44px] items-center rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 whitespace-nowrap"
                      >
                        Report Water Issue
                      </Link>
                      <Link
                        to="/track"
                        className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                      >
                        View My Submitted Complaints
                      </Link>
                    </>
                  )}
                  {(activePortal === 'engineer' || activePortal === 'pdo') && (
                    <>
                      <Link
                        to="/engineer"
                        className="inline-flex min-h-[44px] items-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 whitespace-nowrap"
                      >
                        {activePortal === 'pdo'
                          ? 'Open PDO & Engineer Dashboard'
                          : 'Open Engineer Dashboard'}
                      </Link>
                      <Link
                        to="/track"
                        className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                      >
                        Track Public Complaints
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div
                role="alert"
                className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 space-y-2"
              >
                <p className="font-semibold">
                  {activePortal === 'pdo'
                    ? 'PDO / Administrator Approval Required'
                    : 'Engineer Authorization Required'}
                </p>
                <p className="text-xs leading-relaxed text-amber-900">
                  You are signed in as <strong>{firebaseUser.email}</strong> ({displayRoleLabel}).
                  To access the {portalMeta.tabLabel}, ask an authorized PDO / Portal Administrator to
                  add your User UID (<code className="font-mono">{firebaseUser.uid}</code>) in the{' '}
                  <strong>PDO Login</strong> Role Authorization panel, then click{' '}
                  <strong>Refresh Role</strong> above—or switch to an authorized official Google
                  account.
                </p>
              </div>
            )}
          </div>

          {/* PDO Role Management Panel (Visible when verified PDO/Admin is on PDO tab) */}
          {activePortal === 'pdo' && isAdmin && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
              <div className="space-y-1 border-b border-slate-200 pb-4">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  PDO Role Authorization Manager
                </h3>
                <p className="text-xs text-slate-600">
                  Grant or revoke Engineer and PDO access using the official&apos;s Google User UID
                  and email address.
                </p>
              </div>

              <form onSubmit={handleAuthorizeOfficial} className="grid gap-4 sm:grid-cols-12">
                <div className="sm:col-span-4">
                  <label htmlFor="auth-uid" className="block text-xs font-medium text-slate-700 mb-1">
                    User UID *
                  </label>
                  <input
                    id="auth-uid"
                    type="text"
                    required
                    value={targetUid}
                    onChange={(e) => setTargetUid(e.target.value)}
                    placeholder="Paste user's Firebase UID"
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 mb-1">
                    Official Email *
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="engineer@example.com"
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="auth-role" className="block text-xs font-medium text-slate-700 mb-1">
                    Role *
                  </label>
                  <select
                    id="auth-role"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as 'engineer' | 'admin')}
                    className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="engineer">Engineer</option>
                    <option value="admin">PDO / Admin</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="submit"
                    disabled={roleActionBusy}
                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    <UserPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Authorize</span>
                  </button>
                </div>
              </form>

              {roleActionMsg && (
                <p className="text-xs font-medium text-emerald-700">{roleActionMsg}</p>
              )}
              {roleActionErr && (
                <p role="alert" className="text-xs font-medium text-rose-700">
                  {roleActionErr}
                </p>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">
                  Authorized Engineers &amp; PDOs ({officials.length})
                </p>
                {officialsLoading ? (
                  <p className="text-xs text-slate-500">Loading authorized officials...</p>
                ) : officials.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No additional Engineer or PDO UIDs assigned yet. Add an official above.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
                    {officials.map((item) => (
                      <div
                        key={`${item.roleType}-${item.uid}`}
                        className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-900">
                              {item.roleType === 'admin' ? 'PDO / Admin' : 'Engineer'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-700">{item.email}</span>
                          </div>
                          <p className="font-mono text-xs text-slate-500">{item.uid}</p>
                        </div>
                        <button
                          type="button"
                          disabled={roleActionBusy}
                          onClick={() => void handleRevokeOfficial(item)}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50 cursor-pointer self-start sm:self-auto whitespace-nowrap"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Revoke</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Profile Settings Form */}
          <form
            onSubmit={handleSaveProfile}
            className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
          >
            <h3 className="font-display text-base font-bold text-slate-900">
              Contact Profile Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="prof-name" className="block text-xs font-medium text-slate-700 mb-1">
                  Display Name *
                </label>
                <input
                  id="prof-name"
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="prof-mobile" className="block text-xs font-medium text-slate-700 mb-1">
                  Default Mobile Number
                </label>
                <input
                  id="prof-mobile"
                  type="tel"
                  maxLength={15}
                  value={mobile}
                  onChange={(e) => setMobile(sanitizeMobile(e.target.value))}
                  placeholder="9845012345"
                  className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums text-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="prof-loc" className="block text-xs font-medium text-slate-700 mb-1">
                  Village / Locality
                </label>
                <input
                  id="prof-loc"
                  type="text"
                  maxLength={120}
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Main Road, Ward Locality, or Village Name"
                  className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>

            {savedMsg && (
              <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>{savedMsg}</span>
              </p>
            )}
            {errorMsg && (
              <p role="alert" className="text-xs font-medium text-rose-700">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
