import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CalculatorWorkspace from '../../components/CalculatorWorkspace';
import CalculatorPageTemplate from '../../components/CalculatorPageTemplate';
import ArticleSection from '../../components/ArticleSection';
import { useApp } from '../../context/AppContext';
import { FORMULA_REFERENCES, CALCULATORS_LIST } from '../../data/calculatorsData';
import { CalculatorCategory } from '../../types';
import { BookOpen, ThumbsUp, ThumbsDown, ChevronRight } from 'lucide-react';
import { CATEGORY_PATH_MAP, getCalculatorSlug } from '../../utils/seo';
import { trackEvent } from '../../utils/analytics';
import { motion } from 'motion/react';

export interface CalculatorPageConfig {
  calculatorId: string;
  category: CalculatorCategory;
  path: string;
  title: string;
  description: string;
  breadcrumbLabel: string;
  faqs?: { question: string; answer: string }[];
}

export default function CalculatorPageShell({
  calculatorId, category, path, title, description, breadcrumbLabel, faqs,
}: CalculatorPageConfig) {
  const {
    unitSystem, setUnitSystem, handleSaveCalculation,
    savedCalculations, loadedCalculation, currency, setActiveCalcId,
  } = useApp();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    setActiveCalcId(calculatorId);
    trackEvent('calculator_view', { calculator_id: calculatorId, category });
  }, [calculatorId, category, setActiveCalcId]);

  const formulaRef = FORMULA_REFERENCES[calculatorId];

  const relatedCalculators = CALCULATORS_LIST
    .filter(c => c.category === category && c.id !== calculatorId)
    .slice(0, 4);

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    trackEvent('calculator_feedback', { calculator_id: calculatorId, feedback: type });
  };

  return (
    <>
      <CalculatorPageTemplate
        title={title}
        description={description}
        category={category}
        path={path}
        breadcrumbLabel={breadcrumbLabel}
        faqs={faqs}
      >
        <CalculatorWorkspace
          calculatorId={calculatorId}
          unitSystem={unitSystem}
          setUnitSystem={setUnitSystem}
          onSaveCalculation={handleSaveCalculation}
          savedCalculations={savedCalculations}
          loadedCalculation={loadedCalculation}
          currency={currency}
        />
      </CalculatorPageTemplate>

      {formulaRef && (
        <section className="mt-8 max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-[#0A84FF]" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Engineering Formula & Calculation Steps</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-xs">
            <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 leading-relaxed">
              {formulaRef.explanation}
            </p>
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Calculation Steps</h3>
              <ol className="space-y-1.5 list-decimal list-inside">
                {formulaRef.steps.map((step, i) => (
                  <li key={i} className="text-[10px] font-mono text-slate-500 dark:text-slate-400 leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* Engineering Article */}
      <ArticleSection calculatorId={calculatorId} />

      {/* Feedback Widget */}
      <section className="mt-8 max-w-4xl">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Was this calculator helpful?</span>
            <div className="flex items-center gap-3">
              <button onClick={() => handleFeedback('up')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${feedback === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button onClick={() => handleFeedback('down')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${feedback === 'down' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          {feedback && (
            <p className="mt-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">Thank you for your feedback!</p>
          )}
        </div>
      </section>

      {/* Related Calculators */}
      {relatedCalculators.length > 0 && (
        <section className="mt-8 max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Related Calculators</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedCalculators.map((calc, idx) => (
              <motion.div key={calc.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  const p = CATEGORY_PATH_MAP[calc.category];
                  navigate(`/${p}/${getCalculatorSlug(calc)}`);
                  trackEvent('related_calculator_click', { from: calculatorId, to: calc.id });
                }}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:border-[#0A84FF]/40 shadow-xs hover:shadow-md transition-all cursor-pointer text-left">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0A84FF] transition-colors">{calc.name}</h3>
                <p className="mt-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 line-clamp-2">{calc.description}</p>
                <div className="mt-3 flex items-center text-[9px] font-mono text-[#0A84FF]">
                  <span>Open Calculator</span>
                  <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
