import { useState, ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search, ChevronRight, Sparkles, Clipboard, Layers, GitCommit, Anchor, Compass, RefreshCw, Grid, Clock,
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
      <section className="relative pt-10 md:pt-16 pb-8 text-center">
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2563EB]/10 dark:bg-[#2563EB]/15 border border-[#2563EB]/20 rounded-full text-[10px] font-bold text-[#2563EB] uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            {meta.name}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-3xl mx-auto">
          {heroTitle || meta.heroTitle}
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {heroSubtitle || meta.heroSubtitle}
        </p>
      </section>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563EB] to-[#4DA6FF] rounded-2xl opacity-15 group-hover:opacity-25 blur transition-opacity" />
          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs group-hover:shadow-sm transition-all">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search calculators..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400" />
          </div>
        </div>
      </div>

      {/* Calculator Cards */}
      <div className="pb-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No calculators found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((calc, idx) => (
              <motion.div key={calc.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: Math.min(0.15, idx * 0.03) }}
                onClick={() => navigate(calc.path)}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#2563EB]/10 dark:bg-[#2563EB]/15 text-[#2563EB] shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#2563EB] transition-colors">{calc.name}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">{calc.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-[9px] text-slate-400">
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> ~2 min</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ + Explore */}
      <section className="max-w-4xl mx-auto pb-16 space-y-10">
        {/* FAQ */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 text-center">Frequently Asked Questions</h3>
          <div className="space-y-2">
            {FAQS.map((faq, idx) => (
              <details key={idx} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-shadow hover:shadow-xs">
                <summary className="px-4 py-3.5 text-[11px] font-semibold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center justify-between list-none">
                  {faq.question}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <div className="px-4 pb-3.5 text-[10px] text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Related Categories */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Explore Other Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(CATEGORY_META).filter(([key]) => key !== category).map(([key, catMeta]) => (
              <button key={key} onClick={() => navigate(`/${CATEGORY_PATH_MAP[key as CalculatorCategory]}`)}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#2563EB]/40 hover:shadow-xs transition-all text-left cursor-pointer">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 capitalize">{catMeta.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800/80 pt-8 pb-8 space-y-3">
        <div className="flex justify-center items-center gap-6 font-semibold">
          <button onClick={() => navigate('/about')} className="hover:text-[#2563EB] transition-colors cursor-pointer">About Us</button>
          <button onClick={() => navigate('/contact')} className="hover:text-[#2563EB] transition-colors cursor-pointer">Contact</button>
          <button onClick={() => navigate('/privacy')} className="hover:text-[#2563EB] transition-colors cursor-pointer">Privacy</button>
        </div>
        <p>© 2026 CivilMath Inc. Professional Civil Calculation Labs.</p>
      </footer>
    </>
  );
}
