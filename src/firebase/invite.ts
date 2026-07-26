import {
  collection, addDoc, getDoc, getDocs, doc, query, where, deleteDoc, setDoc,
} from 'firebase/firestore';
import { db } from './config';

export interface InviteLink {
  id: string;
  projectId: string;
  createdBy: string;
  role: string;
  uses: number;
  maxUses: number;
  expiresAt: string;
  createdAt: string;
}

export async function generateInvite(
  projectId: string, createdBy: string, role = 'engineer', maxUses = 10, expiresInDays = 7,
): Promise<string | null> {
  if (!db) return null;
  const expiresAt = new Date(Date.now() + expiresInDays * 86400000).toISOString();
  const ref = await addDoc(collection(db, 'invites'), {
    projectId, createdBy, role, uses: 0, maxUses, expiresAt, createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function acceptInvite(inviteId: string): Promise<{ projectId: string; role: string } | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'invites', inviteId));
  if (!snap.exists()) return null;
  const data = snap.data() as Omit<InviteLink, 'id'>;
  if (data.uses >= data.maxUses) return null;
  if (new Date(data.expiresAt) < new Date()) return null;
  await setDoc(doc(db, 'invites', inviteId), { uses: data.uses + 1 }, { merge: true });
  return { projectId: data.projectId, role: data.role };
}

export async function getInviteInfo(inviteId: string): Promise<InviteLink | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'invites', inviteId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as InviteLink;
}
