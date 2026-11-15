import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  ensureUserProfile,
  signInWithGooglePopup,
  signOutUser,
  updateUserProfileDetails,
} from '../services/authService';
import type { UserProfile } from '../types/user';

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  isEngineerOrAdmin: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name: string; mobile: string; locality: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const syncedProfile = await ensureUserProfile(user);
          setProfile(syncedProfile);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const user = await signInWithGooglePopup();
    const syncedProfile = await ensureUserProfile(user);
    setProfile(syncedProfile);
    return user;
  };

  const logout = async () => {
    await signOutUser();
    setProfile(null);
  };

  const updateProfile = async (updates: { name: string; mobile: string; locality: string }) => {
    if (!firebaseUser) throw new Error('Not authenticated.');
    await updateUserProfileDetails(firebaseUser.uid, updates);
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const isAdmin = profile?.role === 'admin';
  const isEngineerOrAdmin = profile?.role === 'engineer' || profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        authReady,
        isEngineerOrAdmin,
        isAdmin,
        signInWithGoogle,
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
