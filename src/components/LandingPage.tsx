import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Compass, Layers, GitCommit, Grid, Anchor, 
  Sparkles, TrendingUp, ChevronRight, ArrowRight,
  HardHat, Sliders
} from 'lucide-react';
import { CALCULATORS_LIST } from '../data/calculatorsData';
import { CalculatorCategory } from '../types';

interface LandingPageProps {
  onSelectCalculator: (id: string) => void;
  onLaunchDashboard: () => void;
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onSelectCalculator, onLaunchDashboard, onNavigate }: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CalculatorCategory | 'all'>('all');

  // Categories config
  const CATEGORIES = [
    { id: 'all', name: 'All Solutions', icon: 'Calculator', desc: 'Browse full list of civil formulas' },
    { id: 'bbs', name: 'BBS Steel', icon: 'Clipboard', desc: 'Bar bending schedules & cutting lengths' },
    { id: 'structural', name: 'Structural Labs', icon: 'GitCommit', desc: 'Beams, Columns, Deflection margins' },
    { id: 'concrete', name: 'Concrete Mixes', icon: 'Layers', desc: 'Volumes, Bag ratios, costing arrays' },
    { id: 'geotech', name: 'Geotechnical', icon: 'Anchor', desc: 'Bearing capacity & retaining walls' },
    { id: 'survey', name: 'Surveying Plat', icon: 'Compass', desc: 'Height of instrument, leveling traces' },
    { id: 'utility', name: 'Engineering Utilities', icon: 'RefreshCw', desc: 'Conversions, dynamic scales' }
  ];

  // Filtering based on search query and category tab
  const filteredCalculators = CALCULATORS_LIST.filter(calc => {
    const matchesSearch = calc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          calc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || calc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const trendingCalculators = CALCULATORS_LIST.filter(c => c.trending);

  // FAQ block config
  const FAQS = [
    {
      q: 'Which structural standard codes are implemented in CiviCore?',
      a: 'The computing formulas strictly represent building codes including ACI 318-19 (American Concrete Institute) short columns, concrete mixture models, and classic Euler-Bernoulli beam formulas.'
    },
    {
      q: 'Are metric and imperial measurements evaluated in real-time?',
      a: 'Yes, toggling the unit systems globally updates the input thresholds, conversions, material densities, safety parameters, dynamic canvas markings, and final aggregate weights instantly.'
    },
    {
      q: 'Does the CiviCore AI principal review look into local code books?',
      a: 'Yes. The OpenRouter-powered AI assistant processes computed results and anchors safety evaluations against international concrete design standards and ASTM specifications.'
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION with animated blueprint background */}
      <section className="relative pt-12 md:pt-16 text-center overflow-hidden border-b border-slate-200/50 dark:border-slate-900 pb-12">
        
        {/* Absolute Background Blueprint Grid and Circles */}
        <div className="absolute inset-0 blueprint-grid opacity-25 dark:opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] border border-[#0A84FF]/10 dark:border-[#0A84FF]/5 rounded-full pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] md:w-[400px] h-[220px] md:h-[400px] border border-[#0A84FF]/10 dark:border-[#0A84FF]/5 rounded-full border-dashed pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto px-4 space-y-6 z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-950/40 px-3.5 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-900/40 text-[10px] font-mono text-[#0A84FF] tracking-wider font-extrabold uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0A84FF] animate-spin" style={{ animationDuration: '3s' }} />
            <span>CIVIL ENGINEERING WORKSPACE REIMAGINED</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold font-sans tracking-tight text-[#0F172A] dark:text-white leading-[1.1] md:leading-[1.05]"
          >
            Engineering Calculations.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A84FF] via-indigo-500 to-emerald-500">
              Casting the Future.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-sans max-w-2xl mx-auto leading-relaxed"
          >
            Professional, formula-grounded structural, concrete, and surveying calculator utilities crafted for principal researchers, building contractors, and structural estimators.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <button 
              onClick={() => {
                const searchEl = document.getElementById('search-catalog');
                if (searchEl) searchEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3 bg-[#0A84FF] hover:bg-blue-600 text-white font-sans text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/10 cursor-pointer whitespace-nowrap transition-all group"
            >
              <span>Explore Formulas Suite</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onLaunchDashboard}
              className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-sans text-xs font-semibold shadow-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-all"
            >
              <HardHat className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Saved Analytics Sheets</span>
            </button>
          </motion.div>

        </div>
      </section>

      {/* NEW BENTO GRID FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="text-left space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-[#0A84FF] rounded-full"></span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
              Engineering Capabilities
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] dark:text-white font-sans tracking-tight">
            Integrated Civil Estimating Suite
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Card 1: Concrete Volume */}
          <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-xs text-left">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-[#0A84FF] rounded-xl w-10 h-10 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-850 dark:text-white font-sans">Material Volumes Estimator</h4>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 leading-normal">
                Generates raw materials (cement bags, sand bulk weights, aggregate mass) based on shrinkage density factors and customizable waste percentages.
              </p>
            </div>
          </div>

          {/* Card 2: Bar Bending Schedule (BBS) */}
          <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-xs text-left">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-450 rounded-xl w-10 h-10 flex items-center justify-center">
              <Grid className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-850 dark:text-white font-sans">Dynamic BBS Steel Sheets</h4>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 leading-normal">
                Schedules concrete reinforcement schedules, bar counts, splice overlap allowances, hooked anchors, cutting lengths, and exports clean PDF bar shapes tables instantly.
              </p>
            </div>
          </div>

          {/* Card 3: Geotech bearing limits */}
          <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-xs text-left">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-450 rounded-xl w-10 h-10 flex items-center justify-center">
              <Anchor className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-850 dark:text-white font-sans">Geotechnical Limits</h4>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 leading-normal">
                Evaluates Terzaghi soil ultimate bearing pressure capacities, cantilever retaining walls active Earth forces, and safety factor indicators.
              </p>
            </div>
          </div>

          {/* Card 4: Surveying Plat loops */}
          <div className="md:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl space-y-4 shadow-xs text-left">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl w-10 h-10 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-850 dark:text-white font-sans">Leveling & Traverse Platforms</h4>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 leading-normal">
                Solves Height of Instrument (HI) leveling networks and single-leg traverse coordinates (Northing, Easting, elevation) from known station benchmarks.
              </p>
            </div>
          </div>

          {/* Card 5: Engineering Converter */}
          <div className="md:col-span-6 bg-[#0F172A] dark:bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xs text-left text-slate-200">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-1 bg-blue-500/10 border border-blue-500/20 text-[#0A84FF] px-2 py-0.5 rounded-md text-[9px] font-mono uppercase font-bold">
                <Sliders className="w-3 h-3 mr-0.5" strokeWidth={3} /> Dual Measurements Mode
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-white font-sans">Real-time Metric / Imperial Translation</h4>
                <p className="text-[11px] font-mono text-slate-450 leading-relaxed">
                  Toggle between Metric SI and Imperial US systems at any moment. All coefficients, standard ASTM rebar sizes, soil pressures, and dynamic graphical diagrams adjust on the fly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH & FORMULA SELECTOR CATALOG SECTION */}
      <section id="search-catalog" className="max-w-7xl mx-auto px-4 scroll-mt-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 space-y-4 md:space-y-0 text-left">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="w-1.5 h-1.5 bg-[#0A84FF] rounded-full animate-pulse"></span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-450 uppercase tracking-widest block font-bold">Calculator Library</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#0F172A] dark:text-white font-sans tracking-tight">Browse Formula Calculators</h2>
          </div>

          {/* Search bar group */}
          <div className="relative w-full md:w-80 shadow-xs">
            <input 
              type="text" 
              placeholder="Search e.g. Beam, Concrete, Footing..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-slate-850 dark:text-slate-250 outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-450" />
          </div>
        </div>

        {/* Categories togglers */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
               key={cat.id}
               onClick={() => setActiveCategory(cat.id as any)}
               className={`px-4 py-2 rounded-xl text-xs font-mono border whitespace-nowrap transition-all uppercase cursor-pointer ${activeCategory === cat.id ? 'border-[#0A84FF] bg-[#0A84FF]/10 dark:bg-[#0A84FF]/25 text-[#0A84FF] font-bold' : 'border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Calculators grid */}
        {filteredCalculators.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <Search className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">No calculators matched your current criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredCalculators.map((calc, idx) => (
              <motion.div 
                key={calc.id}
                id={idx === 0 ? "tour-calc-card" : undefined}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(0.2, idx * 0.03) }}
                onClick={() => onSelectCalculator(calc.id)}
                className="group relative bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-[#0A84FF] dark:hover:border-[#0A84FF] shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden text-left"
              >
                {/* Visual hover background mesh details */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/20 dark:bg-blue-900/15 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 px-2.5 py-0.5 rounded-full uppercase">
                      {calc.category}
                    </span>
                    {calc.trending && (
                      <span className="text-[8px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/25 dark:border-blue-500/45 font-bold uppercase animate-pulse">
                        Trending
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0A84FF] dark:group-hover:text-[#0A84FF] transition-all font-sans leading-snug">
                    {calc.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed line-clamp-3">
                    {calc.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-[10px] font-mono text-[#0A84FF]">
                  <span>Open Analyst Sheet</span>
                  <ChevronRight className="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* TRENDING CARDS SECTION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-2 mb-6">
          <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full"></span>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block font-bold text-left">Trending Configurations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          {trendingCalculators.slice(0, 3).map((calc) => (
            <div 
              key={calc.id}
              onClick={() => onSelectCalculator(calc.id)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:bg-slate-50/55 dark:hover:bg-slate-850 hover:border-[#0A84FF] dark:hover:border-[#0A84FF] shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">{calc.name}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">ASTM Standards compliant // Live 3D graphics</p>
              </div>
              <span className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-450 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-xs">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AI DESIGN ASSET PANEL */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-[#0F172A] dark:bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl text-left">
          
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-[#0A84FF]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-4 max-w-xl relative z-10">
            <span className="text-[9px] font-mono bg-[#0A84FF]/20 text-[#0A84FF] px-3 py-1 rounded-full border border-[#0A84FF]/30 uppercase font-bold tracking-widest">CiviCore AI Assistant</span>
            <h3 className="text-2xl md:text-3xl font-bold font-sans tracking-tight text-white">Ask AI to optimize parameters on the fly.</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Not sure why your footing undergoes stress failures or why structural beam deflection slips? Type any inquiry inside our AI-Expert grounder to review soil parameters against code books instantly.
            </p>
          </div>

          <div className="p-4 bg-[#1e293b]/50 dark:bg-[#0F172A]/80 border border-slate-700/60 dark:border-slate-800 rounded-2xl w-full md:w-80 font-mono text-[11px] space-y-3.5 backdrop-blur-md relative z-10 shadow-lg text-slate-300">
            <div className="text-slate-400 dark:text-slate-500 text-[9px] border-b border-slate-800 pb-1.5 uppercase">AI SIMULATION LABS</div>
            <div className="text-[#0A84FF] font-bold flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-450 dark:text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} /> CiviCore Assistant:
            </div>
            <p className="text-slate-200 leading-normal">
              "We recommend increasing structural footing widths to 1.8m. This leverages Terzaghi\'s cohesive factors and elevates the factor of safety margin to 3.2, passing building protocols is achieved."
            </p>
          </div>
        </div>
      </section>

      {/* DETAILED FAQS */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-455 uppercase tracking-widest block font-bold">Rigid Standards Compliance</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">Frequently Answered Queries</h3>
        </div>

        <div className="space-y-4 font-sans text-left">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-start space-x-2.5">
                <span className="p-1.5 bg-blue-50 dark:bg-blue-950 text-[#0A84FF] rounded-lg text-xs font-mono font-bold">Q</span>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 pt-1">{faq.q}</h4>
              </div>
              <p className="text-[11px] font-mono text-slate-550 dark:text-slate-400 leading-relaxed pl-9">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* LANDING FOOTER */}
      <footer className="text-center font-mono text-[10px] text-slate-550 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800/80 pt-8 mt-12 max-w-7xl mx-auto space-y-3">
        <div className="flex justify-center items-center space-x-6 text-[#0A84FF] font-bold">
          <button onClick={() => onNavigate('about')} className="hover:underline transition-all cursor-pointer">About Us</button>
          <button onClick={() => onNavigate('contact')} className="hover:underline transition-all cursor-pointer">Contact</button>
          <button onClick={() => onNavigate('privacy')} className="hover:underline transition-all cursor-pointer">Privacy Policy</button>
        </div>
        <p>© 2026 CiviCore Inc. Professional Civil Calculation Labs. Compliance: ACI, Eurocodes & ASTM Standards.</p>
        <p className="mt-1 text-slate-400 dark:text-slate-500">
          Product vision built with rigorous engineering safety parameters. Developed by{" "}
          <a 
            href="https://lk.linkedin.com/in/sithum-d-edirisingha" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#0A84FF] hover:underline font-bold transition-all"
          >
            Sithum D. Edirisingha
          </a>.
        </p>
      </footer>

    </div>
  );
}
