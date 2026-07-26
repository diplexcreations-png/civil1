import {
  signInWithPopup, signInWithRedirect, getRedirectResult,
  GoogleAuthProvider, signOut, onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './config';

export type AuthStateListener = (user: User | null) => void;

export function onAuthChange(cb: AuthStateListener): () => void {
  if (!auth) {
    cb(null);
    return () => {};
  }
  const unsub = onAuthStateChanged(auth, cb);
  return unsub;
}

/** Check for a redirect result (called once on mount) */
export async function checkRedirectResult(): Promise<User | null> {
  if (!auth) return null;
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (e) {
    console.error('Firebase redirect result error:', e);
    return null;
  }
}

export async function loginWithGoogle(): Promise<User | null> {
  if (!auth) return null;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (e: any) {
    if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/popup-closed-by-user') {
      // Fall back to redirect if popup fails
      try {
        await signInWithRedirect(auth, provider);
        return null; // page will redirect, result handled on return
      } catch (e2) {
        console.error('Firebase redirect error:', e2);
        return null;
      }
    }
    console.error('Firebase sign-in error:', e?.code, e?.message);
    return null;
  }
}

export async function logout(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}
