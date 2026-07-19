import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, GitCommit, Grid, Server, Anchor, Trello, Compass, RefreshCw,
  HardHat, Bookmark, Sparkles, Sliders, Layout, Home, CheckCircle2, Moon, Sun, 
  HelpCircle, ChevronRight, Activity, Search, X, ArrowUpDown, Clipboard,
  FileText, Copy, Check, Hammer, ListCollapse, Menu
} from 'lucide-react';
import { UnitSystem, SavedCalculation, CURRENCY_MAPPING } from './types';
import { CALCULATORS_LIST } from './data/calculatorsData';
import LandingPage from './components/LandingPage';
import { AboutPage, ContactPage, PrivacyPolicyPage } from './components/StaticPages';
import CalculatorWorkspace from './components/CalculatorWorkspace';
import MainDashboard from './components/MainDashboard';
import { ChatBot } from './components/ChatBot';
import { trackEvent, trackPageView } from './utils/analytics';

export default function App() {
  // Global States
  const [navActive, setNavActive] = useState<'landing' | 'workspace' | 'dashboard' | 'about' | 'contact' | 'privacy'>('landing');
  const [isSidebarCollapsed] = useState<boolean>(true);
  const [isDraftingDeskOpen, setIsDraftingDeskOpen] = useState<boolean>(() => {
    return localStorage.getItem('civicore_drafting_desk_open') === 'true';
  });
  const [draftingNotes, setDraftingNotes] = useState<string>(() => {
    return localStorage.getItem('civicore_drafting_notes') || '• Project specification codes: ASTM A615 Grade 60\n• Target concrete compressive strength: f\'c = 25 MPa\n• Clear concrete cover defaults: 40mm (Footings), 25mm (Beams)\n• Safety Factor target: SF = 3.0';
  });

  const [activeCalcId, setActiveCalcId] = useState<string>('concrete-volume');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('civicore_currency') || 'USD';
  });

  // Copy notification state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 1500);
  };

  // Dark Mode System Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('civicore_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save notes and desk preferences on changes
  useEffect(() => {
    localStorage.setItem('civicore_drafting_notes', draftingNotes);
  }, [draftingNotes]);

  useEffect(() => {
    localStorage.setItem('civicore_drafting_desk_open', String(isDraftingDeskOpen));
  }, [isDraftingDeskOpen]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('civicore_theme', newTheme);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem('civicore_currency', newCurrency);
  };
  
  // Search state for sidebar catalog
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'name'>('popularity');
  const [isMobileCatalogOpen, setIsMobileCatalogOpen] = useState<boolean>(false);
  
  // Collapsible dashboard/sidebar categories
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({
    structural: false,
    concrete: false,
    survey: false,
    utility: false,
    bbs: true,
    geotech: false,
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Auto-expand category on active calculator change
  useEffect(() => {
    const activeCalc = CALCULATORS_LIST.find(c => c.id === activeCalcId);
    if (activeCalc?.category) {
      setExpandedCategories(prev => ({
        ...prev,
        [activeCalc.category]: true
      }));
    }
  }, [activeCalcId]);

  // Google Analytics — section views
  useEffect(() => {
    trackPageView(`civicore/${navActive}`);
  }, [navActive]);

  // Google Analytics — calculator usage
  useEffect(() => {
    if (navActive === 'workspace') {
      trackEvent('calculator_select', { calculator_id: activeCalcId });
    }
  }, [activeCalcId, navActive]);
  
  // local persistence for saved sheets
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [loadedCalculation, setLoadedCalculation] = useState<SavedCalculation | null>(null);

  // Load calculations on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem('civicore_saved_calcs');
      if (stored) {
        setSavedCalculations(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Local storage read failure:", e);
    }
  }, []);

  const handleSaveCalculation = (newCalc: SavedCalculation) => {
    const updated = [newCalc, ...savedCalculations];
    setSavedCalculations(updated);
    try {
      localStorage.setItem('civicore_saved_calcs', JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage save failure:", e);
    }
  };

  const handleDeleteCalculation = (id: string) => {
    const updated = savedCalculations.filter(calc => calc.id !== id);
    setSavedCalculations(updated);
    try {
      localStorage.setItem('civicore_saved_calcs', JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage delete failure:", e);
    }
  };

  const handleLoadSavedCalculation = (calc: SavedCalculation) => {
    setLoadedCalculation(calc);
    setActiveCalcId(calc.calculatorId);
    setUnitSystem(calc.unitSystem);
    setNavActive('workspace');
  };

  const handleSelectCalculatorFromLanding = (id: string) => {
    setLoadedCalculation(null);
    setActiveCalcId(id);
    setNavActive('workspace');
  };

  // Group calculators nicely for Sidebar Catalog
  const categories = [
    { id: 'bbs', name: 'BBS Calculator', icon: Clipboard },
    { id: 'structural', name: 'Structural Labs', icon: GitCommit },
    { id: 'concrete', name: 'Concrete Mix', icon: Layers },
    { id: 'geotech', name: 'Geotechnical', icon: Anchor },
    { id: 'survey', name: 'Surveying Plat', icon: Compass },
    { id: 'utility', name: 'Utilities', icon: RefreshCw }
  ];

  const activeCalculatorDef = CALCULATORS_LIST.find(c => c.id === activeCalcId);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090F1C] text-slate-800 dark:text-slate-100 flex flex-col font-sans relative overflow-hidden transition-colors duration-200">
      
      {/* Ambient background blur blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/15 dark:bg-blue-900/10 rounded-full filter blur-3xl opacity-60 dark:opacity-45 animate-blob pointer-events-none"></div>
      <div className="absolute top-[30vh] right-10 w-96 h-96 bg-emerald-300/15 dark:bg-emerald-900/5 rounded-full filter blur-3xl opacity-60 dark:opacity-35 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-20 left-[25%] w-80 h-80 bg-purple-300/15 dark:bg-purple-900/10 rounded-full filter blur-3xl opacity-50 dark:opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Background blueprint details */}
      <div className="absolute inset-0 blueprint-grid opacity-35 dark:opacity-15 pointer-events-none"></div>

      {/* FIXED PLATFORM HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/75 dark:bg-[#090F1C]/75 border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 md:py-4 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo with Green healthy engine dot */}
          <div 
            onClick={() => setNavActive('landing')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="p-2 bg-[#0A84FF] text-white rounded-xl shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-md font-black tracking-tight font-sans text-[#0F172A] dark:text-white">CiviCore</span>
                <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-ping"></span>
              </div>
              <p className="text-[8px] font-mono text-slate-550 dark:text-slate-400 uppercase tracking-widest leading-none">STRUCTURAL SUITE</p>
            </div>
          </div>

          {/* Center Tabs Navigations */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-900/85 border border-slate-200/85 dark:border-slate-800 backdrop-blur-md rounded-2xl p-1 text-xs font-sans font-semibold text-slate-500 dark:text-slate-400">
            <button 
              onClick={() => setNavActive('landing')}
              className={`px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${navActive === 'landing' ? 'bg-[#0A84FF] text-white shadow-sm' : 'hover:text-[#0F172A] dark:hover:text-white'}`}
            >
              <Home className="w-4 h-4" />
              <span>Explore Suite</span>
            </button>
            <button 
              onClick={() => setNavActive('workspace')}
              className={`px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${navActive === 'workspace' ? 'bg-[#0A84FF] text-white shadow-sm' : 'hover:text-[#0F172A] dark:hover:text-white'}`}
            >
              <Sliders className="w-4 h-4" />
              <span>Analysis Desk</span>
            </button>
            <button 
              onClick={() => setNavActive('dashboard')}
              className={`px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer ${navActive === 'dashboard' ? 'bg-[#0A84FF] text-white shadow-sm' : 'hover:text-[#0F172A] dark:hover:text-white'}`}
            >
              <Layout className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Right Control Panels */}
          <div className="flex items-center space-x-3 flex-wrap justify-end gap-y-2">
            
            {/* Global Currency Selection dropdown */}
            <div className="bg-slate-100/80 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 flex items-center text-[10px] font-mono shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] mr-1 border-r border-slate-200 dark:border-slate-800 pr-1.5 h-3.5 flex items-center">CURRENCY</span>
              <select
                id="global-currency-select"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="bg-transparent border-none outline-none font-mono cursor-pointer focus:text-[#0A84FF] transition-colors font-bold pr-1 text-slate-700 dark:text-slate-300 text-[10px]"
                aria-label="Universal currency preferences"
              >
                {Object.entries(CURRENCY_MAPPING).map(([code, details]) => (
                  <option key={code} value={code} className="font-mono text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {code} ({details.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Units selector */}
            <div className="bg-slate-100/80 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex items-center text-[10px] font-mono shadow-xs">
              <button 
                onClick={() => setUnitSystem('metric')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${unitSystem === 'metric' ? 'bg-[#0A84FF] font-bold text-white shadow-xs' : 'text-slate-550 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'}`}
              >
                METRIC (SI)
              </button>
              <button 
                onClick={() => setUnitSystem('imperial')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${unitSystem === 'imperial' ? 'bg-[#0A84FF] font-bold text-white shadow-xs' : 'text-slate-550 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'}`}
              >
                IMPERIAL (US)
              </button>
            </div>

            {/* Dark Mode Toggle Switch */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/85 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-xs cursor-pointer flex items-center justify-center h-8 w-8"
              title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Micro Dashboard action on mobile */}
            <button 
              onClick={() => setNavActive('dashboard')}
              className="md:hidden p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer shadow-xs"
              aria-label="Toggle mobile stats"
            >
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
            </button>

          </div>
        </div>
      </header>

      {/* MOBILE COMPANION BOTTOM TABS */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white/85 dark:bg-[#090F1C]/85 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl backdrop-blur-lg flex items-center space-x-1 text-xs font-sans font-semibold text-slate-500 dark:text-slate-400 w-[280px] justify-between">
        <button 
          onClick={() => setNavActive('landing')}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all cursor-pointer ${navActive === 'landing' ? 'bg-[#0A84FF] text-white shadow-sm' : 'hover:text-[#0F172A] dark:hover:text-white'}`}
        >
          <Home className="w-3.5 h-3.5" />
          <span className="text-[9px]">Explore</span>
        </button>
        <button 
          onClick={() => setNavActive('workspace')}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all cursor-pointer ${navActive === 'workspace' ? 'bg-[#0A84FF] text-white shadow-sm' : 'hover:text-[#0F172A] dark:hover:text-white'}`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="text-[9px]">Workspace</span>
        </button>
        <button 
          onClick={() => setNavActive('dashboard')}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center justify-center space-y-0.5 transition-all cursor-pointer ${navActive === 'dashboard' ? 'bg-[#0A84FF] text-white shadow-sm' : 'hover:text-[#0F172A] dark:hover:text-white'}`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span className="text-[9px]">Analytics</span>
        </button>
      </div>

      {/* CORE ROUTING SHELL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 mb-16 md:mb-0 relative z-10">
        <AnimatePresence mode="wait">
          {navActive === 'landing' && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <LandingPage 
                onSelectCalculator={handleSelectCalculatorFromLanding} 
                onLaunchDashboard={() => setNavActive('dashboard')}
                onNavigate={(page) => setNavActive(page as any)}
              />
            </motion.div>
          )}

          {navActive === 'about' && (
            <AboutPage onBack={() => setNavActive('landing')} />
          )}
          
          {navActive === 'contact' && (
            <ContactPage onBack={() => setNavActive('landing')} />
          )}
          
          {navActive === 'privacy' && (
            <PrivacyPolicyPage onBack={() => setNavActive('landing')} />
          )}

          {navActive === 'workspace' && (
            <div className="space-y-4">
              
              {/* BRAND NEW WORKSPACE TOP BREADCRUMB AND COMPLIANCE BAR */}
              <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl px-5 py-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs backdrop-blur-md text-left">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-[#0A84FF] rounded-lg">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 uppercase font-bold">
                      <span>CIVICORE HUB</span>
                      <span>/</span>
                      <span>WORKSPACE</span>
                      <span>/</span>
                      <span className="text-[#0A84FF]">{activeCalculatorDef?.category}</span>
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-800 dark:text-white font-sans mt-0.5 tracking-tight">
                      {activeCalculatorDef?.name || 'Calculator Sheet'}
                    </h2>
                  </div>
                </div>

                {/* Status Pills */}
                <div className="flex items-center space-x-2 flex-wrap">
                  <button 
                    onClick={() => setIsMobileCatalogOpen(true)}
                    className="inline-flex items-center text-[9px] font-sans font-bold bg-[#0A84FF] hover:bg-blue-600 active:bg-blue-700 text-white px-2.5 py-1 rounded border border-blue-500/20 shadow-xs cursor-pointer transition-all"
                  >
                    <Menu className="w-3.5 h-3.5 mr-1" /> CALCULATION MODULES
                  </button>
                  <span className="inline-flex items-center text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 px-2 py-0.5 rounded border border-emerald-500/15">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> CALIBRATED CODES
                  </span>
                  <span className="inline-flex items-center text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-950 text-slate-550 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    ACI 318 compliant
                  </span>
                  <button 
                    onClick={() => setIsDraftingDeskOpen(!isDraftingDeskOpen)}
                    className={`inline-flex items-center text-[9px] font-mono font-bold px-2 py-0.5 rounded border cursor-pointer transition-colors ${isDraftingDeskOpen ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 text-slate-550 border-slate-200 dark:border-slate-800'}`}
                  >
                    <FileText className="w-3 h-3 mr-1 text-amber-500" /> NOTES {isDraftingDeskOpen ? 'OPEN' : 'CLOSED'}
                  </button>
                </div>
              </div>

              {/* MAIN LAYOUT SPLITTER GRID */}
              <motion.div 
                key="workspace"
                initial={{ opacity: 0, scale: 0.995 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start"
              >
                
                {/* SIDEBAR CATALOG: Filter list layout span 3 */}
                {/* ACTIVE WORKSPACE PANEL: adjusts span based on side drawers being open/closed */}
                <div className={`${
                  isSidebarCollapsed && !isDraftingDeskOpen ? "xl:col-span-12 w-full" : 
                  !isSidebarCollapsed && isDraftingDeskOpen ? "xl:col-span-6 w-full" :
                  isSidebarCollapsed && isDraftingDeskOpen ? "xl:col-span-9 w-full" : 
                  "xl:col-span-9 w-full"
                }`}>
                  <CalculatorWorkspace 
                    calculatorId={activeCalcId} 
                    unitSystem={unitSystem} 
                    setUnitSystem={setUnitSystem}
                    onSaveCalculation={handleSaveCalculation}
                    savedCalculations={savedCalculations}
                    loadedCalculation={loadedCalculation}
                    currency={currency}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsMobileCatalogOpen(true)}
                  />
                </div>

                {/* BRAND NEW INTERACTIVE DRAFTING DESK & SCRATCHPAD (Collapsible Col 3) */}
                {isDraftingDeskOpen && (
                  <motion.aside 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="xl:col-span-3 bg-white/80 dark:bg-slate-900/65 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl backdrop-blur-lg shadow-xs space-y-4 text-left"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-150 dark:border-slate-800">
                      <div className="flex items-center space-x-1.5">
                        <Hammer className="w-4 h-4 text-amber-500" />
                        <h4 className="text-[10px] font-mono text-slate-700 dark:text-slate-300 uppercase tracking-widest font-black">Drafting Desk</h4>
                      </div>
                      <button 
                        onClick={() => setIsDraftingDeskOpen(false)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                        title="Close Drafting Desk"
                      >
                        <ListCollapse className="w-3.5 h-3.5 text-slate-450" />
                      </button>
                    </div>

                    {/* Persisted Engineer Notes Area */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-mono text-slate-550 dark:text-slate-455 uppercase tracking-wider font-extrabold flex justify-between">
                        <span>Notebook Scribbler</span>
                        <span className="text-[8px] text-[#0A84FF]">Auto-saved offline</span>
                      </label>
                      <textarea
                        aria-label="Engineer personal scratchpad notes"
                        rows={6}
                        value={draftingNotes}
                        onChange={(e) => setDraftingNotes(e.target.value)}
                        placeholder="Draft client parameters or bar counts checklist here..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-700 dark:text-slate-300 outline-none focus:border-amber-500 resize-none leading-relaxed"
                      />
                    </div>

                    {/* Quick copyable Safety Presets */}
                    <div className="space-y-2">
                      <div className="text-[9px] font-mono text-slate-550 dark:text-slate-455 uppercase tracking-wider font-extrabold">Safety Factor Presets</div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleCopy("3.0", "SF_SOIL")}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2 rounded-xl text-left hover:border-[#0A84FF] transition-all cursor-pointer relative"
                        >
                          <span className="text-[8px] text-slate-450 block uppercase font-bold">Soil limits</span>
                          <span className="text-xs font-black font-mono text-slate-800 dark:text-white block mt-0.5">SF = 3.0</span>
                          <div className="absolute right-2 bottom-2">
                            {copiedText === "SF_SOIL" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
                          </div>
                        </button>

                        <button 
                          onClick={() => handleCopy("1.5", "SF_CONC")}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-2 rounded-xl text-left hover:border-[#0A84FF] transition-all cursor-pointer relative"
                        >
                          <span className="text-[8px] text-slate-450 block uppercase font-bold">Concrete dead</span>
                          <span className="text-xs font-black font-mono text-slate-800 dark:text-white block mt-0.5">1.50 multiplier</span>
                          <div className="absolute right-2 bottom-2">
                            {copiedText === "SF_CONC" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* ASTM Quick Reference */}
                    <div className="space-y-1.5 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/10 dark:border-amber-500/10 p-3 rounded-2xl text-[10px] font-mono text-slate-500">
                      <div className="font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider border-b border-amber-500/15 pb-1 mb-1">
                        COEF REFERENCE (ASTM)
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Rebar Weight:</span>
                          <span className="text-[#0A84FF] font-bold">d² / 162</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Concrete Density:</span>
                          <span className="text-[#0A84FF] font-bold">2400 kg/m³</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Steel Density:</span>
                          <span className="text-[#0A84FF] font-bold">7850 kg/m³</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Eurocode SF:</span>
                          <span className="text-[#0A84FF] font-bold">1.35 (Dead)</span>
                        </div>
                      </div>
                    </div>

                  </motion.aside>
                )}

              </motion.div>
            </div>
          )}

          {navActive === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4 mb-6 text-left">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">CiviCore Analytics Dashboard</h2>
                <p className="text-xs text-slate-500 font-mono">TRACKING SCHEDULED CONCRETE CASTINGS, DEFLECTION BENDS AND REBAR STANDARD MATRICES</p>
              </div>

              <MainDashboard 
                savedCalculations={savedCalculations}
                onLoadCalculation={handleLoadSavedCalculation}
                onDeleteCalculation={handleDeleteCalculation}
                unitSystem={unitSystem}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MOBILE SLIDE-OUT CATALOG DRAWER */}
      <AnimatePresence>
        {isMobileCatalogOpen && (
          <div className="fixed inset-0 z-50 flex justify-start">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileCatalogOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            
            {/* Drawer panel */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 h-full w-[310px] sm:w-[350px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-5 shadow-2xl overflow-y-auto flex flex-col text-left"
            >
              {/* Header of Drawer */}
              <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-[#0A84FF]" />
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-white uppercase tracking-wider">Civil Calculators</span>
                </div>
                <button 
                  onClick={() => setIsMobileCatalogOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Search and List */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-mono text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold">CALCULATION MODULES</h4>
                    {searchTerm.trim() !== '' && (
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-bold">
                        {CALCULATORS_LIST.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length} found
                      </span>
                    )}
                  </div>

                  {/* Search and Sort controls */}
                  <div className="space-y-2 mb-4">
                    {/* Search input field */}
                    <div className="relative flex items-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-[#0A84FF] focus-within:ring-1 focus-within:ring-[#0A84FF] transition-all shadow-2xs px-2.5 py-1.5">
                      <Search className="w-3.5 h-3.5 text-slate-450 dark:text-slate-550 mr-2 flex-shrink-0" />
                      <input 
                        type="text"
                        placeholder="Search calculators..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-100 placeholder-slate-450 font-sans"
                      />
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="p-1 hover:bg-slate-150 dark:hover:bg-slate-850 rounded-full cursor-pointer transition-colors"
                          aria-label="Clear search"
                        >
                          <X className="w-3 h-3 text-slate-450" />
                        </button>
                      )}
                    </div>

                    {/* Sorting dropdown */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] font-medium text-slate-650 dark:text-slate-400">
                      <span className="flex items-center text-slate-500 dark:text-slate-505 font-bold uppercase tracking-wider text-[9px]">
                        <ArrowUpDown className="w-3 h-3 mr-1 text-[#0A84FF]" /> Sort
                      </span>
                      <select
                        id="sort-calculators-select-mobile"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'popularity' | 'name')}
                        className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-350 font-sans cursor-pointer font-bold focus:text-[#0A84FF] transition-colors"
                        aria-label="Sort configuration"
                      >
                        <option value="popularity" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Popularity</option>
                        <option value="name" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Name (A-Z)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {categories
                      .filter((cat) => 
                        CALCULATORS_LIST.some(c => c.category === cat.id && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map((cat) => {
                        const getPopularityScore = (calc: typeof CALCULATORS_LIST[0]) => {
                          let score = 0;
                          if (calc.trending) score += 10;
                          if (calc.featured) score += 5;
                          const basePopularity: Record<string, number> = {
                            'concrete-volume': 6,
                            'structural-beam': 5,
                            'utility-convert': 3,
                            'structural-column': 2,
                            'structural-slab': 1,
                          };
                          score += basePopularity[calc.id] || 0;
                          return score;
                        };

                        const calcs = CALCULATORS_LIST.filter(c => 
                           c.category === cat.id && 
                           c.name.toLowerCase().includes(searchTerm.toLowerCase())
                        ).sort((a, b) => {
                          if (sortBy === 'popularity') {
                            const scoreA = getPopularityScore(a);
                            const scoreB = getPopularityScore(b);
                            if (scoreB !== scoreA) return scoreB - scoreA;
                            return a.name.localeCompare(b.name);
                          } else {
                            return a.name.localeCompare(b.name);
                          }
                        });
                        const isExpanded = searchTerm.trim() !== '' ? true : (expandedCategories[cat.id] ?? false);
                        return (
                          <div key={cat.id} className="space-y-1.5">
                            <button
                              onClick={() => toggleCategory(cat.id)}
                              className="w-full text-left py-1 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between group cursor-pointer border border-transparent select-none"
                              aria-expanded={isExpanded}
                            >
                              <span className="text-[10px] font-mono text-[#0F172A] dark:text-slate-250 font-bold uppercase flex items-center tracking-wider">
                                <cat.icon className="w-3.5 h-3.5 mr-1.5 text-[#0A84FF]" />
                                {cat.name}
                              </span>
                              <ChevronRight 
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                              />
                            </button>
                            
                            <motion.div
                              initial={false}
                              animate={{
                                height: isExpanded ? 'auto' : 0,
                                opacity: isExpanded ? 1 : 0
                              }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden space-y-1 pl-4 border-l border-slate-200/80 dark:border-slate-800"
                            >
                              {calcs.map((calc) => (
                                <button
                                  key={calc.id}
                                  onClick={() => {
                                    setLoadedCalculation(null);
                                    setActiveCalcId(calc.id);
                                    setIsMobileCatalogOpen(false);
                                  }}
                                  className={`w-full text-left py-1 px-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between group cursor-pointer ${activeCalcId === calc.id ? 'bg-[#0A84FF]/10 dark:bg-[#0A84FF]/25 text-[#0A84FF] border border-[#0A84FF]/25 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-slate-250 border border-transparent'}`}
                                >
                                  <span className="truncate pr-1 group-hover:translate-x-0.5 transition-transform">{calc.name}</span>
                                  {calc.trending && (
                                    <span className="w-1.5 h-1.5 bg-[#0A84FF] rounded-full flex-shrink-0"></span>
                                  )}
                                </button>
                              ))}
                            </motion.div>
                          </div>
                        );
                      })}

                    {categories.filter((cat) => 
                      CALCULATORS_LIST.some(c => c.category === cat.id && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs font-sans">
                        No matching calculators found
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50/90 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-[10px] font-mono leading-relaxed text-slate-500 dark:text-slate-400 space-y-1 text-left">
                  <div className="flex items-center text-slate-700 dark:text-slate-300 font-bold uppercase text-[9px] tracking-wider mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] mr-1" /> CIVIL VERIFICATION
                  </div>
                  <span>Formulas verified against structural code records. Adjust loading forces relative to safety benchmarks.</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CiviCore AI Assistant Floating Chatbot */}
      <ChatBot activeCalcId={activeCalcId} unitSystem={unitSystem} />
    </div>
  );
}
