import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ChevronRight, Clipboard } from 'lucide-react';
import { useState } from 'react';
import { SEOHead } from '../utils/seo';
import { STRUCTURES } from '../UniversalBBSCalculator/types';

const STRUCTURE_CARDS = STRUCTURES.map(s => ({
  id: s.id,
  name: s.label,
  description: `Professional bar bending schedule for ${s.label.toLowerCase()} reinforcement. Generates cutting lengths, bar marks, weight schedules, and shape codes.`,
  path: `/bbs/${s.id}`,
  icon: Clipboard,
}));

const BBS_FAQS: { question: string; answer: string }[] = [
  {
    question: 'What is a Bar Bending Schedule?',
    answer: 'A Bar Bending Schedule (BBS) is a detailed list of all reinforcement bars required for a concrete structure. It includes bar marks, diameters, lengths, shapes, bending details, and quantities needed for procurement and site execution.',
  },
  {
    question: 'Which design codes are supported?',
    answer: 'The BBS calculator supports ACI 318 (American), BS 8110 (British), Eurocode 2 (European), and IS 456 (Indian) standards. You can switch between codes to match your project requirements.',
  },
  {
    question: 'What shape codes are available?',
    answer: 'The calculator supports standard shape codes from 00 to 91, including straight bars, hooks, bends, U-bars, stirrups, ties, and complex shapes. Each shape code includes automatic cutting length formulas.',
  },
  {
    question: 'Can I export the BBS to PDF or Excel?',
    answer: 'Yes. Each BBS calculation includes export options for PDF (landscape professional format), Excel (XLSX with styled headers), and CSV. Multi-member projects have a built-in Project Summary with material totals.',
  },
];

export default function BBSCategoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = STRUCTURE_CARDS.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEOHead meta={{
        title: 'Bar Bending Schedule Calculators',
        description: 'Professional rebar bending schedule calculators for footings, beams, columns, slabs, stairs, retaining walls, raft foundations, pedestals, and more. ACI 318, BS 8110, Eurocode 2, IS 456.',
        path: '/bbs',
        type: 'website',
        breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'BBS Calculators', url: '/bbs' }],
        faqs: BBS_FAQS,
        schema: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Bar Bending Schedule Calculators',
          description: 'Professional rebar bending schedule calculators for all RC structure types.',
        },
      }} />

      {/* Hero */}
      <section className="relative pt-8 md:pt-12 text-center overflow-hidden border-b border-slate-200/50 dark:border-slate-900 pb-10 mb-8">
        <div className="absolute inset-0 blueprint-grid opacity-25 dark:opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-4 z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-1.5 bg-blue-50 dark:bg-blue-950/40 px-3.5 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-900/40 text-[10px] font-mono text-[#0A84FF] tracking-wider font-extrabold uppercase">
            <Clipboard className="w-3.5 h-3.5" /><span>Bar Bending Schedule</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold font-sans tracking-tight text-[#0F172A] dark:text-white leading-tight">
            Rebar BBS Calculators
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-slate-600 dark:text-slate-400 text-xs md:text-sm font-sans max-w-2xl mx-auto leading-relaxed">
            Generate professional bar bending schedules for any reinforced concrete structure. 
            Supports ACI 318, BS 8110, Eurocode 2, and IS 456 with formula transparency and multi-member project management.
          </motion.p>
        </div>
      </section>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-8 px-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search structure types..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#0A84FF] font-mono" />
        </div>
      </div>

      {/* Structure Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, idx) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: Math.min(0.15, idx * 0.02) }}
              onClick={() => navigate(item.path)}
              className="group relative bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl hover:border-[#0A84FF] shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/20 dark:bg-blue-900/15 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-[#0A84FF] rounded-lg">
                    <item.icon className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0A84FF] transition-all font-sans">
                    {item.name}
                  </h3>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center text-[10px] font-mono text-[#0A84FF]">
                <span>Open BBS Calculator</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Frequently Asked Questions</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">About BBS Calculators</h3>
        </div>
        <div className="space-y-4">
          {BBS_FAQS.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-xs">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{faq.question}</h4>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center font-mono text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-800/80 pt-8 pb-8 max-w-7xl mx-auto space-y-3 px-4">
        <p>© 2026 CivilMath Inc. Bar Bending Schedule Calculators — ACI 318, BS 8110, Eurocode 2, IS 456 Compliant.</p>
      </footer>
    </>
  );
}
