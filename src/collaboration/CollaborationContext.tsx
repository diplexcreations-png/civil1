import React, { createContext, useContext, useReducer, useCallback, useMemo, useState, useEffect, type ReactNode } from 'react';
import {
  CollaborationState, ProgressRecord, ProjectMember, Task, Comment,
  ActivityLog, FavoritedCalculator, PinnedCalculator, CalcHistoryEntry,
  Milestone, ProgressPhoto, MemberRole, WorkCategory, ProgressStatus,
  Issue, Document, ChatMessage, AppNotification, ProjectSettings,
  DailyReport, CostItem, MaterialItem,
  defaultCollaborationState, defaultCurrentUser,
} from './types';
import { isConfigured } from '../firebase/config';
import { onAuthChange, loginWithGoogle, logout as fbLogout, checkRedirectResult } from '../firebase/auth';
import {
  onMembersChange, addMemberFB, updateMemberFB, removeMemberFB,
  onTasksChange, addTaskFB, updateTaskFB, removeTaskFB,
  onActivitiesChange, addActivityFB,
  onCommentsChange, addCommentFB, removeCommentFB,
  onRecordsChange, addRecordFB, updateRecordFB, removeRecordFB,
  onIssuesChange, addIssueFB, updateIssueFB, removeIssueFB,
  onDocumentsChange, addDocumentFB, removeDocumentFB,
  onChatMessagesChange, addChatMessageFB,
  addNotificationFB, markNotificationReadFB, markAllNotificationsReadFB,
  onSettingsChange, saveSettingsFB,
  onDailyReportsChange, addDailyReportFB, removeDailyReportFB,
  onCostItemsChange, addCostItemFB, updateCostItemFB, removeCostItemFB,
  onMaterialItemsChange, addMaterialItemFB, updateMaterialItemFB, removeMaterialItemFB,
  createProject, getProject, getUserProjects, uploadFile, deleteFile, type FireProject,
} from '../firebase/firestore';
import { generateInvite, acceptInvite } from '../firebase/invite';

const STORAGE_KEY = 'civilmath_collab';

type CollabAction =
  | { type: 'SET_PROJECT'; projectId: string }
  | { type: 'SET_USER'; user: Partial<ProjectMember> }
  /* Progress */
  | { type: 'ADD_PROGRESS'; projectId: string; record: ProgressRecord }
  | { type: 'UPDATE_PROGRESS'; projectId: string; recordId: string; data: Partial<ProgressRecord> }
  | { type: 'REMOVE_PROGRESS'; projectId: string; recordId: string }
  | { type: 'ADD_PHOTO'; projectId: string; recordId: string; photo: ProgressPhoto }
  | { type: 'ADD_MILESTONE'; projectId: string; milestone: Milestone }
  | { type: 'UPDATE_MILESTONE'; projectId: string; milestoneId: string; data: Partial<Milestone> }
  /* Members */
  | { type: 'ADD_MEMBER'; projectId: string; member: ProjectMember }
  | { type: 'UPDATE_MEMBER'; projectId: string; memberId: string; data: Partial<ProjectMember> }
  | { type: 'REMOVE_MEMBER'; projectId: string; memberId: string }
  /* Tasks */
  | { type: 'ADD_TASK'; projectId: string; task: Task }
  | { type: 'UPDATE_TASK'; projectId: string; taskId: string; data: Partial<Task> }
  | { type: 'REMOVE_TASK'; projectId: string; taskId: string }
  /* Activity */
  | { type: 'ADD_ACTIVITY'; projectId: string; activity: ActivityLog }
  /* Comments */
  | { type: 'ADD_COMMENT'; projectId: string; comment: Comment }
  | { type: 'REMOVE_COMMENT'; projectId: string; commentId: string }
  /* Issues */
  | { type: 'ADD_ISSUE'; projectId: string; issue: Issue }
  | { type: 'UPDATE_ISSUE'; projectId: string; issueId: string; data: Partial<Issue> }
  | { type: 'REMOVE_ISSUE'; projectId: string; issueId: string }
  /* Documents */
  | { type: 'ADD_DOCUMENT'; projectId: string; document: Document }
  | { type: 'REMOVE_DOCUMENT'; projectId: string; docId: string }
  /* Chat */
  | { type: 'ADD_CHAT_MESSAGE'; projectId: string; message: ChatMessage }
  /* Notifications */
  | { type: 'ADD_NOTIFICATION'; notification: AppNotification }
  | { type: 'MARK_NOTIFICATION_READ'; notificationId: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  /* Settings */
  | { type: 'SET_SETTINGS'; projectId: string; settings: ProjectSettings }
  /* Daily Reports */
  | { type: 'ADD_DAILY_REPORT'; projectId: string; report: DailyReport }
  | { type: 'REMOVE_DAILY_REPORT'; projectId: string; reportId: string }
  /* Cost Items */
  | { type: 'ADD_COST_ITEM'; projectId: string; item: CostItem }
  | { type: 'UPDATE_COST_ITEM'; projectId: string; itemId: string; data: Partial<CostItem> }
  | { type: 'REMOVE_COST_ITEM'; projectId: string; itemId: string }
  /* Material Items */
  | { type: 'ADD_MATERIAL_ITEM'; projectId: string; item: MaterialItem }
  | { type: 'UPDATE_MATERIAL_ITEM'; projectId: string; itemId: string; data: Partial<MaterialItem> }
  | { type: 'REMOVE_MATERIAL_ITEM'; projectId: string; itemId: string }
  /* Favorites / History */
  | { type: 'TOGGLE_FAVORITE'; calculatorId: string; name: string }
  | { type: 'REMOVE_FAVORITE'; calculatorId: string }
  | { type: 'PIN_CALCULATOR'; calculatorId: string; name: string }
  | { type: 'UNPIN_CALCULATOR'; calculatorId: string }
  | { type: 'REORDER_PINNED'; pinned: PinnedCalculator[] }
  | { type: 'ADD_HISTORY'; entry: CalcHistoryEntry }
  | { type: 'DELETE_HISTORY'; id: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'LOAD_STATE'; state: CollaborationState };

function nextId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function collabReducer(state: CollaborationState, action: CollabAction): CollaborationState {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, currentProjectId: action.projectId };
    case 'SET_USER':
      return { ...state, currentUser: { ...state.currentUser, ...action.user } };

    /* Progress */
    case 'ADD_PROGRESS': {
      const records = state.projects[action.projectId]?.records || [];
      return { ...state, projects: { ...state.projects, [action.projectId]: { ...state.projects[action.projectId], records: [...records, action.record] } } };
    }
    case 'UPDATE_PROGRESS': {
      const p = state.projects[action.projectId];
      if (!p) return state;
      return { ...state, projects: { ...state.projects, [action.projectId]: { ...p, records: p.records.map(r => r.id === action.recordId ? { ...r, ...action.data } : r) } } };
    }
    case 'REMOVE_PROGRESS': {
      const p = state.projects[action.projectId];
      if (!p) return state;
      return { ...state, projects: { ...state.projects, [action.projectId]: { ...p, records: p.records.filter(r => r.id !== action.recordId) } } };
    }
    case 'ADD_PHOTO': {
      const p = state.projects[action.projectId];
      if (!p) return state;
      return { ...state, projects: { ...state.projects, [action.projectId]: { ...p, records: p.records.map(r => r.id === action.recordId ? { ...r, photos: [...r.photos, action.photo] } : r) } } };
    }
    case 'ADD_MILESTONE': {
      const p = state.projects[action.projectId];
      return { ...state, projects: { ...state.projects, [action.projectId]: { ...p, milestones: [...(p?.milestones || []), action.milestone] } } };
    }
    case 'UPDATE_MILESTONE': {
      const p = state.projects[action.projectId];
      if (!p) return state;
      return { ...state, projects: { ...state.projects, [action.projectId]: { ...p, milestones: p.milestones.map(m => m.id === action.milestoneId ? { ...m, ...action.data } : m) } } };
    }

    /* Members */
    case 'ADD_MEMBER': {
      const members = state.members[action.projectId] || [];
      return { ...state, members: { ...state.members, [action.projectId]: [...members, action.member] } };
    }
    case 'UPDATE_MEMBER': {
      const members = state.members[action.projectId] || [];
      return { ...state, members: { ...state.members, [action.projectId]: members.map(m => m.id === action.memberId ? { ...m, ...action.data } : m) } };
    }
    case 'REMOVE_MEMBER': {
      const members = state.members[action.projectId] || [];
      return { ...state, members: { ...state.members, [action.projectId]: members.filter(m => m.id !== action.memberId) } };
    }

    /* Tasks */
    case 'ADD_TASK': {
      const tasks = state.tasks[action.projectId] || [];
      return { ...state, tasks: { ...state.tasks, [action.projectId]: [...tasks, action.task] } };
    }
    case 'UPDATE_TASK': {
      const tasks = state.tasks[action.projectId] || [];
      return { ...state, tasks: { ...state.tasks, [action.projectId]: tasks.map(t => t.id === action.taskId ? { ...t, ...action.data } : t) } };
    }
    case 'REMOVE_TASK': {
      const tasks = state.tasks[action.projectId] || [];
      return { ...state, tasks: { ...state.tasks, [action.projectId]: tasks.filter(t => t.id !== action.taskId) } };
    }

    case 'ADD_ACTIVITY': {
      const activities = state.activities[action.projectId] || [];
      return { ...state, activities: { ...state.activities, [action.projectId]: [action.activity, ...activities] } };
    }

    case 'ADD_COMMENT': {
      const comments = state.comments[action.projectId] || [];
      return { ...state, comments: { ...state.comments, [action.projectId]: [...comments, action.comment] } };
    }
    case 'REMOVE_COMMENT': {
      const comments = state.comments[action.projectId] || [];
      return { ...state, comments: { ...state.comments, [action.projectId]: comments.filter(c => c.id !== action.commentId) } };
    }

    /* Issues */
    case 'ADD_ISSUE': {
      const issues = state.issues[action.projectId] || [];
      return { ...state, issues: { ...state.issues, [action.projectId]: [...issues, action.issue] } };
    }
    case 'UPDATE_ISSUE': {
      const issues = state.issues[action.projectId] || [];
      return { ...state, issues: { ...state.issues, [action.projectId]: issues.map(i => i.id === action.issueId ? { ...i, ...action.data } : i) } };
    }
    case 'REMOVE_ISSUE': {
      const issues = state.issues[action.projectId] || [];
      return { ...state, issues: { ...state.issues, [action.projectId]: issues.filter(i => i.id !== action.issueId) } };
    }

    /* Documents */
    case 'ADD_DOCUMENT': {
      const docs = state.documents[action.projectId] || [];
      return { ...state, documents: { ...state.documents, [action.projectId]: [...docs, action.document] } };
    }
    case 'REMOVE_DOCUMENT': {
      const docs = state.documents[action.projectId] || [];
      return { ...state, documents: { ...state.documents, [action.projectId]: docs.filter(d => d.id !== action.docId) } };
    }

    /* Chat */
    case 'ADD_CHAT_MESSAGE': {
      const msgs = state.chatMessages[action.projectId] || [];
      return { ...state, chatMessages: { ...state.chatMessages, [action.projectId]: [...msgs, action.message] } };
    }

    /* Notifications */
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.notification, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.notificationId ? { ...n, read: true } : n) };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };

    /* Settings */
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, [action.projectId]: action.settings } };

    /* Daily Reports */
    case 'ADD_DAILY_REPORT': {
      const reports = state.dailyReports[action.projectId] || [];
      return { ...state, dailyReports: { ...state.dailyReports, [action.projectId]: [...reports, action.report] } };
    }
    case 'REMOVE_DAILY_REPORT': {
      const reports = state.dailyReports[action.projectId] || [];
      return { ...state, dailyReports: { ...state.dailyReports, [action.projectId]: reports.filter(r => r.id !== action.reportId) } };
    }

    /* Cost Items */
    case 'ADD_COST_ITEM': {
      const items = state.costItems[action.projectId] || [];
      return { ...state, costItems: { ...state.costItems, [action.projectId]: [...items, action.item] } };
    }
    case 'UPDATE_COST_ITEM': {
      const items = state.costItems[action.projectId] || [];
      return { ...state, costItems: { ...state.costItems, [action.projectId]: items.map(i => i.id === action.itemId ? { ...i, ...action.data } : i) } };
    }
    case 'REMOVE_COST_ITEM': {
      const items = state.costItems[action.projectId] || [];
      return { ...state, costItems: { ...state.costItems, [action.projectId]: items.filter(i => i.id !== action.itemId) } };
    }

    /* Material Items */
    case 'ADD_MATERIAL_ITEM': {
      const items = state.materialItems[action.projectId] || [];
      return { ...state, materialItems: { ...state.materialItems, [action.projectId]: [...items, action.item] } };
    }
    case 'UPDATE_MATERIAL_ITEM': {
      const items = state.materialItems[action.projectId] || [];
      return { ...state, materialItems: { ...state.materialItems, [action.projectId]: items.map(i => i.id === action.itemId ? { ...i, ...action.data } : i) } };
    }
    case 'REMOVE_MATERIAL_ITEM': {
      const items = state.materialItems[action.projectId] || [];
      return { ...state, materialItems: { ...state.materialItems, [action.projectId]: items.filter(i => i.id !== action.itemId) } };
    }

    /* Favorites / History */
    case 'TOGGLE_FAVORITE': {
      const exists = state.favorites.find(f => f.calculatorId === action.calculatorId);
      if (exists) return { ...state, favorites: state.favorites.filter(f => f.calculatorId !== action.calculatorId) };
      return { ...state, favorites: [...state.favorites, { calculatorId: action.calculatorId, name: action.name, addedAt: new Date().toISOString() }] };
    }
    case 'REMOVE_FAVORITE':
      return { ...state, favorites: state.favorites.filter(f => f.calculatorId !== action.calculatorId) };
    case 'PIN_CALCULATOR': {
      if (state.pinned.find(p => p.calculatorId === action.calculatorId)) return state;
      return { ...state, pinned: [...state.pinned, { calculatorId: action.calculatorId, name: action.name, order: state.pinned.length }] };
    }
    case 'UNPIN_CALCULATOR':
      return { ...state, pinned: state.pinned.filter(p => p.calculatorId !== action.calculatorId) };
    case 'REORDER_PINNED':
      return { ...state, pinned: action.pinned };
    case 'ADD_HISTORY':
      return { ...state, history: [action.entry, ...state.history].slice(0, 200) };
    case 'DELETE_HISTORY':
      return { ...state, history: state.history.filter(h => h.id !== action.id) };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    case 'LOAD_STATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

function persist(state: CollaborationState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

/* ── Context interface ── */

interface CollabContextValue {
  state: CollaborationState;
  dispatch: React.Dispatch<CollabAction>;
  fbUser: any;
  isOnline: boolean;
  inviteLink: string | null;
  generateInviteLink: () => Promise<void>;

  /* Selectors — existing */
  currentRecords: ProgressRecord[];
  currentMembers: ProjectMember[];
  currentTasks: Task[];
  currentActivities: ActivityLog[];
  currentComments: Comment[];
  overallProgress: number;
  todayProgress: number;
  weeklyProgress: number;
  monthlyProgress: number;
  completedTasks: number;
  pendingTasks: number;
  delayedTasks: number;
  categoryProgress: Record<string, number>;

  /* Selectors — new */
  currentIssues: Issue[];
  currentDocuments: Document[];
  currentChatMessages: ChatMessage[];
  currentNotifications: AppNotification[];
  currentSettings: ProjectSettings | null;
  currentDailyReports: DailyReport[];
  currentCostItems: CostItem[];
  currentMaterialItems: MaterialItem[];
  unreadNotifications: number;
  totalBudget: number;
  totalActualCost: number;
  totalCommitted: number;

  /* Actions — existing */
  setProject: (id: string) => void;
  setUser: (user: Partial<ProjectMember>) => void;
  addProgress: (projectId: string, record?: Partial<ProgressRecord>) => void;
  updateProgress: (projectId: string, recordId: string, data: Partial<ProgressRecord>) => void;
  removeProgress: (projectId: string, recordId: string) => void;
  addPhoto: (projectId: string, recordId: string, photo: ProgressPhoto) => void;
  addMilestone: (projectId: string, name: string, category: WorkCategory) => void;
  updateMilestone: (projectId: string, milestoneId: string, data: Partial<Milestone>) => void;
  addMember: (projectId: string, member?: Partial<ProjectMember>) => void;
  updateMember: (projectId: string, memberId: string, data: Partial<ProjectMember>) => void;
  removeMember: (projectId: string, memberId: string) => void;
  addTask: (projectId: string, task?: Partial<Task>) => void;
  updateTask: (projectId: string, taskId: string, data: Partial<Task>) => void;
  removeTask: (projectId: string, taskId: string) => void;
  addActivity: (projectId: string, action: string, details: string) => void;
  addComment: (projectId: string, text: string, parentId?: string) => void;
  removeComment: (projectId: string, commentId: string) => void;
  updateRecord: (projectId: string, recordId: string, data: Partial<ProgressRecord>) => void;

  /* Actions — new */
  addIssue: (projectId: string, issue?: Partial<Issue>) => void;
  updateIssue: (projectId: string, issueId: string, data: Partial<Issue>) => void;
  removeIssue: (projectId: string, issueId: string) => void;
  addDocument: (projectId: string, doc: Partial<Document>) => void;
  removeDocument: (projectId: string, docId: string) => void;
  uploadProjectFile: (projectId: string, file: File, docData: Partial<Document>) => Promise<void>;
  sendChatMessage: (projectId: string, text: string) => void;
  addNotification: (notif: Partial<AppNotification>) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  saveSettings: (projectId: string, settings: Partial<ProjectSettings>) => void;
  addDailyReport: (projectId: string, report?: Partial<DailyReport>) => void;
  removeDailyReport: (projectId: string, reportId: string) => void;
  addCostItem: (projectId: string, item?: Partial<CostItem>) => void;
  updateCostItem: (projectId: string, itemId: string, data: Partial<CostItem>) => void;
  removeCostItem: (projectId: string, itemId: string) => void;
  addMaterialItem: (projectId: string, item?: Partial<MaterialItem>) => void;
  updateMaterialItem: (projectId: string, itemId: string, data: Partial<MaterialItem>) => void;
  removeMaterialItem: (projectId: string, itemId: string) => void;

  /* Project management */
  currentProjects: FireProject[];
  currentProjectName: string;
  createNewProject: (name: string) => Promise<void>;

  /* Auth */
  toggleFavorite: (calculatorId: string, name: string) => void;
  pinCalculator: (calculatorId: string, name: string) => void;
  unpinCalculator: (calculatorId: string) => void;
  addHistory: (entry: CalcHistoryEntry) => void;
  deleteHistory: (id: string) => void;
  clearHistory: () => void;
  isFavorited: (calculatorId: string) => boolean;
  isPinned: (calculatorId: string) => boolean;
  hasProject: (projectId: string) => boolean;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const CollabContext = createContext<CollabContextValue | null>(null);

export function CollaborationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(collabReducer, null, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultCollaborationState(), ...JSON.parse(saved) };
    } catch {}
    return defaultCollaborationState();
  });

  const online = isConfigured();
  const [fbUser, setFbUser] = useState<any>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  /* Firebase state mirrors */
  const [fbMembers, setFbMembers] = useState<ProjectMember[]>([]);
  const [fbTasks, setFbTasks] = useState<Task[]>([]);
  const [fbActivities, setFbActivities] = useState<ActivityLog[]>([]);
  const [fbComments, setFbComments] = useState<Comment[]>([]);
  const [fbRecords, setFbRecords] = useState<ProgressRecord[]>([]);
  const [fbIssues, setFbIssues] = useState<Issue[]>([]);
  const [fbDocuments, setFbDocuments] = useState<Document[]>([]);
  const [fbChatMessages, setFbChatMessages] = useState<ChatMessage[]>([]);
  const [fbSettings, setFbSettings] = useState<ProjectSettings | null>(null);
  const [fbDailyReports, setFbDailyReports] = useState<DailyReport[]>([]);
  const [fbCostItems, setFbCostItems] = useState<CostItem[]>([]);
  const [fbMaterialItems, setFbMaterialItems] = useState<MaterialItem[]>([]);
  const [fbProjects, setFbProjects] = useState<FireProject[]>([]);

  /* Fetch user projects when auth changes */
  useEffect(() => {
    if (!online || !fbUser) { setFbProjects([]); return; }
    getUserProjects(fbUser.uid).then(setFbProjects);
  }, [online, fbUser]);

  /* Auth listener */
  useEffect(() => {
    if (!online) return;
    checkRedirectResult().then(user => {
      if (user) {
        setFbUser(user);
        dispatch({ type: 'SET_USER', user: { id: user.uid, name: user.displayName || 'User', email: user.email || '', avatar: user.photoURL || '' } });
      }
    });
    const unsub = onAuthChange(user => {
      setFbUser(user);
      if (user) {
        dispatch({ type: 'SET_USER', user: { id: user.uid, name: user.displayName || 'User', email: user.email || '', avatar: user.photoURL || '' } });
      }
    });
    return () => unsub();
  }, [online]);

  /* Real-time listeners */
  useEffect(() => {
    if (!online) return;
    const pid = state.currentProjectId || 'default';
    const unsubs: (() => void)[] = [];

    unsubs.push(onMembersChange(pid, setFbMembers));
    unsubs.push(onTasksChange(pid, setFbTasks));
    unsubs.push(onActivitiesChange(pid, setFbActivities));
    unsubs.push(onCommentsChange(pid, setFbComments));
    unsubs.push(onRecordsChange(pid, setFbRecords));
    unsubs.push(onIssuesChange(pid, setFbIssues));
    unsubs.push(onDocumentsChange(pid, setFbDocuments));
    unsubs.push(onChatMessagesChange(pid, setFbChatMessages));
    unsubs.push(onSettingsChange(pid, setFbSettings));
    unsubs.push(onDailyReportsChange(pid, setFbDailyReports));
    unsubs.push(onCostItemsChange(pid, setFbCostItems));
    unsubs.push(onMaterialItemsChange(pid, setFbMaterialItems));

    return () => unsubs.forEach(u => u());
  }, [online, state.currentProjectId]);

  /* Persist */
  useEffect(() => { persist(state); }, [state]);

  const pid = state.currentProjectId || 'default';

  /* Selectors with Firebase fallback */
  const currentRecords = online && fbRecords.length > 0 ? fbRecords : (state.projects[pid]?.records || []);
  const currentMembers = online && fbMembers.length > 0 ? fbMembers : (state.members[pid] || []);
  const currentTasks = online && fbTasks.length > 0 ? fbTasks : (state.tasks[pid] || []);
  const currentActivities = online && fbActivities.length > 0 ? fbActivities : (state.activities[pid] || []);
  const currentComments = online && fbComments.length > 0 ? fbComments : (state.comments[pid] || []);
  const currentIssues = online && fbIssues.length > 0 ? fbIssues : (state.issues[pid] || []);
  const currentDocuments = online && fbDocuments.length > 0 ? fbDocuments : (state.documents[pid] || []);
  const currentChatMessages = online && fbChatMessages.length > 0 ? fbChatMessages : (state.chatMessages[pid] || []);
  const currentSettings = online && fbSettings ? fbSettings : (state.settings[pid] || null);
  const currentDailyReports = online && fbDailyReports.length > 0 ? fbDailyReports : (state.dailyReports[pid] || []);
  const currentCostItems = online && fbCostItems.length > 0 ? fbCostItems : (state.costItems[pid] || []);
  const currentMaterialItems = online && fbMaterialItems.length > 0 ? fbMaterialItems : (state.materialItems[pid] || []);
  const currentProjects = online ? fbProjects : [];
  const currentProjectName = currentProjects.find(p => p.id === pid)?.name || currentSettings?.name || pid;
  const currentNotifications = state.notifications;
  const unreadNotifications = currentNotifications.filter(n => !n.read).length;

  /* Computed — existing */
  const overallProgress = useMemo(() => {
    if (currentRecords.length === 0) return 0;
    const tp = currentRecords.reduce((s, r) => s + r.plannedQty, 0);
    const tc = currentRecords.reduce((s, r) => s + r.completedQty, 0);
    return tp > 0 ? Math.min(100, Math.round((tc / tp) * 100)) : 0;
  }, [currentRecords]);

  const todayProgress = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayRecords = currentRecords.filter(r => r.date === today);
    if (todayRecords.length === 0) return 0;
    const tp = todayRecords.reduce((s, r) => s + r.plannedQty, 0);
    const tc = todayRecords.reduce((s, r) => s + r.completedQty, 0);
    return tp > 0 ? Math.round((tc / tp) * 100) : 0;
  }, [currentRecords]);

  const weeklyProgress = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const week = currentRecords.filter(r => r.date >= weekAgo);
    const tp = week.reduce((s, r) => s + r.plannedQty, 0);
    const tc = week.reduce((s, r) => s + r.completedQty, 0);
    return tp > 0 ? Math.round((tc / tp) * 100) : 0;
  }, [currentRecords]);

  const monthlyProgress = useMemo(() => {
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const month = currentRecords.filter(r => r.date >= monthAgo);
    const tp = month.reduce((s, r) => s + r.plannedQty, 0);
    const tc = month.reduce((s, r) => s + r.completedQty, 0);
    return tp > 0 ? Math.round((tc / tp) * 100) : 0;
  }, [currentRecords]);

  const completedTasks = useMemo(() => currentTasks.filter(t => t.status === 'completed').length, [currentTasks]);
  const pendingTasks = useMemo(() => currentTasks.filter(t => t.status === 'todo' || t.status === 'in-progress').length, [currentTasks]);
  const delayedTasks = useMemo(() => currentTasks.filter(t => t.status === 'blocked').length, [currentTasks]);

  const categoryProgress = useMemo(() => {
    const cat: Record<string, { planned: number; completed: number }> = {};
    currentRecords.forEach(r => {
      if (!cat[r.category]) cat[r.category] = { planned: 0, completed: 0 };
      cat[r.category].planned += r.plannedQty;
      cat[r.category].completed += r.completedQty;
    });
    const result: Record<string, number> = {};
    Object.entries(cat).forEach(([k, v]) => { result[k] = v.planned > 0 ? Math.round((v.completed / v.planned) * 100) : 0; });
    return result;
  }, [currentRecords]);

  /* Computed — new */
  const totalBudget = useMemo(() => currentCostItems.reduce((s, i) => s + i.estimatedCost, 0), [currentCostItems]);
  const totalActualCost = useMemo(() => currentCostItems.reduce((s, i) => s + i.actualCost, 0), [currentCostItems]);
  const totalCommitted = useMemo(() => currentCostItems.reduce((s, i) => s + i.committedCost, 0), [currentCostItems]);

  /* ── Actions ── */

  const setProject = useCallback((id: string) => dispatch({ type: 'SET_PROJECT', projectId: id }), []);
  const setUser = useCallback((user: Partial<ProjectMember>) => dispatch({ type: 'SET_USER', user }), []);

  const updateRecord = useCallback(async (projectId: string, recordId: string, data: Partial<ProgressRecord>) => {
    const act: ActivityLog = { id: nextId('act'), projectId, userId: state.currentUser.id, userName: state.currentUser.name, action: 'updated progress', details: `Updated record ${recordId}`, timestamp: new Date().toISOString() };
    dispatch({ type: 'UPDATE_PROGRESS', projectId, recordId, data });
    dispatch({ type: 'ADD_ACTIVITY', projectId, activity: act });
    if (online) { updateRecordFB(projectId, recordId, data); addActivityFB(projectId, act); }
  }, [online, state.currentUser]);

  const addProgress = useCallback(async (projectId: string, record?: Partial<ProgressRecord>) => {
    const r: ProgressRecord = {
      id: nextId('prg'), projectId, date: new Date().toISOString().slice(0, 10),
      category: 'Other', description: '', plannedQty: 0, completedQty: 0, unit: 'm³',
      status: 'pending', engineerNotes: '', photos: [], createdBy: state.currentUser.id,
      createdAt: new Date().toISOString(), ...record,
    };
    const act: ActivityLog = { id: nextId('act'), projectId, userId: state.currentUser.id, userName: state.currentUser.name, action: 'added progress', details: `New ${r.category} record`, timestamp: new Date().toISOString() };
    dispatch({ type: 'ADD_PROGRESS', projectId, record: r });
    dispatch({ type: 'ADD_ACTIVITY', projectId, activity: act });
    if (online) { addRecordFB(projectId, r); addActivityFB(projectId, act); }
  }, [online, state.currentUser]);

  const removeProgress = useCallback(async (projectId: string, recordId: string) => {
    dispatch({ type: 'REMOVE_PROGRESS', projectId, recordId });
    if (online) removeRecordFB(projectId, recordId);
  }, [online]);

  const addPhoto = useCallback((projectId: string, recordId: string, photo: ProgressPhoto) => {
    dispatch({ type: 'ADD_PHOTO', projectId, recordId, photo });
  }, []);

  const addMilestone = useCallback((projectId: string, name: string, category: WorkCategory) => {
    dispatch({ type: 'ADD_MILESTONE', projectId, milestone: { id: nextId('ms'), name, category, status: 'pending', completedDate: null } });
  }, []);

  const updateMilestone = useCallback((projectId: string, milestoneId: string, data: Partial<Milestone>) => {
    dispatch({ type: 'UPDATE_MILESTONE', projectId, milestoneId, data });
  }, []);

  const addMember = useCallback(async (projectId: string, member?: Partial<ProjectMember>) => {
    const m: ProjectMember = { id: nextId('mem'), name: '', email: '', role: 'viewer', avatar: '', lastActive: new Date().toISOString(), assignedTasks: [], joinedAt: new Date().toISOString(), ...member };
    dispatch({ type: 'ADD_MEMBER', projectId, member: m });
    if (online) addMemberFB(projectId, m);
  }, [online]);

  const updateMember = useCallback(async (projectId: string, memberId: string, data: Partial<ProjectMember>) => {
    dispatch({ type: 'UPDATE_MEMBER', projectId, memberId, data });
    if (online) updateMemberFB(projectId, memberId, data);
  }, [online]);

  const removeMember = useCallback(async (projectId: string, memberId: string) => {
    dispatch({ type: 'REMOVE_MEMBER', projectId, memberId });
    if (online) removeMemberFB(projectId, memberId);
  }, [online]);

  const addTask = useCallback(async (projectId: string, task?: Partial<Task>) => {
    const t: Task = { id: nextId('task'), projectId, title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '', status: 'todo', category: '', createdBy: state.currentUser.id, createdAt: new Date().toISOString(), ...task };
    dispatch({ type: 'ADD_TASK', projectId, task: t });
    if (online) addTaskFB(projectId, t);
  }, [online, state.currentUser]);

  const updateTask = useCallback(async (projectId: string, taskId: string, data: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', projectId, taskId, data });
    if (online) updateTaskFB(projectId, taskId, data);
  }, [online]);

  const removeTask = useCallback(async (projectId: string, taskId: string) => {
    dispatch({ type: 'REMOVE_TASK', projectId, taskId });
    if (online) removeTaskFB(projectId, taskId);
  }, [online]);

  const addActivity = useCallback(async (projectId: string, action: string, details: string) => {
    const a: ActivityLog = { id: nextId('act'), projectId, userId: state.currentUser.id, userName: state.currentUser.name, action, details, timestamp: new Date().toISOString() };
    dispatch({ type: 'ADD_ACTIVITY', projectId, activity: a });
    if (online) addActivityFB(projectId, a);
  }, [online, state.currentUser]);

  const addComment = useCallback(async (projectId: string, text: string, parentId?: string) => {
    const c: Comment = { id: nextId('cmt'), projectId, userId: state.currentUser.id, userName: state.currentUser.name, text, mentions: [], attachments: [], parentId: parentId || null, createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_COMMENT', projectId, comment: c });
    if (online) addCommentFB(projectId, c);
  }, [online, state.currentUser]);

  const removeComment = useCallback(async (projectId: string, commentId: string) => {
    dispatch({ type: 'REMOVE_COMMENT', projectId, commentId });
    if (online) removeCommentFB(projectId, commentId);
  }, [online]);

  /* ── Issues ── */

  const addIssue = useCallback(async (projectId: string, issue?: Partial<Issue>) => {
    const i: Issue = {
      id: nextId('iss'), projectId, title: '', description: '', status: 'open',
      priority: 'medium', severity: 'minor', category: 'Other', assignedTo: '',
      createdBy: state.currentUser.id, createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), resolvedAt: null, attachments: [], commentIds: [], ...issue,
    };
    dispatch({ type: 'ADD_ISSUE', projectId, issue: i });
    if (online) addIssueFB(projectId, i);
  }, [online, state.currentUser]);

  const updateIssue = useCallback(async (projectId: string, issueId: string, data: Partial<Issue>) => {
    dispatch({ type: 'UPDATE_ISSUE', projectId, issueId, data: { ...data, updatedAt: new Date().toISOString() } });
    if (online) updateIssueFB(projectId, issueId, { ...data, updatedAt: new Date().toISOString() });
  }, [online]);

  const removeIssue = useCallback(async (projectId: string, issueId: string) => {
    dispatch({ type: 'REMOVE_ISSUE', projectId, issueId });
    if (online) removeIssueFB(projectId, issueId);
  }, [online]);

  /* ── Documents ── */

  const addDocument = useCallback(async (projectId: string, doc: Partial<Document>) => {
    const d: Document = {
      id: nextId('doc'), projectId, name: '', type: 'other', category: 'Other',
      fileUrl: '', fileSize: 0, mimeType: '', uploadedBy: state.currentUser.id,
      uploadedAt: new Date().toISOString(), version: 1, tags: [], description: '', ...doc,
    };
    dispatch({ type: 'ADD_DOCUMENT', projectId, document: d });
    if (online) addDocumentFB(projectId, d);
  }, [online, state.currentUser]);

  const removeDocument = useCallback(async (projectId: string, docId: string) => {
    dispatch({ type: 'REMOVE_DOCUMENT', projectId, docId });
    if (online) removeDocumentFB(projectId, docId);
  }, [online]);

  const uploadProjectFile = useCallback(async (projectId: string, file: File, docData: Partial<Document>) => {
    const path = `projects/${projectId}/documents/${Date.now()}_${file.name}`;
    const url = await uploadFile(path, file);
    if (url) {
      addDocument(projectId, { ...docData, name: file.name, fileUrl: url, fileSize: file.size, mimeType: file.type });
    }
  }, [addDocument]);

  /* ── Chat ── */

  const sendChatMessage = useCallback(async (projectId: string, text: string) => {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: nextId('chat'), projectId, senderId: state.currentUser.id,
      senderName: state.currentUser.name, senderAvatar: state.currentUser.avatar,
      text, timestamp: new Date().toISOString(), attachments: [], replyTo: null, editedAt: null,
    };
    dispatch({ type: 'ADD_CHAT_MESSAGE', projectId, message: msg });
    if (online) addChatMessageFB(projectId, msg);
  }, [online, state.currentUser]);

  /* ── Notifications ── */

  const addNotification = useCallback(async (notif: Partial<AppNotification>) => {
    const n: AppNotification = {
      id: nextId('notif'), userId: state.currentUser.id, projectId: pid,
      type: 'system', title: '', message: '', link: '', read: false,
      createdAt: new Date().toISOString(), ...notif,
    };
    dispatch({ type: 'ADD_NOTIFICATION', notification: n });
    if (online) addNotificationFB(n);
  }, [online, state.currentUser, pid]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', notificationId });
    if (online) markNotificationReadFB(notificationId);
  }, [online]);

  const markAllNotificationsRead = useCallback(async () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
    if (online) markAllNotificationsReadFB(state.currentUser.id);
  }, [online, state.currentUser.id]);

  /* ── Settings ── */

  const saveSettings = useCallback(async (projectId: string, settings: Partial<ProjectSettings>) => {
    const s: ProjectSettings = {
      projectId, name: '', description: '', location: '', startDate: '',
      targetEndDate: '', status: 'planning', budget: 0, currency: 'USD',
      ownerId: state.currentUser.id, defaultRole: 'viewer', logo: '', tags: [],
      updatedAt: new Date().toISOString(), ...currentSettings, ...settings,
    };
    dispatch({ type: 'SET_SETTINGS', projectId, settings: s });
    if (online) saveSettingsFB(projectId, s);
  }, [online, state.currentUser, currentSettings]);

  /* ── Daily Reports ── */

  const addDailyReport = useCallback(async (projectId: string, report?: Partial<DailyReport>) => {
    const r: DailyReport = {
      id: nextId('dr'), projectId, date: new Date().toISOString().slice(0, 10),
      createdBy: state.currentUser.id, weather: '', temperature: '', summary: '',
      workers: 0, equipment: [], materialDeliveries: [], safetyIncidents: [],
      delays: [], notes: '', photos: [], createdAt: new Date().toISOString(), ...report,
    };
    dispatch({ type: 'ADD_DAILY_REPORT', projectId, report: r });
    if (online) addDailyReportFB(projectId, r);
  }, [online, state.currentUser]);

  const removeDailyReport = useCallback(async (projectId: string, reportId: string) => {
    dispatch({ type: 'REMOVE_DAILY_REPORT', projectId, reportId });
    if (online) removeDailyReportFB(projectId, reportId);
  }, [online]);

  /* ── Cost Items ── */

  const addCostItem = useCallback(async (projectId: string, item?: Partial<CostItem>) => {
    const c: CostItem = {
      id: nextId('cost'), projectId, category: 'Other', description: '',
      estimatedCost: 0, actualCost: 0, committedCost: 0, currency: 'USD',
      status: 'pending', vendor: '', dueDate: '', paidDate: null,
      createdBy: state.currentUser.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...item,
    };
    dispatch({ type: 'ADD_COST_ITEM', projectId, item: c });
    if (online) addCostItemFB(projectId, c);
  }, [online, state.currentUser]);

  const updateCostItem = useCallback(async (projectId: string, itemId: string, data: Partial<CostItem>) => {
    dispatch({ type: 'UPDATE_COST_ITEM', projectId, itemId, data: { ...data, updatedAt: new Date().toISOString() } });
    if (online) updateCostItemFB(projectId, itemId, { ...data, updatedAt: new Date().toISOString() });
  }, [online]);

  const removeCostItem = useCallback(async (projectId: string, itemId: string) => {
    dispatch({ type: 'REMOVE_COST_ITEM', projectId, itemId });
    if (online) removeCostItemFB(projectId, itemId);
  }, [online]);

  /* ── Material Items ── */

  const addMaterialItem = useCallback(async (projectId: string, item?: Partial<MaterialItem>) => {
    const m: MaterialItem = {
      id: nextId('mat'), projectId, name: '', category: 'Other', specification: '',
      unit: 'kg', quantityRequired: 0, quantityOrdered: 0, quantityReceived: 0, quantityUsed: 0,
      unitCost: 0, totalCost: 0, supplier: '', status: 'ordered',
      expectedDelivery: '', deliveredDate: null, notes: '', createdBy: state.currentUser.id,
      updatedAt: new Date().toISOString(), ...item,
    };
    dispatch({ type: 'ADD_MATERIAL_ITEM', projectId, item: m });
    if (online) addMaterialItemFB(projectId, m);
  }, [online, state.currentUser]);

  const updateMaterialItem = useCallback(async (projectId: string, itemId: string, data: Partial<MaterialItem>) => {
    dispatch({ type: 'UPDATE_MATERIAL_ITEM', projectId, itemId, data: { ...data, updatedAt: new Date().toISOString() } });
    if (online) updateMaterialItemFB(projectId, itemId, { ...data, updatedAt: new Date().toISOString() });
  }, [online]);

  const removeMaterialItem = useCallback(async (projectId: string, itemId: string) => {
    dispatch({ type: 'REMOVE_MATERIAL_ITEM', projectId, itemId });
    if (online) removeMaterialItemFB(projectId, itemId);
  }, [online]);

  /* ── Favorites & Auth ── */

  const toggleFavorite = useCallback((calculatorId: string, name: string) => dispatch({ type: 'TOGGLE_FAVORITE', calculatorId, name }), []);
  const pinCalculator = useCallback((calculatorId: string, name: string) => dispatch({ type: 'PIN_CALCULATOR', calculatorId, name }), []);
  const unpinCalculator = useCallback((calculatorId: string) => dispatch({ type: 'UNPIN_CALCULATOR', calculatorId }), []);
  const addHistory = useCallback((entry: CalcHistoryEntry) => dispatch({ type: 'ADD_HISTORY', entry }), []);
  const deleteHistory = useCallback((id: string) => dispatch({ type: 'DELETE_HISTORY', id }), []);
  const clearHistory = useCallback(() => dispatch({ type: 'CLEAR_HISTORY' }), []);
  const isFavorited = useCallback((calculatorId: string) => state.favorites.some(f => f.calculatorId === calculatorId), [state.favorites]);
  const isPinned = useCallback((calculatorId: string) => state.pinned.some(p => p.calculatorId === calculatorId), [state.pinned]);
  const hasProject = useCallback((projectId: string) => !!state.projects[projectId], [state.projects]);

  const loginGoogle = useCallback(async () => {
    if (!online) return;
    const user = await loginWithGoogle();
    if (user) {
      setFbUser(user);
      dispatch({ type: 'SET_USER', user: { id: user.uid, name: user.displayName || 'User', email: user.email || '', avatar: user.photoURL || '' } });
      const currentPid = state.currentProjectId || 'default';
      const existing = await getProject(currentPid);
      if (!existing && currentPid === 'default') {
        const newId = await createProject('My Project', user.uid);
        if (newId) dispatch({ type: 'SET_PROJECT', projectId: newId });
      }
    }
  }, [online, state.currentProjectId]);

  const logout = useCallback(async () => {
    if (!online) return;
    await fbLogout();
    setFbUser(null);
  }, [online]);

  const generateInviteLink = useCallback(async () => {
    if (!online) return;
    try {
      const pid2 = state.currentProjectId || 'default';
      const inviteId = await generateInvite(pid2, state.currentUser.id);
      if (inviteId) {
        setInviteLink(`${window.location.origin}/join/${inviteId}`);
      }
    } catch (e) {
      console.warn('generateInviteLink error:', e);
    }
  }, [online, state.currentProjectId, state.currentUser.id]);

  const createNewProject = useCallback(async (name: string) => {
    const uid = state.currentUser.id;
    const newId = await createProject(name, uid);
    if (newId) {
      dispatch({ type: 'SET_PROJECT', projectId: newId });
      // Add creator as owner member
      addMember(newId, { id: uid, name: state.currentUser.name, email: state.currentUser.email, role: 'owner' });
      // Refresh project list
      if (online) getUserProjects(uid).then(setFbProjects);
    }
  }, [online, state.currentUser, addMember]);

  /* Handle invite from URL */
  useEffect(() => {
    if (!online || !fbUser) return;
    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get('invite');
    if (inviteId) {
      acceptInvite(inviteId).then(result => {
        if (result) {
          dispatch({ type: 'SET_PROJECT', projectId: result.projectId });
          addMemberFB(result.projectId, {
            id: fbUser.uid, name: fbUser.displayName || state.currentUser.name,
            email: fbUser.email || state.currentUser.email, role: result.role as MemberRole,
            avatar: fbUser.photoURL || '', lastActive: new Date().toISOString(),
            assignedTasks: [], joinedAt: new Date().toISOString(),
          });
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }).catch(e => console.warn('accept invite error:', e));
    }
  }, [online, fbUser]);

  const value = useMemo<CollabContextValue>(() => ({
    state, dispatch, fbUser, isOnline: online, inviteLink, generateInviteLink,
    currentRecords, currentMembers, currentTasks, currentActivities, currentComments,
    overallProgress, todayProgress, weeklyProgress, monthlyProgress,
    completedTasks, pendingTasks, delayedTasks, categoryProgress,
    currentIssues, currentDocuments, currentChatMessages, currentNotifications,
    currentSettings, currentDailyReports, currentCostItems, currentMaterialItems,
    unreadNotifications, totalBudget, totalActualCost, totalCommitted,
    currentProjects, currentProjectName, createNewProject,
    setProject, setUser,
    addProgress, updateProgress: updateRecord, removeProgress, addPhoto,
    addMilestone, updateMilestone,
    addMember, updateMember, removeMember,
    addTask, updateTask, removeTask,
    addActivity, addComment, removeComment,
    addIssue, updateIssue, removeIssue,
    addDocument, removeDocument, uploadProjectFile,
    sendChatMessage,
    addNotification, markNotificationRead, markAllNotificationsRead,
    saveSettings,
    addDailyReport, removeDailyReport,
    addCostItem, updateCostItem, removeCostItem,
    addMaterialItem, updateMaterialItem, removeMaterialItem,
    toggleFavorite, pinCalculator, unpinCalculator,
    addHistory, deleteHistory, clearHistory,
    isFavorited, isPinned, hasProject, updateRecord,
    loginGoogle, logout,
  }), [state, currentRecords, currentMembers, currentTasks, currentActivities, currentComments,
      overallProgress, todayProgress, weeklyProgress, monthlyProgress,
      completedTasks, pendingTasks, delayedTasks, categoryProgress,
      currentIssues, currentDocuments, currentChatMessages, currentNotifications,
      currentSettings, currentDailyReports, currentCostItems, currentMaterialItems,
      unreadNotifications, totalBudget, totalActualCost, totalCommitted,
      currentProjects, currentProjectName, createNewProject,
      setProject, setUser, addProgress, removeProgress, addPhoto,
      addMilestone, updateMilestone,
      addMember, updateMember, removeMember,
      addTask, updateTask, removeTask,
      addActivity, addComment, removeComment,
      addIssue, updateIssue, removeIssue,
      addDocument, removeDocument, uploadProjectFile,
      sendChatMessage,
      addNotification, markNotificationRead, markAllNotificationsRead,
      saveSettings,
      addDailyReport, removeDailyReport,
      addCostItem, updateCostItem, removeCostItem,
      addMaterialItem, updateMaterialItem, removeMaterialItem,
      toggleFavorite, pinCalculator, unpinCalculator,
      addHistory, deleteHistory, clearHistory, isFavorited, isPinned, hasProject,
      fbUser, online, inviteLink, generateInviteLink, loginGoogle, logout,
    ]);

  return <CollabContext.Provider value={value}>{children}</CollabContext.Provider>;
}

export function useCollab(): CollabContextValue {
  const ctx = useContext(CollabContext);
  if (!ctx) throw new Error('useCollab must be used within CollaborationProvider');
  return ctx;
}