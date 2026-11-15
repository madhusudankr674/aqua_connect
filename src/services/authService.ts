import {
  browserPopupRedirectResolver,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../config/firebase';
import type { UserProfile, UserRole } from '../types/user';

const inFlightProfiles = new Map<string, Promise<UserProfile>>();

export function isEmbeddedIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
}

function extractErrorCode(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err && typeof err.code === 'string') {
    return err.code.toLowerCase();
  }
  const msg = err instanceof Error ? err.message : String(err);
  const match = msg.match(/auth\/[a-z0-9-]+/i);
  return match ? match[0].toLowerCase() : '';
}

export function formatAuthError(err: unknown): string {
  const code = extractErrorCode(err);
  const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before completing login. Click "Continue with Google" to try again.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in popup was already open. Please wait a moment and click "Continue with Google" once.';
    case 'auth/popup-blocked':
      return isEmbeddedIframe()
        ? 'Your browser blocked the Google sign-in popup inside this embedded view. Allow popups for this site or open Aqua Connect in a new browser tab to sign in.'
        : 'Your browser blocked the Google sign-in popup. Allow popups for this site or use the redirect sign-in option below.';
    case 'auth/unauthorized-domain':
      return `Sign-in is not yet authorized for "${host}". Add "${host}" under Firebase Console → Authentication → Settings → Authorized domains.`;
    case 'auth/operation-not-allowed':
      return 'Google Sign-In is currently disabled in Firebase Authentication for this project.';
    case 'auth/operation-not-supported-in-this-environment':
    case 'auth/web-storage-unsupported':
      return 'Browser storage or third-party cookies are restricted in this embedded frame. Please open the portal in a new browser tab to sign in.';
    case 'auth/internal-error':
      return 'Google sign-in could not complete in this window (often caused by blocked popups or restricted third-party storage). Try allowing popups or opening the portal in a new browser tab.';
    case 'auth/network-request-failed':
      return 'Network connection error while contacting Google Sign-In. Please check your internet connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact your portal administrator.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts in a short time. Please wait a minute and try again.';
    default: {
      const raw = err instanceof Error ? err.message : String(err || 'Sign-in failed.');
      if (raw.startsWith('{')) {
        try {
          const parsed = JSON.parse(raw) as { error?: string };
          if (parsed.error) return parsed.error;
        } catch {
          // fall through
        }
      }
      return raw || 'Sign-in failed. Please try again.';
    }
  }
}

export async function signInWithGooglePopup(): Promise<User | null> {
  try {
    const credential = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    return credential.user;
  } catch (err) {
    const code = extractErrorCode(err);
    if (
      !isEmbeddedIframe() &&
      (code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment')
    ) {
      await signInWithRedirect(auth, googleProvider, browserPopupRedirectResolver);
      return null;
    }
    throw err;
  }
}

export async function signInWithGoogleRedirect(): Promise<void> {
  if (isEmbeddedIframe()) {
    throw new Error(
      'Redirect sign-in cannot run inside an embedded frame. Please open the portal in a new browser tab.'
    );
  }
  await signInWithRedirect(auth, googleProvider, browserPopupRedirectResolver);
}

export async function consumeGoogleRedirectResult(): Promise<User | null> {
  const result = await getRedirectResult(auth, browserPopupRedirectResolver);
  return result?.user ?? null;
}

export async function signOutUser(): Promise<void> {
  inFlightProfiles.clear();
  await signOut(auth);
}

export async function resolveUserRole(user: User): Promise<UserRole> {
  if (
    user.emailVerified &&
    user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
  ) {
    return 'admin';
  }

  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    if (adminSnap.exists()) {
      return 'admin';
    }
  } catch {
    // Non-admins may not have access; ignore cleanly
  }

  try {
    const engineerSnap = await getDoc(doc(db, 'engineers', user.uid));
    if (engineerSnap.exists()) {
      return 'engineer';
    }
  } catch {
    // Default to citizen
  }

  return 'citizen';
}

function buildFallbackProfile(user: User, role: UserRole): UserProfile {
  const safeName = (
    user.displayName?.trim() ||
    user.email?.split('@')[0]?.trim() ||
    'Community Member'
  ).slice(0, 100);
  const safeEmail = (user.email?.trim() || 'user@example.com').slice(0, 150);

  return {
    uid: user.uid,
    name: safeName,
    mobile: '',
    email: safeEmail,
    role,
    locality: '',
    createdAt: serverTimestamp(),
  };
}

async function syncUserProfileInternal(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const resolvedRole = await resolveUserRole(user);

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    console.warn('Unable to read Firestore user profile, using session profile:', error);
    return buildFallbackProfile(user, resolvedRole);
  }

  if (existingSnap && existingSnap.exists()) {
    const data = existingSnap.data() as UserProfile;
    return {
      ...data,
      role: resolvedRole !== 'citizen' ? resolvedRole : data.role,
    };
  }

  const newProfile = buildFallbackProfile(user, 'citizen');

  try {
    await setDoc(userRef, newProfile);
  } catch (error) {
    try {
      const retrySnap = await getDoc(userRef);
      if (retrySnap.exists()) {
        const data = retrySnap.data() as UserProfile;
        return {
          ...data,
          role: resolvedRole !== 'citizen' ? resolvedRole : data.role,
        };
      }
    } catch {
      // Ignore retry read failure
    }
    console.warn('Unable to persist new Firestore user profile:', error);
    return {
      ...newProfile,
      role: resolvedRole,
    };
  }

  return {
    ...newProfile,
    role: resolvedRole,
  };
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const existingPromise = inFlightProfiles.get(user.uid);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = syncUserProfileInternal(user).finally(() => {
    inFlightProfiles.delete(user.uid);
  });
  inFlightProfiles.set(user.uid, promise);
  return promise;
}

export async function updateUserProfileDetails(
  user: User,
  updates: { name: string; mobile: string; locality: string }
): Promise<void> {
  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  const cleanName = updates.name.trim().slice(0, 100);
  if (!cleanName) {
    throw new Error('Display name cannot be empty.');
  }

  const cleanMobile = updates.mobile.trim().slice(0, 15);
  const cleanLocality = updates.locality.trim().slice(0, 120);

  let snap;
  try {
    snap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (!snap || !snap.exists()) {
    const profileDoc: UserProfile = {
      uid: user.uid,
      name: cleanName,
      mobile: cleanMobile,
      email: (user.email?.trim() || 'user@example.com').slice(0, 150),
      role: 'citizen',
      locality: cleanLocality,
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(userRef, profileDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
    return;
  }

  try {
    await updateDoc(userRef, {
      name: cleanName,
      mobile: cleanMobile,
      locality: cleanLocality,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}
