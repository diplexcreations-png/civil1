import { useNavigate } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import { SEOHead, CATEGORY_PATH_MAP, getCalculatorSlug, generateOrganizationSchema, generateWebsiteSchema } from '../utils/seo';
import { CALCULATORS_LIST } from '../data/calculatorsData';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { setActiveCalcId } = useApp();

  const handleSelectCalculator = (id: string) => {
    const calc = CALCULATORS_LIST.find(c => c.id === id);
    setActiveCalcId(id);
    if (calc) {
      const path = CATEGORY_PATH_MAP[calc.category];
      if (calc.category === 'bbs') {
        navigate('/bbs/footing');
      } else {
        navigate(`/${path}/${getCalculatorSlug(calc)}`);
      }
    }
  };

  return (
    <>
      <SEOHead meta={{
        title: 'Civil Engineering Calculator Suite',
        description: 'Professional civil engineering calculators for concrete volume, structural beam analysis, column design, bar bending schedules, surveying, and geotechnical engineering. ACI, ASTM, Eurocode compliant.',
        path: '/',
        type: 'website',
        breadcrumbs: [{ name: 'Home', url: '/' }],
        schema: generateOrganizationSchema(),
      }} />
      <LandingPage
        onSelectCalculator={handleSelectCalculator}
        onLaunchDashboard={() => navigate('/dashboard')}
        onNavigate={(page: string) => navigate(`/${page}`)}
      />
    </>
  );
}
