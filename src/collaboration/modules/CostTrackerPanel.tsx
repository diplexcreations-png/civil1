import { useState } from 'react';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import { useCollab } from '../CollaborationContext';
import { Card, StatusBadge, formatNum } from './shared';
import { COST_CATEGORIES, COST_STATUS_LABELS, type CostStatus } from '../types';

export default function CostTrackerPanel() {
  const { state, currentCostItems, addCostItem, updateCostItem, removeCostItem, totalBudget, totalActualCost, totalCommitted } = useCollab();
  const pid = state.currentProjectId || 'default';

  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Materials');
  const [estCost, setEstCost] = useState('0');
  const [vendor, setVendor] = useState('');

  const handleAdd = () => {
    addCostItem(pid, { description: description || 'New Cost', category, estimatedCost: Number(estCost), vendor });
    setDescription(''); setEstCost('0'); setVendor(''); setShowForm(false);
  };

  const statusColors: Record<CostStatus, string> = { pending: '#F59E0B', approved: '#2563EB', rejected: '#EF4444', paid: '#10B981' };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}`, color: '#2563EB' },
          { label: 'Actual Cost', value: `$${totalActualCost.toLocaleString()}`, color: totalActualCost > totalBudget ? '#EF4444' : '#10B981' },
          { label: 'Committed', value: `$${totalCommitted.toLocaleString()}`, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-3">
            <div className="text-[18px] font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] font-semibold text-[#64748B]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-[#64748B]">{currentCostItems.length} cost items</span>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB] text-white rounded-xl text-[10px] font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
          <Plus className="w-3 h-3" /> Add Cost Item
        </button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <div className="space-y-2">
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description"
              className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
            <div className="grid grid-cols-3 gap-2">
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
                {COST_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" value={estCost} onChange={e => setEstCost(e.target.value)} placeholder="Est. Cost"
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none" />
              <input type="text" value={vendor} onChange={e => setVendor(e.target.value)} placeholder="Vendor"
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none" />
            </div>
            <button onClick={handleAdd}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add Cost Item
            </button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {currentCostItems.map(item => (
          <div key={item.id} className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-white">{item.description}</span>
                  <StatusBadge label={COST_STATUS_LABELS[item.status]} color={statusColors[item.status]} />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#64748B]">
                  <span>{item.category}</span>
                  <span>Est: ${formatNum(item.estimatedCost)}</span>
                  <span>Actual: ${formatNum(item.actualCost)}</span>
                  {item.vendor && <span>· {item.vendor}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {(['pending', 'approved', 'paid'] as CostStatus[]).filter(s => s !== item.status).map(s => (
                  <button key={s} onClick={() => updateCostItem(pid, item.id, { status: s })}
                    className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] hover:bg-[#2563EB]/10 hover:text-[#2563EB] cursor-pointer">
                    {COST_STATUS_LABELS[s]}
                  </button>
                ))}
                <button onClick={() => removeCostItem(pid, item.id)}
                  className="p-1 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {currentCostItems.length === 0 && (
          <p className="text-[#94A3B8] text-center py-8 text-xs">No cost items yet. Add your first cost item above.</p>
        )}
      </div>
    </div>
  );
}
