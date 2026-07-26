export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  avatar: string;
  lastActive: string;
  assignedTasks: string[];
  joinedAt: string;
}

export type MemberRole =
  | 'owner'
  | 'engineer'
  | 'qs'
  | 'supervisor'
  | 'foreman'
  | 'client'
  | 'viewer';

export const ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'Project Owner',
  engineer: 'Engineer',
  qs: 'Quantity Surveyor',
  supervisor: 'Site Supervisor',
  foreman: 'Foreman',
  client: 'Client',
  viewer: 'Viewer',
};

export const ROLE_PERMISSIONS: Record<MemberRole, string[]> = {
  owner: ['full'],
  engineer: ['edit_technical', 'view_boq', 'view_progress', 'edit_tasks'],
  qs: ['edit_boq', 'view_technical', 'view_progress', 'edit_quantities'],
  supervisor: ['edit_progress', 'view_boq', 'view_technical', 'upload_photos'],
  foreman: ['edit_progress', 'view_tasks'],
  client: ['view_progress', 'view_boq', 'view_reports'],
  viewer: ['view_progress'],
};

export type WorkCategory =
  | 'Site Clearing' | 'Excavation' | 'PCC' | 'Foundation'
  | 'Footings' | 'Columns' | 'Beams' | 'Slabs' | 'Brickwork'
  | 'Roof' | 'Plaster' | 'Floor Finish' | 'Painting'
  | 'External Works' | 'Drainage' | 'Water Supply'
  | 'Electrical' | 'Other';

export type ProgressStatus = 'pending' | 'in-progress' | 'completed' | 'delayed';

export interface ProgressRecord {
  id: string;
  projectId: string;
  date: string;
  category: WorkCategory;
  description: string;
  plannedQty: number;
  completedQty: number;
  unit: string;
  status: ProgressStatus;
  engineerNotes: string;
  photos: ProgressPhoto[];
  createdBy: string;
  createdAt: string;
}

export interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  description: string;
  category: string;
  uploadedBy: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  dueDate: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  category: string;
  createdBy: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  text: string;
  mentions: string[];
  attachments: string[];
  parentId: string | null;
  createdAt: string;
}

export interface FavoritedCalculator {
  calculatorId: string;
  name: string;
  addedAt: string;
}

export interface PinnedCalculator {
  calculatorId: string;
  name: string;
  order: number;
}

export interface CalcHistoryEntry {
  id: string;
  calculatorId: string;
  calculatorName: string;
  date: string;
  inputs: Record<string, number | string>;
  outputs: Record<string, number | string>;
  projectName: string;
  category: string;
}

export interface ProjectProgress {
  projectId: string;
  records: ProgressRecord[];
  startDate: string;
  targetEndDate: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  category: WorkCategory;
  status: ProgressStatus;
  completedDate: string | null;
}

export interface CollaborationState {
  projects: Record<string, ProjectProgress>;
  members: Record<string, ProjectMember[]>;
  tasks: Record<string, Task[]>;
  activities: Record<string, ActivityLog[]>;
  comments: Record<string, Comment[]>;
  favorites: FavoritedCalculator[];
  pinned: PinnedCalculator[];
  history: CalcHistoryEntry[];
  currentProjectId: string | null;
  currentUser: ProjectMember;
}

export function defaultCurrentUser(): ProjectMember {
  return {
    id: 'user-1',
    name: 'Engineer',
    email: 'engineer@civilmath.com',
    role: 'owner',
    avatar: '',
    lastActive: new Date().toISOString(),
    assignedTasks: [],
    joinedAt: new Date().toISOString(),
  };
}

export function defaultCollaborationState(): CollaborationState {
  return {
    projects: {},
    members: {},
    tasks: {},
    activities: {},
    comments: {},
    favorites: [],
    pinned: [],
    history: [],
    currentProjectId: null,
    currentUser: defaultCurrentUser(),
  };
}

export const WORK_CATEGORIES: WorkCategory[] = [
  'Site Clearing', 'Excavation', 'PCC', 'Foundation',
  'Footings', 'Columns', 'Beams', 'Slabs', 'Brickwork',
  'Roof', 'Plaster', 'Floor Finish', 'Painting',
  'External Works', 'Drainage', 'Water Supply', 'Electrical', 'Other',
];
