import {
  collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, onSnapshot, serverTimestamp, type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type {
  ProjectMember, Task, ActivityLog, Comment, ProgressRecord, CollaborationState,
} from '../collaboration/types';

/* ── Helpers ── */

function coll(path: string) {
  if (!db) throw new Error('Firestore not initialized');
  return collection(db, path);
}

function d(path: string) {
  if (!db) throw new Error('Firestore not initialized');
  return doc(db, path);
}

function snapData<T>(snap: any): T | null {
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
}

/* ── Project ── */

export interface FireProject {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export async function createProject(name: string, ownerId: string): Promise<string> {
  const ref = await addDoc(coll('projects'), { name, ownerId, createdAt: new Date().toISOString() });
  return ref.id;
}

export async function getProject(projectId: string): Promise<FireProject | null> {
  return snapData<FireProject>(await getDoc(d(`projects/${projectId}`)));
}

/* ── Members ── */

export function onMembersChange(projectId: string, cb: (members: ProjectMember[]) => void): Unsubscribe {
  return onSnapshot(
    query(coll(`projects/${projectId}/members`)),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectMember))),
  );
}

export async function addMemberFB(projectId: string, member: ProjectMember): Promise<void> {
  await setDoc(d(`projects/${projectId}/members/${member.id}`), member);
}

export async function updateMemberFB(projectId: string, memberId: string, data: Partial<ProjectMember>): Promise<void> {
  await updateDoc(d(`projects/${projectId}/members/${memberId}`), data);
}

export async function removeMemberFB(projectId: string, memberId: string): Promise<void> {
  await deleteDoc(d(`projects/${projectId}/members/${memberId}`));
}

/* ── Tasks ── */

export function onTasksChange(projectId: string, cb: (tasks: Task[]) => void): Unsubscribe {
  return onSnapshot(
    query(coll(`projects/${projectId}/tasks`)),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task))),
  );
}

export async function addTaskFB(projectId: string, task: Task): Promise<void> {
  await setDoc(d(`projects/${projectId}/tasks/${task.id}`), task);
}

export async function updateTaskFB(projectId: string, taskId: string, data: Partial<Task>): Promise<void> {
  await updateDoc(d(`projects/${projectId}/tasks/${taskId}`), data);
}

export async function removeTaskFB(projectId: string, taskId: string): Promise<void> {
  await deleteDoc(d(`projects/${projectId}/tasks/${taskId}`));
}

/* ── Activity ── */

export function onActivitiesChange(projectId: string, cb: (activities: ActivityLog[]) => void): Unsubscribe {
  return onSnapshot(
    query(coll(`projects/${projectId}/activities`)),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog))),
  );
}

export async function addActivityFB(projectId: string, activity: ActivityLog): Promise<void> {
  await setDoc(d(`projects/${projectId}/activities/${activity.id}`), activity);
}

/* ── Comments ── */

export function onCommentsChange(projectId: string, cb: (comments: Comment[]) => void): Unsubscribe {
  return onSnapshot(
    query(coll(`projects/${projectId}/comments`)),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment))),
  );
}

export async function addCommentFB(projectId: string, comment: Comment): Promise<void> {
  await setDoc(d(`projects/${projectId}/comments/${comment.id}`), comment);
}

export async function removeCommentFB(projectId: string, commentId: string): Promise<void> {
  await deleteDoc(d(`projects/${projectId}/comments/${commentId}`));
}

/* ── Progress Records ── */

export function onRecordsChange(projectId: string, cb: (records: ProgressRecord[]) => void): Unsubscribe {
  return onSnapshot(
    query(coll(`projects/${projectId}/records`)),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProgressRecord))),
  );
}

export async function addRecordFB(projectId: string, record: ProgressRecord): Promise<void> {
  await setDoc(d(`projects/${projectId}/records/${record.id}`), record);
}

export async function updateRecordFB(projectId: string, recordId: string, data: Partial<ProgressRecord>): Promise<void> {
  await updateDoc(d(`projects/${projectId}/records/${recordId}`), data);
}

export async function removeRecordFB(projectId: string, recordId: string): Promise<void> {
  await deleteDoc(d(`projects/${projectId}/records/${recordId}`));
}
