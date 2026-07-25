import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  HardHat, Home, Sliders, Layout, Activity, Sun, Moon,
  FileText, Menu, X, Layers, ChevronRight, Search, ArrowUpDown,
  CheckCircle2, ListCollapse, Hammer, Copy, Check, Sparkles,
  Calculator, Grid, BookOpen,
} from 'lucide-react';
import { CURRENCY_MAPPING, CalculatorCategory } from '../types';
import { CALCULATORS_LIST } from '../data/calculatorsData';
import { useApp } from '../context/AppContext';
import { ChatBot } from './ChatBot';
import { CATEGORY_PATH_MAP, CATEGORY_META } from '../utils/seo';

export default function AppLayout() {
  const {
    unitSystem, setUnitSystem, currency, setCurrency,
    theme, toggleTheme,
    activeCalcId, setActiveCalcId,
    isDraftingDeskOpen, setIsDraftingDeskOpen,
    draftingNotes, setDraftingNotes,
    copiedText, handleCopy,
    savedCalculations, handleLoadSavedCalculation, handleDeleteCalculation,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCalcMenuOpen, setIsCalcMenuOpen] = useState(false);
  const calcMenuRef = useRef<HTMLDivElement>(null);
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'name'>('popularity');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    structural: false, concrete: false, survey: false, utility: false, bbs: true, geotech: false,
  });

  const categories = [
    { id: 'bbs', name: 'BBS Calculator', icon: Layout },
    { id: 'structural', name: 'Structural Labs', icon: Sliders },
    { id: 'concrete', name: 'Concrete Mix', icon: Layers },
    { id: 'geotech', name: 'Geotechnical', icon: Activity },
    { id: 'survey', name: 'Surveying Plat', icon: Activity },
    { id: 'utility', name: 'Utilities', icon: Activity },
  ];

  const activeCategory = CALCULATORS_LIST.find(c => c.id === activeCalcId)?.category;

  // Determine if we're on a calculator page (not home)
  const isHome = location.pathname === '/';
  const isWorkspace = location.pathname.includes('/bbs/') || location.pathname.includes('/structural/')
    || location.pathname.includes('/concrete/') || location.pathname.includes('/geotechnical/')
    || location.pathname.includes('/surveying/') || location.pathname.includes('/utilities/');

  const toggleCategory = (catId: string) => {
    setExpandedCategories(p => ({ ...p, [catId]: !p[catId] }));
  };

  const getCalculatorSlug = (calc: typeof CALCULATORS_LIST[0]) => {
    if (calc.id.startsWith(calc.category + '-')) return calc.id.substring(calc.category.length + 1);
    return calc.id; // e.g. steel-calculator, rebar-calculator don't have category prefix
  };

  const handleSelectCalculator = (id: string) => {
    const calc = CALCULATORS_LIST.find(c => c.id === id);
    setActiveCalcId(id);
    setIsMobileCatalogOpen(false);
    if (calc) {
      const path = CATEGORY_PATH_MAP[calc.category];
      if (calc.category === 'bbs' && calc.id === 'bbs-universal') {
        navigate('/bbs/footing');
      } else {
        navigate(`/${path}/${getCalculatorSlug(calc)}`);
      }
    }
  };

  // Routes for bbs structure types
  const handleSelectBBSStructure = (structure: string) => {
    setActiveCalcId('bbs-universal');
    setIsMobileCatalogOpen(false);
    navigate(`/bbs/${structure}`);
  };

  // Close calc menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calcMenuRef.current && !calcMenuRef.current.contains(e.target as Node)) {
        setIsCalcMenuOpen(false);
      }
    };
    if (isCalcMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalcMenuOpen]);

  // Close calc menu on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCalcMenuOpen(false);
    };
    if (isCalcMenuOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isCalcMenuOpen]);

  const closeCalcMenu = useCallback(() => setIsCalcMenuOpen(false), []);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090F1C] text-slate-800 dark:text-slate-100 flex flex-col font-sans relative overflow-hidden transition-colors duration-200">
      {/* Ambient background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/15 dark:bg-blue-900/10 rounded-full filter blur-3xl opacity-60 dark:opacity-45 animate-blob pointer-events-none" />
      <div className="absolute top-[30vh] right-10 w-96 h-96 bg-emerald-300/15 dark:bg-emerald-900/5 rounded-full filter blur-3xl opacity-60 dark:opacity-35 animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute bottom-20 left-[25%] w-80 h-80 bg-purple-300/15 dark:bg-purple-900/10 rounded-full filter blur-3xl opacity-50 dark:opacity-30 animate-blob animation-delay-4000 pointer-events-none" />
      <div className="absolute inset-0 blueprint-grid opacity-35 dark:opacity-15 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/75 dark:bg-[#090F1C]/75 border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 md:py-4 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div onClick={() => navigate('/')} className="flex items-center space-x-2.5 cursor-pointer group">
            <div className="p-2 bg-[#0A84FF] text-white rounded-xl shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-md font-black tracking-tight font-sans text-[#0F172A] dark:text-white">CivilMath</span>
                <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-ping" />
              </div>
              <p className="text-[8px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">STRUCTURAL SUITE</p>
            </div>
          </div>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-900/85 border border-slate-200/85 dark:border-slate-800 backdrop-blur-md rounded-2xl p-1 text-xs font-sans font-semibold text-slate-500 dark:text-slate-400">
            <button onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${isHome ? 'bg-[#0A84FF] text-white shadow-sm' : 'hover:text-[#0F172A] dark:hover:text-white'}`}>
              <Home className="w-4 h-4" /><span>Explore Suite</span>
            </button>

            {/* All Calculators Dropdown */}
            <div ref={calcMenuRef} className="relative">
              <button onClick={() => setIsCalcMenuOpen(!isCalcMenuOpen)}
                className={`px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${isCalcMenuOpen ? 'bg-slate-200/80 dark:bg-slate-800 text-[#0F172A] dark:text-white' : 'hover:text-[#0F172A] dark:hover:text-white'}`}>
                <Calculator className="w-4 h-4" /><span>All Calculators</span>
                <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isCalcMenuOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* Dropdown Panel */}
              {isCalcMenuOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] max-h-[70vh] overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 z-50 grid grid-cols-3 gap-3">
                  {categories.map(cat => {
                    const calcs = CALCULATORS_LIST.filter(c => c.category === cat.id);
                    return (
                      <div key={cat.id} className="space-y-1.5">
                        <button onClick={() => { closeCalcMenu(); navigate(`/${CATEGORY_PATH_MAP[cat.id as CalculatorCategory]}`); }}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 w-full text-left transition-colors cursor-pointer">
                          <cat.icon className="w-3.5 h-3.5 text-[#0A84FF]" />
                          <span className="text-[10px] font-bold font-mono text-slate-700 dark:text-slate-300 uppercase tracking-wider">{cat.name}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400 ml-auto" />
                        </button>
                        <div className="space-y-0.5 pl-1">
                          {cat.id === 'bbs' && (
                            <button onClick={() => { closeCalcMenu(); navigate('/bbs'); }}
                              className="block w-full text-left px-2 py-0.5 text-[9px] font-mono text-[#0A84FF] font-bold hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors cursor-pointer">
                              All BBS Types →
                            </button>
                          )}
                          {calcs.map(calc => (
                            <button key={calc.id} onClick={() => { closeCalcMenu(); handleSelectCalculator(calc.id); }}
                              className="block w-full text-left px-2 py-0.5 text-[9px] font-mono text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer truncate">
                              {calc.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button onClick={() => { if (activeCalcId) handleSelectCalculator(activeCalcId); else navigate('/bbs/footing'); }}
              className={`px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${isWorkspace ? 'bg-[#0A84FF] text-white shadow-sm' : 'hover:text-[#0F172A] dark:hover:text-white'}`}>
              <Sliders className="w-4 h-4" /><span>Analysis Desk</span>
            </button>
            <button onClick={() => navigate('/dashboard')}
              className={`px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${location.pathname === '/dashboard' ? 'bg-[#0A84FF] text-white shadow-sm' : 'hover:text-[#0F172A] dark:hover:text-white'}`}>
              <Layout className="w-4 h-4" /><span>Analytics</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-3 flex-wrap justify-end gap-y-2">
            <div className="bg-slate-100/80 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 flex items-center text-[10px] font-mono shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] mr-1 border-r border-slate-200 dark:border-slate-800 pr-1.5 h-3.5 flex items-center">CURRENCY</span>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="bg-transparent border-none outline-none font-mono cursor-pointer focus:text-[#0A84FF] transition-colors font-bold pr-1 text-slate-700 dark:text-slate-300 text-[10px]">
                {Object.entries(CURRENCY_MAPPING).map(([code, details]) => (
                  <option key={code} value={code} className="font-mono text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {code} ({details.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-100/80 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex items-center text-[10px] font-mono shadow-xs">
              <button onClick={() => setUnitSystem('metric')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${unitSystem === 'metric' ? 'bg-[#0A84FF] font-bold text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'}`}>
                METRIC (SI)
              </button>
              <button onClick={() => setUnitSystem('imperial')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${unitSystem === 'imperial' ? 'bg-[#0A84FF] font-bold text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'}`}>
                IMPERIAL (US)
              </button>
            </div>

            <button onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/85 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-xs cursor-pointer flex items-center justify-center h-8 w-8">
              {theme === 'light' ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <button onClick={() => setIsMobileCatalogOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer shadow-xs">
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/85 dark:bg-[#090F1C]/85 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl backdrop-blur-lg flex items-center space-x-1 text-xs font-sans font-semibold text-slate-500 dark:text-slate-400 w-[280px] justify-between">
        <button onClick={() => navigate('/')}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all cursor-pointer ${isHome ? 'bg-[#0A84FF] text-white shadow-sm' : 'hover:text-[#0F172A] dark:hover:text-white'}`}>
          <Home className="w-3.5 h-3.5" /><span className="text-[9px]">Explore</span>
        </button>
        <button onClick={() => { if (activeCalcId) handleSelectCalculator(activeCalcId); else navigate('/bbs/footing'); }}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all cursor-pointer ${isWorkspace ? 'bg-[#0A84FF] text-white shadow-sm' : 'hover:text-[#0F172A] dark:hover:text-white'}`}>
          <Sliders className="w-3.5 h-3.5" /><span className="text-[9px]">Work</span>
        </button>
        <button onClick={() => navigate('/dashboard')}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all cursor-pointer ${location.pathname === '/dashboard' ? 'bg-[#0A84FF] text-white shadow-sm' : 'hover:text-[#0F172A] dark:hover:text-white'}`}>
          <Layout className="w-3.5 h-3.5" /><span className="text-[9px]">Data</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 mb-16 md:mb-0 relative z-10">
        <Outlet />
      </main>

      {/* Mobile Catalog Drawer */}
      <AnimatePresence>
        {isMobileCatalogOpen && (
          <div className="fixed inset-0 z-50 flex justify-start">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileCatalogOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 h-full w-[310px] sm:w-[350px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-5 shadow-2xl overflow-y-auto flex flex-col text-left">
              <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-[#0A84FF]" />
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-white uppercase tracking-wider">Civil Calculators</span>
                </div>
                <button onClick={() => setIsMobileCatalogOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-mono text-slate-500 dark:text-slate-500 uppercase tracking-widest font-bold">CALCULATION MODULES</h4>
                    {searchTerm.trim() !== '' && (
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-bold">
                        {CALCULATORS_LIST.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length} found
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-[#0A84FF] focus-within:ring-1 focus-within:ring-[#0A84FF] transition-all shadow-xs px-2.5 py-1.5">
                      <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500 mr-2 flex-shrink-0" />
                      <input type="text" placeholder="Search calculators..." value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-100 placeholder-slate-500 font-sans" />
                      {searchTerm && (
                        <button onClick={() => setSearchTerm('')}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full cursor-pointer">
                          <X className="w-3 h-3 text-slate-500" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                      <span className="flex items-center text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                        <ArrowUpDown className="w-3 h-3 mr-1 text-[#0A84FF]" /> Sort
                      </span>
                      <select value={sortBy} onChange={e => setSortBy(e.target.value as 'popularity' | 'name')}
                        className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 font-sans cursor-pointer font-bold focus:text-[#0A84FF] transition-colors">
                        <option value="popularity" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Popularity</option>
                        <option value="name" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Name (A-Z)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {categories.filter(cat => CALCULATORS_LIST.some(c => c.category === cat.id && c.name.toLowerCase().includes(searchTerm.toLowerCase()))).map(cat => {
                      const getPopularityScore = (calc: typeof CALCULATORS_LIST[0]) => {
                        let score = 0;
                        if (calc.trending) score += 10;
                        if (calc.featured) score += 5;
                        const basePopularity: Record<string, number> = {
                          'concrete-volume': 6, 'structural-beam': 5, 'utility-convert': 3,
                          'structural-column': 2, 'structural-slab': 1,
                        };
                        score += basePopularity[calc.id] || 0;
                        return score;
                      };
                      const calcs = CALCULATORS_LIST.filter(c => c.category === cat.id && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .sort((a, b) => sortBy === 'popularity' ? getPopularityScore(b) - getPopularityScore(a) : a.name.localeCompare(b.name));
                      const isExpanded = searchTerm.trim() !== '' ? true : (expandedCategories[cat.id] ?? false);
                      return (
                        <div key={cat.id} className="space-y-1.5">
                          <button onClick={() => toggleCategory(cat.id)}
                            className="w-full text-left py-1 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between group cursor-pointer border border-transparent select-none">
                            <span className="text-[10px] font-mono text-[#0F172A] dark:text-slate-200 font-bold uppercase flex items-center tracking-wider">
                              <cat.icon className="w-3.5 h-3.5 mr-1.5 text-[#0A84FF]" />
                              {cat.name}
                            </span>
                            <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                          <motion.div initial={false} animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }} className="overflow-hidden space-y-1 pl-4 border-l border-slate-200/80 dark:border-slate-800">
                            {cat.id === 'bbs' && (
                              <button onClick={() => { setIsMobileCatalogOpen(false); navigate('/bbs'); }}
                                className="w-full text-left py-1 px-2 rounded-lg text-xs font-mono text-[#0A84FF] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                BBS Category Page →
                              </button>
                            )}
                            {calcs.map(calc => (
                              <button key={calc.id} onClick={() => handleSelectCalculator(calc.id)}
                                className={`w-full text-left py-1 px-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between group cursor-pointer ${activeCalcId === calc.id ? 'bg-[#0A84FF]/10 dark:bg-[#0A84FF]/25 text-[#0A84FF] border border-[#0A84FF]/25 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-slate-200 border border-transparent'}`}>
                                <span className="truncate pr-1 group-hover:translate-x-0.5 transition-transform">{calc.name}</span>
                                {calc.trending && <span className="w-1.5 h-1.5 bg-[#0A84FF] rounded-full flex-shrink-0" />}
                              </button>
                            ))}
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chatbot */}
      <ChatBot activeCalcId={activeCalcId} unitSystem={unitSystem} />
    </div>
  );
}
