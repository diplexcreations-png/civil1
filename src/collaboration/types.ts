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

/* ── Issue Tracking ── */

export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueSeverity = 'minor' | 'major' | 'critical';

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
  category: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  attachments: string[];
  commentIds: string[];
}

/* ── Document Management ── */

export type DocType = 'drawing' | 'specification' | 'report' | 'photo' | 'contract' | 'correspondence' | 'other';

export interface Document {
  id: string;
  projectId: string;
  name: string;
  type: DocType;
  category: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  tags: string[];
  description: string;
}

/* ── Real-time Chat ── */

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  attachments: string[];
  replyTo: string | null;
  editedAt: string | null;
}

/* ── Notifications ── */

export type NotificationType = 'mention' | 'task_assigned' | 'issue_updated' | 'new_document' | 'new_member' | 'progress_update' | 'comment' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  projectId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

/* ── Project Settings ── */

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed';

export interface ProjectSettings {
  projectId: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  targetEndDate: string;
  status: ProjectStatus;
  budget: number;
  currency: string;
  ownerId: string;
  defaultRole: MemberRole;
  logo: string;
  tags: string[];
  updatedAt: string;
}

/* ── Daily Reports ── */

export interface DailyReport {
  id: string;
  projectId: string;
  date: string;
  createdBy: string;
  weather: string;
  temperature: string;
  summary: string;
  workers: number;
  equipment: string[];
  materialDeliveries: string[];
  safetyIncidents: string[];
  delays: string[];
  notes: string;
  photos: string[];
  createdAt: string;
}

/* ── Cost Tracking ── */

export type CostStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface CostItem {
  id: string;
  projectId: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  committedCost: number;
  currency: string;
  status: CostStatus;
  vendor: string;
  dueDate: string;
  paidDate: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/* ── Material Tracking ── */

export type MaterialStatus = 'ordered' | 'partial' | 'delivered' | 'installed';

export interface MaterialItem {
  id: string;
  projectId: string;
  name: string;
  category: string;
  specification: string;
  unit: string;
  quantityRequired: number;
  quantityOrdered: number;
  quantityReceived: number;
  quantityUsed: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  status: MaterialStatus;
  expectedDelivery: string;
  deliveredDate: string | null;
  notes: string;
  createdBy: string;
  updatedAt: string;
}

/* ── Full State ── */

export interface CollaborationState {
  projects: Record<string, ProjectProgress>;
  members: Record<string, ProjectMember[]>;
  tasks: Record<string, Task[]>;
  activities: Record<string, ActivityLog[]>;
  comments: Record<string, Comment[]>;
  issues: Record<string, Issue[]>;
  documents: Record<string, Document[]>;
  chatMessages: Record<string, ChatMessage[]>;
  notifications: AppNotification[];
  settings: Record<string, ProjectSettings>;
  dailyReports: Record<string, DailyReport[]>;
  costItems: Record<string, CostItem[]>;
  materialItems: Record<string, MaterialItem[]>;
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
    issues: {},
    documents: {},
    chatMessages: {},
    notifications: [],
    settings: {},
    dailyReports: {},
    costItems: {},
    materialItems: {},
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

export const ISSUE_CATEGORIES = ['Structural', 'Architectural', 'MEP', 'Safety', 'Quality', 'Design', 'Material', 'Other'];

export const DOCUMENT_CATEGORIES = ['Structural', 'Architectural', 'MEP', 'Civil', 'Contracts', 'Reports', 'Photos', 'Other'];

export const COST_CATEGORIES = ['Materials', 'Labor', 'Equipment', 'Subcontractor', 'Permits', 'Overhead', 'Contingency', 'Other'];

export const MATERIAL_CATEGORIES = ['Cement', 'Steel', 'Aggregate', 'Sand', 'Bricks', 'Timber', 'MEP', 'Finishing', 'Other'];

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Open', 'in-progress': 'In Progress', resolved: 'Resolved', closed: 'Closed',
};

export const ISSUE_PRIORITY_LABELS: Record<IssuePriority, string> = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
};

export const ISSUE_SEVERITY_LABELS: Record<IssueSeverity, string> = {
  minor: 'Minor', major: 'Major', critical: 'Critical',
};

export const COST_STATUS_LABELS: Record<CostStatus, string> = {
  pending: 'Pending', approved: 'Approved', rejected: 'Rejected', paid: 'Paid',
};

export const MATERIAL_STATUS_LABELS: Record<MaterialStatus, string> = {
  ordered: 'Ordered', partial: 'Partial', delivered: 'Delivered', installed: 'Installed',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning', active: 'Active', 'on-hold': 'On Hold', completed: 'Completed',
};
