import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useCollab } from '../CollaborationContext';
import { Card } from './shared';
import { PROJECT_STATUS_LABELS, ROLE_LABELS, type ProjectStatus, type MemberRole } from '../types';

export default function SettingsPanel() {
  const { state, currentSettings, saveSettings } = useCollab();
  const pid = state.currentProjectId || 'default';

  const [name, setName] = useState(currentSettings?.name || '');
  const [description, setDescription] = useState(currentSettings?.description || '');
  const [location, setLocation] = useState(currentSettings?.location || '');
  const [startDate, setStartDate] = useState(currentSettings?.startDate || '');
  const [targetEndDate, setTargetEndDate] = useState(currentSettings?.targetEndDate || '');
  const [status, setStatus] = useState<ProjectStatus>(currentSettings?.status || 'planning');
  const [budget, setBudget] = useState(String(currentSettings?.budget || 0));
  const [currency, setCurrency] = useState(currentSettings?.currency || 'USD');
  const [defaultRole, setDefaultRole] = useState<MemberRole>(currentSettings?.defaultRole || 'viewer');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setName(currentSettings.name);
      setDescription(currentSettings.description);
      setLocation(currentSettings.location);
      setStartDate(currentSettings.startDate);
      setTargetEndDate(currentSettings.targetEndDate);
      setStatus(currentSettings.status);
      setBudget(String(currentSettings.budget));
      setCurrency(currentSettings.currency);
      setDefaultRole(currentSettings.defaultRole);
    }
  }, [currentSettings]);

  const handleSave = () => {
    saveSettings(pid, {
      name, description, location, startDate, targetEndDate, status,
      budget: Number(budget), currency, defaultRole,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <Card title="Project Settings">
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-[#64748B] block mb-1">Project Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[#64748B] block mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] min-h-[60px]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-[#64748B] block mb-1">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#64748B] block mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none">
                {Object.entries(PROJECT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#64748B] block mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#64748B] block mb-1">Target End Date</label>
              <input type="date" value={targetEndDate} onChange={e => setTargetEndDate(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#64748B] block mb-1">Budget ({currency})</label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#64748B] block mb-1">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none">
                {['USD', 'EUR', 'GBP', 'LKR', 'INR', 'AED', 'SAR'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#64748B] block mb-1">Default Member Role</label>
              <select value={defaultRole} onChange={e => setDefaultRole(e.target.value as MemberRole)}
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none">
                {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
            <Save className="w-3.5 h-3.5" /> {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </Card>
    </div>
  );
}
