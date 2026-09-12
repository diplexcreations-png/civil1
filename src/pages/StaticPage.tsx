import { ComponentType, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AboutPage, ContactPage, PrivacyPolicyPage } from '../components/StaticPages';
import { SEO, getRouteSEO, SITE_URL, DEFAULT_IMAGE } from '../utils/seo';

const PAGE_CONFIG: Record<string, { title: string; description: string; Component: ComponentType<{ onBack: () => void }> }> = {
  about: {
    title: 'About CivilMath',
    description: 'Learn about CivilMath — a professional civil engineering calculator suite for structural, concrete, geotechnical, and surveying computations.',
    Component: AboutPage,
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with the CivilMath engineering team for support, feedback, or partnership inquiries.',
    Component: ContactPage,
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'CivilMath privacy policy — how we handle your data, calculations, and engineering project information.',
    Component: PrivacyPolicyPage,
  },
  terms: {
    title: 'Terms of Use',
    description: 'Terms for using CivilMath calculators and educational content.',
    Component: () => (
      <LegalPage title="Terms of Use">
        <p>CivilMath provides calculators and educational content for general information and planning. You are responsible for checking inputs, outputs, project requirements and suitability before use.</p>
        <p>Do not use the service as a substitute for qualified engineering, surveying, legal, financial or construction advice.</p>
      </LegalPage>
    ),
  },
  disclaimer: {
    title: 'Engineering Disclaimer',
    description: 'Important limitations for CivilMath engineering calculators and calculation guides.',
    Component: () => (
      <LegalPage title="Engineering Disclaimer">
        <p>Results are estimates or preliminary calculations based on the inputs and methods shown in the application. They are not a signed design, construction instruction, code-compliance certificate or professional certification.</p>
        <p>Verify designs, reinforcement detailing, quantities, materials, site conditions and applicable standards with a qualified professional and the project documentation.</p>
      </LegalPage>
    ),
  },
};

function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto space-y-4 text-left">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </div>
  );
}

export default function StaticPage({ page }: { page: string }) {
  const navigate = useNavigate();
  const config = PAGE_CONFIG[page];

  if (!config) {
    return <div className="text-center py-20 text-slate-500">Page not found.</div>;
  }

  const path = `/${page}`;
  const seo = getRouteSEO(path);
  const title = seo?.title || `${config.title} | CivilMath`;
  const description = seo?.description || config.description;

  return (
    <>
      <SEO
        title={title}
        description={description}
        canonicalUrl={`${SITE_URL}${path}`}
        keywords={seo?.keywords}
        ogImage={DEFAULT_IMAGE}
        type="website"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: config.title, url: path }]}
      />
      <config.Component onBack={() => navigate('/')} />
    </>
  );
}
