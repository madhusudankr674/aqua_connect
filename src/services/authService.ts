import { signInWithPopup, signOut, type User } from 'firebase/auth';
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

export async function signInWithGooglePopup(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function signOutUser(): Promise<void> {
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
    // Non-admins may not have list permission, ignore silently if missing
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

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  const resolvedRole = await resolveUserRole(user);

  let existingSnap;
  try {
    existingSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (existingSnap && existingSnap.exists()) {
    const data = existingSnap.data() as UserProfile;
    return {
      ...data,
      role: resolvedRole !== 'citizen' ? resolvedRole : data.role,
    };
  }

  const newProfile: UserProfile = {
    uid: user.uid,
    name: (user.displayName || 'Community Member').slice(0, 100),
    mobile: '',
    email: (user.email || 'user@example.com').slice(0, 150),
    role: 'citizen',
    locality: 'Herooru Grama Panchayat',
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, newProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, userPath);
  }

  return {
    ...newProfile,
    role: resolvedRole,
  };
}

export async function updateUserProfileDetails(
  uid: string,
  updates: { name: string; mobile: string; locality: string }
): Promise<void> {
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  try {
    await updateDoc(userRef, {
      name: updates.name.trim().slice(0, 100),
      mobile: updates.mobile.trim().slice(0, 15),
      locality: updates.locality.trim().slice(0, 120),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}
