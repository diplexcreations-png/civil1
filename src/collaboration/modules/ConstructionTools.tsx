import { useState } from 'react';
import { HardHat, Calculator, Send, Ruler, Weight, Truck, Wrench, Layers, Grid, Droplets, Hash, Paintbrush, LayoutGrid, GitFork, Home, Hammer, Shield, Shovel, SprayCan, Triangle, ArrowUpDown, Container, Fence, LayoutPanelTop, Layers3 } from 'lucide-react';
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
  { id: 'concreteVol', label: 'Concrete Vol', icon: Droplets },
  { id: 'rebarWeight', label: 'Rebar Weight', icon: Hash },
  { id: 'painting', label: 'Painting', icon: Paintbrush },
  { id: 'masonry', label: 'Masonry', icon: LayoutGrid },
  { id: 'piping', label: 'Piping', icon: GitFork },
  { id: 'roofing', label: 'Roofing', icon: Home },
  { id: 'compaction', label: 'Compaction', icon: Hammer },
  { id: 'waterproofing', label: 'Waterproofing', icon: Shield },
  { id: 'mixDesign', label: 'Mix Design', icon: Shovel },
  { id: 'plastering', label: 'Plastering', icon: SprayCan },
  { id: 'slopedExc', label: 'Sloped Exc', icon: Triangle },
  { id: 'staircase', label: 'Staircase', icon: ArrowUpDown },
  { id: 'waterTank', label: 'Water Tank', icon: Container },
  { id: 'fencing', label: 'Fencing', icon: Fence },
  { id: 'screed', label: 'Screed', icon: LayoutPanelTop },
  { id: 'formworkArea', label: 'Formwork Area', icon: Layers3 },
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

/* ── 9. Concrete Volume (slab / beam / column / cylinder) ── */
function ConcreteVolTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [sLab, setSLab] = useState('5');
  const [sWid, setSWid] = useState('4');
  const [sThk, setSThk] = useState('0.15');
  const [bLen, setBLen] = useState('3');
  const [bWid, setBWid] = useState('0.3');
  const [bDep, setBDep] = useState('0.45');
  const [cWid, setCWid] = useState('0.3');
  const [cDep, setCDep] = useState('0.3');
  const [cHt, setCHt] = useState('3');
  const [cylDia, setCylDia] = useState('0.3');
  const [cylHt, setCylHt] = useState('3');
  const [unitPrice, setUnitPrice] = useState('120');

  const slabV = (Number(sLab)||0) * (Number(sWid)||0) * (Number(sThk)||0);
  const beamV = (Number(bLen)||0) * (Number(bWid)||0) * (Number(bDep)||0);
  const colV = (Number(cWid)||0) * (Number(cDep)||0) * (Number(cHt)||0);
  const cylV = Math.PI * ((Number(cylDia)||0)/2)**2 * (Number(cylHt)||0);
  const totalV = slabV + beamV + colV + cylV;
  const totalCost = totalV * (Number(unitPrice)||0);

  const push = () => {
    addMaterialItem(pid, { name: 'Ready-Mix Concrete', category: 'Cement', unit: 'm³', quantityRequired: Math.ceil(totalV), totalCost: Math.round(totalCost), specification: `Slab ${sLab}m×${sWid}m×${sThk}m + Beam + Column + Cylinder` });
    addCostItem(pid, { description: 'Concrete Volume Total', category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  const Inp = (l:string,v:string,s:(x:string)=>void,p?:string) => (
    <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">{l}</label><input type="number" step={p||'0.01'} value={v} onChange={e=>s(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Concrete Volume Inputs">
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide">Slab</p>
          <div className="grid grid-cols-3 gap-1">{Inp('Length (m)',sLab,setSLab)}{Inp('Width (m)',sWid,setSWid)}{Inp('Thick (m)',sThk,setSThk)}</div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Beam</p>
          <div className="grid grid-cols-3 gap-1">{Inp('Length (m)',bLen,setBLen)}{Inp('Width (m)',bWid,setBWid)}{Inp('Depth (m)',bDep,setBDep)}</div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Column</p>
          <div className="grid grid-cols-3 gap-1">{Inp('Width (m)',cWid,setCWid)}{Inp('Depth (m)',cDep,setCDep)}{Inp('Height (m)',cHt,setCHt)}</div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Cylinder / Pile</p>
          <div className="grid grid-cols-2 gap-1">{Inp('Diameter (m)',cylDia,setCylDia)}{Inp('Height (m)',cylHt,setCylHt)}</div>
          <div className="mt-1">{Inp('Concrete Unit Price ($/m³)',unitPrice,setUnitPrice,'1')}</div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Slab Volume</span><span className="font-bold">{formatNum(slabV)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Beam Volume</span><span className="font-bold">{formatNum(beamV)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Column Volume</span><span className="font-bold">{formatNum(colV)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Cylinder Volume</span><span className="font-bold">{formatNum(cylV)} m³</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B] font-bold">Total Volume</span><span className="font-bold">{formatNum(totalV)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 10. Rebar Weight Calculator ── */
function RebarWeightTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [diam, setDiam] = useState('16');
  const [barLen, setBarLen] = useState('12');
  const [qty, setQty] = useState('100');
  const [priceKg, setPriceKg] = useState('1.2');

  const d = Number(diam) || 16;
  const L = Number(barLen) || 12;
  const n = Number(qty) || 100;
  const wPerM = (d * d) / 162; // kg/m (standard formula)
  const wPerBar = wPerM * L;
  const totalKg = wPerBar * n;
  const totalTons = totalKg / 1000;
  const totalCost = totalKg * (Number(priceKg) || 0);

  const push = () => {
    addMaterialItem(pid, { name: `Rebar ${diam}mm`, category: 'Steel', unit: 'kg', quantityRequired: Math.ceil(totalKg), totalCost: Math.round(totalCost), specification: `${n} bars × ${L}m, ${totalTons.toFixed(2)} tons` });
    addCostItem(pid, { description: `Rebar ${diam}mm – ${n} bars`, category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Rebar Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Diameter (mm)</label><input type="number" value={diam} onChange={e=>setDiam(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Bar Length (m)</label><input type="number" value={barLen} onChange={e=>setBarLen(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Number of Bars</label><input type="number" value={qty} onChange={e=>setQty(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Price ($/kg)</label><input type="number" step="0.01" value={priceKg} onChange={e=>setPriceKg(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Weight per m</span><span className="font-bold">{wPerM.toFixed(3)} kg/m</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Weight per Bar</span><span className="font-bold">{wPerBar.toFixed(1)} kg</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Weight</span><span className="font-bold">{formatNum(totalKg)} kg</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Tons</span><span className="font-bold">{totalTons.toFixed(2)} t</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 11. Painting Estimator ── */
function PaintingTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [roomL, setRoomL] = useState('6');
  const [roomW, setRoomW] = useState('4');
  const [roomH, setRoomH] = useState('3');
  const [doors, setDoors] = useState('2');
  const [windows, setWindows] = useState('3');
  const [coats, setCoats] = useState('2');
  const [coverage, setCoverage] = useState('10');
  const [paintPrice, setPaintPrice] = useState('8');

  const RL = Number(roomL) || 0;
  const RW = Number(roomW) || 0;
  const RH = Number(roomH) || 0;
  const wallArea = 2 * RH * (RL + RW);
  const ceilArea = RL * RW;
  const doorArea = (Number(doors)||0) * 2.1 * 0.9;
  const winArea = (Number(windows)||0) * 1.5 * 1.2;
  const netArea = wallArea + ceilArea - doorArea - winArea;
  const paintLiters = (netArea * (Number(coats)||0)) / (Number(coverage)||10);
  const totalCost = paintLiters * (Number(paintPrice)||0);

  const push = () => {
    addMaterialItem(pid, { name: 'Interior Paint', category: 'Finishing', unit: 'liters', quantityRequired: Math.ceil(paintLiters), totalCost: Math.round(totalCost), specification: `${coats} coats, ${formatNum(netArea)} m² net area` });
    addCostItem(pid, { description: 'Painting – Interior', category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Painting Input">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Room L (m)</label><input type="number" value={roomL} onChange={e=>setRoomL(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Room W (m)</label><input type="number" value={roomW} onChange={e=>setRoomW(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><input type="number" value={roomH} onChange={e=>setRoomH(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Doors (2.1×0.9m)</label><input type="number" value={doors} onChange={e=>setDoors(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Windows (1.5×1.2m)</label><input type="number" value={windows} onChange={e=>setWindows(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Coats</label><input type="number" value={coats} onChange={e=>setCoats(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Coverage (m²/L)</label><input type="number" value={coverage} onChange={e=>setCoverage(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div className="col-span-2"><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Price per Liter ($)</label><input type="number" step="0.1" value={paintPrice} onChange={e=>setPaintPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Gross Wall + Ceiling</span><span className="font-bold">{formatNum(wallArea + ceilArea)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Openings Deduction</span><span className="font-bold">-{formatNum(doorArea + winArea)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Net Paint Area</span><span className="font-bold">{formatNum(netArea)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Paint Required</span><span className="font-bold">{paintLiters.toFixed(1)} L</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 12. Masonry / Blockwork ── */
function MasonryTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [wallL, setWallL] = useState('10');
  const [wallH, setWallH] = useState('3');
  const [wallT, setWallT] = useState('0.2');
  const [blockL, setBlockL] = useState('0.4');
  const [blockH, setBlockH] = useState('0.2');
  const [joint, setJoint] = useState('0.01');
  const [blockPrice, setBlockPrice] = useState('1.5');
  const [cementBagPrice, setCementBagPrice] = useState('7');
  const [sandPrice, setSandPrice] = useState('20');

  const L = Number(wallL) || 0;
  const Hgt = Number(wallH) || 0;
  const T = Number(wallT) || 0.2;
  const bl = Number(blockL) || 0.4;
  const bh = Number(blockH) || 0.2;
  const jt = Number(joint) || 0.01;
  const wallArea = L * Hgt;
  const blockArea = (bl + jt) * (bh + jt);
  const blocks = Math.ceil(wallArea / blockArea);
  const volMortar = wallArea * T - blocks * (bl * bh * T);
  const cementBags = Math.ceil(volMortar * 7.5);
  const sandM3 = volMortar * 1.2;
  const materialCost = blocks * (Number(blockPrice)||0) + cementBags * (Number(cementBagPrice)||0) + sandM3 * (Number(sandPrice)||0);

  const push = () => {
    addMaterialItem(pid, { name: 'Concrete Blocks', category: 'Cement', unit: 'nos', quantityRequired: blocks, totalCost: blocks * (Number(blockPrice)||0), specification: `${bl*1000}×${bh*1000}×${T*1000}mm` });
    addMaterialItem(pid, { name: 'Cement (Mortar)', category: 'Cement', unit: 'bags', quantityRequired: cementBags, totalCost: cementBags * (Number(cementBagPrice)||0) });
    addMaterialItem(pid, { name: 'Sand (Mortar)', category: 'Cement', unit: 'm³', quantityRequired: Math.ceil(sandM3*10)/10, totalCost: Math.round(sandM3 * (Number(sandPrice)||0)) });
    addCostItem(pid, { description: 'Masonry Blockwork', category: 'Materials', estimatedCost: Math.round(materialCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Blockwork Input">
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide">Wall</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><input type="number" value={wallL} onChange={e=>setWallL(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><input type="number" value={wallH} onChange={e=>setWallH(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Thickness (m)</label><input type="number" step="0.01" value={wallT} onChange={e=>setWallT(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Block / Mortar</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Block L (m)</label><input type="number" step="0.01" value={blockL} onChange={e=>setBlockL(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Block H (m)</label><input type="number" step="0.01" value={blockH} onChange={e=>setBlockH(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Joint (m)</label><input type="number" step="0.005" value={joint} onChange={e=>setJoint(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Unit Prices</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Block ($/no)</label><input type="number" step="0.1" value={blockPrice} onChange={e=>setBlockPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cement ($/bag)</label><input type="number" step="0.5" value={cementBagPrice} onChange={e=>setCementBagPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Sand ($/m³)</label><input type="number" step="1" value={sandPrice} onChange={e=>setSandPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Wall Area</span><span className="font-bold">{formatNum(wallArea)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Blocks Required</span><span className="font-bold">{blocks} nos</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Mortar Volume</span><span className="font-bold">{volMortar.toFixed(2)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Cement (bags)</span><span className="font-bold">{cementBags} bags</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Sand Required</span><span className="font-bold">{sandM3.toFixed(1)} m³</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Material Cost</span><span className="font-bold text-[#2563EB]">${formatNum(materialCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 13. Piping / Plumbing ── */
function PipingTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [pipeL, setPipeL] = useState('50');
  const [pipeOD, setPipeOD] = useState('0.15');
  const [pipeWT, setPipeWT] = useState('0.005');
  const [pipeDensity, setPipeDensity] = useState('7850');
  const [pipePrice, setPipePrice] = useState('25');
  const [encase, setEncase] = useState('0');

  const L = Number(pipeL) || 0;
  const OD = Number(pipeOD) || 0.15;
  const t = Number(pipeWT) || 0.005;
  const ID = OD - 2 * t;
  const volInternal = Math.PI * (ID/2)**2 * L;
  const volSteel = Math.PI * ((OD/2)**2 - (ID/2)**2) * L;
  const weight = volSteel * (Number(pipeDensity)||7850);
  const encaseV = (Number(encase)||0) > 0 ? L * (Number(encase)||0) : 0;
  const totalCost = L * (Number(pipePrice)||0) + encaseV * 80;

  const push = () => {
    addMaterialItem(pid, { name: `Pipe Ø${(OD*1000).toFixed(0)}mm`, category: 'Steel', unit: 'm', quantityRequired: Math.ceil(L), totalCost: Math.round(L * Number(pipePrice)||0), specification: `ID ${(ID*1000).toFixed(0)}mm, wt ${(t*1000).toFixed(0)}mm, ${weight.toFixed(0)}kg` });
    if (encaseV > 0) {
      addMaterialItem(pid, { name: 'Concrete Encasement', category: 'Cement', unit: 'm³', quantityRequired: Math.ceil(encaseV*10)/10, totalCost: Math.round(encaseV * 80) });
    }
    addCostItem(pid, { description: `Piping Ø${(OD*1000).toFixed(0)}mm × ${L}m`, category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Pipe Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Pipe Length (m)</label><input type="number" value={pipeL} onChange={e=>setPipeL(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Outer Dia (m)</label><input type="number" step="0.01" value={pipeOD} onChange={e=>setPipeOD(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Wall Thick (m)</label><input type="number" step="0.001" value={pipeWT} onChange={e=>setPipeWT(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Density (kg/m³)</label><select value={pipeDensity} onChange={e=>setPipeDensity(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">{[['7850','Steel'],['2700','Aluminum'],['950','PVC'],['930','HDPE']].map(([v,l]) => <option key={v} value={v}>{l} ({v})</option>)}</select></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Price per m ($)</label><input type="number" step="1" value={pipePrice} onChange={e=>setPipePrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Encase Width (m, 0=no)</label><input type="number" step="0.1" value={encase} onChange={e=>setEncase(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Internal Volume</span><span className="font-bold">{volInternal.toFixed(2)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Pipe Weight</span><span className="font-bold">{weight.toFixed(0)} kg</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Weight per m</span><span className="font-bold">{(weight/L||0).toFixed(1)} kg/m</span></div>
          {encaseV > 0 && <div className="flex justify-between text-xs"><span className="text-[#64748B]">Concrete Encase</span><span className="font-bold">{encaseV.toFixed(2)} m³</span></div>}
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 14. Roofing Estimator ── */
function RoofingTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [roofL, setRoofL] = useState('15');
  const [roofW, setRoofW] = useState('10');
  const [pitch, setPitch] = useState('30');
  const [overhang, setOverhang] = useState('0.3');
  const [bundCover, setBundCover] = useState('3.3');
  const [bundPrice, setBundPrice] = useState('35');
  const [felt, setFelt] = useState('0');
  const [feltPrice, setFeltPrice] = useState('0.5');

  const L = Number(roofL) || 0;
  const W = Number(roofW) || 0;
  const P = Number(pitch) || 30;
  const OH = Number(overhang) || 0;
  const slopeFactor = 1 / Math.cos(P * Math.PI / 180);
  const planArea = (L + 2*OH) * (W + 2*OH);
  const slopeArea = planArea * slopeFactor;
  const bundles = Math.ceil(slopeArea / (Number(bundCover)||3.3));
  const feltM2 = (Number(felt)||0) > 0 ? slopeArea * 1.1 : 0;
  const totalCost = bundles * (Number(bundPrice)||0) + feltM2 * (Number(feltPrice)||0);

  const push = () => {
    addMaterialItem(pid, { name: 'Roof Shingles', category: 'Cement', unit: 'bundles', quantityRequired: bundles, totalCost: bundles * (Number(bundPrice)||0), specification: `${bundles} bundles covers ${formatNum(slopeArea)} m² at ${pitch}° pitch` });
    if (feltM2 > 0) {
      addMaterialItem(pid, { name: 'Underlayment Felt', category: 'Finishing', unit: 'm²', quantityRequired: Math.ceil(feltM2), totalCost: Math.round(feltM2 * (Number(feltPrice)||0)) });
    }
    addCostItem(pid, { description: 'Roofing Materials', category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Roof Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><input type="number" value={roofL} onChange={e=>setRoofL(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><input type="number" value={roofW} onChange={e=>setRoofW(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Pitch (°)</label><input type="number" value={pitch} onChange={e=>setPitch(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Overhang (m)</label><input type="number" step="0.1" value={overhang} onChange={e=>setOverhang(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Bundle Cover (m²)</label><input type="number" step="0.1" value={bundCover} onChange={e=>setBundCover(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Price/Bundle ($)</label><input type="number" step="1" value={bundPrice} onChange={e=>setBundPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Felt? (0=no)</label><input type="number" step="1" value={felt} onChange={e=>setFelt(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Felt $/m²</label><input type="number" step="0.1" value={feltPrice} onChange={e=>setFeltPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Plan Area</span><span className="font-bold">{formatNum(planArea)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Slope Area</span><span className="font-bold">{formatNum(slopeArea)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Shingle Bundles</span><span className="font-bold">{bundles}</span></div>
          {feltM2 > 0 && <div className="flex justify-between text-xs"><span className="text-[#64748B]">Felt Required</span><span className="font-bold">{Math.ceil(feltM2)} m²</span></div>}
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 15. Compaction / Backfill ── */
function CompactionTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [trenchL, setTrenchL] = useState('30');
  const [trenchW, setTrenchW] = useState('1');
  const [trenchD, setTrenchD] = useState('1.5');
  const [swellPct, setSwellPct] = useState('25');
  const [compactPct, setCompactPct] = useState('90');
  const [fillCost, setFillCost] = useState('18');
  const [laborRate, setLaborRate] = useState('5');

  const L = Number(trenchL) || 0;
  const W = Number(trenchW) || 0;
  const D = Number(trenchD) || 0;
  const bankVol = L * W * D;
  const swell = bankVol * ((Number(swellPct)||0)/100);
  const looseVol = bankVol + swell;
  const compactedVol = bankVol * ((Number(compactPct)||0)/100);
  const fillRequired = compactedVol * 1.05;
  const materialCost = fillRequired * (Number(fillCost)||0);
  const laborCost = compactedVol * (Number(laborRate)||0);
  const totalCost = materialCost + laborCost;

  const push = () => {
    addMaterialItem(pid, { name: 'Granular Fill Material', category: 'Cement', unit: 'm³', quantityRequired: Math.ceil(fillRequired), totalCost: Math.round(materialCost), specification: `Trench ${L}m×${W}m×${D}m, ${compactPct}% compaction` });
    addCostItem(pid, { description: 'Trench Compaction / Backfill', category: 'Materials', estimatedCost: Math.round(materialCost) });
    addCostItem(pid, { description: 'Compaction Labor', category: 'Labor', estimatedCost: Math.round(laborCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Compaction Input">
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide">Trench</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><input type="number" value={trenchL} onChange={e=>setTrenchL(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><input type="number" step="0.1" value={trenchW} onChange={e=>setTrenchW(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Depth (m)</label><input type="number" step="0.1" value={trenchD} onChange={e=>setTrenchD(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Factors & Costs</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Swell %</label><input type="number" value={swellPct} onChange={e=>setSwellPct(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Compaction %</label><input type="number" value={compactPct} onChange={e=>setCompactPct(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Fill $/m³</label><input type="number" step="1" value={fillCost} onChange={e=>setFillCost(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div className="col-span-3"><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Compaction Labor ($/m³)</label><input type="number" step="0.5" value={laborRate} onChange={e=>setLaborRate(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Bank Volume</span><span className="font-bold">{formatNum(bankVol)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Loose Volume</span><span className="font-bold">{formatNum(looseVol)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Compacted Fill Req</span><span className="font-bold">{fillRequired.toFixed(1)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Material Cost</span><span className="font-bold">${formatNum(materialCost)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Labor Cost</span><span className="font-bold">${formatNum(laborCost)}</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 16. Waterproofing / Curing ── */
function WaterproofingTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [concArea, setConcArea] = useState('200');
  const [cureDays, setCureDays] = useState('7');
  const [waterPerM2, setWaterPerM2] = useState('3');
  const [waterCost, setWaterCost] = useState('0.002');
  const [wpArea, setWpArea] = useState('100');
  const [wpCoats, setWpCoats] = useState('2');
  const [wpCoverage, setWpCoverage] = useState('8');
  const [wpPrice, setWpPrice] = useState('12');

  const A = Number(concArea) || 0;
  const D = Number(cureDays) || 7;
  const wRate = Number(waterPerM2) || 3;
  const totalWater = A * D * wRate;
  const cureCost = totalWater * (Number(waterCost)||0);

  const WA = Number(wpArea) || 0;
  const WC = Number(wpCoats) || 2;
  const cov = Number(wpCoverage) || 8;
  const wpLiters = (WA * WC) / cov;
  const wpMatCost = wpLiters * (Number(wpPrice)||0);
  const totalCost = cureCost + wpMatCost;

  const push = () => {
    if (A > 0) {
      addMaterialItem(pid, { name: 'Curing Water', category: 'Cement', unit: 'L', quantityRequired: Math.ceil(totalWater), totalCost: Math.round(cureCost), specification: `${A} m² × ${D} days @ ${wRate} L/m²/day` });
    }
    if (WA > 0) {
      addMaterialItem(pid, { name: 'Waterproofing Membrane', category: 'Finishing', unit: 'L', quantityRequired: Math.ceil(wpLiters), totalCost: Math.round(wpMatCost), specification: `${WC} coats, ${WA} m², coverage ${cov} m²/L` });
    }
    addCostItem(pid, { description: 'Curing + Waterproofing', category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Curing & Waterproofing Input">
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide">Concrete Curing</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Area (m²)</label><input type="number" value={concArea} onChange={e=>setConcArea(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Days</label><input type="number" value={cureDays} onChange={e=>setCureDays(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Water L/m²/d</label><input type="number" step="0.1" value={waterPerM2} onChange={e=>setWaterPerM2(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Waterproofing Membrane</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Area (m²)</label><input type="number" value={wpArea} onChange={e=>setWpArea(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Coats</label><input type="number" value={wpCoats} onChange={e=>setWpCoats(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cov (m²/L)</label><input type="number" step="0.1" value={wpCoverage} onChange={e=>setWpCoverage(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Water Cost ($/L)</label><input type="number" step="0.001" value={waterCost} onChange={e=>setWaterCost(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">WP Price ($/L)</label><input type="number" step="0.5" value={wpPrice} onChange={e=>setWpPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Curing Water Req</span><span className="font-bold">{formatNum(totalWater)} L</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Curing Cost</span><span className="font-bold">${formatNum(cureCost)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">WP Membrane Req</span><span className="font-bold">{wpLiters.toFixed(1)} L</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">WP Material Cost</span><span className="font-bold">${formatNum(wpMatCost)}</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 17. Concrete Mix Design ── */
function MixDesignTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [gradeIdx, setGradeIdx] = useState('2');
  const [volConc, setVolConc] = useState('1');
  const [cementPrice, setCementPrice] = useState('7');
  const [sandPrice, setSandPrice] = useState('20');
  const [aggPrice, setAggPrice] = useState('25');

  const mixes = [
    { name: 'M10', cement: 220, sand: 0.46, agg: 0.92, wc: 0.55 },
    { name: 'M15', cement: 280, sand: 0.42, agg: 0.84, wc: 0.50 },
    { name: 'M20', cement: 320, sand: 0.38, agg: 0.76, wc: 0.45 },
    { name: 'M25', cement: 360, sand: 0.35, agg: 0.70, wc: 0.42 },
    { name: 'M30', cement: 400, sand: 0.32, agg: 0.64, wc: 0.38 },
  ];
  const mix = mixes[Number(gradeIdx)] || mixes[2];
  const V = Number(volConc) || 1;
  const cementBags = Math.ceil(mix.cement * V / 50);
  const sandM3 = mix.sand * V;
  const aggM3 = mix.agg * V;
  const waterL = mix.wc * mix.cement * V;
  const totalCost = cementBags * (Number(cementPrice)||7) + sandM3 * (Number(sandPrice)||20) + aggM3 * (Number(aggPrice)||25);

  const push = () => {
    addMaterialItem(pid, { name: `Cement (${mix.name})`, category: 'Cement', unit: 'bags', quantityRequired: cementBags, totalCost: cementBags * (Number(cementPrice)||7) });
    addMaterialItem(pid, { name: `Sand (${mix.name})`, category: 'Cement', unit: 'm³', quantityRequired: Math.ceil(sandM3*10)/10, totalCost: Math.round(sandM3 * (Number(sandPrice)||20)) });
    addMaterialItem(pid, { name: `Aggregate (${mix.name})`, category: 'Cement', unit: 'm³', quantityRequired: Math.ceil(aggM3*10)/10, totalCost: Math.round(aggM3 * (Number(aggPrice)||25)) });
    addCostItem(pid, { description: `Concrete Mix ${mix.name} – ${V} m³`, category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Mix Design Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Grade</label><select value={gradeIdx} onChange={e=>setGradeIdx(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">{mixes.map((m,i) => <option key={i} value={i}>{m.name} ({m.cement}kg cem)</option>)}</select></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Volume (m³)</label><input type="number" step="0.1" value={volConc} onChange={e=>setVolConc(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cement ($/bag)</label><input type="number" step="0.5" value={cementPrice} onChange={e=>setCementPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Sand ($/m³)</label><input type="number" step="1" value={sandPrice} onChange={e=>setSandPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Aggregate ($/m³)</label><input type="number" step="1" value={aggPrice} onChange={e=>setAggPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Grade</span><span className="font-bold">{mix.name}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Cement</span><span className="font-bold">{cementBags} bags ({mix.cement*V} kg)</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Sand</span><span className="font-bold">{sandM3.toFixed(2)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Aggregate</span><span className="font-bold">{aggM3.toFixed(2)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Water</span><span className="font-bold">{waterL.toFixed(0)} L</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 18. Plastering Estimator ── */
function PlasteringTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [plastL, setPlastL] = useState('10');
  const [plastH, setPlastH] = useState('3');
  const [plastT, setPlastT] = useState('0.012');
  const [mixRatioC, setMixRatioC] = useState('1');
  const [mixRatioS, setMixRatioS] = useState('4');
  const [plastPrice, setPlastPrice] = useState('8');

  const L = Number(plastL) || 0;
  const H = Number(plastH) || 0;
  const T = Number(plastT) || 0.012;
  const area = L * H;
  const volWet = area * T;
  const volDry = volWet * 1.33;
  const totalParts = (Number(mixRatioC)||1) + (Number(mixRatioS)||4);
  const cementVol = volDry * (Number(mixRatioC)||1) / totalParts;
  const sandVol = volDry * (Number(mixRatioS)||4) / totalParts;
  const cementBags = Math.ceil(cementVol / 0.035);
  const totalCost = cementBags * (Number(plastPrice)||8) + sandVol * 20;

  const push = () => {
    addMaterialItem(pid, { name: 'Cement (Plaster)', category: 'Cement', unit: 'bags', quantityRequired: cementBags, totalCost: cementBags * (Number(plastPrice)||8) });
    addMaterialItem(pid, { name: 'Sand (Plaster)', category: 'Cement', unit: 'm³', quantityRequired: Math.ceil(sandVol*20)/20 });
    addCostItem(pid, { description: `Plastering ${formatNum(area)} m²`, category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Plaster Input">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Wall Length (m)</label><input type="number" value={plastL} onChange={e=>setPlastL(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><input type="number" value={plastH} onChange={e=>setPlastH(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Thickness (m)</label><input type="number" step="0.001" value={plastT} onChange={e=>setPlastT(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cement parts</label><input type="number" min="1" value={mixRatioC} onChange={e=>setMixRatioC(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Sand parts</label><input type="number" min="1" value={mixRatioS} onChange={e=>setMixRatioS(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cement ($/bag)</label><input type="number" step="0.5" value={plastPrice} onChange={e=>setPlastPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Plaster Area</span><span className="font-bold">{formatNum(area)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Wet Volume</span><span className="font-bold">{volWet.toFixed(3)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Dry Volume</span><span className="font-bold">{volDry.toFixed(3)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Cement Required</span><span className="font-bold">{cementBags} bags</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Sand Required</span><span className="font-bold">{sandVol.toFixed(2)} m³</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 19. Sloped Excavation (Trapezoidal Trench) ── */
function SlopedExcTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [exL, setExL] = useState('20');
  const [exBw, setExBw] = useState('1');
  const [exD, setExD] = useState('2');
  const [exSlope, setExSlope] = useState('0.5');
  const [exCost, setExCost] = useState('12');

  const L = Number(exL) || 0;
  const Bw = Number(exBw) || 0;
  const D = Number(exD) || 0;
  const S = Number(exSlope) || 0;
  const Bt = Bw + 2 * S * D;
  const vol = L * D * (Bw + Bt) / 2;
  const totalCost = vol * (Number(exCost)||0);

  const push = () => {
    addMaterialItem(pid, { name: 'Excavation (Sloped)', category: 'Cement', unit: 'm³', quantityRequired: Math.ceil(vol), totalCost: Math.round(totalCost), specification: `Trench ${L}m × top ${Bt.toFixed(2)}m × bot ${Bw}m × ${D}m deep` });
    addCostItem(pid, { description: 'Sloped Trench Excavation', category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Sloped Trench Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><input type="number" value={exL} onChange={e=>setExL(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Bottom Width (m)</label><input type="number" step="0.1" value={exBw} onChange={e=>setExBw(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Depth (m)</label><input type="number" step="0.1" value={exD} onChange={e=>setExD(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Slope (H:V)</label><input type="number" step="0.1" value={exSlope} onChange={e=>setExSlope(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div className="col-span-2"><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cost per m³ ($)</label><input type="number" step="1" value={exCost} onChange={e=>setExCost(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Bottom Width</span><span className="font-bold">{Bw} m</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Top Width</span><span className="font-bold">{Bt.toFixed(2)} m</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Excavation Volume</span><span className="font-bold">{formatNum(vol)} m³</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 20. Staircase Layout ── */
function StaircaseTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [floorHt, setFloorHt] = useState('3');
  const [rise, setRise] = useState('0.15');
  const [tread, setTread] = useState('0.3');
  const [stairW, setStairW] = useState('1.2');
  const [slabT, setSlabT] = useState('0.15');
  const [concPrice, setConcPrice] = useState('120');

  const FH = Number(floorHt) || 0;
  const R = Number(rise) || 0.15;
  const T = Number(tread) || 0.3;
  const W = Number(stairW) || 1.2;
  const ST = Number(slabT) || 0.15;
  const steps = Math.ceil(FH / R);
  const actualRise = FH / steps;
  const going = (steps - 1) * T;
  const incline = Math.sqrt(FH*FH + going*going);
  const concVol = incline * W * ST + steps * 0.5 * R * T * W;
  const totalCost = concVol * (Number(concPrice)||0);

  const push = () => {
    addMaterialItem(pid, { name: 'Staircase Concrete', category: 'Cement', unit: 'm³', quantityRequired: Math.ceil(concVol*10)/10, totalCost: Math.round(totalCost), specification: `${steps} steps (${(actualRise*1000).toFixed(0)}mm rise × ${(T*1000).toFixed(0)}mm tread), width ${W}m` });
    addCostItem(pid, { description: 'Staircase Concrete', category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Staircase Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Floor Height (m)</label><input type="number" step="0.05" value={floorHt} onChange={e=>setFloorHt(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Rise (m)</label><input type="number" step="0.005" value={rise} onChange={e=>setRise(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Tread (m)</label><input type="number" step="0.01" value={tread} onChange={e=>setTread(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Stair Width (m)</label><input type="number" step="0.1" value={stairW} onChange={e=>setStairW(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Slab Thick (m)</label><input type="number" step="0.005" value={slabT} onChange={e=>setSlabT(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Concrete ($/m³)</label><input type="number" step="5" value={concPrice} onChange={e=>setConcPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Steps</span><span className="font-bold">{steps}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Actual Rise</span><span className="font-bold">{(actualRise*1000).toFixed(0)} mm</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Going (total)</span><span className="font-bold">{going.toFixed(2)} m</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Incline Length</span><span className="font-bold">{incline.toFixed(2)} m</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Concrete Volume</span><span className="font-bold">{concVol.toFixed(2)} m³</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 21. Water Tank Volume ── */
function WaterTankTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [tankShape, setTankShape] = useState('rect');
  const [rLen, setRLen] = useState('3');
  const [rWid, setRWid] = useState('2');
  const [rHt, setRHt] = useState('1.5');
  const [cDia, setCDia] = useState('2');
  const [cHt2, setCHt2] = useState('2');
  const [tankPrice, setTankPrice] = useState('200');

  const isRect = tankShape === 'rect';
  const rectVol = isRect ? (Number(rLen)||0) * (Number(rWid)||0) * (Number(rHt)||0) : 0;
  const cylVol = !isRect ? Math.PI * ((Number(cDia)||0)/2)**2 * (Number(cHt2)||0) : 0;
  const volM3 = isRect ? rectVol : cylVol;
  const volLiters = volM3 * 1000;
  const totalCost = volM3 * (Number(tankPrice)||0);

  const push = () => {
    addMaterialItem(pid, { name: isRect ? 'Rectangular Water Tank' : 'Cylindrical Water Tank', category: 'Cement', unit: 'm³', quantityRequired: Math.ceil(volM3*10)/10, totalCost: Math.round(totalCost), specification: `Capacity ${formatNum(volLiters)} L (${volM3.toFixed(2)} m³)` });
    addCostItem(pid, { description: `${isRect ? 'Rectangular' : 'Cylindrical'} Water Tank ${volM3.toFixed(1)} m³`, category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Tank Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Shape</label>
            <div className="flex gap-2">
              <button onClick={()=>setTankShape('rect')} className={cls("px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all", tankShape==='rect' ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B]')}>Rectangular</button>
              <button onClick={()=>setTankShape('cyl')} className={cls("px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all", tankShape==='cyl' ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B]')}>Cylindrical</button>
            </div>
          </div>
          {isRect ? (
            <div className="grid grid-cols-3 gap-1">
              <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><input type="number" value={rLen} onChange={e=>setRLen(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
              <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><input type="number" value={rWid} onChange={e=>setRWid(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
              <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><input type="number" value={rHt} onChange={e=>setRHt(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Diameter (m)</label><input type="number" step="0.1" value={cDia} onChange={e=>setCDia(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
              <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><input type="number" value={cHt2} onChange={e=>setCHt2(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            </div>
          )}
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cost per m³ ($)</label><input type="number" step="10" value={tankPrice} onChange={e=>setTankPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Volume</span><span className="font-bold">{volM3.toFixed(2)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Capacity</span><span className="font-bold">{formatNum(volLiters)} L ({formatNum(volLiters/1000)} kL)</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 22. Fencing / Boundary Wall ── */
function FencingTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [fenceL, setFenceL] = useState('50');
  const [postSpacing, setPostSpacing] = useState('2.5');
  const [fenceH, setFenceH] = useState('1.8');
  const [railsPerSpan, setRailsPerSpan] = useState('3');
  const [postPrice, setPostPrice] = useState('15');
  const [railPrice, setRailPrice] = useState('8');
  const [concretePost, setConcretePost] = useState('5');

  const L = Number(fenceL) || 0;
  const PS = Number(postSpacing) || 2.5;
  const FH = Number(fenceH) || 1.8;
  const posts = Math.ceil(L / PS) + 1;
  const spans = posts - 1;
  const rails = spans * (Number(railsPerSpan)||3);
  const postConc = posts * (Number(concretePost)||5);
  const totalCost = posts * (Number(postPrice)||15) + rails * (Number(railPrice)||8) + postConc * 7;
  const wireLen = 2 * (L * (Math.ceil(FH / 0.3) + 1));

  const push = () => {
    addMaterialItem(pid, { name: 'Fence Posts', category: 'Steel', unit: 'nos', quantityRequired: posts, totalCost: posts * (Number(postPrice)||15), specification: `@ ${PS}m spacing` });
    addMaterialItem(pid, { name: 'Fence Rails', category: 'Steel', unit: 'nos', quantityRequired: rails, totalCost: rails * (Number(railPrice)||8) });
    addMaterialItem(pid, { name: 'Post Concrete', category: 'Cement', unit: 'bags', quantityRequired: Math.ceil(postConc), totalCost: Math.round(postConc * 7) });
    addCostItem(pid, { description: `Fencing ${L}m × ${FH}m`, category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Fencing Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Fence Length (m)</label><input type="number" value={fenceL} onChange={e=>setFenceL(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Post Spacing (m)</label><input type="number" step="0.1" value={postSpacing} onChange={e=>setPostSpacing(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><input type="number" step="0.1" value={fenceH} onChange={e=>setFenceH(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Rails per Span</label><input type="number" value={railsPerSpan} onChange={e=>setRailsPerSpan(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Post Price ($)</label><input type="number" step="1" value={postPrice} onChange={e=>setPostPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Rail Price ($)</label><input type="number" step="1" value={railPrice} onChange={e=>setRailPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cement Post (bags)</label><input type="number" step="0.5" value={concretePost} onChange={e=>setConcretePost(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Posts</span><span className="font-bold">{posts}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Rails</span><span className="font-bold">{rails}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Barbed Wire (~)</span><span className="font-bold">{Math.ceil(wireLen)} m</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Post Concrete</span><span className="font-bold">{postConc.toFixed(1)} bags</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 23. Floor Screed ── */
function ScreedTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [screedL, setScreedL] = useState('8');
  const [screedW, setScreedW] = useState('6');
  const [screedT, setScreedT] = useState('0.05');
  const [screedRatio, setScreedRatio] = useState('1:4');
  const [screedCemPrice, setScreedCemPrice] = useState('7');
  const [screedSandPrice, setScreedSandPrice] = useState('20');

  const SL = Number(screedL) || 0;
  const SW = Number(screedW) || 0;
  const ST = Number(screedT) || 0.05;
  const area = SL * SW;
  const volWet = area * ST;
  const volDry = volWet * 1.33;
  const [cParts, sParts] = screedRatio.split(':').map(Number);
  const total = cParts + sParts;
  const cemVol = volDry * cParts / total;
  const sandVol = volDry * sParts / total;
  const cemBags = Math.ceil(cemVol / 0.035);
  const totalCost = cemBags * (Number(screedCemPrice)||7) + sandVol * (Number(screedSandPrice)||20);

  const push = () => {
    addMaterialItem(pid, { name: 'Cement (Screed)', category: 'Cement', unit: 'bags', quantityRequired: cemBags, totalCost: cemBags * (Number(screedCemPrice)||7) });
    addMaterialItem(pid, { name: 'Sand (Screed)', category: 'Cement', unit: 'm³', quantityRequired: Math.ceil(sandVol*20)/20 });
    addCostItem(pid, { description: `Floor Screed ${formatNum(area)} m²`, category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Screed Input">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><input type="number" value={screedL} onChange={e=>setScreedL(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><input type="number" value={screedW} onChange={e=>setScreedW(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Thickness (m)</label><input type="number" step="0.005" value={screedT} onChange={e=>setScreedT(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Mix Ratio</label><select value={screedRatio} onChange={e=>setScreedRatio(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">{['1:3','1:4','1:5','1:6'].map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cement ($/bag)</label><input type="number" step="0.5" value={screedCemPrice} onChange={e=>setScreedCemPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Sand ($/m³)</label><input type="number" step="1" value={screedSandPrice} onChange={e=>setScreedSandPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Screed Area</span><span className="font-bold">{formatNum(area)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Wet Volume</span><span className="font-bold">{volWet.toFixed(3)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Dry Volume</span><span className="font-bold">{volDry.toFixed(3)} m³</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Cement</span><span className="font-bold">{cemBags} bags</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Sand</span><span className="font-bold">{sandVol.toFixed(2)} m³</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          <button onClick={push} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer mt-2">
            <Send className="w-3.5 h-3.5" /> Push to Materials + Costs
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── 24. Formwork Contact Area ── */
function FormworkAreaTab() {
  const { state, addMaterialItem, addCostItem } = useCollab();
  const pid = state.currentProjectId || 'default';
  const [fsLab, setFSLab] = useState('5');
  const [fsWid, setFSWid] = useState('4');
  const [fsEdge, setFSEdge] = useState('0.15');
  const [fbLen, setFBLen] = useState('3');
  const [fbWid2, setFBWid2] = useState('0.3');
  const [fbDep2, setFBDep2] = useState('0.45');
  const [fcWid2, setFCWid2] = useState('0.3');
  const [fcDep2, setFCDep2] = useState('0.3');
  const [fcHt2, setFCHt2] = useState('3');
  const [wallLen, setWallLen] = useState('10');
  const [wallHt, setWallHt] = useState('3');
  const [formPrice, setFormPrice] = useState('25');

  const slabCA = (Number(fsLab)||0) * (Number(fsWid)||0) + 2 * (Number(fsLab)||0 + Number(fsWid)||0) * (Number(fsEdge)||0);
  const beamCA = (Number(fbLen)||0) * (Number(fbWid2)||0 + 2 * (Number(fbDep2)||0));
  const colCA = 2 * (Number(fcWid2)||0 + Number(fcDep2)||0) * (Number(fcHt2)||0);
  const wallCA = 2 * (Number(wallLen)||0) * (Number(wallHt)||0);
  const totalCA = slabCA + beamCA + colCA + wallCA;
  const totalCost = totalCA * (Number(formPrice)||0);

  const push = () => {
    addMaterialItem(pid, { name: 'Formwork (Contact Area)', category: 'Steel', unit: 'm²', quantityRequired: Math.ceil(totalCA), totalCost: Math.round(totalCost), specification: `Slab ${slabCA.toFixed(1)} + Beam ${beamCA.toFixed(1)} + Column ${colCA.toFixed(1)} + Wall ${wallCA.toFixed(1)} m²` });
    addCostItem(pid, { description: 'Formwork Contact Area Total', category: 'Materials', estimatedCost: Math.round(totalCost) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Contact Area Inputs">
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide">Slab Soffit + Edge</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><input type="number" value={fsLab} onChange={e=>setFSLab(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><input type="number" value={fsWid} onChange={e=>setFSWid(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Edge Ht (m)</label><input type="number" step="0.01" value={fsEdge} onChange={e=>setFSEdge(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Beam (sides + soffit)</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><input type="number" value={fbLen} onChange={e=>setFBLen(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><input type="number" step="0.01" value={fbWid2} onChange={e=>setFBWid2(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Depth (m)</label><input type="number" step="0.01" value={fbDep2} onChange={e=>setFBDep2(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Column (all sides)</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><input type="number" step="0.01" value={fcWid2} onChange={e=>setFCWid2(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Depth (m)</label><input type="number" step="0.01" value={fcDep2} onChange={e=>setFCDep2(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><input type="number" value={fcHt2} onChange={e=>setFCHt2(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Wall (both sides)</p>
          <div className="grid grid-cols-2 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><input type="number" value={wallLen} onChange={e=>setWallLen(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><input type="number" value={wallHt} onChange={e=>setWallHt(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
          </div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Formwork Price ($/m²)</label><input type="number" step="1" value={formPrice} onChange={e=>setFormPrice(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-[#2563EB]" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Slab CA</span><span className="font-bold">{slabCA.toFixed(1)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Beam CA</span><span className="font-bold">{beamCA.toFixed(1)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Column CA</span><span className="font-bold">{colCA.toFixed(1)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Wall CA</span><span className="font-bold">{wallCA.toFixed(1)} m²</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B] font-bold">Total Contact Area</span><span className="font-bold">{totalCA.toFixed(1)} m²</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
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
      case 'concreteVol': return <ConcreteVolTab />;
      case 'rebarWeight': return <RebarWeightTab />;
      case 'painting': return <PaintingTab />;
      case 'masonry': return <MasonryTab />;
      case 'piping': return <PipingTab />;
      case 'roofing': return <RoofingTab />;
      case 'compaction': return <CompactionTab />;
      case 'waterproofing': return <WaterproofingTab />;
      case 'mixDesign': return <MixDesignTab />;
      case 'plastering': return <PlasteringTab />;
      case 'slopedExc': return <SlopedExcTab />;
      case 'staircase': return <StaircaseTab />;
      case 'waterTank': return <WaterTankTab />;
      case 'fencing': return <FencingTab />;
      case 'screed': return <ScreedTab />;
      case 'formworkArea': return <FormworkAreaTab />;
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
