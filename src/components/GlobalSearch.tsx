import { useEffect, useMemo, useState } from 'react';
import { Command, History, Search, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CALCULATORS_LIST } from '../data/calculatorsData';
import { useApp } from '../context/AppContext';
import { CATEGORY_PATH_MAP, getCalculatorSlug } from '../utils/seo';

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { recentCalculatorIds, favoriteCalculatorIds, setActiveCalcId } = useApp();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(true); }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? CALCULATORS_LIST.filter(calc => `${calc.name} ${calc.description} ${calc.category}`.toLowerCase().includes(term)).slice(0, 9) : [];
  }, [query]);
  const recents = recentCalculatorIds.map(id => CALCULATORS_LIST.find(calc => calc.id === id)).filter(Boolean);
  const favorites = favoriteCalculatorIds.map(id => CALCULATORS_LIST.find(calc => calc.id === id)).filter(Boolean);
  const openCalculator = (id: string) => {
    const calc = CALCULATORS_LIST.find(item => item.id === id);
    if (!calc) return;
    setActiveCalcId(id);
    setOpen(false); setQuery('');
    navigate(calc.category === 'bbs' ? '/bbs/footing' : `/${CATEGORY_PATH_MAP[calc.category]}/${getCalculatorSlug(calc)}`);
  };

  return <>
    <button onClick={() => setOpen(true)} aria-label="Search calculators" className="inline-flex items-center gap-2.5 rounded-xl border border-[#D8D0C2] dark:border-[#384238] bg-[#FAF8F5] dark:bg-[#242A24] px-3.5 py-1.5 text-xs font-semibold text-[#555C55] dark:text-[#A4B2A4] hover:border-[#7B8978] transition-colors cursor-pointer shadow-2xs">
      <Search className="w-3.5 h-3.5 text-[#7B8978]" />
      <span className="hidden sm:inline">Search calculators...</span>
      <kbd className="hidden sm:inline rounded-md border border-[#D8D0C2] dark:border-[#384238] bg-white dark:bg-[#1E221E] px-1.5 py-0.5 text-[9px] font-mono text-[#7B8978]">Ctrl K</kbd>
    </button>
    {open && <div role="dialog" aria-modal="true" aria-label="Search calculators" className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#D8D0C2] bg-[#FAF9F6] shadow-2xl dark:border-[#384238] dark:bg-[#1E221E]" onMouseDown={event => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-[#D8D0C2] dark:border-[#384238] px-4 py-3.5">
          <Search className="w-4 h-4 text-[#7B8978]" />
          <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search calculators, engineering tools, formulas…" className="min-w-0 flex-1 bg-transparent text-sm text-[#20231F] dark:text-[#EAE7E0] outline-none placeholder-[#94A094]" />
          <button onClick={() => setOpen(false)} aria-label="Close search" className="rounded-lg p-1 text-[#7B8978] hover:bg-[#EAE7E0] dark:hover:bg-[#2E352E] cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {query ? <SearchGroup title="Results" items={results} onOpen={openCalculator} empty="No calculators match that search." /> : <>
            {favorites.length > 0 && <SearchGroup title="Favorites" icon={Star} items={favorites} onOpen={openCalculator} />}
            <SearchGroup title="Recently used" icon={History} items={recents} onOpen={openCalculator} empty="Start a calculation to build your recent list." />
            <div className="px-3 py-3 text-[10px] font-mono text-[#94A094]">Popular searches: concrete volume, rebar weight, brickwork, beam analysis</div>
          </>}
        </div>
      </div>
    </div>}
  </>;
}

function SearchGroup({ title, icon: Icon, items, onOpen, empty }: { title: string; icon?: typeof Search; items: ReturnType<typeof CALCULATORS_LIST.filter>; onOpen: (id: string) => void; empty?: string }) {
  return <section className="mb-2"><div className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#7B8978]">{Icon && <Icon className="w-3 h-3" />}{title}</div>{items.length === 0 ? <p className="px-3 pb-3 text-xs text-[#94A094]">{empty}</p> : items.map(calc => <button key={calc.id} onClick={() => onOpen(calc.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#EAE7E0] dark:hover:bg-[#2A312A] cursor-pointer transition-colors"><Command className="w-3.5 h-3.5 text-[#657565]" /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-[#20231F] dark:text-[#EAE7E0]">{calc.name}</span><span className="block truncate text-[10px] text-[#7B8978]">{calc.category}</span></span></button>)}</section>;
}
