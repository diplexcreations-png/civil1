import { useState } from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCollab } from '../CollaborationContext';
import { Card, StatusBadge, cls } from './shared';
import { ISSUE_CATEGORIES, ISSUE_STATUS_LABELS, ISSUE_PRIORITY_LABELS, ISSUE_SEVERITY_LABELS, type IssueStatus, type IssuePriority, type IssueSeverity } from '../types';

export default function IssuesPanel() {
  const { state, currentIssues, addIssue, updateIssue, removeIssue } = useCollab();
  const pid = state.currentProjectId || 'default';

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [severity, setSeverity] = useState<IssueSeverity>('minor');
  const [category, setCategory] = useState('Structural');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = filterStatus ? currentIssues.filter(i => i.status === filterStatus) : currentIssues;

  const handleAdd = () => {
    if (!title) return;
    addIssue(pid, { title, description, priority, severity, category });
    setTitle(''); setDescription(''); setShowForm(false);
  };

  const statusColors: Record<IssueStatus, string> = { open: '#EF4444', 'in-progress': '#F59E0B', resolved: '#10B981', closed: '#94A3B8' };
  const priorityColors: Record<IssuePriority, string> = { low: '#94A3B8', medium: '#F59E0B', high: '#EF4444', critical: '#DC2626' };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
            <option value="">All Issues</option>
            {Object.entries(ISSUE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB] text-white rounded-xl text-[10px] font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
          <Plus className="w-3 h-3" /> New Issue
        </button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <div className="space-y-2">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Issue title"
              className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description"
              className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] min-h-[60px]" />
            <div className="grid grid-cols-3 gap-2">
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
                {ISSUE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={priority} onChange={e => setPriority(e.target.value as IssuePriority)}
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
                {Object.entries(ISSUE_PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={severity} onChange={e => setSeverity(e.target.value as IssueSeverity)}
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
                {Object.entries(ISSUE_SEVERITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <button onClick={handleAdd}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Create Issue
            </button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {filtered.map(issue => (
          <div key={issue.id} className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[issue.status] }} />
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-white">{issue.title}</span>
                  <StatusBadge label={ISSUE_STATUS_LABELS[issue.status]} color={statusColors[issue.status]} />
                  <StatusBadge label={ISSUE_PRIORITY_LABELS[issue.priority]} color={priorityColors[issue.priority]} />
                  <StatusBadge label={ISSUE_SEVERITY_LABELS[issue.severity]} color={issue.severity === 'critical' ? '#DC2626' : issue.severity === 'major' ? '#F59E0B' : '#64748B'} />
                </div>
                {issue.description && <p className="text-[10px] text-[#64748B] mb-1">{issue.description}</p>}
                <div className="flex items-center gap-2 text-[9px] text-[#94A3B8]">
                  <span>{issue.category}</span>
                  <span>·</span>
                  <span>Created {new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {(['open', 'in-progress', 'resolved', 'closed'] as IssueStatus[]).filter(s => s !== issue.status).map(s => (
                  <button key={s} onClick={() => updateIssue(pid, issue.id, { status: s })}
                    className="p-1 rounded hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] cursor-pointer" title={ISSUE_STATUS_LABELS[s]}>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
                <button onClick={() => removeIssue(pid, issue.id)}
                  className="p-1 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-[#94A3B8] text-center py-8 text-xs">No issues found. Create your first issue above.</p>
        )}
      </div>
    </div>
  );
}
