import React, { createContext, useContext, useReducer, useCallback, useMemo, useState, useEffect, type ReactNode } from 'react';
import {
  CollaborationState, ProgressRecord, ProjectMember, Task, Comment,
  ActivityLog, FavoritedCalculator, PinnedCalculator, CalcHistoryEntry,
  Milestone, ProgressPhoto, MemberRole, WorkCategory, ProgressStatus,
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
  createProject, getProject,
} from '../firebase/firestore';
import { generateInvite, acceptInvite } from '../firebase/invite';

const STORAGE_KEY = 'civilmath_collab';

type CollabAction =
  | { type: 'SET_PROJECT'; projectId: string }
  | { type: 'SET_USER'; user: Partial<ProjectMember> }
  | { type: 'ADD_PROGRESS'; projectId: string; record: ProgressRecord }
  | { type: 'UPDATE_PROGRESS'; projectId: string; recordId: string; data: Partial<ProgressRecord> }
  | { type: 'REMOVE_PROGRESS'; projectId: string; recordId: string }
  | { type: 'ADD_PHOTO'; projectId: string; recordId: string; photo: ProgressPhoto }
  | { type: 'ADD_MILESTONE'; projectId: string; milestone: Milestone }
  | { type: 'UPDATE_MILESTONE'; projectId: string; milestoneId: string; data: Partial<Milestone> }
  | { type: 'ADD_MEMBER'; projectId: string; member: ProjectMember }
  | { type: 'UPDATE_MEMBER'; projectId: string; memberId: string; data: Partial<ProjectMember> }
  | { type: 'REMOVE_MEMBER'; projectId: string; memberId: string }
  | { type: 'ADD_TASK'; projectId: string; task: Task }
  | { type: 'UPDATE_TASK'; projectId: string; taskId: string; data: Partial<Task> }
  | { type: 'REMOVE_TASK'; projectId: string; taskId: string }
  | { type: 'ADD_ACTIVITY'; projectId: string; activity: ActivityLog }
  | { type: 'ADD_COMMENT'; projectId: string; comment: Comment }
  | { type: 'REMOVE_COMMENT'; projectId: string; commentId: string }
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

    case 'ADD_PROGRESS': {
      const records = state.projects[action.projectId]?.records || [];
      return {
        ...state,
        projects: {
          ...state.projects,
          [action.projectId]: { ...state.projects[action.projectId], records: [...records, action.record] },
        },
      };
    }
    case 'UPDATE_PROGRESS': {
      const p = state.projects[action.projectId];
      if (!p) return state;
      return {
        ...state,
        projects: {
          ...state.projects,
          [action.projectId]: { ...p, records: p.records.map(r => r.id === action.recordId ? { ...r, ...action.data } : r) },
        },
      };
    }
    case 'REMOVE_PROGRESS': {
      const p = state.projects[action.projectId];
      if (!p) return state;
      return {
        ...state,
        projects: {
          ...state.projects,
          [action.projectId]: { ...p, records: p.records.filter(r => r.id !== action.recordId) },
        },
      };
    }
    case 'ADD_PHOTO': {
      const p = state.projects[action.projectId];
      if (!p) return state;
      return {
        ...state,
        projects: {
          ...state.projects,
          [action.projectId]: {
            ...p,
            records: p.records.map(r => r.id === action.recordId ? { ...r, photos: [...r.photos, action.photo] } : r),
          },
        },
      };
    }
    case 'ADD_MILESTONE': {
      const p = state.projects[action.projectId];
      const milestones = p?.milestones || [];
      return {
        ...state,
        projects: {
          ...state.projects,
          [action.projectId]: { ...p, milestones: [...milestones, action.milestone] },
        },
      };
    }
    case 'UPDATE_MILESTONE': {
      const p = state.projects[action.projectId];
      if (!p) return state;
      return {
        ...state,
        projects: {
          ...state.projects,
          [action.projectId]: { ...p, milestones: p.milestones.map(m => m.id === action.milestoneId ? { ...m, ...action.data } : m) },
        },
      };
    }

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

    case 'TOGGLE_FAVORITE': {
      const exists = state.favorites.find(f => f.calculatorId === action.calculatorId);
      if (exists) return { ...state, favorites: state.favorites.filter(f => f.calculatorId !== action.calculatorId) };
      return { ...state, favorites: [...state.favorites, { calculatorId: action.calculatorId, name: action.name, addedAt: new Date().toISOString() }] };
    }
    case 'REMOVE_FAVORITE':
      return { ...state, favorites: state.favorites.filter(f => f.calculatorId !== action.calculatorId) };
    case 'PIN_CALCULATOR': {
      const exists = state.pinned.find(p => p.calculatorId === action.calculatorId);
      if (exists) return state;
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

/* ── Context interface ── */

interface CollabContextValue {
  state: CollaborationState;
  dispatch: React.Dispatch<CollabAction>;
  fbUser: any;
  isOnline: boolean;
  inviteLink: string | null;
  generateInviteLink: () => Promise<void>;

  // Computed
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

  // Actions
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
  toggleFavorite: (calculatorId: string, name: string) => void;
  pinCalculator: (calculatorId: string, name: string) => void;
  unpinCalculator: (calculatorId: string) => void;
  addHistory: (entry: CalcHistoryEntry) => void;
  deleteHistory: (id: string) => void;
  clearHistory: () => void;
  isFavorited: (calculatorId: string) => boolean;
  isPinned: (calculatorId: string) => boolean;
  hasProject: (projectId: string) => boolean;
  updateRecord: (projectId: string, recordId: string, data: Partial<ProgressRecord>) => void;
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

  // Firebase state mirrors for real-time data
  const [fbMembers, setFbMembers] = useState<ProjectMember[]>([]);
  const [fbTasks, setFbTasks] = useState<Task[]>([]);
  const [fbActivities, setFbActivities] = useState<ActivityLog[]>([]);
  const [fbComments, setFbComments] = useState<Comment[]>([]);
  const [fbRecords, setFbRecords] = useState<ProgressRecord[]>([]);

  // Auth listener + redirect result check
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

  // Real-time listeners for current project
  useEffect(() => {
    if (!online) return;
    const pid = state.currentProjectId || 'default';
    const unsubs: (() => void)[] = [];

    unsubs.push(onMembersChange(pid, setFbMembers));
    unsubs.push(onTasksChange(pid, setFbTasks));
    unsubs.push(onActivitiesChange(pid, setFbActivities));
    unsubs.push(onCommentsChange(pid, setFbComments));
    unsubs.push(onRecordsChange(pid, setFbRecords));

    return () => unsubs.forEach(u => u());
  }, [online, state.currentProjectId]);

  // Persist local-only state (favorites, history)
  useEffect(() => { persist(state); }, [state]);

  const pid = state.currentProjectId || 'default';

  // Use Firebase data if online, else fall back to reducer state
  const currentRecords = online ? fbRecords : (state.projects[pid]?.records || []);
  const currentMembers = online ? fbMembers : (state.members[pid] || []);
  const currentTasks = online ? fbTasks : (state.tasks[pid] || []);
  const currentActivities = online ? fbActivities : (state.activities[pid] || []);
  const currentComments = online ? fbComments : (state.comments[pid] || []);

  const overallProgress = useMemo(() => {
    if (currentRecords.length === 0) return 0;
    const totalPlanned = currentRecords.reduce((s, r) => s + r.plannedQty, 0);
    const totalCompleted = currentRecords.reduce((s, r) => s + r.completedQty, 0);
    return totalPlanned > 0 ? Math.min(100, Math.round((totalCompleted / totalPlanned) * 100)) : 0;
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
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const week = currentRecords.filter(r => r.date >= weekAgo);
    const tp = week.reduce((s, r) => s + r.plannedQty, 0);
    const tc = week.reduce((s, r) => s + r.completedQty, 0);
    return tp > 0 ? Math.round((tc / tp) * 100) : 0;
  }, [currentRecords]);

  const monthlyProgress = useMemo(() => {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
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

  const setProject = useCallback((id: string) => dispatch({ type: 'SET_PROJECT', projectId: id }), []);

  const setUser = useCallback((user: Partial<ProjectMember>) => {
    dispatch({ type: 'SET_USER', user });
  }, []);

  const updateRecord = useCallback((projectId: string, recordId: string, data: Partial<ProgressRecord>) => {
    if (online) {
      updateRecordFB(projectId, recordId, data);
      const act: ActivityLog = { id: nextId('act'), projectId, userId: state.currentUser.id, userName: state.currentUser.name, action: 'updated progress', details: `Updated record ${recordId}`, timestamp: new Date().toISOString() };
      addActivityFB(projectId, act);
    } else {
      dispatch({ type: 'UPDATE_PROGRESS', projectId, recordId, data });
      dispatch({ type: 'ADD_ACTIVITY', projectId, activity: { id: nextId('act'), projectId, userId: state.currentUser.id, userName: state.currentUser.name, action: 'updated progress', details: `Updated record ${recordId}`, timestamp: new Date().toISOString() } });
    }
  }, [online, state.currentUser]);

  const addProgress = useCallback((projectId: string, record?: Partial<ProgressRecord>) => {
    const r: ProgressRecord = {
      id: nextId('prg'), projectId, date: new Date().toISOString().slice(0, 10),
      category: 'Other', description: '', plannedQty: 0, completedQty: 0, unit: 'm³',
      status: 'pending', engineerNotes: '', photos: [], createdBy: state.currentUser.id,
      createdAt: new Date().toISOString(), ...record,
    };
    if (online) {
      addRecordFB(projectId, r);
      const act: ActivityLog = { id: nextId('act'), projectId, userId: state.currentUser.id, userName: state.currentUser.name, action: 'added progress', details: `New ${r.category} record`, timestamp: new Date().toISOString() };
      addActivityFB(projectId, act);
    } else {
      dispatch({ type: 'ADD_PROGRESS', projectId, record: r });
      dispatch({ type: 'ADD_ACTIVITY', projectId, activity: { id: nextId('act'), projectId, userId: state.currentUser.id, userName: state.currentUser.name, action: 'added progress', details: `New ${r.category} record`, timestamp: new Date().toISOString() } });
    }
  }, [online, state.currentUser]);

  const removeProgress = useCallback((projectId: string, recordId: string) => {
    if (online) {
      removeRecordFB(projectId, recordId);
    } else {
      dispatch({ type: 'REMOVE_PROGRESS', projectId, recordId });
    }
  }, [online]);

  const addPhoto = useCallback((projectId: string, recordId: string, photo: ProgressPhoto) => {
    dispatch({ type: 'ADD_PHOTO', projectId, recordId, photo });
  }, []);

  const addMilestone = useCallback((projectId: string, name: string, category: WorkCategory) => {
    const m: Milestone = { id: nextId('ms'), name, category, status: 'pending', completedDate: null };
    dispatch({ type: 'ADD_MILESTONE', projectId, milestone: m });
  }, []);

  const updateMilestone = useCallback((projectId: string, milestoneId: string, data: Partial<Milestone>) => {
    dispatch({ type: 'UPDATE_MILESTONE', projectId, milestoneId, data });
  }, []);

  const addMember = useCallback((projectId: string, member?: Partial<ProjectMember>) => {
    const m: ProjectMember = {
      id: nextId('mem'), name: '', email: '', role: 'viewer', avatar: '',
      lastActive: new Date().toISOString(), assignedTasks: [], joinedAt: new Date().toISOString(), ...member,
    };
    if (online) {
      addMemberFB(projectId, m);
    } else {
      dispatch({ type: 'ADD_MEMBER', projectId, member: m });
    }
  }, [online]);

  const updateMember = useCallback((projectId: string, memberId: string, data: Partial<ProjectMember>) => {
    if (online) {
      updateMemberFB(projectId, memberId, data);
    } else {
      dispatch({ type: 'UPDATE_MEMBER', projectId, memberId, data });
    }
  }, [online]);

  const removeMember = useCallback((projectId: string, memberId: string) => {
    if (online) {
      removeMemberFB(projectId, memberId);
    } else {
      dispatch({ type: 'REMOVE_MEMBER', projectId, memberId });
    }
  }, [online]);

  const addTask = useCallback((projectId: string, task?: Partial<Task>) => {
    const t: Task = {
      id: nextId('task'), projectId, title: '', description: '', priority: 'medium',
      assignedTo: '', dueDate: '', status: 'todo', category: '', createdBy: state.currentUser.id,
      createdAt: new Date().toISOString(), ...task,
    };
    if (online) {
      addTaskFB(projectId, t);
    } else {
      dispatch({ type: 'ADD_TASK', projectId, task: t });
    }
  }, [online, state.currentUser]);

  const updateTask2 = useCallback((projectId: string, taskId: string, data: Partial<Task>) => {
    if (online) {
      updateTaskFB(projectId, taskId, data);
    } else {
      dispatch({ type: 'UPDATE_TASK', projectId, taskId, data });
    }
  }, [online]);

  const removeTask = useCallback((projectId: string, taskId: string) => {
    if (online) {
      removeTaskFB(projectId, taskId);
    } else {
      dispatch({ type: 'REMOVE_TASK', projectId, taskId });
    }
  }, [online]);

  const addActivity = useCallback((projectId: string, action: string, details: string) => {
    const a: ActivityLog = { id: nextId('act'), projectId, userId: state.currentUser.id, userName: state.currentUser.name, action, details, timestamp: new Date().toISOString() };
    if (online) {
      addActivityFB(projectId, a);
    } else {
      dispatch({ type: 'ADD_ACTIVITY', projectId, activity: a });
    }
  }, [online, state.currentUser]);

  const addComment = useCallback((projectId: string, text: string, parentId?: string) => {
    const c: Comment = { id: nextId('cmt'), projectId, userId: state.currentUser.id, userName: state.currentUser.name, text, mentions: [], attachments: [], parentId: parentId || null, createdAt: new Date().toISOString() };
    if (online) {
      addCommentFB(projectId, c);
    } else {
      dispatch({ type: 'ADD_COMMENT', projectId, comment: c });
    }
  }, [online, state.currentUser]);

  const removeComment = useCallback((projectId: string, commentId: string) => {
    if (online) {
      removeCommentFB(projectId, commentId);
    } else {
      dispatch({ type: 'REMOVE_COMMENT', projectId, commentId });
    }
  }, [online]);

  const toggleFavorite = useCallback((calculatorId: string, name: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', calculatorId, name });
  }, []);

  const pinCalculator = useCallback((calculatorId: string, name: string) => {
    dispatch({ type: 'PIN_CALCULATOR', calculatorId, name });
  }, []);

  const unpinCalculator = useCallback((calculatorId: string) => {
    dispatch({ type: 'UNPIN_CALCULATOR', calculatorId });
  }, []);

  const addHistory = useCallback((entry: CalcHistoryEntry) => {
    dispatch({ type: 'ADD_HISTORY', entry });
  }, []);

  const deleteHistory = useCallback((id: string) => {
    dispatch({ type: 'DELETE_HISTORY', id });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  const isFavorited = useCallback((calculatorId: string) => {
    return state.favorites.some(f => f.calculatorId === calculatorId);
  }, [state.favorites]);

  const isPinned = useCallback((calculatorId: string) => {
    return state.pinned.some(p => p.calculatorId === calculatorId);
  }, [state.pinned]);

  const hasProject = useCallback((projectId: string) => {
    return !!state.projects[projectId];
  }, [state.projects]);

  const loginGoogle = useCallback(async () => {
    if (!online) return;
    const user = await loginWithGoogle();
    if (user) {
      setFbUser(user);
      dispatch({ type: 'SET_USER', user: { id: user.uid, name: user.displayName || 'User', email: user.email || '', avatar: user.photoURL || '' } });
      // Try to create/find project
      const currentPid = state.currentProjectId || 'default';
      const existing = await getProject(currentPid);
      if (!existing && currentPid === 'default') {
        const newId = await createProject('My Project', user.uid);
        dispatch({ type: 'SET_PROJECT', projectId: newId });
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
    const pid = state.currentProjectId || 'default';
    const inviteId = await generateInvite(pid, state.currentUser.id);
    if (inviteId) {
      const base = window.location.origin + window.location.pathname;
      setInviteLink(`${base}?invite=${inviteId}`);
    }
  }, [online, state.currentProjectId, state.currentUser.id]);

  // Handle invite from URL
  useEffect(() => {
    if (!online || !fbUser) return;
    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get('invite');
    if (inviteId) {
      acceptInvite(inviteId).then(result => {
        if (result) {
          dispatch({ type: 'SET_PROJECT', projectId: result.projectId });
          const newMember: ProjectMember = {
            id: fbUser.uid, name: fbUser.displayName || state.currentUser.name,
            email: fbUser.email || state.currentUser.email, role: result.role as MemberRole,
            avatar: fbUser.photoURL || '', lastActive: new Date().toISOString(),
            assignedTasks: [], joinedAt: new Date().toISOString(),
          };
          addMemberFB(result.projectId, newMember);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, [online, fbUser]);

  const value = useMemo<CollabContextValue>(() => ({
    state, dispatch, fbUser, isOnline: online, inviteLink, generateInviteLink,
    currentRecords, currentMembers, currentTasks, currentActivities, currentComments,
    overallProgress, todayProgress, weeklyProgress, monthlyProgress,
    completedTasks, pendingTasks, delayedTasks, categoryProgress,
    setProject, setUser,
    addProgress, updateProgress: updateRecord, removeProgress, addPhoto,
    addMilestone, updateMilestone,
    addMember, updateMember, removeMember,
    addTask, updateTask: updateTask2, removeTask,
    addActivity, addComment, removeComment,
    toggleFavorite, pinCalculator, unpinCalculator,
    addHistory, deleteHistory, clearHistory,
    isFavorited, isPinned, hasProject, updateRecord,
    loginGoogle, logout,
  }), [state, currentRecords, currentMembers, currentTasks, currentActivities, currentComments,
      overallProgress, todayProgress, weeklyProgress, monthlyProgress,
      completedTasks, pendingTasks, delayedTasks, categoryProgress,
      setProject, setUser, addProgress, removeProgress, addPhoto,
      addMilestone, updateMilestone,
      addMember, updateMember, removeMember,
      addTask, updateTask2, removeTask,
      addActivity, addComment, removeComment,
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
