import {
  collection, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc,
  query, onSnapshot, getDocs, where, type Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, type UploadResult } from 'firebase/storage';
import { db, storage } from './config';
import type {
  ProjectMember, Task, ActivityLog, Comment, ProgressRecord,
  Issue, Document, ChatMessage, AppNotification, ProjectSettings,
  DailyReport, CostItem, MaterialItem,
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

async function safeWrite(fn: () => Promise<void>): Promise<boolean> {
  if (!db) return false;
  try { await fn(); return true; } catch (e) { console.warn('Firestore write error:', e); return false; }
}

/* ── Storage ── */

export async function uploadFile(path: string, file: File): Promise<string | null> {
  if (!storage) return null;
  try {
    const storageRef = ref(storage, path);
    const result: UploadResult = await uploadBytes(storageRef, file);
    return await getDownloadURL(result.ref);
  } catch (e) { console.warn('Storage upload error:', e); return null; }
}

export async function deleteFile(path: string): Promise<boolean> {
  if (!storage) return false;
  try { await deleteObject(ref(storage, path)); return true; } catch (e) { console.warn('Storage delete error:', e); return false; }
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
    const snap = await getDoc(docRef(`projects/${projectId}`));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as FireProject) : null;
  } catch { return null; }
}

export async function getUserProjects(userId: string): Promise<FireProject[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(query(coll('projects'), where('ownerId', '==', userId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FireProject));
  } catch (e) { console.warn('getUserProjects error:', e); return []; }
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

/* ── Issues ── */

export function onIssuesChange(projectId: string, cb: (issues: Issue[]) => void): Unsubscribe {
  return safeSubscribe(`projects/${projectId}/issues`, cb, d => d as Issue);
}

export async function addIssueFB(projectId: string, issue: Issue): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`projects/${projectId}/issues/${issue.id}`), issue));
}

export async function updateIssueFB(projectId: string, issueId: string, data: Partial<Issue>): Promise<boolean> {
  return safeWrite(() => updateDoc(docRef(`projects/${projectId}/issues/${issueId}`), data));
}

export async function removeIssueFB(projectId: string, issueId: string): Promise<boolean> {
  return safeWrite(() => deleteDoc(docRef(`projects/${projectId}/issues/${issueId}`)));
}

/* ── Documents ── */

export function onDocumentsChange(projectId: string, cb: (docs: Document[]) => void): Unsubscribe {
  return safeSubscribe(`projects/${projectId}/documents`, cb, d => d as Document);
}

export async function addDocumentFB(projectId: string, docData: Document): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`projects/${projectId}/documents/${docData.id}`), docData));
}

export async function removeDocumentFB(projectId: string, docId: string): Promise<boolean> {
  return safeWrite(() => deleteDoc(docRef(`projects/${projectId}/documents/${docId}`)));
}

/* ── Chat Messages ── */

export function onChatMessagesChange(projectId: string, cb: (msgs: ChatMessage[]) => void): Unsubscribe {
  return safeSubscribe(`projects/${projectId}/chat`, cb, d => d as ChatMessage);
}

export async function addChatMessageFB(projectId: string, msg: ChatMessage): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`projects/${projectId}/chat/${msg.id}`), msg));
}

/* ── Notifications ── */

export async function addNotificationFB(notification: AppNotification): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`notifications/${notification.id}`), notification));
}

export async function markNotificationReadFB(notificationId: string): Promise<boolean> {
  return safeWrite(() => updateDoc(docRef(`notifications/${notificationId}`), { read: true }));
}

export async function markAllNotificationsReadFB(userId: string): Promise<boolean> {
  if (!db) return false;
  try {
    const snap = await getDocs(query(coll('notifications'), where('userId', '==', userId), where('read', '==', false)));
    const batch = snap.docs.map(d => updateDoc(docRef(`notifications/${d.id}`), { read: true }));
    await Promise.all(batch);
    return true;
  } catch (e) { console.warn('Firestore markAllRead error:', e); return false; }
}

/* ── Project Settings ── */

export function onSettingsChange(projectId: string, cb: (settings: ProjectSettings | null) => void): Unsubscribe {
  if (!db) return () => {};
  try {
    return onSnapshot(
      doc(db, `projects/${projectId}/settings/general`),
      snap => cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as ProjectSettings) : null),
      err => console.warn('Firestore settings error:', err.code),
    );
  } catch { return () => {}; }
}

export async function saveSettingsFB(projectId: string, settings: ProjectSettings): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`projects/${projectId}/settings/general`), settings));
}

/* ── Daily Reports ── */

export function onDailyReportsChange(projectId: string, cb: (reports: DailyReport[]) => void): Unsubscribe {
  return safeSubscribe(`projects/${projectId}/dailyReports`, cb, d => d as DailyReport);
}

export async function addDailyReportFB(projectId: string, report: DailyReport): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`projects/${projectId}/dailyReports/${report.id}`), report));
}

export async function removeDailyReportFB(projectId: string, reportId: string): Promise<boolean> {
  return safeWrite(() => deleteDoc(docRef(`projects/${projectId}/dailyReports/${reportId}`)));
}

/* ── Cost Items ── */

export function onCostItemsChange(projectId: string, cb: (items: CostItem[]) => void): Unsubscribe {
  return safeSubscribe(`projects/${projectId}/costItems`, cb, d => d as CostItem);
}

export async function addCostItemFB(projectId: string, item: CostItem): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`projects/${projectId}/costItems/${item.id}`), item));
}

export async function updateCostItemFB(projectId: string, itemId: string, data: Partial<CostItem>): Promise<boolean> {
  return safeWrite(() => updateDoc(docRef(`projects/${projectId}/costItems/${itemId}`), data));
}

export async function removeCostItemFB(projectId: string, itemId: string): Promise<boolean> {
  return safeWrite(() => deleteDoc(docRef(`projects/${projectId}/costItems/${itemId}`)));
}

/* ── Material Items ── */

export function onMaterialItemsChange(projectId: string, cb: (items: MaterialItem[]) => void): Unsubscribe {
  return safeSubscribe(`projects/${projectId}/materialItems`, cb, d => d as MaterialItem);
}

export async function addMaterialItemFB(projectId: string, item: MaterialItem): Promise<boolean> {
  return safeWrite(() => setDoc(docRef(`projects/${projectId}/materialItems/${item.id}`), item));
}

export async function updateMaterialItemFB(projectId: string, itemId: string, data: Partial<MaterialItem>): Promise<boolean> {
  return safeWrite(() => updateDoc(docRef(`projects/${projectId}/materialItems/${itemId}`), data));
}

export async function removeMaterialItemFB(projectId: string, itemId: string): Promise<boolean> {
  return safeWrite(() => deleteDoc(docRef(`projects/${projectId}/materialItems/${itemId}`)));
}