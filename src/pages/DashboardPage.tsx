import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, ChevronRight, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import MainDashboard from '../components/MainDashboard';
import { SEOHead, CATEGORY_PATH_MAP, getCalculatorSlug } from '../utils/seo';
import { CALCULATORS_LIST } from '../data/calculatorsData';
import { useApp } from '../context/AppContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { savedCalculations, handleLoadSavedCalculation, handleDeleteCalculation, unitSystem, favoriteCalculatorIds, recentCalculatorIds, setActiveCalcId } = useApp();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

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

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

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

      {/* Widget header row: greeting/clock + quick stats */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5 flex items-center justify-between md:col-span-1">
          <div>
            <div className="text-sm font-semibold text-[#161A2C] dark:text-[#E7EAF7]">{greeting}, Engineer 👋</div>
            <div className="text-2xl font-bold text-[#161A2C] dark:text-[#E7EAF7] mt-1">{timeStr}</div>
            <div className="text-[11px] text-[#7C88B8]">{dateStr}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#4C5FE0]/10 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#4C5FE0]" />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#4C5FE0]/10 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-[#4C5FE0]" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#161A2C] dark:text-[#E7EAF7] leading-none">{savedCalculations.length}</div>
            <div className="text-[11px] text-[#7C88B8] mt-1">Saved calculations</div>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#D9B96E]/15 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-[#8A6D2B]">{unitSystem === 'metric' ? 'SI' : 'US'}</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-[#161A2C] dark:text-[#E7EAF7]">Unit system</div>
            <div className="text-[11px] text-[#7C88B8] capitalize">{unitSystem}</div>
          </div>
        </div>
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
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#161A2C] dark:text-[#E7EAF7] mb-2">
        <Icon className="w-4 h-4 text-[#7C88B8]" />{title}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-[#7C88B8]">{empty}</p>
      ) : (
        <div className="space-y-0.5">
          {items.slice(0, 5).map(item => item && (
            <button
              key={item.id}
              onClick={() => onOpen(item.id)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-[#EEF1FB] dark:hover:bg-[#1D2438] transition-colors cursor-pointer group text-left"
            >
              <span className="text-xs text-[#293552] dark:text-[#C9D0EA] truncate">{item.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#B7C1D9] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
