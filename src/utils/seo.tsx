import { Helmet } from 'react-helmet-async';
import { ReactNode } from 'react';
import { CalculatorCategory } from '../types';
import { CALCULATORS_LIST } from '../data/calculatorsData';

export interface SEOMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  published?: string;
  schema?: Record<string, any>;
  faqs?: { question: string; answer: string }[];
  breadcrumbs?: { name: string; url: string }[];
}

const SITE_URL = 'https://civilmath.com';
const SITE_NAME = 'CivilMath — Civil Engineering Calculator Suite';
const DEFAULT_IMAGE = '/og-image.png';
const TWITTER_HANDLE = '@civilmath';

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CivilMath',
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    description: 'Free online civil engineering calculators for structural analysis, concrete design, rebar BBS, geotechnical engineering, surveying, and unit conversion.',
    sameAs: [
      'https://twitter.com/civilmath',
    ],
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Professional-grade free online civil engineering calculators for structural, concrete, geotechnical, and surveying computations.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateCalculatorSchema(calc: {
  name: string;
  description: string;
  url: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: calc.name,
    description: calc.description,
    url: `${SITE_URL}${calc.url}`,
    applicationCategory: 'EngineeringApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    ...(calc.category ? { keywords: calc.category } : {}),
  };
}

export function getCalculatorSlug(calc: typeof CALCULATORS_LIST[0]): string {
  if (calc.slug) return calc.slug;
  if (calc.id.startsWith(calc.category + '-')) return calc.id.substring(calc.category.length + 1);
  return calc.id;
}

export function SEOHead({ meta, children }: { meta: SEOMeta; children?: ReactNode }) {
  const url = `${SITE_URL}${meta.path}`;
  const image = meta.image || DEFAULT_IMAGE;
  const schemas: Record<string, any>[] = [];

  if (meta.schema) schemas.push(meta.schema);
  if (meta.breadcrumbs) schemas.push(generateBreadcrumbSchema(meta.breadcrumbs));
  if (meta.faqs) schemas.push(generateFAQSchema(meta.faqs));

  return (
    <Helmet>
      <title>{meta.title} | {SITE_NAME}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={meta.type || 'website'} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={image} />

      {meta.published && <meta property="article:published_time" content={meta.published} />}

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
      ))}

      {children}
    </Helmet>
  );
}

export const CATEGORY_META: Record<CalculatorCategory, { name: string; description: string; heroTitle: string; heroSubtitle: string }> = {
  bbs: {
    name: 'Bar Bending Schedule',
    description: 'Free professional bar bending schedule calculators for footings, beams, columns, slabs, stairs, retaining walls, raft foundations, and pedestals. Generate rebar cutting lengths, bar marks, weight schedules, and BBS sheets compliant with ACI 318, BS 8110, Eurocode 2, and IS 456.',
    heroTitle: 'Rebar Bending Schedule Calculators',
    heroSubtitle: 'Generate professional BBS sheets for any reinforced concrete structure. Multi-member management, multi-code compliance, PDF/Excel export.',
  },
  structural: {
    name: 'Structural Engineering',
    description: 'Free structural engineering calculators for reinforced concrete beam analysis, column design, one-way slab deflection, steel section properties, retaining wall stability, and rebar estimation. ACI 318-19 code-compliant formulas with metric and imperial units.',
    heroTitle: 'Structural Engineering Design Tools',
    heroSubtitle: 'Analyze beams, design columns, check slab deflection, compute steel properties, and estimate rebar quantities with code-compliant formulas.',
  },
  concrete: {
    name: 'Concrete & Materials',
    description: 'Free concrete volume calculator, concrete mix design tool, brick quantity calculator, mortar and plaster estimator, and rebar weight calculator. Estimate materials, costs, and quantities for slabs, columns, walls, and footings.',
    heroTitle: 'Concrete & Construction Materials Calculators',
    heroSubtitle: 'Estimate concrete volumes, mix ratios, brick quantities, mortar, plaster, and rebar requirements for any construction project.',
  },
  geotech: {
    name: 'Geotechnical Engineering',
    description: 'Free geotechnical engineering calculators for soil bearing capacity using Terzaghi and Meyerhof methods, retaining wall lateral earth pressure (Rankine and Coulomb), and slope stability analysis.',
    heroTitle: 'Geotechnical Engineering Tools',
    heroSubtitle: 'Evaluate bearing capacity, lateral earth pressures, and soil stability using classical and modern geotechnical theories.',
  },
  survey: {
    name: 'Surveying',
    description: 'Free surveying calculators for height of instrument (HI), coordinate traverse adjustments, differential leveling networks, cut and fill volume computations, and bearing angle calculations for land surveying.',
    heroTitle: 'Surveying & Leveling Calculators',
    heroSubtitle: 'Solve leveling networks, traverse coordinates, bearing angles, and elevation differences with precision surveying tools.',
  },
  utility: {
    name: 'Engineering Utilities',
    description: 'Free engineering unit converter for civil and structural engineering units, steel weight calculator for beams, channels, angles, and rebars, and general civil engineering reference tools.',
    heroTitle: 'Engineering Utilities & Converters',
    heroSubtitle: 'Convert engineering units, estimate steel section weights, and access quick-reference tools for daily civil engineering work.',
  },
  construction: {
    name: 'Construction',
    description: 'Free construction site calculators for earthwork cut-fill, formwork contact area, asphalt quantity, labor output, equipment rates, scaffolding, tile, lap splice, concrete mix design, rebar weight, painting, masonry, piping, roofing, compaction, waterproofing, plastering, sloped excavation, staircase, water tank, fencing, and screed estimation.',
    heroTitle: 'Construction & Site Calculators',
    heroSubtitle: '24 field-ready estimators for earthwork, formwork, mixes, quantities, and site costs.',
  },
};

export const CATEGORY_PATH_MAP: Record<CalculatorCategory, string> = {
  bbs: 'bbs',
  structural: 'structural',
  concrete: 'concrete',
  geotech: 'geotechnical',
  survey: 'surveying',
  utility: 'utilities',
  construction: 'construction',
};

export function calcIdToPath(id: string): string {
  return id.replace(/-/g, '/').replace(/_/g, '-');
}

export function pathToCalcId(path: string): string {
  return path.replace(/\//g, '-');
}
