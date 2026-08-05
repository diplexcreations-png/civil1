import { useState } from 'react';
import { HardHat, Calculator, Ruler, Weight, Truck, Wrench, Layers, Grid, Droplets, Hash, Paintbrush, LayoutGrid, GitFork, Home, Hammer, Shield, Shovel, SprayCan, Triangle, ArrowUpDown, Container, Fence, LayoutPanelTop, Layers3 } from 'lucide-react';
import { Card, cls, formatNum } from '../components/shared';
import { NumericInput } from '../components/NumericInput';

/* ΓöÇΓöÇ Tab definitions ΓöÇΓöÇ */
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

/* ΓöÇΓöÇ Helpers ΓöÇΓöÇ */
function calcItem(key: string) { return `calc_${key}_${Date.now()}`; }

/* ΓöÇΓöÇ 1. Earthwork Cut-Fill ΓöÇΓöÇ */
function EarthworkTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Grid Method Cut-Fill">
        <div className="space-y-2">
          {[
            { label: 'Length (m)', val: length, set: setLength },
            { label: 'Width (m)', val: width, set: setWidth },
            { label: 'Avg Depth (m)', val: depth, set: setDepth },
            { label: 'Swell Factor %', val: swell, set: setSwell },
            { label: 'Cost per m┬│ ($)', val: unitCost, set: setUnitCost },
          ].map(f => (
            <div key={f.label}>
              <label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">{f.label}</label>
              <NumericInput value={f.val} onChange={f.set}
                variant="wsMd" />
            </div>
          ))}
        </div>
      </Card>
      <div>
        <Card title="Results">
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span className="text-[#64748B]">Bank Volume</span><span className="font-bold">{formatNum(bankVol)} m┬│</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#64748B]">Loose Volume</span><span className="font-bold">{formatNum(looseVol)} m┬│</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#64748B]">Estimated Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
            
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ΓöÇΓöÇ 2. Formwork Estimator ΓöÇΓöÇ */
function FormworkTab() {
  const [slabArea, setSlabArea] = useState('100');
  const [slabThick, setSlabThick] = useState('0.15');
  const [height, setHeight] = useState('3');

  const A = Number(slabArea) || 0;
  const T = Number(slabThick) || 0.15;
  const H = Number(height) || 3;
  const plywoodSheets = Math.ceil(A / 2.976); // standard 2440├ù1220mm sheet
  const props = Math.ceil(A * 1.5);
  const beams = Math.ceil(A * 0.4); // runner beams in lm
  const totalCost = plywoodSheets * 35 + props * 8 + beams * 12;

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Slab Formwork Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Slab Area (m┬▓)</label><NumericInput value={slabArea} onChange={setSlabArea} variant="wsMd" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Slab Thickness (m)</label><NumericInput step="0.01" value={slabThick} onChange={setSlabThick} variant="wsMd" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height to soffit (m)</label><NumericInput value={height} onChange={setHeight} variant="wsMd" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Plywood Sheets</span><span className="font-bold">{plywoodSheets} nos</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Steel Props</span><span className="font-bold">{props} nos</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Runner Beams</span><span className="font-bold">{beams} lm</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 3. Asphalt / Paving ΓöÇΓöÇ */
function AsphaltTab() {
  const [area, setArea] = useState('500');
  const [thick, setThick] = useState('0.05');
  const [density, setDensity] = useState('2.4');
  const [costPerTon, setCostPerTon] = useState('120');

  const A = Number(area) || 0;
  const T = Number(thick) || 0;
  const D = Number(density) || 2.4;
  const tons = A * T * D;
  const totalCost = tons * (Number(costPerTon) || 0);

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Asphalt Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Area (m┬▓)</label><NumericInput value={area} onChange={setArea} variant="wsMd" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Thickness (m)</label><NumericInput step="0.01" value={thick} onChange={setThick} variant="wsMd" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Density (t/m┬│)</label><NumericInput step="0.1" value={density} onChange={setDensity} variant="wsMd" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cost per ton ($)</label><NumericInput value={costPerTon} onChange={setCostPerTon} variant="wsMd" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Asphalt Required</span><span className="font-bold">{formatNum(tons)} tons</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 4. Labor Productivity ΓöÇΓöÇ */
function LaborTab() {
  const [workers, setWorkers] = useState('10');
  const [days, setDays] = useState('5');
  const [rate, setRate] = useState('150');
  const [activity, setActivity] = useState('Concrete Pouring');

  const W = Number(workers) || 0;
  const D = Number(days) || 0;
  const laborCost = W * D * (Number(rate) || 0);

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Labor Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Activity</label><input type="text" value={activity} onChange={e => setActivity(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Number of Workers</label><NumericInput value={workers} onChange={setWorkers} variant="wsMd" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Days</label><NumericInput value={days} onChange={setDays} variant="wsMd" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Daily Rate per Worker ($)</label><NumericInput value={rate} onChange={setRate} variant="wsMd" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Worker-Days</span><span className="font-bold">{W * D}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Labor Cost</span><span className="font-bold text-[#2563EB]">${formatNum(laborCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 5. Equipment Hourly Cost ΓöÇΓöÇ */
function EquipmentTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Equipment Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Equipment Name</label><input type="text" value={equipName} onChange={e => setEquipName(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2563EB]" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Purchase Price ($)</label><NumericInput value={purchasePrice} onChange={setPurchasePrice} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Salvage Value ($)</label><NumericInput value={salvage} onChange={setSalvage} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Life (years)</label><NumericInput value={lifeYears} onChange={setLifeYears} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Hours/year</label><NumericInput value={hoursYear} onChange={setHoursYear} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Fuel ($/hr)</label><NumericInput value={fuel} onChange={setFuel} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Maint ($/hr)</label><NumericInput value={maintenance} onChange={setMaintenance} variant="ws" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Depreciation</span><span className="font-bold">${formatNum(depr)}/hr</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Fuel + Maint</span><span className="font-bold">${formatNum(fuelCost + maintCost)}/hr</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Hourly Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalHourly)}/hr</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Annual Cost</span><span className="font-bold">${formatNum(annualCost)}/yr</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 6. Scaffolding Quantity ΓöÇΓöÇ */
function ScaffoldingTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Scaffold Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><NumericInput value={scaffLength} onChange={setScaffLength} variant="wsMd" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><NumericInput value={scaffHeight} onChange={setScaffHeight} variant="wsMd" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><NumericInput step="0.1" value={scaffWidth} onChange={setScaffWidth} variant="wsMd" /></div>
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
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 7. Tile / Floor Finishing ΓöÇΓöÇ */
function TileTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Tile Input">
        <div className="space-y-2">
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Room Length (m)</label><NumericInput value={roomLength} onChange={setRoomLength} variant="wsMd" /></div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Room Width (m)</label><NumericInput value={roomWidth} onChange={setRoomWidth} variant="wsMd" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Tile Size (m)</label><NumericInput step="0.1" value={tileSize} onChange={setTileSize} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Wastage %</label><NumericInput value={wastage} onChange={setWastage} variant="ws" /></div>
            <div className="col-span-2"><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cost per Tile ($)</label><NumericInput value={tileCost} onChange={setTileCost} variant="wsMd" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Floor Area</span><span className="font-bold">{formatNum(area)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Tiles Needed (net)</span><span className="font-bold">{tilesNet}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Tiles + Wastage</span><span className="font-bold">{tilesTotal} ({wastage}%)</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Material Cost</span><span className="font-bold text-[#2563EB]">${formatNum(materialCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 8. Lap Length / Splice ΓöÇΓöÇ */
function LapTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Rebar Splice Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Bar Diameter (mm)</label><NumericInput value={barDiam} onChange={setBarDiam} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Steel Grade (fy)</label><select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">{['250', '415', '500', '550'].map(g => <option key={g} value={g}>Fe{g}</option>)}</select></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Concrete Grade</label><select value={concreteGrade} onChange={e => setConcreteGrade(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">{['20', '25', '30', '35', '40'].map(g => <option key={g} value={g}>M{g}</option>)}</select></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Total Bars</label><NumericInput value={bars} onChange={setBars} variant="ws" /></div>
          </div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Bar Length (m)</label><NumericInput value={barLength} onChange={setBarLength} variant="wsMd" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Development Length Ld</span><span className="font-bold">{ld} mm</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Laps per Bar</span><span className="font-bold">{lapsPerBar}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Extra Steel</span><span className="font-bold">{extraSteelKg} kg</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Extra Cost</span><span className="font-bold text-[#2563EB]">${formatNum(extraCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 9. Concrete Volume (slab / beam / column / cylinder) ΓöÇΓöÇ */
function ConcreteVolTab() {
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

  

  const Inp = (l:string,v:string,s:(x:string)=>void,p?:string) => (
    <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">{l}</label><NumericInput step={p||'0.01'} value={v} onChange={s} variant="ws" /></div>
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
          <div className="mt-1">{Inp('Concrete Unit Price ($/m┬│)',unitPrice,setUnitPrice,'1')}</div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Slab Volume</span><span className="font-bold">{formatNum(slabV)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Beam Volume</span><span className="font-bold">{formatNum(beamV)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Column Volume</span><span className="font-bold">{formatNum(colV)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Cylinder Volume</span><span className="font-bold">{formatNum(cylV)} m┬│</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B] font-bold">Total Volume</span><span className="font-bold">{formatNum(totalV)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 10. Rebar Weight Calculator ΓöÇΓöÇ */
function RebarWeightTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Rebar Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Diameter (mm)</label><NumericInput value={diam} onChange={setDiam} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Bar Length (m)</label><NumericInput value={barLen} onChange={setBarLen} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Number of Bars</label><NumericInput value={qty} onChange={setQty} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Price ($/kg)</label><NumericInput step="0.01" value={priceKg} onChange={setPriceKg} variant="ws" /></div>
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
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 11. Painting Estimator ΓöÇΓöÇ */
function PaintingTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Painting Input">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Room L (m)</label><NumericInput value={roomL} onChange={setRoomL} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Room W (m)</label><NumericInput value={roomW} onChange={setRoomW} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><NumericInput value={roomH} onChange={setRoomH} variant="ws" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Doors (2.1├ù0.9m)</label><NumericInput value={doors} onChange={setDoors} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Windows (1.5├ù1.2m)</label><NumericInput value={windows} onChange={setWindows} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Coats</label><NumericInput value={coats} onChange={setCoats} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Coverage (m┬▓/L)</label><NumericInput value={coverage} onChange={setCoverage} variant="ws" /></div>
            <div className="col-span-2"><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Price per Liter ($)</label><NumericInput step="0.1" value={paintPrice} onChange={setPaintPrice} variant="ws" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Gross Wall + Ceiling</span><span className="font-bold">{formatNum(wallArea + ceilArea)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Openings Deduction</span><span className="font-bold">-{formatNum(doorArea + winArea)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Net Paint Area</span><span className="font-bold">{formatNum(netArea)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Paint Required</span><span className="font-bold">{paintLiters.toFixed(1)} L</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 12. Masonry / Blockwork ΓöÇΓöÇ */
function MasonryTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Blockwork Input">
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide">Wall</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><NumericInput value={wallL} onChange={setWallL} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><NumericInput value={wallH} onChange={setWallH} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Thickness (m)</label><NumericInput step="0.01" value={wallT} onChange={setWallT} variant="ws" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Block / Mortar</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Block L (m)</label><NumericInput step="0.01" value={blockL} onChange={setBlockL} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Block H (m)</label><NumericInput step="0.01" value={blockH} onChange={setBlockH} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Joint (m)</label><NumericInput step="0.005" value={joint} onChange={setJoint} variant="ws" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Unit Prices</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Block ($/no)</label><NumericInput step="0.1" value={blockPrice} onChange={setBlockPrice} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cement ($/bag)</label><NumericInput step="0.5" value={cementBagPrice} onChange={setCementBagPrice} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Sand ($/m┬│)</label><NumericInput step="1" value={sandPrice} onChange={setSandPrice} variant="ws" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Wall Area</span><span className="font-bold">{formatNum(wallArea)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Blocks Required</span><span className="font-bold">{blocks} nos</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Mortar Volume</span><span className="font-bold">{volMortar.toFixed(2)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Cement (bags)</span><span className="font-bold">{cementBags} bags</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Sand Required</span><span className="font-bold">{sandM3.toFixed(1)} m┬│</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Material Cost</span><span className="font-bold text-[#2563EB]">${formatNum(materialCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 13. Piping / Plumbing ΓöÇΓöÇ */
function PipingTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Pipe Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Pipe Length (m)</label><NumericInput value={pipeL} onChange={setPipeL} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Outer Dia (m)</label><NumericInput step="0.01" value={pipeOD} onChange={setPipeOD} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Wall Thick (m)</label><NumericInput step="0.001" value={pipeWT} onChange={setPipeWT} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Density (kg/m┬│)</label><select value={pipeDensity} onChange={e=>setPipeDensity(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">{[['7850','Steel'],['2700','Aluminum'],['950','PVC'],['930','HDPE']].map(([v,l]) => <option key={v} value={v}>{l} ({v})</option>)}</select></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Price per m ($)</label><NumericInput step="1" value={pipePrice} onChange={setPipePrice} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Encase Width (m, 0=no)</label><NumericInput step="0.1" value={encase} onChange={setEncase} variant="ws" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Internal Volume</span><span className="font-bold">{volInternal.toFixed(2)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Pipe Weight</span><span className="font-bold">{weight.toFixed(0)} kg</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Weight per m</span><span className="font-bold">{(weight/L||0).toFixed(1)} kg/m</span></div>
          {encaseV > 0 && <div className="flex justify-between text-xs"><span className="text-[#64748B]">Concrete Encase</span><span className="font-bold">{encaseV.toFixed(2)} m┬│</span></div>}
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 14. Roofing Estimator ΓöÇΓöÇ */
function RoofingTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Roof Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><NumericInput value={roofL} onChange={setRoofL} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><NumericInput value={roofW} onChange={setRoofW} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Pitch (┬░)</label><NumericInput value={pitch} onChange={setPitch} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Overhang (m)</label><NumericInput step="0.1" value={overhang} onChange={setOverhang} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Bundle Cover (m┬▓)</label><NumericInput step="0.1" value={bundCover} onChange={setBundCover} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Price/Bundle ($)</label><NumericInput step="1" value={bundPrice} onChange={setBundPrice} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Felt? (0=no)</label><NumericInput step="1" value={felt} onChange={setFelt} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Felt $/m┬▓</label><NumericInput step="0.1" value={feltPrice} onChange={setFeltPrice} variant="ws" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Plan Area</span><span className="font-bold">{formatNum(planArea)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Slope Area</span><span className="font-bold">{formatNum(slopeArea)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Shingle Bundles</span><span className="font-bold">{bundles}</span></div>
          {feltM2 > 0 && <div className="flex justify-between text-xs"><span className="text-[#64748B]">Felt Required</span><span className="font-bold">{Math.ceil(feltM2)} m┬▓</span></div>}
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 15. Compaction / Backfill ΓöÇΓöÇ */
function CompactionTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Compaction Input">
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide">Trench</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><NumericInput value={trenchL} onChange={setTrenchL} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><NumericInput step="0.1" value={trenchW} onChange={setTrenchW} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Depth (m)</label><NumericInput step="0.1" value={trenchD} onChange={setTrenchD} variant="ws" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Factors & Costs</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Swell %</label><NumericInput value={swellPct} onChange={setSwellPct} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Compaction %</label><NumericInput value={compactPct} onChange={setCompactPct} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Fill $/m┬│</label><NumericInput step="1" value={fillCost} onChange={setFillCost} variant="ws" /></div>
            <div className="col-span-3"><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Compaction Labor ($/m┬│)</label><NumericInput step="0.5" value={laborRate} onChange={setLaborRate} variant="ws" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Bank Volume</span><span className="font-bold">{formatNum(bankVol)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Loose Volume</span><span className="font-bold">{formatNum(looseVol)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Compacted Fill Req</span><span className="font-bold">{fillRequired.toFixed(1)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Material Cost</span><span className="font-bold">${formatNum(materialCost)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Labor Cost</span><span className="font-bold">${formatNum(laborCost)}</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 16. Waterproofing / Curing ΓöÇΓöÇ */
function WaterproofingTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Curing & Waterproofing Input">
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide">Concrete Curing</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Area (m┬▓)</label><NumericInput value={concArea} onChange={setConcArea} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Days</label><NumericInput value={cureDays} onChange={setCureDays} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Water L/m┬▓/d</label><NumericInput step="0.1" value={waterPerM2} onChange={setWaterPerM2} variant="ws" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Waterproofing Membrane</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Area (m┬▓)</label><NumericInput value={wpArea} onChange={setWpArea} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Coats</label><NumericInput value={wpCoats} onChange={setWpCoats} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cov (m┬▓/L)</label><NumericInput step="0.1" value={wpCoverage} onChange={setWpCoverage} variant="ws" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Water Cost ($/L)</label><NumericInput step="0.001" value={waterCost} onChange={setWaterCost} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">WP Price ($/L)</label><NumericInput step="0.5" value={wpPrice} onChange={setWpPrice} variant="ws" /></div>
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
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 17. Concrete Mix Design ΓöÇΓöÇ */
function MixDesignTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Mix Design Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Grade</label><select value={gradeIdx} onChange={e=>setGradeIdx(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">{mixes.map((m,i) => <option key={i} value={i}>{m.name} ({m.cement}kg cem)</option>)}</select></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Volume (m┬│)</label><NumericInput step="0.1" value={volConc} onChange={setVolConc} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cement ($/bag)</label><NumericInput step="0.5" value={cementPrice} onChange={setCementPrice} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Sand ($/m┬│)</label><NumericInput step="1" value={sandPrice} onChange={setSandPrice} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Aggregate ($/m┬│)</label><NumericInput step="1" value={aggPrice} onChange={setAggPrice} variant="ws" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Grade</span><span className="font-bold">{mix.name}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Cement</span><span className="font-bold">{cementBags} bags ({mix.cement*V} kg)</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Sand</span><span className="font-bold">{sandM3.toFixed(2)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Aggregate</span><span className="font-bold">{aggM3.toFixed(2)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Water</span><span className="font-bold">{waterL.toFixed(0)} L</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 18. Plastering Estimator ΓöÇΓöÇ */
function PlasteringTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Plaster Input">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Wall Length (m)</label><NumericInput value={plastL} onChange={setPlastL} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><NumericInput value={plastH} onChange={setPlastH} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Thickness (m)</label><NumericInput step="0.001" value={plastT} onChange={setPlastT} variant="ws" /></div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cement parts</label><NumericInput min="1" value={mixRatioC} onChange={setMixRatioC} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Sand parts</label><NumericInput min="1" value={mixRatioS} onChange={setMixRatioS} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cement ($/bag)</label><NumericInput step="0.5" value={plastPrice} onChange={setPlastPrice} variant="ws" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Plaster Area</span><span className="font-bold">{formatNum(area)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Wet Volume</span><span className="font-bold">{volWet.toFixed(3)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Dry Volume</span><span className="font-bold">{volDry.toFixed(3)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Cement Required</span><span className="font-bold">{cementBags} bags</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Sand Required</span><span className="font-bold">{sandVol.toFixed(2)} m┬│</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 19. Sloped Excavation (Trapezoidal Trench) ΓöÇΓöÇ */
function SlopedExcTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Sloped Trench Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><NumericInput value={exL} onChange={setExL} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Bottom Width (m)</label><NumericInput step="0.1" value={exBw} onChange={setExBw} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Depth (m)</label><NumericInput step="0.1" value={exD} onChange={setExD} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Slope (H:V)</label><NumericInput step="0.1" value={exSlope} onChange={setExSlope} variant="ws" /></div>
            <div className="col-span-2"><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cost per m┬│ ($)</label><NumericInput step="1" value={exCost} onChange={setExCost} variant="ws" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Bottom Width</span><span className="font-bold">{Bw} m</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Top Width</span><span className="font-bold">{Bt.toFixed(2)} m</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Excavation Volume</span><span className="font-bold">{formatNum(vol)} m┬│</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 20. Staircase Layout ΓöÇΓöÇ */
function StaircaseTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Staircase Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Floor Height (m)</label><NumericInput step="0.05" value={floorHt} onChange={setFloorHt} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Rise (m)</label><NumericInput step="0.005" value={rise} onChange={setRise} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Tread (m)</label><NumericInput step="0.01" value={tread} onChange={setTread} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Stair Width (m)</label><NumericInput step="0.1" value={stairW} onChange={setStairW} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Slab Thick (m)</label><NumericInput step="0.005" value={slabT} onChange={setSlabT} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Concrete ($/m┬│)</label><NumericInput step="5" value={concPrice} onChange={setConcPrice} variant="ws" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Steps</span><span className="font-bold">{steps}</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Actual Rise</span><span className="font-bold">{(actualRise*1000).toFixed(0)} mm</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Going (total)</span><span className="font-bold">{going.toFixed(2)} m</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Incline Length</span><span className="font-bold">{incline.toFixed(2)} m</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Concrete Volume</span><span className="font-bold">{concVol.toFixed(2)} m┬│</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 21. Water Tank Volume ΓöÇΓöÇ */
function WaterTankTab() {
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
              <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><NumericInput value={rLen} onChange={setRLen} variant="ws" /></div>
              <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><NumericInput value={rWid} onChange={setRWid} variant="ws" /></div>
              <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><NumericInput value={rHt} onChange={setRHt} variant="ws" /></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Diameter (m)</label><NumericInput step="0.1" value={cDia} onChange={setCDia} variant="ws" /></div>
              <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><NumericInput value={cHt2} onChange={setCHt2} variant="ws" /></div>
            </div>
          )}
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cost per m┬│ ($)</label><NumericInput step="10" value={tankPrice} onChange={setTankPrice} variant="ws" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Volume</span><span className="font-bold">{volM3.toFixed(2)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Capacity</span><span className="font-bold">{formatNum(volLiters)} L ({formatNum(volLiters/1000)} kL)</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 22. Fencing / Boundary Wall ΓöÇΓöÇ */
function FencingTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Fencing Input">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Fence Length (m)</label><NumericInput value={fenceL} onChange={setFenceL} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Post Spacing (m)</label><NumericInput step="0.1" value={postSpacing} onChange={setPostSpacing} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><NumericInput step="0.1" value={fenceH} onChange={setFenceH} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Rails per Span</label><NumericInput value={railsPerSpan} onChange={setRailsPerSpan} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Post Price ($)</label><NumericInput step="1" value={postPrice} onChange={setPostPrice} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Rail Price ($)</label><NumericInput step="1" value={railPrice} onChange={setRailPrice} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cement Post (bags)</label><NumericInput step="0.5" value={concretePost} onChange={setConcretePost} variant="ws" /></div>
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
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 23. Floor Screed ΓöÇΓöÇ */
function ScreedTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Screed Input">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><NumericInput value={screedL} onChange={setScreedL} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><NumericInput value={screedW} onChange={setScreedW} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Thickness (m)</label><NumericInput step="0.005" value={screedT} onChange={setScreedT} variant="ws" /></div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Mix Ratio</label><select value={screedRatio} onChange={e=>setScreedRatio(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-lg px-2 py-1.5 text-[10px] outline-none">{['1:3','1:4','1:5','1:6'].map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Cement ($/bag)</label><NumericInput step="0.5" value={screedCemPrice} onChange={setScreedCemPrice} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Sand ($/m┬│)</label><NumericInput step="1" value={screedSandPrice} onChange={setScreedSandPrice} variant="ws" /></div>
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Screed Area</span><span className="font-bold">{formatNum(area)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Wet Volume</span><span className="font-bold">{volWet.toFixed(3)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Dry Volume</span><span className="font-bold">{volDry.toFixed(3)} m┬│</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Cement</span><span className="font-bold">{cemBags} bags</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Sand</span><span className="font-bold">{sandVol.toFixed(2)} m┬│</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ 24. Formwork Contact Area ΓöÇΓöÇ */
function FormworkAreaTab() {
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

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Contact Area Inputs">
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide">Slab Soffit + Edge</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><NumericInput value={fsLab} onChange={setFSLab} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><NumericInput value={fsWid} onChange={setFSWid} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Edge Ht (m)</label><NumericInput step="0.01" value={fsEdge} onChange={setFSEdge} variant="ws" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Beam (sides + soffit)</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><NumericInput value={fbLen} onChange={setFBLen} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><NumericInput step="0.01" value={fbWid2} onChange={setFBWid2} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Depth (m)</label><NumericInput step="0.01" value={fbDep2} onChange={setFBDep2} variant="ws" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Column (all sides)</p>
          <div className="grid grid-cols-3 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Width (m)</label><NumericInput step="0.01" value={fcWid2} onChange={setFCWid2} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Depth (m)</label><NumericInput step="0.01" value={fcDep2} onChange={setFCDep2} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><NumericInput value={fcHt2} onChange={setFCHt2} variant="ws" /></div>
          </div>
          <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-wide mt-1">Wall (both sides)</p>
          <div className="grid grid-cols-2 gap-1">
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Length (m)</label><NumericInput value={wallLen} onChange={setWallLen} variant="ws" /></div>
            <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Height (m)</label><NumericInput value={wallHt} onChange={setWallHt} variant="ws" /></div>
          </div>
          <div><label className="text-[9px] font-semibold text-[#64748B] block mb-0.5">Formwork Price ($/m┬▓)</label><NumericInput step="1" value={formPrice} onChange={setFormPrice} variant="ws" /></div>
        </div>
      </Card>
      <Card title="Results">
        <div className="space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Slab CA</span><span className="font-bold">{slabCA.toFixed(1)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Beam CA</span><span className="font-bold">{beamCA.toFixed(1)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Column CA</span><span className="font-bold">{colCA.toFixed(1)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Wall CA</span><span className="font-bold">{wallCA.toFixed(1)} m┬▓</span></div>
          <div className="flex justify-between text-xs border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2"><span className="text-[#64748B] font-bold">Total Contact Area</span><span className="font-bold">{totalCA.toFixed(1)} m┬▓</span></div>
          <div className="flex justify-between text-xs"><span className="text-[#64748B]">Total Cost</span><span className="font-bold text-[#2563EB]">${formatNum(totalCost)}</span></div>
          
        </div>
      </Card>
    </div>
  );
}

/* ΓöÇΓöÇ Main panel ΓöÇΓöÇ */
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
