import { SEOHead } from '../utils/seo';
import ConstructionTools from './ConstructionTools';

export default function ConstructionPage() {
  return (
    <>
      <SEOHead meta={{
        title: 'Construction & Site Calculators',
        description: 'Free construction calculators for earthwork cut-fill, formwork, asphalt, concrete mix design, rebar weight, plastering, sloped excavation, water tanks, fencing, screed and more — 24 site tools in one place.',
        path: '/construction',
        type: 'website',
        breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Construction', url: '/construction' }],
      }} />

      <div className="max-w-6xl mx-auto">
        <div className="pt-8 md:pt-12 pb-6 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D97706]/10 dark:bg-[#D97706]/15 border border-[#D97706]/25 rounded-full text-[10px] font-bold text-[#D97706] uppercase tracking-wider">
            Construction Tools
          </span>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Site & Construction Calculators
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Earthwork, formwork, mix design, rebar weight, plastering, waterproofing and 18 more
            field-ready estimators — pick a tool and start calculating.
          </p>
        </div>
        <ConstructionTools />
      </div>
    </>
  );
}
