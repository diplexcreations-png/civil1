import { useEffect } from 'react';
import CalculatorWorkspace from '../../components/CalculatorWorkspace';
import CalculatorPageTemplate from '../../components/CalculatorPageTemplate';
import ArticleSection from '../../components/ArticleSection';
import { useApp } from '../../context/AppContext';
import { FORMULA_REFERENCES } from '../../data/calculatorsData';
import { CalculatorCategory } from '../../types';
import { BookOpen } from 'lucide-react';

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

  useEffect(() => {
    setActiveCalcId(calculatorId);
  }, [calculatorId, setActiveCalcId]);

  const formulaRef = FORMULA_REFERENCES[calculatorId];

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
    </>
  );
}
