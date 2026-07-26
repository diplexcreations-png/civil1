import { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { useCollab } from '../CollaborationContext';
import { Card, StatusBadge, ProgressBar, formatNum } from './shared';
import { MATERIAL_CATEGORIES, MATERIAL_STATUS_LABELS, type MaterialStatus } from '../types';

export default function MaterialTrackerPanel() {
  const { state, currentMaterialItems, addMaterialItem, updateMaterialItem, removeMaterialItem } = useCollab();
  const pid = state.currentProjectId || 'default';

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cement');
  const [unit, setUnit] = useState('kg');
  const [qtyRequired, setQtyRequired] = useState('0');
  const [supplier, setSupplier] = useState('');

  const handleAdd = () => {
    addMaterialItem(pid, { name: name || 'New Material', category, unit, quantityRequired: Number(qtyRequired), supplier, quantityOrdered: Number(qtyRequired) });
    setName(''); setQtyRequired('0'); setSupplier(''); setShowForm(false);
  };

  const statusColors: Record<MaterialStatus, string> = { ordered: '#F59E0B', partial: '#2563EB', delivered: '#10B981', installed: '#7C3AED' };

  const delivered = currentMaterialItems.filter(m => m.status === 'delivered' || m.status === 'installed').length;
  const totalQty = currentMaterialItems.reduce((s, m) => s + m.quantityRequired, 0);
  const receivedQty = currentMaterialItems.reduce((s, m) => s + m.quantityReceived, 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Items', value: String(currentMaterialItems.length), color: '#2563EB' },
          { label: 'Delivered', value: String(delivered), color: '#10B981' },
          { label: 'Total Qty', value: formatNum(totalQty, 0), color: '#D97706', detail: `${formatNum(receivedQty, 0)} received` },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-3">
            <div className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] font-semibold text-[#64748B]">{s.label}</div>
            {s.detail && <div className="text-[9px] text-[#94A3B8]">{s.detail}</div>}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-[#64748B]">{currentMaterialItems.length} materials tracked</span>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB] text-white rounded-xl text-[10px] font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
          <Plus className="w-3 h-3" /> Add Material
        </button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <div className="space-y-2">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Material name"
              className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
            <div className="grid grid-cols-4 gap-2">
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
                {MATERIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={unit} onChange={e => setUnit(e.target.value)}
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">
                {['kg', 'tons', 'm³', 'm²', 'm', 'nos', 'bags', 'liters'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <input type="number" value={qtyRequired} onChange={e => setQtyRequired(e.target.value)} placeholder="Qty"
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none" />
              <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier"
                className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none" />
            </div>
            <button onClick={handleAdd}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add Material
            </button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {currentMaterialItems.map(m => {
          const pct = m.quantityRequired > 0 ? Math.round((m.quantityReceived / m.quantityRequired) * 100) : 0;
          return (
            <div key={m.id} className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Package className="w-3.5 h-3.5 text-[#D97706]" />
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-white">{m.name}</span>
                    <StatusBadge label={MATERIAL_STATUS_LABELS[m.status]} color={statusColors[m.status]} />
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    {m.category} · {formatNum(m.quantityRequired, 0)} {m.unit} · {m.supplier && `${m.supplier}`}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {(['ordered', 'partial', 'delivered', 'installed'] as MaterialStatus[]).filter(s => s !== m.status).map(s => (
                    <button key={s} onClick={() => updateMaterialItem(pid, m.id, { status: s })}
                      className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] hover:bg-[#2563EB]/10 hover:text-[#2563EB] cursor-pointer">
                      {MATERIAL_STATUS_LABELS[s]}
                    </button>
                  ))}
                  <button onClick={() => removeMaterialItem(pid, m.id)}
                    className="p-1 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <ProgressBar value={pct} size="sm" color={pct >= 100 ? '#10B981' : '#2563EB'} />
              <div className="flex justify-between text-[8px] text-[#94A3B8] mt-0.5">
                <span>Received: {formatNum(m.quantityReceived, 0)} / {formatNum(m.quantityRequired, 0)}</span>
                <span className="font-bold">{pct}%</span>
              </div>
            </div>
          );
        })}
        {currentMaterialItems.length === 0 && (
          <p className="text-[#94A3B8] text-center py-8 text-xs">No materials tracked yet.</p>
        )}
      </div>
    </div>
  );
}
