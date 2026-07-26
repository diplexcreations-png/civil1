import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  HardHat, Home, Sliders, Layout, Sun, Moon, Menu, X, Search,
  ChevronRight, Calculator, Sparkles, Clock, Star, Settings,
  Clipboard, Layers, Grid, Compass, Activity, RefreshCw, PanelRightClose,
  BarChart3, Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CALCULATORS_LIST } from '../data/calculatorsData';
import { CalculatorCategory } from '../types';
import { CATEGORY_PATH_MAP, getCalculatorSlug } from '../utils/seo';

const categoryConfig = [
  { id: 'bbs' as const, label: 'BBS', icon: Clipboard },
  { id: 'concrete' as const, label: 'Concrete', icon: Layers },
  { id: 'structural' as const, label: 'Structural', icon: Grid },
  { id: 'geotech' as const, label: 'Geotech', icon: Activity },
  { id: 'survey' as const, label: 'Survey', icon: Compass },
  { id: 'utility' as const, label: 'Utility', icon: RefreshCw },
];

const RECENT_CALCULATORS_KEY = 'civilmath_recent';

export default function AppLayout() {
  const { unitSystem, setUnitSystem, theme, toggleTheme, activeCalcId, setActiveCalcId, currency, setCurrency } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentCalcs, setRecentCalcs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_CALCULATORS_KEY) || '[]'); } catch { return []; }
  });
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isWorkspace = /^\/(bbs|structural|concrete|geotechnical|surveying|utilities)/.test(location.pathname);
  const isDashboard = location.pathname === '/dashboard';
  const isBOQ = location.pathname === '/boq-builder';
  const isProjectManagement = location.pathname === '/project-management';

  useEffect(() => {
    if (activeCalcId && activeCalcId !== 'bbs-universal') {
      setRecentCalcs(prev => {
        const next = [activeCalcId, ...prev.filter(id => id !== activeCalcId)].slice(0, 5);
        localStorage.setItem(RECENT_CALCULATORS_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [activeCalcId]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 1024) setSidebarOpen(false); };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMobileMenuOpen(false); }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSelectCalc = (id: string) => {
    const calc = CALCULATORS_LIST.find(c => c.id === id);
    setActiveCalcId(id);
    setSearchQuery('');
    setMobileMenuOpen(false);
    if (calc) {
      const path = CATEGORY_PATH_MAP[calc.category];
      navigate(calc.category === 'bbs' ? '/bbs/footing' : `/${path}/${getCalculatorSlug(calc)}`);
    }
  };

  const filteredCalcs = searchQuery
    ? CALCULATORS_LIST.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const recentCalcObjects = recentCalcs.map(id => CALCULATORS_LIST.find(c => c.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#080d19] text-[#0F172A] dark:text-[#F1F5F9] flex font-sans transition-colors duration-300">
      {/* Ambient bg */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-blue-300/8 dark:bg-blue-900/6 rounded-full blur-3xl opacity-50 animate-blob pointer-events-none" />
      <div className="fixed top-[30vh] right-10 w-80 h-80 bg-emerald-300/8 dark:bg-emerald-900/4 rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none" />
      <div className="fixed inset-0 blueprint-grid opacity-25 dark:opacity-10 pointer-events-none" />

      {/* ===== SIDEBAR ===== */}
      <AnimatePresence mode="wait">
        {(sidebarOpen || mobileMenuOpen) && (
          <>
            {/* Mobile overlay */}
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" />
            )}
            <motion.aside
              initial={mobileMenuOpen ? { x: '-100%' } : false}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen bg-white dark:bg-[#0D1527] border-r border-[#E2E8F0] dark:border-[#1E293B] flex flex-col transition-all duration-300 ${
                sidebarOpen ? 'w-[260px]' : 'w-0 lg:w-[260px]'
              } ${mobileMenuOpen ? 'w-[300px]' : ''}`}
            >
              {/* Logo */}
              <div className="flex items-center justify-between px-4 h-16 shrink-0 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="p-2 bg-[#2563EB] text-white rounded-xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                    <HardHat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold tracking-tight text-[#0F172A] dark:text-white leading-none">CivilMath</div>
                    <div className="text-[8px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.15em]">Engineering Suite</div>
                  </div>
                </button>
                <button onClick={() => { setSidebarOpen(false); setMobileMenuOpen(false); }}
                  className="p-1.5 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] cursor-pointer hidden lg:flex">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="px-3 pt-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                  <input
                    type="text" placeholder="Search calculators..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl pl-8 pr-3 py-2 text-xs outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all placeholder:text-[#94A3B8]"
                  />
                </div>
                {/* Search results dropdown */}
                {searchQuery && filteredCalcs.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-1 bg-white dark:bg-[#0D1527] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredCalcs.map(calc => (
                      <button key={calc.id} onClick={() => handleSelectCalc(calc.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] transition-colors text-xs cursor-pointer">
                        <Calculator className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span className="text-[#0F172A] dark:text-[#F1F5F9] font-medium">{calc.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
                <SidebarItem icon={Home} label="Explore" active={isHome} onClick={() => { navigate('/'); setMobileMenuOpen(false); }} />
                <SidebarItem icon={Sliders} label="Workspace" active={isWorkspace} onClick={() => { navigate('/bbs/footing'); setMobileMenuOpen(false); }} />
                <SidebarItem icon={Layout} label="Dashboard" active={isDashboard} onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} />
                <SidebarItem icon={BarChart3} label="BOQ Builder" active={isBOQ} onClick={() => { navigate('/boq-builder'); setMobileMenuOpen(false); }} />
                <SidebarItem icon={Users} label="Project Mgmt" active={isProjectManagement} onClick={() => { navigate('/project-management'); setMobileMenuOpen(false); }} />

                <hr className="divider my-3" />

                <div className="text-[9px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider px-2 pb-1">Categories</div>
                {categoryConfig.map(cat => (
                  <SidebarItem key={cat.id} icon={cat.icon} label={cat.label}
                    active={activeCalcId.startsWith(cat.id)}
                    onClick={() => { navigate(`/${CATEGORY_PATH_MAP[cat.id]}`); setMobileMenuOpen(false); }} />
                ))}

                {recentCalcObjects.length > 0 && (
                  <>
                    <hr className="divider my-3" />
                    <div className="text-[9px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider px-2 pb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recent
                    </div>
                    {recentCalcObjects.map(calc => calc && (
                      <button key={calc.id} onClick={() => handleSelectCalc(calc.id)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors cursor-pointer">
                        <Calculator className="w-3 h-3 text-[#2563EB]" />
                        <span className="truncate">{calc.name}</span>
                      </button>
                    ))}
                  </>
                )}
              </nav>

              {/* Bottom section */}
              <div className="px-3 py-3 border-t border-[#E2E8F0] dark:border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#64748B] uppercase">Units</span>
                  <div className="flex bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg p-0.5">
                    <button onClick={() => setUnitSystem('metric')}
                      className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${unitSystem === 'metric' ? 'bg-white dark:bg-[#0D1527] text-[#2563EB] shadow-xs' : 'text-[#64748B]'}`}>SI</button>
                    <button onClick={() => setUnitSystem('imperial')}
                      className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${unitSystem === 'imperial' ? 'bg-white dark:bg-[#0D1527] text-[#2563EB] shadow-xs' : 'text-[#64748B]'}`}>IMP</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#64748B] uppercase">Currency</span>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    className="bg-[#F1F5F9] dark:bg-[#1E293B] border-0 rounded-lg px-2 py-1 text-[9px] font-bold text-[#475569] dark:text-[#94A3B8] outline-none cursor-pointer">
                    <option value="USD">USD ($)</option>
                    <option value="LKR">LKR (Rs)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={toggleTheme}
                    className="flex items-center gap-2 text-[10px] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer">
                    {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="font-semibold">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#080d19]/80 backdrop-blur-xl border-b border-[#E2E8F0]/60 dark:border-[#1E293B]/60">
          <div className="flex items-center justify-between h-14 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button onClick={() => { setSidebarOpen(!sidebarOpen); }}
                className="hidden lg:flex p-2 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] cursor-pointer">
                <Menu className="w-4 h-4" />
              </button>
              <button onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] cursor-pointer">
                <Menu className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="hidden lg:flex p-2 rounded-xl hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] cursor-pointer">
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 lg:py-8 mb-0 relative z-10">
          <Outlet />
        </main>

        {/* Sticky bottom bar (mobile) */}
        {isWorkspace && (
          <div className="sticky-bottom-bar lg:hidden">
            <button onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-xl text-xs font-semibold text-[#475569] cursor-pointer">
              <Calculator className="w-4 h-4" /> Change Calculator
            </button>
            <button className="btn-primary flex-1 max-w-[200px]">
              Calculate
            </button>
          </div>
        )}
      </div>

      {/* ===== RIGHT PANEL (drawing / tips) ===== */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:flex flex-col h-screen sticky top-0 border-l border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0D1527] overflow-hidden shrink-0"
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-[#E2E8F0] dark:border-[#1E293B] shrink-0">
              <span className="text-[11px] font-bold text-[#0F172A] dark:text-[#F1F5F9]">Preview</span>
              <button onClick={() => setRightPanelOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] text-[#64748B] cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Placeholder live preview */}
              <div className="aspect-square bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <HardHat className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                  <p className="text-[10px] text-[#94A3B8]">3D Preview</p>
                  <p className="text-[8px] text-[#CBD5E1] mt-1">Enter dimensions to preview</p>
                </div>
              </div>

              {/* Quick summary */}
              <div className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl p-4 space-y-2">
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Quick Summary</div>
                <div className="text-[9px] text-[#94A3B8]">No data yet. Start entering values to see results.</div>
              </div>

              {/* Standards */}
              <div className="bg-[#F8FAFC] dark:bg-[#080d19] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl p-4 space-y-2">
                <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Standards</div>
                <div className="space-y-1.5">
                  {['ACI 318-19', 'BS 8110', 'Eurocode 2', 'IS 456'].map(s => (
                    <div key={s} className="flex items-center gap-2 text-[9px] text-[#94A3B8]">
                      <div className="w-1 h-1 rounded-full bg-[#2563EB]" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: {
  key?: string; icon: typeof Home; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
        active
          ? 'bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20'
          : 'text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
      }`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
