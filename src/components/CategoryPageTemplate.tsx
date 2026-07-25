import { useState, ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search, ChevronRight, Sparkles, Clipboard, Layers, GitCommit, Anchor, Compass, RefreshCw, Grid,
} from 'lucide-react';
import { SEOHead, CATEGORY_META, CATEGORY_PATH_MAP, getCalculatorSlug } from '../utils/seo';
import { CalculatorCategory, CalculatorDef } from '../types';
import { CALCULATORS_LIST } from '../data/calculatorsData';

interface CategoryPageProps {
  category: CalculatorCategory;
  subCalculators?: { id: string; name: string; description: string; path: string }[];
  heroTitle?: string;
  heroSubtitle?: string;
}

const ICON_MAP: Record<string, ComponentType<any>> = {
  Clipboard, Layers, GitCommit, Anchor, Compass, RefreshCw, Grid, Search, Sparkles,
};

export default function CategoryPageTemplate({ category, subCalculators, heroTitle, heroSubtitle }: CategoryPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const meta = CATEGORY_META[category];
  const categoryPath = CATEGORY_PATH_MAP[category];

  const getSlug = (calcDef: typeof CALCULATORS_LIST[0]) => {
    if (calcDef.id.startsWith(calcDef.category + '-')) return calcDef.id.substring(calcDef.category.length + 1);
    return calcDef.id;
  };

  const calculators = subCalculators || CALCULATORS_LIST
    .filter(c => c.category === category)
    .map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      path: `/${categoryPath}/${getSlug(c) || getCalculatorSlug(c)}`,
    }));

  const filtered = calculators.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const FAQS: { question: string; answer: string }[] = [
    {
      question: `What standards are used in the ${meta.name} calculators?`,
      answer: `All ${meta.name} calculators implement industry-standard formulas. BBS calculators support ACI 318, BS 8110, Eurocode 2, and IS 456. Structural calculators use ACI 318-19 formulations. Geotechnical tools use Terzaghi and Rankine methods.`,
    },
    {
      question: 'Can I switch between metric and imperial units?',
      answer: 'Yes. All calculators support real-time toggling between Metric (SI) and Imperial (US) unit systems. All inputs, outputs, and visualizations update instantly.',
    },
    {
      question: 'Can I save my calculations?',
      answer: 'Yes. Each calculator includes a Save function that stores your inputs and results locally. You can view, reload, or delete saved calculations from the Analytics dashboard.',
    },
    {
      question: 'Are the results exportable?',
      answer: 'Yes. BBS calculators support PDF, Excel (XLSX), and CSV export. Other calculators support copying results and saving to your local project history.',
    },
  ];

  return (
    <>
      <SEOHead meta={{
        title: `${meta.name} Calculators`,
        description: meta.description,
        path: `/${categoryPath}`,
        type: 'website',
        breadcrumbs: [{ name: 'Home', url: '/' }, { name: meta.name, url: `/${categoryPath}` }],
        faqs: FAQS,
        schema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${meta.name} Calculators`,
          description: meta.description,
        },
      }} />

      {/* Hero */}
      <section className="relative pt-8 md:pt-12 text-center overflow-hidden border-b border-slate-200/50 dark:border-slate-900 pb-10 mb-8">
        <div className="absolute inset-0 blueprint-grid opacity-25 dark:opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-4 z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-950/40 px-3.5 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-900/40 text-[10px] font-mono text-[#0A84FF] tracking-wider font-extrabold uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#0A84FF]" /><span>{meta.name}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold font-sans tracking-tight text-[#0F172A] dark:text-white leading-tight">
            {heroTitle || meta.heroTitle}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-sans max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle || meta.heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-8 px-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search calculators..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#0A84FF] font-mono placeholder:text-slate-400" />
        </div>
      </div>

      {/* Calculator Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <Search className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-mono">No calculators found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((calc, idx) => (
              <motion.div key={calc.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: Math.min(0.2, idx * 0.03) }}
                onClick={() => navigate(calc.path)}
                className="group relative bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between hover:border-[#0A84FF] dark:hover:border-[#0A84FF] shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/20 dark:bg-blue-900/15 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0A84FF] transition-all font-sans leading-snug">
                    {calc.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed line-clamp-3">
                    {calc.description}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-[10px] font-mono text-[#0A84FF]">
                  <span>Open Calculator</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Frequently Asked Questions</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">About {meta.name}</h3>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-xs">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{faq.question}</h4>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Categories */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Explore Other Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(CATEGORY_META).filter(([key]) => key !== category).map(([key, catMeta]) => (
              <button key={key} onClick={() => navigate(`/${CATEGORY_PATH_MAP[key as CalculatorCategory]}`)}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#0A84FF]/40 text-left transition-all cursor-pointer">
                <span className="text-[10px] font-bold font-mono text-slate-600 dark:text-slate-300 capitalize">{catMeta.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center font-mono text-[10px] text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800/80 pt-8 pb-8 max-w-7xl mx-auto space-y-3 px-4">
        <div className="flex justify-center items-center space-x-6 text-[#0A84FF] font-bold">
          <button onClick={() => navigate('/about')} className="hover:underline cursor-pointer">About Us</button>
          <button onClick={() => navigate('/contact')} className="hover:underline cursor-pointer">Contact</button>
          <button onClick={() => navigate('/privacy')} className="hover:underline cursor-pointer">Privacy Policy</button>
        </div>
        <p>© 2026 CivilMath Inc. Professional Civil Calculation Labs. Compliance: ACI, Eurocodes & ASTM Standards.</p>
        <p className="text-slate-400">Built with rigorous engineering safety parameters.</p>
      </footer>
    </>
  );
}
