import { useState } from 'react';
import { Plus, Trash2, Sun, Cloud, Thermometer } from 'lucide-react';
import { useCollab } from '../CollaborationContext';
import { Card } from './shared';

export default function DailyReportsPanel() {
  const { state, currentDailyReports, addDailyReport, removeDailyReport } = useCollab();
  const pid = state.currentProjectId || 'default';

  const [showForm, setShowForm] = useState(false);
  const [weather, setWeather] = useState('Sunny');
  const [temperature, setTemperature] = useState('30°C');
  const [summary, setSummary] = useState('');
  const [workers, setWorkers] = useState('0');
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    addDailyReport(pid, { weather, temperature, summary, workers: Number(workers), notes });
    setSummary(''); setNotes(''); setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] text-[#64748B]">{currentDailyReports.length} reports filed</div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#2563EB] text-white rounded-xl text-[10px] font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
          <Plus className="w-3 h-3" /> New Report
        </button>
      </div>

      {showForm && (
        <Card className="mb-4">
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5">
                <Sun className="w-3 h-3 text-[#F59E0B]" />
                <select value={weather} onChange={e => setWeather(e.target.value)}
                  className="bg-transparent border-none outline-none text-[10px] flex-1">
                  {['Sunny', 'Cloudy', 'Rainy', 'Windy', 'Stormy', 'Foggy'].map(w => <option key={w}>{w}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5">
                <Thermometer className="w-3 h-3 text-[#EF4444]" />
                <input type="text" value={temperature} onChange={e => setTemperature(e.target.value)}
                  placeholder="Temp" className="bg-transparent border-none outline-none text-[10px] w-full" />
              </div>
              <div className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5">
                <Cloud className="w-3 h-3 text-[#64748B]" />
                <input type="number" value={workers} onChange={e => setWorkers(e.target.value)}
                  placeholder="Workers" className="bg-transparent border-none outline-none text-[10px] w-full" />
              </div>
            </div>
            <input type="text" value={summary} onChange={e => setSummary(e.target.value)}
              placeholder="Daily summary" className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB]" />
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes"
              className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#2563EB] min-h-[60px]" />
            <button onClick={handleAdd}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> File Report
            </button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {currentDailyReports.map(r => (
          <div key={r.id} className="bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-white">{r.date}</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B]">{r.weather} · {r.temperature}</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-[#2563EB]/10 text-[#2563EB]">{r.workers} workers</span>
                </div>
                {r.summary && <p className="text-[11px] text-[#475569] dark:text-[#CBD5E1]">{r.summary}</p>}
                {r.notes && <p className="text-[10px] text-[#94A3B8] mt-1">{r.notes}</p>}
              </div>
              <button onClick={() => removeDailyReport(pid, r.id)}
                className="p-1 text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer shrink-0">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
        {currentDailyReports.length === 0 && (
          <p className="text-[#94A3B8] text-center py-8 text-xs">No daily reports yet. File your first report above.</p>
        )}
      </div>
    </div>
  );
}
