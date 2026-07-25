import { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { AboutPage, ContactPage, PrivacyPolicyPage } from '../components/StaticPages';
import { SEOHead } from '../utils/seo';

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
};

export default function StaticPage({ page }: { page: string }) {
  const navigate = useNavigate();
  const config = PAGE_CONFIG[page];

  if (!config) {
    return <div className="text-center py-20 text-slate-500">Page not found.</div>;
  }

  return (
    <>
      <SEOHead meta={{
        title: config.title,
        description: config.description,
        path: `/${page}`,
        type: 'website',
        breadcrumbs: [{ name: 'Home', url: '/' }, { name: config.title, url: `/${page}` }],
      }} />
      <config.Component onBack={() => navigate('/')} />
    </>
  );
}
