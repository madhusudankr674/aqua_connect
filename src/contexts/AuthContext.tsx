import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  consumeGoogleRedirectResult,
  ensureUserProfile,
  formatAuthError,
  signInWithGooglePopup,
  signInWithGoogleRedirect,
  signOutUser,
  updateUserProfileDetails,
} from '../services/authService';
import type { LoginPortal, UserProfile } from '../types/user';

const PORTAL_STORAGE_KEY = 'aqua_connect_login_portal';

function readStoredPortal(): LoginPortal {
  try {
    const val = sessionStorage.getItem(PORTAL_STORAGE_KEY);
    if (val === 'engineer' || val === 'pdo' || val === 'resident') {
      return val;
    }
  } catch {
    // Ignore storage errors
  }
  return 'resident';
}

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  signingIn: boolean;
  authError: string | null;
  loginPortal: LoginPortal;
  isEngineerOrAdmin: boolean;
  isAdmin: boolean;
  setLoginPortal: (portal: LoginPortal) => void;
  clearAuthError: () => void;
  signInWithGoogle: (portal?: LoginPortal) => Promise<User | null>;
  signInWithRedirectFallback: (portal?: LoginPortal) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name: string; mobile: string; locality: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginPortal, setLoginPortalState] = useState<LoginPortal>(readStoredPortal);

  const setLoginPortal = (portal: LoginPortal) => {
    setLoginPortalState(portal);
    try {
      sessionStorage.setItem(PORTAL_STORAGE_KEY, portal);
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    let active = true;

    consumeGoogleRedirectResult().catch((err) => {
      if (active) {
        setAuthError(formatAuthError(err));
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;
      setFirebaseUser(user);
      if (user) {
        setAuthError(null);
        try {
          const syncedProfile = await ensureUserProfile(user);
          if (active) setProfile(syncedProfile);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          if (active) setProfile(null);
        }
      } else {
        setProfile(null);
      }
      if (active) setAuthReady(true);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signInWithGoogle = async (portal?: LoginPortal): Promise<User | null> => {
    if (signingIn) return null;
    if (portal) setLoginPortal(portal);
    setSigningIn(true);
    setAuthError(null);
    try {
      const user = await signInWithGooglePopup();
      if (user) {
        const syncedProfile = await ensureUserProfile(user);
        setProfile(syncedProfile);
      }
      return user;
    } catch (err) {
      const friendly = formatAuthError(err);
      setAuthError(friendly);
      throw new Error(friendly);
    } finally {
      setSigningIn(false);
    }
  };

  const signInWithRedirectFallback = async (portal?: LoginPortal): Promise<void> => {
    if (signingIn) return;
    if (portal) setLoginPortal(portal);
    setSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogleRedirect();
    } catch (err) {
      const friendly = formatAuthError(err);
      setAuthError(friendly);
      setSigningIn(false);
      throw new Error(friendly);
    }
  };

  const refreshProfile = async () => {
    if (!firebaseUser) return;
    const syncedProfile = await ensureUserProfile(firebaseUser);
    setProfile(syncedProfile);
  };

  const logout = async () => {
    setAuthError(null);
    await signOutUser();
    setProfile(null);
  };

  const updateProfile = async (updates: { name: string; mobile: string; locality: string }) => {
    if (!firebaseUser) throw new Error('Not authenticated.');
    await updateUserProfileDetails(firebaseUser, updates);
    setProfile((prev) =>
      prev
        ? { ...prev, ...updates }
        : {
            uid: firebaseUser.uid,
            name: updates.name.trim(),
            mobile: updates.mobile.trim(),
            email: firebaseUser.email || 'user@example.com',
            role: 'citizen',
            locality: updates.locality.trim(),
            createdAt: null,
          }
    );
  };

  const isAdmin = profile?.role === 'admin';
  const isEngineerOrAdmin = profile?.role === 'engineer' || profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
