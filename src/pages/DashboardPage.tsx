import { useNavigate } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import { motion } from 'motion/react';
import MainDashboard from '../components/MainDashboard';
import { SEOHead, CATEGORY_PATH_MAP, getCalculatorSlug } from '../utils/seo';
import { CALCULATORS_LIST } from '../data/calculatorsData';
import { useApp } from '../context/AppContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { savedCalculations, handleLoadSavedCalculation, handleDeleteCalculation, unitSystem, favoriteCalculatorIds, recentCalculatorIds, setActiveCalcId } = useApp();

  const handleLoad = (calc: any) => {
    handleLoadSavedCalculation(calc);
    const def = CALCULATORS_LIST.find((c: any) => c.id === calc.calculatorId);
    if (def) {
      const path = CATEGORY_PATH_MAP[def.category];
      navigate(`/${path}/${getCalculatorSlug(def)}`);
    }
  };
  const openCalculator = (id: string) => {
    const def = CALCULATORS_LIST.find(calc => calc.id === id);
    if (!def) return;
    setActiveCalcId(id);
    const path = CATEGORY_PATH_MAP[def.category];
    navigate(def.category === 'bbs' ? '/bbs/footing' : `/${path}/${getCalculatorSlug(def)}`);
  };
  const favorites = favoriteCalculatorIds.map(id => CALCULATORS_LIST.find(calc => calc.id === id)).filter(Boolean);
  const recents = recentCalculatorIds.map(id => CALCULATORS_LIST.find(calc => calc.id === id)).filter(Boolean);

  return (
    <>
      <SEOHead meta={{
        title: 'Civil Engineering Analytics Dashboard',
        description: 'View saved structural calculations, concrete mix designs, bar bending schedules, and project history from CivilMath calculators. Track rebar quantities, concrete volumes, and engineering analyses.',
        path: '/dashboard',
        noindex: true,
        type: 'website',
        breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Dashboard', url: '/dashboard' }],
      }} />
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-6 text-left">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">CivilMath Analytics Dashboard</h1>
        <p className="text-xs text-slate-500 font-mono">TRACKING SCHEDULED CONCRETE CASTINGS, DEFLECTION BENDS AND REBAR STANDARD MATRICES</p>
      </motion.div>
      <section className="grid gap-4 md:grid-cols-2 mb-6">
        <PersonalList title="My favorites" icon={Star} items={favorites} empty="Star a calculator from any category to keep it here." onOpen={openCalculator} />
        <PersonalList title="Recently used" icon={Clock} items={recents} empty="Open a calculator to build your recent activity." onOpen={openCalculator} />
      </section>
      <MainDashboard
        savedCalculations={savedCalculations}
        onLoadCalculation={handleLoad}
        onDeleteCalculation={handleDeleteCalculation}
        unitSystem={unitSystem}
      />
    </>
  );
}

function PersonalList({ title, icon: Icon, items, empty, onOpen }: { title: string; icon: typeof Star; items: (typeof CALCULATORS_LIST[number] | undefined)[]; empty: string; onOpen: (id: string) => void }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2 text-xs font-bold"><Icon className="w-4 h-4 text-[#2563EB]" />{title}</div>{items.length === 0 ? <p className="mt-4 text-xs text-slate-400">{empty}</p> : <div className="mt-3 flex flex-wrap gap-2">{items.slice(0, 5).map(item => item && <button key={item.id} onClick={() => onOpen(item.id)} className="rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-[#2563EB] dark:bg-slate-800 dark:text-slate-300 cursor-pointer">{item.name}</button>)}</div>}</div>;
}
