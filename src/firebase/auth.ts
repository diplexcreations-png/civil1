import {
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged,
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

export async function loginWithGoogle(): Promise<User | null> {
  if (!auth) return null;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}
