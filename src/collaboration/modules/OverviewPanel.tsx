import { BarChart3, Clock, Activity, Calendar, Check, AlertCircle, FileText, DollarSign, Package, Users, TrendingUp } from 'lucide-react';
import { useCollab } from '../CollaborationContext';
import { ProgressBar, Card } from './shared';

export default function OverviewPanel() {
  const {
    overallProgress, todayProgress, weeklyProgress, monthlyProgress,
    completedTasks, pendingTasks, delayedTasks, currentRecords, currentTasks,
    currentIssues, currentMembers, totalBudget, totalActualCost, totalCommitted,
    currentMaterialItems,
  } = useCollab();

  const openIssues = currentIssues.filter(i => i.status === 'open' || i.status === 'in-progress').length;
  const deliveredMaterials = currentMaterialItems.filter(m => m.status === 'delivered' || m.status === 'installed').length;
  const costVariance = totalBudget > 0 ? ((totalActualCost - totalBudget) / totalBudget * 100).toFixed(1) : '0';

  const stats = [
    { label: 'Overall Progress', value: `${overallProgress}%`, icon: BarChart3, color: '#2563EB', detail: `${currentRecords.length} records` },
    { label: 'Today', value: `${todayProgress}%`, icon: Clock, color: '#10B981', detail: 'Today\'s completion' },
    { label: 'Weekly', value: `${weeklyProgress}%`, icon: Activity, color: '#059669', detail: '7-day progress' },
    { label: 'Monthly', value: `${monthlyProgress}%`, icon: Calendar, color: '#D97706', detail: '30-day progress' },
    { label: 'Tasks Done', value: String(completedTasks), icon: Check, color: '#10B981', detail: `${pendingTasks} remaining` },
    { label: 'Open Issues', value: String(openIssues), icon: AlertCircle, color: '#EF4444', detail: `${currentIssues.length} total` },
    { label: 'Team Size', value: String(currentMembers.length), icon: Users, color: '#7C3AED', detail: 'members' },
    { label: 'Budget', value: `$${totalBudget.toLocaleString()}`, icon: DollarSign, color: '#2563EB', detail: `$${totalActualCost.toLocaleString()} actual (${costVariance}%)` },
    { label: 'Materials', value: String(currentMaterialItems.length), icon: Package, color: '#D97706', detail: `${deliveredMaterials} delivered` },
    { label: 'Tasks', value: String(currentTasks.length), icon: TrendingUp, color: '#0891B2', detail: `${completedTasks} done` },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-lg font-extrabold text-[#0F172A] dark:text-white">{s.value}</span>
            </div>
            <div className="text-[10px] font-semibold text-[#64748B] uppercase">{s.label}</div>
            <div className="text-[9px] text-[#94A3B8] mt-0.5">{s.detail}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Project Progress">
          <div className="space-y-3">
            <div><div className="flex justify-between text-[10px] mb-1"><span>Overall</span><span className="font-bold">{overallProgress}%</span></div><ProgressBar value={overallProgress} /></div>
            <div><div className="flex justify-between text-[10px] mb-1"><span>Today</span><span className="font-bold">{todayProgress}%</span></div><ProgressBar value={todayProgress} color="#10B981" /></div>
            <div><div className="flex justify-between text-[10px] mb-1"><span>This Week</span><span className="font-bold">{weeklyProgress}%</span></div><ProgressBar value={weeklyProgress} color="#059669" /></div>
            <div><div className="flex justify-between text-[10px] mb-1"><span>This Month</span><span className="font-bold">{monthlyProgress}%</span></div><ProgressBar value={monthlyProgress} color="#D97706" /></div>
          </div>
        </Card>

        <Card title="Cost Overview">
          <div className="space-y-3">
            <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Budget</span><span className="font-bold text-[#0F172A] dark:text-white">${totalBudget.toLocaleString()}</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#64748B]">Actual Cost</span><span className="font-bold text-[#0F172A] dark:text-white">${totalActualCost.toLocaleString()}</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#64748B]">Committed</span><span className="font-bold text-[#0F172A] dark:text-white">${totalCommitted.toLocaleString()}</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#64748B]">Variance</span>
              <span className={`font-bold ${Number(costVariance) > 0 ? 'text-red-500' : 'text-green-500'}`}>{costVariance}%</span>
            </div>
            <div className="pt-2"><ProgressBar value={totalBudget > 0 ? Math.min(100, (totalActualCost / totalBudget) * 100) : 0} color={Number(costVariance) > 5 ? '#EF4444' : '#2563EB'} /></div>
          </div>
        </Card>

        <Card title="Task Summary">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'To Do', count: currentTasks.filter(t => t.status === 'todo').length, color: '#94A3B8' },
              { label: 'In Progress', count: currentTasks.filter(t => t.status === 'in-progress').length, color: '#2563EB' },
              { label: 'Blocked', count: currentTasks.filter(t => t.status === 'blocked').length, color: '#EF4444' },
              { label: 'Done', count: currentTasks.filter(t => t.status === 'completed').length, color: '#10B981' },
            ].map(s => (
              <div key={s.label} className="text-center p-2 bg-[#F8FAFC] dark:bg-[#080d19] rounded-lg">
                <div className="text-lg font-extrabold" style={{ color: s.color }}>{s.count}</div>
                <div className="text-[9px] text-[#64748B]">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Issue Summary">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Open', count: currentIssues.filter(i => i.status === 'open').length, color: '#EF4444' },
              { label: 'In Progress', count: currentIssues.filter(i => i.status === 'in-progress').length, color: '#F59E0B' },
              { label: 'Resolved', count: currentIssues.filter(i => i.status === 'resolved').length, color: '#10B981' },
              { label: 'Closed', count: currentIssues.filter(i => i.status === 'closed').length, color: '#94A3B8' },
            ].map(s => (
              <div key={s.label} className="text-center p-2 bg-[#F8FAFC] dark:bg-[#080d19] rounded-lg">
                <div className="text-lg font-extrabold" style={{ color: s.color }}>{s.count}</div>
                <div className="text-[9px] text-[#64748B]">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
