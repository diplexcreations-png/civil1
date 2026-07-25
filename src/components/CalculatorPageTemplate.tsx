import { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, Share2, Printer, BookOpen,
} from 'lucide-react';
import { SEOHead, generateCalculatorSchema, CATEGORY_PATH_MAP } from '../utils/seo';
import { CalculatorCategory } from '../types';
import StepWizard from './StepWizard';
import { BeginnerToggle } from './BeginnerMode';

interface CalculatorPageProps {
  title: string;
  description: string;
  category: CalculatorCategory;
  path: string;
  image?: string;
  faqs?: { question: string; answer: string }[];
  children: ReactNode;
  breadcrumbLabel?: string;
  beginnerMode?: boolean;
  onBeginnerModeChange?: (v: boolean) => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const categoryPathNames: Record<string, string> = {
  structural: 'Structural', concrete: 'Concrete', geotech: 'Geotechnical',
  survey: 'Surveying', utility: 'Utilities', bbs: 'BBS',
};

export default function CalculatorPageTemplate({
  title, description, category, path, image, faqs, children, breadcrumbLabel,
  beginnerMode, onBeginnerModeChange, currentStep, onStepChange,
}: CalculatorPageProps) {
  const navigate = useNavigate();
  const categoryPath = CATEGORY_PATH_MAP[category];
  const displayPath = path.startsWith('/') ? path : `/${path}`;
  const [showHelp, setShowHelp] = useState(false);

  const steps = [
    { id: 'choose', label: 'Calculator', description: 'Type & shape' },
    { id: 'inputs', label: 'Dimensions', description: 'Enter values' },
    { id: 'results', label: 'Results', description: 'Review output' },
  ];

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
        title, description, path: displayPath, image,
        type: 'article', faqs: faqs || defaultFaqs,
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: categoryPathNames[category] || category, url: `/${categoryPath}` },
          { name: breadcrumbLabel || title, url: displayPath },
        ],
        schema: generateCalculatorSchema({ name: title, description, url: displayPath, category }),
      }} />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <button onClick={() => navigate('/')} className="hover:text-[#2563EB] transition-colors cursor-pointer font-semibold">Home</button>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <button onClick={() => navigate(`/${categoryPath}`)} className="hover:text-[#2563EB] transition-colors cursor-pointer font-semibold capitalize">
          {categoryPathNames[category] || category}
        </button>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-[#2563EB] font-bold truncate max-w-[200px]">{breadcrumbLabel || title}</span>
      </nav>

      {/* Title + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h1>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onBeginnerModeChange && (
            <BeginnerToggle enabled={!!beginnerMode} onChange={onBeginnerModeChange} />
          )}
          <button onClick={handleShare}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button onClick={() => window.print()}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {/* Step Progress */}
      {currentStep !== undefined && onStepChange && (
        <div className="mb-6">
          <StepWizard steps={steps} currentStep={currentStep} onStepClick={onStepChange} />
        </div>
      )}

      {/* Calculator Content */}
      <div className="relative">
        {children}
      </div>

      {/* FAQ Section */}
      <section className="mt-10 max-w-4xl">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-[#2563EB]" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Frequently Asked Questions</h3>
        </div>
        <div className="space-y-2">
          {(faqs || defaultFaqs).map((faq, idx) => (
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
      </section>
    </>
  );
}
