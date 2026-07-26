import { useState } from 'react';
import { HardHat, Calculator, Send, Ruler, Weight, Truck, Wrench, Layers, Grid } from 'lucide-react';
import { useCollab } from '../CollaborationContext';
import { Card, cls, formatNum } from './shared';

/* ── Tab definitions ── */
const TABS = [
  { id: 'earthwork', label: 'Earthwork', icon: Truck },
  { id: 'formwork', label: 'Formwork', icon: Grid },
  { id: 'asphalt', label: 'Asphalt', icon: Weight },
  { id: 'labor', label: 'Labor', icon: Wrench },
  { id: 'equipment', label: 'Equipment', icon: HardHat },
  { id: 'scaffolding', label: 'Scaffolding', icon: Layers },
  { id: 'tile', label: 'Tile', icon: Ruler },
  { id: 'lap', label: 'Lap Splice', icon: Calculator },
];

/* ── Helpers ── */
function calcItem(key: string) { return `calc_${key}_${Date.now()}`; }

/* ── 1. Earthwork Cut-Fill ── */
function EarthworkTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [length, setLength] = useState('50');
  const [width, setWidth] = useState('30');
  const [depth, setDepth] = useState('2');
  const [swell, setSwell] = useState('20');
  const [unitCost, setUnitCost] = useState('15');

  const L = Number(length) || 0;
  const W = Number(width) || 0;
  const D = Number(depth) || 0;
  const bankVol = L * W * D;
  const looseVol = bankVol * (1 + (Number(swell) || 0) / 100);
  const totalCost = looseVol * (Number(unitCost) || 0);

  const push = () => {
    addMaterialItem(pid, { name: 'Earthwork Excavation', category: 'Cement', unit: 'm³', quantityRequired: Math.ceil(looseVol), totalCost: Math.round(totalCost), specification: `Cut-fill: ${L}m×${W}m×${D}m, ${swell}% swell` });
    addCostItem(pid, { description: 'Earthwork Cut-Fill', category: 'Materials', estimatedCost: Math.round(totalCost), actualCost: 0, committedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Grid Method Cut-Fill">
        <div className="space-y-2">
          {[
            { label: 'Length (m)', val: length, set: setLength },
            { label: 'Width (m)', val: width, set: setWidth },
            { label: 'Avg Depth (m)', val: depth, set: setDepth },
            { label: 'Swell Factor %', val: swell, set: setSwell },
            { label: 'Cost per m³ ($)', val: unitCost, set: setUnitCost },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">{f.label}</label>
              <input type="number" value={f.val} onChange={e => f.set(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" />
            </div>
          ))}
        </div>
      </Card>
      <div>
        <Card title="Results">
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span className="text-[#64748B]">Bank Volume</span><span className="font-bold">{formatNum(bankVol)} m³</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#64748B]">Loose Volume</span><span className="font-bold">{formatNum(looseVol)} m³</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#64748B]">Estimated Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
            <button onClick={push}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
              <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── 2. Formwork Estimator ── */
function FormworkTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [slabArea, setSlabArea] = useState('100');
  const [slabThick, setSlabThick] = useState('0.15');
  const [height, setHeight] = useState('3');

  const A = Number(slabArea) || 0;
  const T = Number(slabThick) || 0.15;
  const H = Number(height) || 3;
  const plywoodSheets = Math.ceil(A / 2.976); // standard 2440×1220mm sheet
  const props = Math.ceil(A * 1.5);
  const beams = Math.ceil(A * 0.4); // runner beams in lm
  const totalCost = plywoodSheets * 35 + props * 8 + beams * 12;

  const push = () => {
    addMaterialItem(pid, { name: 'Plywood Sheets', category: 'Steel', unit: 'nos', quantityRequired: plywoodSheets, totalCost: plywoodSheets * 35, specification: `18mm ply for ${A}m² slab` });
    addMaterialItem(pid, { name: 'Formwork Props', category: 'Steel', unit: 'nos', quantityRequired: props, totalCost: props * 8, specification: `Adjustable steel props H=${H}m` });
    addMaterialItem(pid, { name: 'Runner Beams', category: 'Steel', unit: 'm', quantityRequired: beams, totalCost: beams * 12, specification: 'Timber runners' });
    addCostItem(pid, { description: 'Formwork Materials', category: 'Materials', estimatedCost: totalCost });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Slab Formwork Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Slab Area (m²)</label><input type="number" value={slabArea} onChange={e => setSlabArea(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Slab Thickness (m)</label><input type="number" step="0.01" value={slabThick} onChange={e => setSlabThick(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height to soffit (m)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Plywood Sheets</span><span className="font-bold">{plywoodSheets} nos</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Steel Props</span><span className="font-bold">{props} nos</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Runner Beams</span><span className="font-bold">{beams} lm</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 3. Asphalt / Paving ── */
function AsphaltTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [area, setArea] = useState('500');
  const [thick, setThick] = useState('0.05');
  const [density, setDensity] = useState('2.4');
  const [costPerTon, setCostPerTon] = useState('120');

  const A = Number(area) || 0;
  const T = Number(thick) || 0;
  const D = Number(density) || 2.4;
  const tons = A * T * D;
  const totalCost = tons * (Number(costPerTon) || 0);

  const push = () => {
    addMaterialItem(pid, { name: 'Asphalt Mix', category: 'Cement', unit: 'tons', quantityRequired: Math.ceil(tons), totalCost: Math.round(totalCost), specification: `AC ${T*1000}mm, ${A}m²` });
    addCostItem(pid, { description: 'Asphalt Paving', category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Asphalt Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Area (m²)</label><input type="number" value={area} onChange={e => setArea(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Thickness (m)</label><input type="number" step="0.01" value={thick} onChange={e => setThick(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Density (t/m³)</label><input type="number" step="0.1" value={density} onChange={e => setDensity(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cost per ton ($)</label><input type="number" value={costPerTon} onChange={e => setCostPerTon(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Asphalt Required</span><span className="font-bold">{formatNum(tons)} tons</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 4. Labor Productivity ── */
function LaborTab() {
  const { state, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [workers, setWorkers] = useState('10');
  const [days, setDays] = useState('5');
  const [rate, setRate] = useState('150');
  const [activity, setActivity] = useState('Concrete Pouring');

  const W = Number(workers) || 0;
  const D = Number(days) || 0;
  const laborCost = W * D * (Number(rate) || 0);

  const push = () => {
    addCostItem(pid, { description: `Labor: ${activity}`, category: 'Labor', estimatedCost: Math.round(laborCost), vendor: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Labor Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Activity</label><input type="text" value={activity} onChange={e => setActivity(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Number of Workers</label><input type="number" value={workers} onChange={e => setWorkers(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Days</label><input type="number" value={days} onChange={e => setDays(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Daily Rate per Worker ($)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Worker-Days</span><span className="font-bold">{W * D}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Labor Cost</span><span className="font-bold text-[#2563EB]">${formatNum(laborCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 5. Equipment Hourly Cost ── */
function EquipmentTab() {
  const { state, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [equipName, setEquipName] = useState('Excavator 20t');
  const [purchasePrice, setPurchasePrice] = useState('250000');
  const [salvage, setSalvage] = useState('50000');
  const [lifeYears, setLifeYears] = useState('5');
  const [hoursYear, setHoursYear] = useState('1600');
  const [fuel, setFuel] = useState('25');
  const [maintenance, setMaintenance] = useState('15');

  const P = Number(purchasePrice) || 0;
  const S = Number(salvage) || 0;
  const L = Number(lifeYears) || 5;
  const H = Number(hoursYear) || 1600;
  const depr = (P - S) / (L * H);
  const fuelCost = Number(fuel) || 0;
  const maintCost = Number(maintenance) || 0;
  const totalHourly = depr + fuelCost + maintCost;
  const annualCost = totalHourly * H;

  const push = () => {
    addCostItem(pid, { description: `Equipment: ${equipName}`, category: 'Equipment', estimatedCost: Math.round(annualCost), vendor: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Equipment Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Equipment Name</label><input type="text" value={equipName} onChange={e => setEquipName(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Purchase Price ($)</label><input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Salvage Value ($)</label><input type="number" value={salvage} onChange={e => setSalvage(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Life (years)</label><input type="number" value={lifeYears} onChange={e => setLifeYears(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Hours/year</label><input type="number" value={hoursYear} onChange={e => setHoursYear(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Fuel ($/hr)</label><input type="number" value={fuel} onChange={e => setFuel(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Maint ($/hr)</label><input type="number" value={maintenance} onChange={e => setMaintenance(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Depreciation</span><span className="font-bold">${formatNum(depr)}/hr</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Fuel + Maint</span><span className="font-bold">${formatNum(fuelCost + maintCost)}/hr</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Hourly Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalHourly)}/hr</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Annual Cost</span><span className="font-bold">${formatNum(annualCost)}/yr</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 6. Scaffolding Quantity ── */
function ScaffoldingTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [scaffLength, setScaffLength] = useState('20');
  const [scaffHeight, setScaffHeight] = useState('10');
  const [scaffWidth, setScaffWidth] = useState('1.5');

  const L = Number(scaffLength) || 0;
  const H = Number(scaffHeight) || 0;
  const W = Number(scaffWidth) || 1.5;

  const standards = Math.ceil(L / 2) * 2; // two rows
  const ledgers = Math.ceil(H / 2) * Math.ceil(L / 2) * 2;
  const diagonals = Math.ceil(Math.sqrt(L*L + H*H) / 4) * 2;
  const couplers = standards * 4 + ledgers * 2;
  const baseJacks = Math.ceil(L / 2) * 2;
  const totalArea = L * H;
  const totalCost = standards * 15 + ledgers * 8 + diagonals * 12 + couplers * 3 + baseJacks * 10;

  const push = () => {
    addMaterialItem(pid, { name: 'Scaffolding Standards', category: 'Steel', unit: 'nos', quantityRequired: standards, specification: `H=${H}m` });
    addMaterialItem(pid, { name: 'Scaffolding Ledgers', category: 'Steel', unit: 'nos', quantityRequired: ledgers });
    addMaterialItem(pid, { name: 'Scaffolding Couplers', category: 'Steel', unit: 'nos', quantityRequired: couplers });
    addCostItem(pid, { description: 'Scaffolding Materials', category: 'Materials', estimatedCost: totalCost });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Scaffold Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><input type="number" value={scaffLength} onChange={e => setScaffLength(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><input type="number" value={scaffHeight} onChange={e => setScaffHeight(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><input type="number" step="0.1" value={scaffWidth} onChange={e => setScaffWidth(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Standards</span><span className="font-bold">{standards}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Ledgers</span><span className="font-bold">{ledgers}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Diagonals</span><span className="font-bold">{diagonals}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Couplers</span><span className="font-bold">{couplers}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Base Jacks</span><span className="font-bold">{baseJacks}</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 7. Tile / Floor Finishing ── */
function TileTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [roomLength, setRoomLength] = useState('6');
  const [roomWidth, setRoomWidth] = useState('4');
  const [tileSize, setTileSize] = useState('0.6');
  const [wastage, setWastage] = useState('10');
  const [tileCost, setTileCost] = useState('25');

  const RL = Number(roomLength) || 0;
  const RW = Number(roomWidth) || 0;
  const TS = Number(tileSize) || 0.6;
  const area = RL * RW;
  const tileArea = TS * TS;
  const tilesNet = Math.ceil(area / tileArea);
  const tilesTotal = Math.ceil(tilesNet * (1 + (Number(wastage) || 0) / 100));
  const materialCost = tilesTotal * (Number(tileCost) || 0);

  const push = () => {
    addMaterialItem(pid, { name: 'Floor Tiles', category: 'Finishing', unit: 'nos', quantityRequired: tilesTotal, totalCost: materialCost, specification: `${TS*1000}×${TS*1000}mm tiles, ${wastage}% wastage` });
    addCostItem(pid, { description: 'Tile Flooring', category: 'Materials', estimatedCost: materialCost });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Tile Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Room Length (m)</label><input type="number" value={roomLength} onChange={e => setRoomLength(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Room Width (m)</label><input type="number" value={roomWidth} onChange={e => setRoomWidth(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Tile Size (m)</label><input type="number" step="0.1" value={tileSize} onChange={e => setTileSize(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Wastage %</label><input type="number" value={wastage} onChange={e => setWastage(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div className="col-span-2"><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cost per Tile ($)</label><input type="number" value={tileCost} onChange={e => setTileCost(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Floor Area</span><span className="font-bold">{formatNum(area)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Tiles Needed (net)</span><span className="font-bold">{tilesNet}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Tiles + Wastage</span><span className="font-bold">{tilesTotal} ({wastage}%)</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Material Cost</span><span className="font-bold text-[#2563EB]">${formatNum(materialCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 8. Lap Length / Splice ── */
function LapTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [barDiam, setBarDiam] = useState('16');
  const [grade, setGrade] = useState('415');
  const [concreteGrade, setConcreteGrade] = useState('25');
  const [bars, setBars] = useState('100');
  const [barLength, setBarLength] = useState('12');

  const d = Number(barDiam) || 16;
  const fy = Number(grade) || 415;
  const fck = Number(concreteGrade) || 25;
  const n = Number(bars) || 100;
  const bl = Number(barLength) || 12;

  // Simplified lap length: 35 * diameter for tension (IS 456)
  const ld = Math.round(Math.max(35 * d, (0.87 * fy * d) / (4 * 1.2 * Math.sqrt(fck))));
  const lapPerBar = ld;
  const lapsPerBar = Math.ceil(bl / 12); // standard bar length 12m
  const totalLapSteel = (lapsPerBar * lapPerBar * n * (d * d * Math.PI / 4) * 7850) / 1e9;
  const extraSteelKg = Math.round(totalLapSteel);
  const extraCost = extraSteelKg * 1.2; // $1.2/kg

  const push = () => {
    addMaterialItem(pid, { name: `Rebar ${d}mm (Lap Extra)`, category: 'Steel', unit: 'kg', quantityRequired: extraSteelKg, totalCost: Math.round(extraCost), specification: `FY${fy}, M${fck}, lap=${ld}mm` });
    addCostItem(pid, { description: `Rebar Lap Steel ${d}mm`, category: 'Materials', estimatedCost: Math.round(extraCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Rebar Splice Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Bar Diameter (mm)</label><input type="number" value={barDiam} onChange={e => setBarDiam(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Steel Grade (fy)</label><select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">{['250', '415', '500', '550'].map(g => <option key={g} value={g}>Fe{g}</option>)}</select></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Concrete Grade</label><select value={concreteGrade} onChange={e => setConcreteGrade(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">{['20', '25', '30', '35', '40'].map(g => <option key={g} value={g}>M{g}</option>)}</select></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Total Bars</label><input type="number" value={bars} onChange={e => setBars(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Bar Length (m)</label><input type="number" value={barLength} onChange={e => setBarLength(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Development Length Ld</span><span className="font-bold">{ld} mm</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Laps per Bar</span><span className="font-bold">{lapsPerBar}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Extra Steel</span><span className="font-bold">{extraSteelKg} kg</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Extra Cost</span><span className="font-bold text-[#2563EB]">${formatNum(extraCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── Main panel ── */
export default function ConstructionTools() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  const ActiveComponent = () => {
    switch (activeTab) {
      case 'earthwork': return <EarthworkTab />;
      case 'formwork': return <FormworkTab />;
      case 'asphalt': return <AsphaltTab />;
      case 'labor': return <LaborTab />;
      case 'equipment': return <EquipmentTab />;
      case 'scaffolding': return <ScaffoldingTab />;
      case 'tile': return <TileTab />;
      case 'lap': return <LapTab />;
      default: return <EarthworkTab />;
    }
  };

  return (
    <div>
      {/* Tool tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto bg-[#F1F5F9] dark:bg-[#1E293B] rounded-xl p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cls("flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all cursor-pointer",
              activeTab === t.id ? 'bg-white dark:bg-[#0D1527] text-[#2563EB] shadow-xs' : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
            )}>
            <t.icon className="w-3 h-3" /> {t.label}
          </button>
        ))}
      </div>
      <ActiveComponent />
    </div>
  );
}
