import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, Share2, Printer, BookOpen,
} from 'lucide-react';
import { SEOHead, generateCalculatorSchema, CATEGORY_PATH_MAP, CATEGORY_META } from '../utils/seo';
import { CalculatorCategory } from '../types';

interface CalculatorPageProps {
  title: string;
  description: string;
  category: CalculatorCategory;
  path: string;
  image?: string;
  faqs?: { question: string; answer: string }[];
  children: ReactNode;
  breadcrumbLabel?: string;
}

export default function CalculatorPageTemplate({
  title, description, category, path, image, faqs, children, breadcrumbLabel,
}: CalculatorPageProps) {
  const navigate = useNavigate();
  const categoryPath = CATEGORY_PATH_MAP[category];
  const categoryMeta = CATEGORY_META[category];
  const displayPath = path.startsWith('/') ? path : `/${path}`;

  const defaultFaqs = [
    {
      question: `How does the ${title} calculator work?`,
      answer: `The ${title} calculator uses industry-standard engineering formulas to compute results based on your input parameters. All calculations follow relevant codes and standards.`,
    },
    {
      question: 'Can I trust the accuracy of these calculations?',
      answer: 'Yes. All formulas are verified against published engineering standards. BBS calculators support ACI 318, BS 8110, Eurocode 2, and IS 456. Structural calculators follow ACI 318-19.',
    },
    {
      question: 'Can I export the results?',
      answer: 'BBS calculators support PDF, Excel (XLSX), and CSV export. You can also save your calculations locally and access them from the Analytics dashboard.',
    },
  ];

  const relatedCalculators = [
    { name: `${categoryMeta.name} Category`, path: `/${categoryPath}` },
  ];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, text: description, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <>
      <SEOHead meta={{
        title,
        description,
        path: displayPath,
        image,
        type: 'article',
        faqs: faqs || defaultFaqs,
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: categoryMeta.name, url: `/${categoryPath}` },
          { name: breadcrumbLabel || title, url: displayPath },
        ],
        schema: generateCalculatorSchema({
          name: title,
          description,
          url: displayPath,
          category,
        }),
      }} />

      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <button onClick={() => navigate('/')} className="hover:text-[#0A84FF] cursor-pointer font-medium">Home</button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <button onClick={() => navigate(`/${categoryPath}`)} className="hover:text-[#0A84FF] cursor-pointer font-medium capitalize">{categoryMeta.name}</button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-[#0A84FF] font-bold truncate max-w-[200px]">{breadcrumbLabel || title}</span>
      </nav>

      {/* Title + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">{title}</h1>
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleShare}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-semibold text-slate-600 flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer transition-all">
            <Share2 className="w-3 h-3" /> Share
          </button>
          <button onClick={() => window.print()}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-semibold text-slate-600 flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer transition-all">
            <Printer className="w-3 h-3" /> Print
          </button>
        </div>
      </div>

      {/* Calculator Content */}
      {children}

      {/* FAQ Section */}
      <section className="mt-10 max-w-4xl">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-[#0A84FF]" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Frequently Asked Questions</h3>
        </div>
        <div className="space-y-3">
          {(faqs || defaultFaqs).map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-1.5 shadow-xs">
              <h4 className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">{faq.question}</h4>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Links */}
      <section className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">Related</h3>
        <div className="flex flex-wrap gap-2">
          {relatedCalculators.map((rel) => (
            <button key={rel.path} onClick={() => navigate(rel.path)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-medium text-slate-600 hover:border-[#0A84FF]/40 hover:text-[#0A84FF] transition-all cursor-pointer">
              {rel.name}
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center font-mono text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-800/80 pt-6 mt-8 pb-8 space-y-2">
        <p>© 2026 CivilMath Inc. Professional Civil Calculation Labs.</p>
      </footer>
    </>
  );
}
