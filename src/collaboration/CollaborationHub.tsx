import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, BarChart3, AlertTriangle, FileText, Package,
  DollarSign, ClipboardList, Users, MessageSquare, Star, Settings,
  ListChecks, HardHat, Globe, LogOut, Bell, Menu, X, ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { CollaborationProvider, useCollab } from './CollaborationContext';
import { cls } from './modules/shared';
import OverviewPanel from './modules/OverviewPanel';
import IssuesPanel from './modules/IssuesPanel';
import DocumentsPanel from './modules/DocumentsPanel';
import ChatPanel from './modules/ChatPanel';
import SettingsPanel from './modules/SettingsPanel';
import DailyReportsPanel from './modules/DailyReportsPanel';
import CostTrackerPanel from './modules/CostTrackerPanel';
import MaterialTrackerPanel from './modules/MaterialTrackerPanel';

/* ── Module definitions ── */
const MODULES = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: '#2563EB' },
  { id: 'progress', label: 'Progress', icon: BarChart3, color: '#10B981' },
  { id: 'tasks', label: 'Tasks', icon: ListChecks, color: '#0891B2' },
  { id: 'issues', label: 'Issues', icon: AlertTriangle, color: '#EF4444' },
  { id: 'documents', label: 'Documents', icon: FileText, color: '#D97706' },
  { id: 'materials', label: 'Materials', icon: Package, color: '#7C3AED' },
  { id: 'costs', label: 'Costs', icon: DollarSign, color: '#059669' },
  { id: 'daily-reports', label: 'Daily Reports', icon: ClipboardList, color: '#2563EB' },
  { id: 'team', label: 'Team', icon: Users, color: '#0891B2' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, color: '#10B981' },
  { id: 'favorites', label: 'Favorites', icon: Star, color: '#F59E0B' },
  { id: 'settings', label: 'Settings', icon: Settings, color: '#64748B' },
] as const;

type ModuleId = typeof MODULES[number]['id'];

/* ── Existing sub-components (simplified) ── */

function formatNum(n: number, d = 2): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
}

function ProgressBar({ value, size = 'md', color = '#2563EB' }: { value: number; size?: 'sm' | 'md'; color?: string }) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div className={cls("w-full bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden", h)}>
      <div className={cls("rounded-full transition-all duration-500", h)} style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }} />
    </div>
  );
}

function CircularProgress({ value, size = 48 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2563EB" strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        className="fill-[#0F172A] dark:fill-white text-[7px] font-bold">{value}%</text>
    </svg>
  );
}

/* ── Progress Section (existing, adapted) ── */
function ProgressSection() {
  const { state, currentRecords, overallProgress, todayProgress, weeklyProgress, monthlyProgress,
    completedTasks, pendingTasks, delayedTasks, categoryProgress, addProgress, updateProgress, removeProgress } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Excavation');
  const [newPlanned, setNewPlanned] = useState('10');
  const [newCompleted, setNewCompleted] = useState('0');
  const [newUnit, setNewUnit] = useState('m³');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = currentRecords.filter(r => {
    if (filterCat && r.category !== filterCat) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const handleAdd = () => {
    if (!newDesc) return;
    addProgress(pid, { description: newDesc, category: newCategory as any, plannedQty: Number(newPlanned), completedQty: Number(newCompleted), unit: newUnit, status: Number(newCompleted) >= Number(newPlanned) ? 'completed' : 'in-progress' });
    setNewDesc(''); setNewCompleted('0');
  };

  const statusColor: Record<string, string> = { pending: '#F59E0B', 'in-progress': '#2563EB', completed: '#10B981', delayed: '#EF4444' };
  const WORK_CATEGORIES = ['Site Clearing', 'Excavation', 'PCC', 'Foundation', 'Footings', 'Columns', 'Beams', 'Slabs', 'Brickwork', 'Roof', 'Plaster', 'Floor Finish', 'Painting', 'External Works', 'Drainage', 'Water Supply', 'Electrical', 'Other'];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Overall', val: `${overallProgress}%`, icon: BarChart3, color: '#2563EB', detail: `${currentRecords.length} records` },
          { label: 'Today', val: `${todayProgress}%`, icon: BarChart3, color: '#10B981', detail: 'Today' },
          { label: 'Weekly', val: `${weeklyProgress}%`, icon: BarChart3, color: '#059669', detail: '7 days' },
          { label: 'Monthly', val: `${monthlyProgress}%`, icon: BarChart3, color: '#D97706', detail: '30 days' },
          { label: 'Done', val: String(completedTasks), icon: ListChecks, color: '#10B981' },
          { label: 'Pending', val: String(pendingTasks), icon: ListChecks, color: '#F59E0B' },
          { label: 'Delayed', val: String(delayedTasks), icon: ListChecks, color: '#EF4444' },
          { label: 'Records', val: String(currentRecords.length), icon: FileText, color: '#7C3AED' },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <c.icon className="w-4 h-4" style={{ color: c.color }} />
              <span className="text-lg font-extrabold text-[#0F172A] dark:text-white">{c.val}</span>
            </div>
            <div className="text-[10px] font-semibold text-[#64748B] uppercase">{c.label}</div>
            {c.detail && <div className="text-[9px] text-[#94A3B8]">{c.detail}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
          <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">Add Progress Record</h3>
          <div className="space-y-2">
            <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description"
              className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
            <div className="grid grid-cols-2 gap-2">
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-2 text-xs outline-none">
                {WORK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={newUnit} onChange={e => setNewUnit(e.target.value)}
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-2 text-xs outline-none">
                {['m³','m²','m','kg','nos','days'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={newPlanned} onChange={e => setNewPlanned(e.target.value)} placeholder="Planned"
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-2 text-xs outline-none focus:border-[#2563EB]" />
              <input type="number" value={newCompleted} onChange={e => setNewCompleted(e.target.value)} placeholder="Done"
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-2 text-xs outline-none focus:border-[#2563EB]" />
            </div>
            <button onClick={handleAdd}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
              <BarChart3 className="w-3.5 h-3.5" /> Add Record
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
          <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">Project Completion</h3>
          <div className="flex flex-col items-center py-4">
            <CircularProgress value={overallProgress} size={96} />
            <div className="text-[10px] text-[#64748B] mt-2">{currentRecords.length} records</div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
          <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">Construction Timeline</h3>
          <div className="space-y-2">
            {['Excavation', 'Foundation', 'Columns', 'Beams', 'Slabs', 'Brickwork', 'Finishing'].map((name, i) => {
              const pct = categoryProgress[name] || 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className="font-medium text-[#0F172A] dark:text-white">{name}</span>
                    <span className={cls("font-bold", pct >= 100 ? 'text-[#10B981]' : pct > 0 ? 'text-[#2563EB]' : 'text-[#94A3B8]')}>
                      {pct >= 100 ? '✓' : `${pct}%`}
                    </span>
                  </div>
                  <ProgressBar value={pct} size="sm" color={pct >= 100 ? '#10B981' : '#2563EB'} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Records table */}
      <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
        <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">Progress Records</h3>
        <div className="flex items-center gap-2 mb-3">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
            <option value="">All Categories</option>
            {WORK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] font-semibold">
                <th className="px-2 py-1.5 text-left">Date</th>
                <th className="px-2 py-1.5 text-left">Category</th>
                <th className="px-2 py-1.5 text-left">Description</th>
                <th className="px-2 py-1.5 text-right">Planned</th>
                <th className="px-2 py-1.5 text-right">Done</th>
                <th className="px-2 py-1.5 text-right">%</th>
                <th className="px-2 py-1.5 text-left">Status</th>
                <th className="px-2 py-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const pct = r.plannedQty > 0 ? Math.round((r.completedQty / r.plannedQty) * 100) : 0;
                return (
                  <tr key={r.id} className="border-b border-[#E2E8F0] dark:border-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#080d19]">
                    <td className="px-2 py-1.5 text-[#0F172A] dark:text-white">{r.date}</td>
                    <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8]">{r.category}</span></td>
                    <td className="px-2 py-1.5 text-[#0F172A] dark:text-white max-w-[200px] truncate">{r.description}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{formatNum(r.plannedQty)}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{formatNum(r.completedQty)}</td>
                    <td className="px-2 py-1.5 text-right font-mono font-bold" style={{ color: statusColor[r.status] }}>{pct}%</td>
                    <td className="px-2 py-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold" style={{ backgroundColor: `${statusColor[r.status]}20`, color: statusColor[r.status] }}>{r.status}</span>
                    </td>
                    <td className="px-2 py-1.5">
                      <button onClick={() => removeProgress(pid, r.id)} className="p-1 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-2 py-8 text-center text-[#94A3B8]">No records</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Team Section (existing, simplified) ── */
function TeamSection() {
  const { state, currentMembers, currentTasks, currentActivities, currentComments,
    addMember, updateMember, removeMember, addTask, updateTask, removeTask,
    addComment, removeComment, addActivity, isOnline, fbUser, inviteLink,
    generateInviteLink, loginGoogle, logout } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'tasks' | 'activity' | 'comments'>('tasks');

  const handleAddTask = () => {
    if (!newTaskTitle) return;
    addTask(pid, { title: newTaskTitle, assignedTo: newTaskAssignee || state.currentUser.id, priority: newTaskPriority, status: 'todo' });
    addActivity(pid, 'created task', `New task: ${newTaskTitle}`);
    setNewTaskTitle('');
  };

  const handleAddComment = () => {
    if (!newComment) return;
    addComment(pid, newComment);
    addActivity(pid, 'commented', 'Added comment');
    setNewComment('');
  };

  const roleColors: Record<string, string> = { owner: '#2563EB', engineer: '#059669', qs: '#D97706', supervisor: '#7C3AED', foreman: '#DC2626', client: '#0891B2', viewer: '#64748B' };
  const ROLE_LABELS: Record<string, string> = { owner: 'Owner', engineer: 'Engineer', qs: 'QS', supervisor: 'Supervisor', foreman: 'Foreman', client: 'Client', viewer: 'Viewer' };

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: ListChecks, count: currentTasks.length },
    { id: 'members', label: 'Team', icon: Users, count: currentMembers.length },
    { id: 'activity', label: 'Activity', icon: BarChart3, count: currentActivities.length },
    { id: 'comments', label: 'Chat', icon: MessageSquare, count: currentComments.length },
  ];

  return (
    <div>
      <div className="flex items-center gap-1 mb-4 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)}
            className={cls("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
              activeTab === t.id ? 'bg-white dark:bg-[#0D1527] text-[#2563EB] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
            )}>
            <t.icon className="w-3.5 h-3.5" /> {t.label} {t.count > 0 && <span className="text-[9px] text-[#94A3B8]">({t.count})</span>}
          </button>
        ))}
      </div>

      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            {['todo', 'in-progress', 'completed', 'blocked'].map(status => {
              const tasks = currentTasks.filter(t => t.status === status);
              if (tasks.length === 0) return null;
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status === 'todo' ? '#94A3B8' : status === 'in-progress' ? '#2563EB' : status === 'completed' ? '#10B981' : '#EF4444' }} />
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">{status}</span>
                    <span className="text-[10px] text-[#94A3B8]">({tasks.length})</span>
                  </div>
                  {tasks.map(t => (
                    <div key={t.id} className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg p-2.5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <div className={cls("w-1.5 h-1.5 rounded-full shrink-0", t.priority === 'critical' ? 'bg-red-500' : t.priority === 'high' ? 'bg-orange-500' : t.priority === 'medium' ? 'bg-yellow-500' : 'bg-slate-400')} />
                            <span className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">{t.title}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {['todo', 'in-progress', 'completed', 'blocked'].filter(s => s !== status).map(s => (
                            <button key={s} onClick={() => updateTask(pid, t.id, { status: s as any })}
                              className="p-1 rounded hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] cursor-pointer" title={s}>
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </button>
                          ))}
                          <button onClick={() => removeTask(pid, t.id)} className="p-1 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
            <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">New Task</h3>
            <div className="space-y-2">
              <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Task title"
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
              <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as any)}
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
              <select value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none">
                <option value="">Assign...</option>
                {currentMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <button onClick={handleAddTask}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
                <ListChecks className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            {currentMembers.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-xs font-bold">{m.name.charAt(0)}</div>
                  <div>
                    <div className="text-xs font-semibold text-[#0F172A] dark:text-white">{m.name}</div>
                    <div className="text-[10px] text-[#64748B]">{m.email}</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: `${roleColors[m.role]}20`, color: roleColors[m.role] }}>{ROLE_LABELS[m.role]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={m.role} onChange={e => updateMember(pid, m.id, { role: e.target.value as any })}
                    className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1 text-[10px] outline-none">
                    {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <button onClick={() => removeMember(pid, m.id)} className="p-1 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
              <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">Add Member</h3>
              <button onClick={() => addMember(pid, { name: `Member ${currentMembers.length + 1}`, email: `member${currentMembers.length + 1}@example.com`, role: 'engineer' })}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
                <Users className="w-3.5 h-3.5" /> Add Team Member
              </button>
            </div>
            {isOnline && (
              <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
                <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">Invite Link</h3>
                <button onClick={generateInviteLink}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  Generate Invite
                </button>
                {inviteLink && (
                  <div className="mt-2 flex items-center gap-1">
                    <input readOnly value={inviteLink} className="flex-1 bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[9px] outline-none truncate" />
                    <button onClick={() => navigator.clipboard.writeText(inviteLink)}
                      className="p-1.5 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg hover:bg-[#E2E8F0] dark:hover:bg-[#2A3040] cursor-pointer">
                      <svg className="w-3 h-3 text-[#64748B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {currentActivities.map(a => (
              <div key={a.id} className="flex items-start gap-2 text-[11px] pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B] last:border-0">
                <div className="w-5 h-5 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-[8px] font-bold shrink-0 mt-0.5">{a.userName.charAt(0)}</div>
                <div>
                  <span className="font-semibold text-[#0F172A] dark:text-white">{a.userName}</span> <span className="text-[#64748B]">{a.action}</span>
                  <p className="text-[#94A3B8] text-[10px]">{a.details}</p>
                  <span className="text-[8px] text-[#94A3B8]">{new Date(a.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {currentActivities.length === 0 && <p className="text-[#94A3B8] text-center py-4 text-xs">No activity yet.</p>}
          </div>
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
            <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">Discussion</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {currentComments.filter(c => !c.parentId).map(c => (
                <div key={c.id} className="pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B] last:border-0">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-[9px] font-bold shrink-0">{c.userName.charAt(0)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#0F172A] dark:text-white">{c.userName}</span>
                        <span className="text-[8px] text-[#94A3B8]">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-[#475569] dark:text-[#CBD5E1] mt-0.5">{c.text}</p>
                      <button onClick={() => removeComment(pid, c.id)} className="text-[8px] text-[#EF4444] hover:underline mt-1 cursor-pointer">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              {currentComments.length === 0 && <p className="text-[#94A3B8] text-center py-4 text-xs">No comments yet.</p>}
            </div>
          </div>
          <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
            <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">Add Comment</h3>
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] min-h-[80px]" placeholder="Write a comment..." />
            <button onClick={handleAddComment}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
              <MessageSquare className="w-3.5 h-3.5" /> Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Favorites Section (simplified) ── */
function FavoritesSection() {
  const { state, toggleFavorite, pinCalculator, unpinCalculator, isFavorited, isPinned, clearHistory } = useCollab();

  const ALL_CALC = [
    { id: 'concrete-volume', name: 'Concrete Volume', category: 'concrete' },
    { id: 'rebar-calculator', name: 'Rebar Calculator', category: 'concrete' },
    { id: 'structural-beam', name: 'Beam Analysis', category: 'structural' },
    { id: 'structural-column', name: 'Column Design', category: 'structural' },
    { id: 'structural-slab', name: 'Slab Deflection', category: 'structural' },
    { id: 'steel-calculator', name: 'Steel Weight', category: 'structural' },
    { id: 'survey-hi', name: 'Height of Instrument', category: 'survey' },
    { id: 'survey-coordinate', name: 'Traverse', category: 'survey' },
    { id: 'geotech-bearing', name: 'Bearing Capacity', category: 'geotech' },
    { id: 'geotech-retaining', name: 'Retaining Wall', category: 'geotech' },
    { id: 'utility-convert', name: 'Unit Converter', category: 'utility' },
    { id: 'bbs-universal', name: 'BBS Calculator', category: 'bbs' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
          <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">Favorites</h3>
          <div className="space-y-1">
            {state.favorites.map(f => (
              <div key={f.calculatorId} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]">
                <span className="text-[11px] text-[#0F172A] dark:text-white">{f.name}</span>
                <button onClick={() => toggleFavorite(f.calculatorId, f.name)} className="p-1 text-[#F59E0B] cursor-pointer"><Star className="w-3 h-3 fill-current" /></button>
              </div>
            ))}
            {state.favorites.length === 0 && <p className="text-[#94A3B8] text-center py-4 text-[10px]">No favorites yet.</p>}
          </div>
        </div>
        <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
          <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">Pinned</h3>
          <div className="space-y-1">
            {state.pinned.map(p => (
              <div key={p.calculatorId} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]">
                <span className="text-[11px] text-[#0F172A] dark:text-white">{p.name}</span>
                <button onClick={() => unpinCalculator(p.calculatorId)} className="p-1 text-[#EF4444] cursor-pointer"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
              </div>
            ))}
            {state.pinned.length === 0 && <p className="text-[#94A3B8] text-center py-4 text-[10px]">No pinned calculators.</p>}
          </div>
        </div>
        <div className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4">
          <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">All Calculators</h3>
          <div className="space-y-1">
            {ALL_CALC.map(c => (
              <div key={c.id} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]">
                <span className="text-[10px] text-[#0F172A] dark:text-white">{c.name}</span>
                <button onClick={() => toggleFavorite(c.id, c.name)} className={cls("p-1 rounded cursor-pointer", isFavorited(c.id) ? 'text-[#F59E0B]' : 'text-[#94A3B8]')}>
                  <Star className={cls("w-3 h-3", isFavorited(c.id) && 'fill-current')} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-[#64748B]">{state.history.length} history entries</span>
        <button onClick={clearHistory} className="px-2 py-1 text-[10px] font-bold text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer">Clear History</button>
      </div>
    </div>
  );
}

/* ── Workspace Shell ── */
function CollaborationHubContent() {
  const { isOnline, fbUser, loginGoogle, logout, unreadNotifications, currentNotifications, markNotificationRead, markAllNotificationsRead, state, currentProjects, currentProjectName, createNewProject, setProject } = useCollab();
  const [activeModule, setActiveModule] = useState<ModuleId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const renderModule = () => {
    switch (activeModule) {
      case 'overview': return <OverviewPanel />;
      case 'progress': return <ProgressSection />;
      case 'tasks': return <TeamSection />;
      case 'issues': return <IssuesPanel />;
      case 'documents': return <DocumentsPanel />;
      case 'materials': return <MaterialTrackerPanel />;
      case 'costs': return <CostTrackerPanel />;
      case 'daily-reports': return <DailyReportsPanel />;
      case 'team': return <TeamSection />;
      case 'chat': return <ChatPanel />;
      case 'favorites': return <FavoritesSection />;
      case 'settings': return <SettingsPanel />;
      default: return <OverviewPanel />;
    }
  };

  const activeMod = MODULES.find(m => m.id === activeModule);
  const Icon = activeMod?.icon || LayoutDashboard;

  return (
    <div className="flex h-[calc(100vh-64px)] -mx-4 -mb-4 overflow-hidden">
      {/* Sidebar */}
      <div className={cls(
        "bg-[#0D1527] border-r border-[#1E293B] flex flex-col transition-all duration-200 shrink-0",
        sidebarOpen ? 'w-52' : 'w-12'
      )}>
        {/* Sidebar header — project selector */}
        <div className="relative px-2 h-11 border-b border-[#1E293B] flex items-center">
          {sidebarOpen ? (
            <div className="flex-1 min-w-0">
              <button onClick={() => setProjectSelectorOpen(!projectSelectorOpen)}
                className="flex items-center gap-1.5 w-full px-1.5 py-1 rounded-lg text-[11px] font-bold text-white hover:bg-[#1E293B] transition-colors cursor-pointer">
                <span className="truncate">{currentProjectName}</span>
                <svg className="w-3 h-3 text-[#64748B] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {projectSelectorOpen && (
                <div className="absolute left-2 right-2 top-full mt-1 bg-[#0D1527] border border-[#1E293B] rounded-lg shadow-xl z-50 py-1 max-h-48 overflow-y-auto">
                  {currentProjects.map(p => (
                    <button key={p.id} onClick={() => { setProject(p.id); setProjectSelectorOpen(false); }}
                      className={cls("w-full text-left px-2.5 py-1.5 text-[11px] hover:bg-[#1E293B] transition-colors cursor-pointer",
                        p.id === state.currentProjectId ? 'text-[#2563EB] font-bold' : 'text-[#94A3B8]'
                      )}>
                      {p.name}
                    </button>
                  ))}
                  <hr className="border-[#1E293B] my-1" />
                  <div className="px-2 py-1">
                    <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
                      placeholder="New project name..."
                      className="w-full bg-[#1E293B] border border-[#2A3040] rounded px-2 py-1 text-[10px] text-white outline-none placeholder:text-[#64748B]"
                      onKeyDown={e => { if (e.key === 'Enter' && newProjectName.trim()) { createNewProject(newProjectName.trim()); setNewProjectName(''); setProjectSelectorOpen(false); } }} />
                    <button onClick={() => { if (newProjectName.trim()) { createNewProject(newProjectName.trim()); setNewProjectName(''); setProjectSelectorOpen(false); } }}
                      className="w-full mt-1 px-2 py-1 bg-[#2563EB] text-white rounded text-[9px] font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
                      + Create Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <button onClick={() => setSidebarOpen(true)} className="p-1 text-[#64748B] hover:text-white rounded cursor-pointer">
                <Menu className="w-4 h-4" />
              </button>
            </div>
          )}
          {sidebarOpen && (
            <button onClick={() => { setSidebarOpen(false); setProjectSelectorOpen(false); }} className="p-1 text-[#64748B] hover:text-white rounded cursor-pointer shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Module list */}
        <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
          {MODULES.map(mod => {
            const ModIcon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button key={mod.id} onClick={() => setActiveModule(mod.id)}
                className={cls(
                  "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer group",
                  isActive
                    ? 'bg-[#2563EB]/15 text-[#2563EB]'
                    : 'text-[#64748B] hover:text-white hover:bg-[#1E293B]'
                )}
                title={mod.label}>
                <ModIcon className="w-4 h-4 shrink-0" style={{ color: isActive ? '#2563EB' : undefined }} />
                {sidebarOpen && (
                  <>
                    <span className="truncate">{mod.label}</span>
                    {mod.id === 'settings' && <Settings className="w-3 h-3 ml-auto opacity-50" />}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* External links */}
        {sidebarOpen && (
          <div className="px-3 py-2 border-t border-[#1E293B] space-y-1">
            <a href="/boq-builder" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-all no-underline">
              <FileText className="w-4 h-4" /> BOQ Builder <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
            <a href="/" className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-all no-underline">
              <HardHat className="w-4 h-4" /> Calculators <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] dark:bg-[#080d19]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 h-11 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0D1527] shrink-0">
          <div className="flex items-center gap-2.5">
            <Icon className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-[13px] font-extrabold text-[#0F172A] dark:text-white">{activeMod?.label || 'Overview'}</h2>
            <span className={cls("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
              isOnline ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
            )}>
              <Globe className="w-2.5 h-2.5" /> {isOnline ? 'Live' : 'Local'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            {isOnline && (
              <div className="relative">
                <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-1.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer">
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EF4444] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl shadow-lg z-50">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                      <span className="text-[11px] font-bold text-[#0F172A] dark:text-white">Notifications</span>
                      {unreadNotifications > 0 && (
                        <button onClick={markAllNotificationsRead} className="text-[9px] text-[#2563EB] hover:underline cursor-pointer">Mark all read</button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {currentNotifications.length === 0 ? (
                        <p className="text-[#94A3B8] text-center py-4 text-[10px]">No notifications</p>
                      ) : (
                        currentNotifications.slice(0, 20).map(n => (
                          <div key={n.id} className={cls("px-3 py-2 border-b border-[#E2E8F0] dark:border-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#080d19] cursor-pointer", !n.read && 'bg-[#2563EB]/5')}
                            onClick={() => markNotificationRead(n.id)}>
                            <div className="flex items-center gap-1.5">
                              {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />}
                              <span className="text-[10px] font-bold text-[#0F172A] dark:text-white">{n.title}</span>
                            </div>
                            <p className="text-[9px] text-[#64748B] ml-3">{n.message}</p>
                            <span className="text-[8px] text-[#94A3B8] ml-3">{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth */}
            {isOnline && !fbUser && (
              <button onClick={loginGoogle} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#2A3040] rounded-xl text-[10px] font-bold hover:bg-[#F8FAFC] dark:hover:bg-[#2A3040] transition-colors cursor-pointer whitespace-nowrap">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign In
              </button>
            )}
            {isOnline && fbUser && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#64748B] hidden sm:inline">{fbUser.displayName || 'User'}</span>
                {fbUser.photoURL ? (
                  <img src={fbUser.photoURL} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-[9px] font-bold">
                    {fbUser.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <button onClick={logout} className="p-1.5 text-[#64748B] hover:text-[#EF4444] rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div key={activeModule} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.12 }}>
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function CollaborationHub() {
  return (
    <CollaborationProvider>
      <CollaborationHubContent />
    </CollaborationProvider>
  );
}
