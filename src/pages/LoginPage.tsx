import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  LogIn,
  LogOut,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatAuthError } from '../services/authService';
import { sanitizeMobile } from '../services/validation';

export function LoginPage() {
  const {
    firebaseUser,
    profile,
    authReady,
    signingIn,
    authError,
    isEngineerOrAdmin,
    clearAuthError,
    signInWithGoogle,
    signInWithRedirectFallback,
    logout,
    updateProfile,
  } = useAuth();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [locality, setLocality] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || firebaseUser?.displayName || '');
      setMobile(profile.mobile || '');
      setLocality(profile.locality || '');
    } else if (firebaseUser) {
      setName(firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '');
    }
  }, [profile, firebaseUser]);

  const activeError = errorMsg || authError;
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const isUnauthorizedDomain = Boolean(
    activeError && activeError.includes('Authorized domains')
  );

  const handleLogin = async () => {
    setErrorMsg(null);
    clearAuthError();
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg(formatAuthError(err));
    }
  };

  const handleRedirectLogin = async () => {
    setErrorMsg(null);
    clearAuthError();
    try {
      await signInWithRedirectFallback();
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

  const handleCopyHost = async () => {
    if (!currentHost || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Aqua Connect Account &amp; Portal Access
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Sign in securely with Google to submit citizen reports, track your complaints, or access
          authorized Engineer Dashboard controls.
        </p>
      </div>

      {!authReady ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Checking authentication status...
        </div>
      ) : !firebaseUser ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Sign in with Verified Google Account
            </h2>
            <p className="text-sm text-slate-600">
              All newly signed-in residents receive a Citizen profile. Authorized local water-supply
              and PHED engineers receive Engineer/Admin access based on verified server-side role
              records.
            </p>
          </div>

          {activeError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 space-y-2.5"
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
                    onClick={() => void handleCopyHost()}
                    className="inline-flex items-center gap-1 rounded border border-rose-300 bg-white px-2.5 py-1 text-xs font-semibold text-rose-900 hover:bg-rose-100 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{copiedDomain ? 'Copied' : 'Copy domain'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col items-start gap-3">
            <button
              type="button"
              disabled={signingIn}
              onClick={() => void handleLogin()}
              className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-lg bg-sky-700 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>{signingIn ? 'Signing in with Google...' : 'Continue with Google'}</span>
            </button>

            <button
              type="button"
              disabled={signingIn}
              onClick={() => void handleRedirectLogin()}
              className="text-xs font-medium text-sky-700 underline hover:text-sky-900 disabled:opacity-50 cursor-pointer"
            >
              Having trouble with popups? Sign in using page redirect instead
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Account Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500">Signed-in Account</p>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  {profile?.name || firebaseUser.displayName || 'Community Member'}
                </h2>
                <p className="text-sm text-slate-600">{firebaseUser.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-900 uppercase">
                  {isEngineerOrAdmin ? (
                    <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>Role: {profile?.role || 'citizen'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/report"
                className="inline-flex min-h-[40px] items-center rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800"
              >
                Report Water Issue
              </Link>
              <Link
                to="/track"
                className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                View My Submitted Complaints
              </Link>
              {isEngineerOrAdmin && (
                <Link
                  to="/engineer"
                  className="inline-flex min-h-[40px] items-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Open Engineer Dashboard
                </Link>
              )}
            </div>
          </div>

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
