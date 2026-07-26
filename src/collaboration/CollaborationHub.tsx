import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardList, Users, Star, Clock, Plus, Trash2, Check, X, ChevronRight,
  Calendar, Upload, MessageSquare, Activity, BarChart3, ListChecks,
  Camera, Paperclip, AlertCircle, ArrowRight, Search, Filter,
  HardHat, Columns, Beaker, Layers, Grid, Compass, RefreshCw,
  FileText, Package, Truck, Wrench, Hammer, Settings, UserPlus,
  Link, Copy, LogOut, Globe,
} from 'lucide-react';
import { CollaborationProvider, useCollab } from './CollaborationContext';
import {
  ROLE_LABELS, WORK_CATEGORIES, ProgressRecord, Task, ProjectMember,
  ActivityLog, Comment, Milestone, ProgressStatus, MemberRole,
} from './types';

const CALC_ICONS: Record<string, typeof HardHat> = {
  'concrete-volume': Layers, 'rebar-calculator': Grid, 'brick-calculator': Layers,
  'structural-beam': Beaker, 'structural-column': Columns, 'structural-slab': Grid,
  'steel-calculator': Hammer, 'survey-hi': Compass, 'survey-coordinate': Compass,
  'geotech-bearing': HardHat, 'geotech-retaining': HardHat, 'utility-convert': RefreshCw,
  'bbs-universal': ClipboardList,
};

function formatNum(n: number, d = 2): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
}

function cls(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cls("bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-4", className)}>
      {title && <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white mb-3">{title}</h3>}
      {children}
    </div>
  );
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

function ProgressSection() {
  const { state, currentRecords, overallProgress, todayProgress, weeklyProgress, monthlyProgress,
    completedTasks, pendingTasks, delayedTasks, categoryProgress, addProgress, updateProgress, removeProgress } = useCollab();

  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Excavation');
  const [newPlanned, setNewPlanned] = useState('10');
  const [newCompleted, setNewCompleted] = useState('0');
  const [newUnit, setNewUnit] = useState('m³');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const pid = state.currentProjectId || 'default';

  const filtered = currentRecords.filter(r => {
    if (filterCat && r.category !== filterCat) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const handleAdd = () => {
    if (!newDesc) return;
    addProgress(pid, {
      description: newDesc, category: newCategory as any,
      plannedQty: Number(newPlanned), completedQty: Number(newCompleted),
      unit: newUnit, status: Number(newCompleted) >= Number(newPlanned) ? 'completed' : 'in-progress',
    });
    setNewDesc(''); setNewCompleted('0');
  };

  const statusColor: Record<ProgressStatus, string> = { pending: '#F59E0B', 'in-progress': '#2563EB', completed: '#10B981', delayed: '#EF4444' };

  const timelineMilestones = [
    { name: 'Excavation', pct: categoryProgress['Excavation'] || 0 },
    { name: 'Foundation', pct: categoryProgress['Foundation'] || 0 },
    { name: 'Columns', pct: categoryProgress['Columns'] || 0 },
    { name: 'Beams', pct: categoryProgress['Beams'] || 0 },
    { name: 'Slabs', pct: categoryProgress['Slabs'] || 0 },
    { name: 'Brickwork', pct: categoryProgress['Brickwork'] || 0 },
    { name: 'Finishing', pct: Math.max(categoryProgress['Plaster'] || 0, categoryProgress['Painting'] || 0) },
  ];

  return (
    <div>
      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Overall Progress', val: `${overallProgress}%`, icon: BarChart3, color: '#2563EB', detail: `${currentRecords.length} records` },
          { label: 'Today', val: `${todayProgress}%`, icon: Clock, color: '#10B981', detail: 'Today\'s completion' },
          { label: 'Weekly', val: `${weeklyProgress}%`, icon: Activity, color: '#059669', detail: '7-day progress' },
          { label: 'Monthly', val: `${monthlyProgress}%`, icon: Calendar, color: '#D97706', detail: '30-day progress' },
          { label: 'Completed', val: String(completedTasks), icon: Check, color: '#10B981', detail: 'Tasks done' },
          { label: 'Pending', val: String(pendingTasks), icon: Clock, color: '#F59E0B', detail: 'Open tasks' },
          { label: 'Delayed', val: String(delayedTasks), icon: AlertCircle, color: '#EF4444', detail: 'Blocked' },
          { label: 'Records', val: String(currentRecords.length), icon: FileText, color: '#7C3AED', detail: 'Total entries' },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <c.icon className="w-4 h-4" style={{ color: c.color }} />
              <span className="text-[18px] font-extrabold text-[#0F172A] dark:text-white">{c.val}</span>
            </div>
            <div className="text-[10px] font-semibold text-[#64748B] uppercase">{c.label}</div>
            <div className="text-[9px] text-[#94A3B8]">{c.detail}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Add Progress Form */}
        <Card title="Add Progress Record">
          <div className="space-y-2">
            <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)}
              placeholder="Description" className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
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
              <input type="number" value={newPlanned} onChange={e => setNewPlanned(e.target.value)}
                placeholder="Planned Qty" className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-2 text-xs outline-none focus:border-[#2563EB]" />
              <input type="number" value={newCompleted} onChange={e => setNewCompleted(e.target.value)}
                placeholder="Completed Qty" className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-2 text-xs outline-none focus:border-[#2563EB]" />
            </div>
            <button onClick={handleAdd} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add Record
            </button>
          </div>
        </Card>

        {/* Circular Progress */}
        <Card title="Project Completion">
          <div className="flex flex-col items-center py-4">
            <CircularProgress value={overallProgress} size={96} />
            <div className="text-[10px] text-[#64748B] mt-2">{currentRecords.length} activity records</div>
          </div>
        </Card>

        {/* Timeline */}
        <Card title="Construction Timeline">
          <div className="space-y-2">
            {timelineMilestones.map((m, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="font-medium text-[#0F172A] dark:text-white">{m.name}</span>
                  <span className={cls("font-bold", m.pct >= 100 ? 'text-[#10B981]' : m.pct > 0 ? 'text-[#2563EB]' : 'text-[#94A3B8]')}>
                    {m.pct >= 100 ? '✓' : `${m.pct}%`}
                  </span>
                </div>
                <ProgressBar value={m.pct} size="sm" color={m.pct >= 100 ? '#10B981' : '#2563EB'} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Progress Records Table */}
      <Card title="Progress Records">
        <div className="flex items-center gap-2 mb-3">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
            <option value="">All Categories</option>
            {WORK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
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
                    <td className="px-2 py-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8]">{r.category}</span>
                    </td>
                    <td className="px-2 py-1.5 text-[#0F172A] dark:text-white max-w-[200px] truncate">{r.description}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{formatNum(r.plannedQty)}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{formatNum(r.completedQty)}</td>
                    <td className="px-2 py-1.5 text-right font-mono font-bold" style={{ color: statusColor[r.status] }}>{pct}%</td>
                    <td className="px-2 py-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold" style={{ backgroundColor: `${statusColor[r.status]}20`, color: statusColor[r.status] }}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <button onClick={() => removeProgress(pid, r.id)} className="p-1 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-2 py-8 text-center text-[#94A3B8]">No progress records. Add your first record above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

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

  const handleAddMember = () => {
    addMember(pid, { name: `Member ${currentMembers.length + 1}`, email: `member${currentMembers.length + 1}@example.com`, role: 'engineer' });
  };

  const handleAddTask = () => {
    if (!newTaskTitle) return;
    addTask(pid, { title: newTaskTitle, assignedTo: newTaskAssignee || state.currentUser.id, priority: newTaskPriority, status: 'todo' });
    addActivity(pid, 'created task', `New task: ${newTaskTitle}`);
    setNewTaskTitle('');
  };

  const handleAddComment = () => {
    if (!newComment) return;
    addComment(pid, newComment);
    addActivity(pid, 'commented', `Added comment to project`);
    setNewComment('');
  };

  const handleTaskStatus = (taskId: string, status: Task['status']) => {
    updateTask(pid, taskId, { status });
    addActivity(pid, 'updated task', `Task ${status}`);
  };

  const roleColors: Record<MemberRole, string> = { owner: '#2563EB', engineer: '#059669', qs: '#D97706', supervisor: '#7C3AED', foreman: '#DC2626', client: '#0891B2', viewer: '#64748B' };

  const tabs = [
    { id: 'tasks' as const, label: 'Tasks', icon: ListChecks, count: currentTasks.length },
    { id: 'members' as const, label: 'Team', icon: Users, count: currentMembers.length },
    { id: 'activity' as const, label: 'Activity', icon: Activity, count: currentActivities.length },
    { id: 'comments' as const, label: 'Chat', icon: MessageSquare, count: currentComments.length },
  ];

  const statusOptions: { value: Task['status']; label: string; color: string }[] = [
    { value: 'todo', label: 'To Do', color: '#94A3B8' },
    { value: 'in-progress', label: 'In Progress', color: '#2563EB' },
    { value: 'completed', label: 'Done', color: '#10B981' },
    { value: 'blocked', label: 'Blocked', color: '#EF4444' },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cls("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
              activeTab === t.id ? 'bg-white dark:bg-[#0D1527] text-[#2563EB] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
            )}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.count > 0 && <span className="text-[9px] text-[#94A3B8]">({t.count})</span>}
          </button>
        ))}
      </div>

      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            {['todo', 'in-progress', 'completed', 'blocked'].map(status => {
              const tasks = currentTasks.filter(t => t.status === status);
              if (tasks.length === 0) return null;
              const sOpt = statusOptions.find(o => o.value === status)!;
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sOpt.color }} />
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">{sOpt.label}</span>
                    <span className="text-[10px] text-[#94A3B8]">({tasks.length})</span>
                  </div>
                  <div className="space-y-1">
                    {tasks.map(t => (
                      <div key={t.id} className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg p-2.5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={cls("w-1.5 h-1.5 rounded-full shrink-0",
                                t.priority === 'critical' ? 'bg-red-500' : t.priority === 'high' ? 'bg-orange-500' : t.priority === 'medium' ? 'bg-yellow-500' : 'bg-slate-400'
                              )} />
                              <span className="text-xs font-semibold text-[#0F172A] dark:text-white truncate">{t.title}</span>
                            </div>
                            {t.description && <p className="text-[10px] text-[#64748B] mt-0.5">{t.description}</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {statusOptions.filter(o => o.value !== status).map(o => (
                              <button key={o.value} onClick={() => handleTaskStatus(t.id, o.value)}
                                className="p-1 rounded hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] cursor-pointer" title={o.label}>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ))}
                            <button onClick={() => removeTask(pid, t.id)} className="p-1 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <Card title="New Task">
            <div className="space-y-2">
              <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Task title" className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
              <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as any)}
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <select value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none">
                <option value="">Assign to...</option>
                {currentMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <button onClick={handleAddTask} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            {currentMembers.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-xs font-bold">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#0F172A] dark:text-white">{m.name}</div>
                    <div className="text-[10px] text-[#64748B]">{m.email}</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: `${roleColors[m.role]}20`, color: roleColors[m.role] }}>
                      {ROLE_LABELS[m.role]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={m.role} onChange={e => updateMember(pid, m.id, { role: e.target.value as MemberRole })}
                    className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1 text-[10px] outline-none">
                    {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <button onClick={() => removeMember(pid, m.id)} className="p-1 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Card title="Add Member">
            <p className="text-[10px] text-[#64748B] mb-3">Add team members to collaborate on this project.</p>
            <button onClick={handleAddMember} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
              <UserPlus className="w-3.5 h-3.5" /> Add Team Member
            </button>
            <div className="mt-3 space-y-1">
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-[9px] px-2 py-1 bg-[#F8FAFC] dark:bg-[#080d19] rounded">
                  <span className="text-[#64748B]">{v}</span>
                  <span style={{ color: roleColors[k as MemberRole] }} className="font-semibold">
                    {k === 'owner' ? 'Full Access' : k === 'viewer' ? 'View Only' : 'Restricted'}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {isOnline && (
            <Card title="Invite Link">
              <p className="text-[10px] text-[#64748B] mb-3">Share this link with teammates to join the project.</p>
              <button onClick={generateInviteLink} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer">
                <Link className="w-3.5 h-3.5" /> Generate Invite Link
              </button>
              {inviteLink && (
                <div className="mt-2 flex items-center gap-1">
                  <input readOnly value={inviteLink} className="flex-1 bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[9px] outline-none truncate" />
                  <button onClick={() => { navigator.clipboard.writeText(inviteLink); }} className="p-1.5 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg hover:bg-[#E2E8F0] dark:hover:bg-[#2A3040] cursor-pointer">
                    <Copy className="w-3 h-3 text-[#64748B]" />
                  </button>
                </div>
              )}
            </Card>
          )}

          {isOnline && !fbUser && (
            <Card title="Sign In">
              <p className="text-[10px] text-[#64748B] mb-3">Sign in with Google to collaborate in real-time.</p>
              <button onClick={loginGoogle} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-[#E2E8F0] dark:bg-[#1E293B] dark:border-[#2A3040] text-[#0F172A] dark:text-white rounded-xl text-xs font-bold hover:bg-[#F8FAFC] dark:hover:bg-[#2A3040] transition-colors cursor-pointer">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign in with Google
              </button>
            </Card>
          )}

          {isOnline && fbUser && (
            <Card title="Account">
              <div className="flex items-center gap-2 mb-2">
                {fbUser.photoURL ? (
                  <img src={fbUser.photoURL} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-[10px] font-bold">
                    {fbUser.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-[#0F172A] dark:text-white">{fbUser.displayName || 'User'}</div>
                  <div className="text-[9px] text-[#64748B]">{fbUser.email}</div>
                </div>
              </div>
              <button onClick={logout} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-[#EF4444] text-[#EF4444] rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <Card>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {currentActivities.map(a => (
              <div key={a.id} className="flex items-start gap-2 text-[11px] pb-2 border-b border-[#E2E8F0] dark:border-[#1E293B] last:border-0">
                <div className="w-5 h-5 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] text-[8px] font-bold shrink-0 mt-0.5">
                  {a.userName.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-[#0F172A] dark:text-white">{a.userName}</span>
                  {' '}<span className="text-[#64748B]">{a.action}</span>
                  <p className="text-[#94A3B8] text-[10px]">{a.details}</p>
                  <span className="text-[8px] text-[#94A3B8]">{new Date(a.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {currentActivities.length === 0 && (
              <p className="text-[#94A3B8] text-center py-4 text-xs">No activity yet.</p>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'comments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Discussion">
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
              {currentComments.length === 0 && (
                <p className="text-[#94A3B8] text-center py-4 text-xs">No comments yet.</p>
              )}
            </div>
          </Card>
          <Card title="Add Comment">
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] min-h-[80px]"
              placeholder="Write a comment..." />
            <button onClick={handleAddComment} className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
              <MessageSquare className="w-3.5 h-3.5" /> Post Comment
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}

function FavoritesSection() {
  const { state, toggleFavorite, pinCalculator, unpinCalculator, isFavorited, isPinned,
    addHistory, deleteHistory, clearHistory } = useCollab();
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('');

  const ALL_CALCULATORS = [
    { id: 'concrete-volume', name: 'Concrete Volume Estimator', category: 'concrete' },
    { id: 'rebar-calculator', name: 'Rebar Quantity Calculator', category: 'concrete' },
    { id: 'brick-calculator', name: 'Brick & Mortar Estimator', category: 'concrete' },
    { id: 'structural-beam', name: 'Beam Load Analyst', category: 'structural' },
    { id: 'structural-column', name: 'Column Design (ACI 318)', category: 'structural' },
    { id: 'structural-slab', name: 'Slab Thickness Estimator', category: 'structural' },
    { id: 'steel-calculator', name: 'Steel Weight Estimator', category: 'structural' },
    { id: 'survey-hi', name: 'Height of Instrument', category: 'survey' },
    { id: 'survey-coordinate', name: 'Coordinate Traverse', category: 'survey' },
    { id: 'geotech-bearing', name: 'Bearing Capacity', category: 'geotech' },
    { id: 'geotech-retaining', name: 'Retaining Wall Force', category: 'geotech' },
    { id: 'utility-convert', name: 'Unit Converter', category: 'utility' },
    { id: 'bbs-universal', name: 'BBS Calculator', category: 'bbs' },
  ];

  const filteredHistory = state.history.filter(h => {
    if (historySearch && !h.calculatorName.toLowerCase().includes(historySearch.toLowerCase())) return false;
    if (historyFilter && h.category !== historyFilter) return false;
    return true;
  });

  const categories = [...new Set(ALL_CALCULATORS.map(c => c.category))];

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Favorites */}
        <Card title="Favorite Calculators">
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {state.favorites.map(f => {
              const Icon = CALC_ICONS[f.calculatorId] || HardHat;
              return (
                <div key={f.calculatorId} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span className="text-[11px] text-[#0F172A] dark:text-white">{f.name}</span>
                  </div>
                  <button onClick={() => toggleFavorite(f.calculatorId, f.name)}
                    className="p-1 text-[#F59E0B] hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded cursor-pointer">
                    <Star className="w-3 h-3 fill-current" />
                  </button>
                </div>
              );
            })}
            {state.favorites.length === 0 && (
              <p className="text-[#94A3B8] text-center py-4 text-[10px]">No favorites yet. Star calculators below.</p>
            )}
          </div>
        </Card>

        {/* Pinned */}
        <Card title="Pinned Calculators">
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {state.pinned.map(p => {
              const Icon = CALC_ICONS[p.calculatorId] || HardHat;
              return (
                <div key={p.calculatorId} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span className="text-[11px] text-[#0F172A] dark:text-white">{p.name}</span>
                  </div>
                  <button onClick={() => unpinCalculator(p.calculatorId)}
                    className="p-1 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
            {state.pinned.length === 0 && (
              <p className="text-[#94A3B8] text-center py-4 text-[10px]">Pin calculators for quick access.</p>
            )}
          </div>
        </Card>

        {/* Stats */}
        <Card title="Your Activity">
          <div className="space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#64748B]">Favorites</span>
              <span className="font-bold text-[#0F172A] dark:text-white">{state.favorites.length}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#64748B]">Pinned</span>
              <span className="font-bold text-[#0F172A] dark:text-white">{state.pinned.length}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#64748B]">History</span>
              <span className="font-bold text-[#0F172A] dark:text-white">{state.history.length}</span>
            </div>
            <ProgressBar value={Math.min(100, state.history.length)} />
          </div>
        </Card>
      </div>

      {/* All Calculators */}
      <Card title="All Calculators" className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {ALL_CALCULATORS.map(calc => {
            const Icon = CALC_ICONS[calc.id] || HardHat;
            const fav = isFavorited(calc.id);
            const pin = isPinned(calc.id);
            return (
              <div key={calc.id} className="flex items-center justify-between px-3 py-2 bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#2563EB]" />
                  <div>
                    <div className="text-[11px] font-semibold text-[#0F172A] dark:text-white">{calc.name}</div>
                    <div className="text-[8px] text-[#94A3B8] uppercase">{calc.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleFavorite(calc.id, calc.name)}
                    className={cls("p-1 rounded cursor-pointer", fav ? 'text-[#F59E0B]' : 'text-[#94A3B8] hover:text-[#F59E0B]')}>
                    <Star className={cls("w-3 h-3", fav && 'fill-current')} />
                  </button>
                  <button onClick={() => pin ? unpinCalculator(calc.id) : pinCalculator(calc.id, calc.name)}
                    className={cls("p-1 rounded cursor-pointer", pin ? 'text-[#2563EB]' : 'text-[#94A3B8] hover:text-[#2563EB]')}>
                    <HardHat className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* History */}
      <Card title="Calculation History">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#94A3B8]" />
            <input type="text" value={historySearch} onChange={e => setHistorySearch(e.target.value)}
              placeholder="Search history..." className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg pl-7 pr-3 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" />
          </div>
          <select value={historyFilter} onChange={e => setHistoryFilter(e.target.value)}
            className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
            <option value="">All</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={clearHistory} className="px-2 py-1.5 text-[10px] font-bold text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer">Clear</button>
        </div>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {filteredHistory.map(h => (
            <div key={h.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#080d19]">
              <div className="flex items-center gap-2">
                {(CALC_ICONS[h.calculatorId] || React.createElement)({ className: "w-3.5 h-3.5 text-[#2563EB]" })}
                <div>
                  <span className="text-[11px] font-medium text-[#0F172A] dark:text-white">{h.calculatorName}</span>
                  <span className="text-[9px] text-[#94A3B8] ml-2">{new Date(h.date).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => deleteHistory(h.id)} className="p-1 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {filteredHistory.length === 0 && (
            <p className="text-[#94A3B8] text-center py-4 text-[10px]">No calculation history yet. Calculations auto-save as you use them.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function CollaborationHubContent() {
  const { isOnline, fbUser, loginGoogle, logout } = useCollab();
  const [activeModule, setActiveModule] = useState<'progress' | 'team' | 'favorites'>('progress');

  const modules = [
    { id: 'progress' as const, label: 'Progress Tracker', icon: BarChart3 },
    { id: 'team' as const, label: 'Team Collaboration', icon: Users },
    { id: 'favorites' as const, label: 'Favorites & History', icon: Star },
  ];

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-[#2563EB]" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-[#0F172A] dark:text-white">Project Management</h1>
              <span className={cls("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                isOnline ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              )}>
                <Globe className="w-2.5 h-2.5" />
                {isOnline ? 'Live' : 'Local'}
              </span>
            </div>
            <p className="text-[10px] text-[#64748B]">Progress tracking, team collaboration & favorites</p>
          </div>
        </div>
        {isOnline && !fbUser && (
          <button onClick={loginGoogle} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#2A3040] rounded-xl text-[10px] font-bold hover:bg-[#F8FAFC] dark:hover:bg-[#2A3040] transition-colors cursor-pointer whitespace-nowrap">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign In
          </button>
        )}
        {isOnline && fbUser && (
          <div className="flex items-center gap-2">
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

      {/* Module Tabs */}
      <div className="flex items-center gap-1 mb-5 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-xl p-1 w-fit">
        {modules.map(m => (
          <button key={m.id} onClick={() => setActiveModule(m.id)}
            className={cls("flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
              activeModule === m.id ? 'bg-white dark:bg-[#0D1527] text-[#2563EB] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
            )}>
            <m.icon className="w-4 h-4" />
            {m.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeModule} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
          {activeModule === 'progress' && <ProgressSection />}
          {activeModule === 'team' && <TeamSection />}
          {activeModule === 'favorites' && <FavoritesSection />}
        </motion.div>
      </AnimatePresence>
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
