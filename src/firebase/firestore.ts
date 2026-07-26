import {
  collection, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc,
  query, onSnapshot, type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type {
  ProjectMember, Task, ActivityLog, Comment, ProgressRecord,
} from '../collaboration/types';

/* ── Helpers ── */

function coll(path: string) {
  if (!db) throw new Error('Firestore not initialized');
  return collection(db, path);
}

function docRef(path: string) {
  if (!db) throw new Error('Firestore not initialized');
  return doc(db, path);
}

function snapData<T>(snap: any): T | null {
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
}

/** Wraps onSnapshot with error logging — returns noop unsub if db is null */
function safeSubscribe<T>(
  path: string,
  cb: (data: T[]) => void,
  mapFn: (d: any) => T,
): Unsubscribe {
  if (!db) return () => {};
  try {
    return onSnapshot(
      query(coll(path)),
      snap => cb(snap.docs.map(d => mapFn({ id: d.id, ...d.data() }))),
      err => console.warn('Firestore snapshot error:', path, err.code),
    );
  } catch (e) {
    console.warn('Firestore subscribe failed:', path, e);
    return () => {};
  }
}

/** Wraps a Firestore write, returns true on success */
async function safeWrite(fn: () => Promise<void>): Promise<boolean> {
  if (!db) return false;
  try { await fn(); return true; } catch (e) { console.warn('Firestore write error:', e); return false; }
}

/* ── Project ── */

export interface FireProject {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export async function createProject(name: string, ownerId: string): Promise<string | null> {
  if (!db) return null;
  try {
    const ref = await addDoc(coll('projects'), { name, ownerId, createdAt: new Date().toISOString() });
    return ref.id;
  } catch (e) { console.warn('Firestore createProject error:', e); return null; }
}

export async function getProject(projectId: string): Promise<FireProject | null> {
  if (!db) return null;
  try {
    return snapData<FireProject>(await getDoc(docRef(`projects/${projectId}`)));
  } catch { return null; }
}

/* ── Members ── */

export function onMembersChange(projectId: string, cb: (members: ProjectMember[]) => void): Unsubscribe {
  return safeSubscribe(`projects/${projectId}/members`, cb, d => d as ProjectMember);
}

export async function addMemberFB(projectId: string, member: ProjectMember): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`projects/${projectId}/members/${member.id}`), member));
}

export async function updateMemberFB(projectId: string, memberId: string, data: Partial<ProjectMember>): Promise<boolean> {
  return safeWrite(() => updateDoc(docRef(`projects/${projectId}/members/${memberId}`), data));
}

export async function removeMemberFB(projectId: string, memberId: string): Promise<boolean> {
  return safeWrite(() => deleteDoc(docRef(`projects/${projectId}/members/${memberId}`)));
}

/* ── Tasks ── */

export function onTasksChange(projectId: string, cb: (tasks: Task[]) => void): Unsubscribe {
  return safeSubscribe(`projects/${projectId}/tasks`, cb, d => d as Task);
}

export async function addTaskFB(projectId: string, task: Task): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`projects/${projectId}/tasks/${task.id}`), task));
}

export async function updateTaskFB(projectId: string, taskId: string, data: Partial<Task>): Promise<boolean> {
  return safeWrite(() => updateDoc(docRef(`projects/${projectId}/tasks/${taskId}`), data));
}

export async function removeTaskFB(projectId: string, taskId: string): Promise<boolean> {
  return safeWrite(() => deleteDoc(docRef(`projects/${projectId}/tasks/${taskId}`)));
}

/* ── Activity ── */

export function onActivitiesChange(projectId: string, cb: (activities: ActivityLog[]) => void): Unsubscribe {
  return safeSubscribe(`projects/${projectId}/activities`, cb, d => d as ActivityLog);
}

export async function addActivityFB(projectId: string, activity: ActivityLog): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`projects/${projectId}/activities/${activity.id}`), activity));
}

/* ── Comments ── */

export function onCommentsChange(projectId: string, cb: (comments: Comment[]) => void): Unsubscribe {
  return safeSubscribe(`projects/${projectId}/comments`, cb, d => d as Comment);
}

export async function addCommentFB(projectId: string, comment: Comment): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`projects/${projectId}/comments/${comment.id}`), comment));
}

export async function removeCommentFB(projectId: string, commentId: string): Promise<boolean> {
  return safeWrite(() => deleteDoc(docRef(`projects/${projectId}/comments/${commentId}`)));
}

/* ── Progress Records ── */

export function onRecordsChange(projectId: string, cb: (records: ProgressRecord[]) => void): Unsubscribe {
  return safeSubscribe(`projects/${projectId}/records`, cb, d => d as ProgressRecord);
}

export async function addRecordFB(projectId: string, record: ProgressRecord): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`projects/${projectId}/records/${record.id}`), record));
}

export async function updateRecordFB(projectId: string, recordId: string, data: Partial<ProgressRecord>): Promise<boolean> {
  return safeWrite(() => updateDoc(docRef(`projects/${projectId}/records/${recordId}`), data));
}

export async function removeRecordFB(projectId: string, recordId: string): Promise<boolean> {
  return safeWrite(() => deleteDoc(docRef(`projects/${projectId}/records/${recordId}`)));
}
