import { SEO, SITE_URL, DEFAULT_IMAGE } from '../utils/seo';
import ConstructionTools from './ConstructionTools';

export default function ConstructionPage() {
  return (
    <>
      <SEO
        title="Construction Site Calculators | Field Estimators | CivilMath"
        description="24 practical field-ready calculators for earthwork cut-fill, formwork contact area, asphalt paving, masonry mortar, scaffolding, and site material costs."
        canonicalUrl={`${SITE_URL}/construction`}
        keywords={['construction calculators', 'field civil calculators', 'earthwork cut fill', 'formwork area calculator']}
        ogImage={DEFAULT_IMAGE}
        type="website"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Construction', url: '/construction' }]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'CivilMath Construction Site Calculators',
          applicationCategory: 'EngineeringApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />

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
