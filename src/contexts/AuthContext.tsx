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
import type { UserProfile } from '../types/user';

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  signingIn: boolean;
  authError: string | null;
  isEngineerOrAdmin: boolean;
  isAdmin: boolean;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<User | null>;
  signInWithRedirectFallback: () => Promise<void>;
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

  const signInWithGoogle = async (): Promise<User | null> => {
    if (signingIn) return null;
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

  const signInWithRedirectFallback = async (): Promise<void> => {
    if (signingIn) return;
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
        isEngineerOrAdmin,
        isAdmin,
        clearAuthError,
        signInWithGoogle,
        signInWithRedirectFallback,
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
