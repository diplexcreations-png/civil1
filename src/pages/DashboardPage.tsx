import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import MainDashboard from '../components/MainDashboard';
import { SEOHead, CATEGORY_PATH_MAP, getCalculatorSlug } from '../utils/seo';
import { CALCULATORS_LIST } from '../data/calculatorsData';
import { useApp } from '../context/AppContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { savedCalculations, handleLoadSavedCalculation, handleDeleteCalculation, unitSystem } = useApp();

  const handleLoad = (calc: any) => {
    handleLoadSavedCalculation(calc);
    const def = CALCULATORS_LIST.find((c: any) => c.id === calc.calculatorId);
    if (def) {
      const path = CATEGORY_PATH_MAP[def.category];
      navigate(`/${path}/${getCalculatorSlug(def)}`);
    }
  };

  return (
    <>
      <SEOHead meta={{
        title: 'Civil Engineering Analytics Dashboard',
        description: 'View saved structural calculations, concrete mix designs, bar bending schedules, and project history from CivilMath calculators. Track rebar quantities, concrete volumes, and engineering analyses.',
        path: '/dashboard',
        type: 'website',
        breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Dashboard', url: '/dashboard' }],
      }} />
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-6 text-left">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">CivilMath Analytics Dashboard</h2>
        <p className="text-xs text-slate-500 font-mono">TRACKING SCHEDULED CONCRETE CASTINGS, DEFLECTION BENDS AND REBAR STANDARD MATRICES</p>
      </motion.div>
      <MainDashboard
        savedCalculations={savedCalculations}
        onLoadCalculation={handleLoad}
        onDeleteCalculation={handleDeleteCalculation}
        unitSystem={unitSystem}
      />
    </>
  );
}
