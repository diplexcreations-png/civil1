import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/AppLayout';
import CategoryPageTemplate from './components/CategoryPageTemplate';
import HomePage from './pages/HomePage';
import BBSCategoryPage from './pages/BBSCategoryPage';
import BBSCalculatorPage from './pages/BBSCalculatorPage';
import CalculatorPage from './pages/CalculatorPage';
import DashboardPage from './pages/DashboardPage';
import StaticPage from './pages/StaticPage';
import { trackPageView } from './utils/analytics';
import { generateSitemapXML, generateRobotsTxt } from './utils/sitemap';
import { CalculatorCategory } from './types';

// Inject sitemap and robots into the head (for static SPA deployment)
function SEOSetup() {
  useEffect(() => {
    const sitemapContent = generateSitemapXML();
    const robotsContent = generateRobotsTxt();

    // Add sitemap link to head
    let sitemapLink = document.querySelector('link[rel="sitemap"]');
    if (!sitemapLink) {
      sitemapLink = document.createElement('link');
      sitemapLink.setAttribute('rel', 'sitemap');
      sitemapLink.setAttribute('type', 'application/xml');
      document.head.appendChild(sitemapLink);
    }
    sitemapLink.setAttribute('href', `data:application/xml,${encodeURIComponent(sitemapContent)}`);

    // Add robots meta
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'index, follow');
  }, []);

  return null;
}

function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(`civilmath${location.pathname}`);
  }, [location.pathname]);
  return null;
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppProvider>
          <SEOSetup />
          <AnalyticsTracker />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />

              {/* BBS Calculators */}
              <Route path="/bbs" element={<BBSCategoryPage />} />
              <Route path="/bbs/:structureType" element={<BBSCalculatorPage />} />

              {/* Non-BBS Calculators by category */}
              <Route path="/structural" element={<CategoryPageTemplate category="structural" />} />
              <Route path="/structural/:calculatorId" element={<CalculatorPage />} />

              <Route path="/concrete" element={<CategoryPageTemplate category="concrete" />} />
              <Route path="/concrete/:calculatorId" element={<CalculatorPage />} />

              <Route path="/geotechnical" element={<CategoryPageTemplate category="geotech" />} />
              <Route path="/geotechnical/:calculatorId" element={<CalculatorPage />} />

              <Route path="/surveying" element={<CategoryPageTemplate category="survey" />} />
              <Route path="/surveying/:calculatorId" element={<CalculatorPage />} />

              <Route path="/utilities" element={<CategoryPageTemplate category="utility" />} />
              <Route path="/utilities/:calculatorId" element={<CalculatorPage />} />

              {/* Dashboard */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Static Pages */}
              <Route path="/about" element={<StaticPage page="about" />} />
              <Route path="/contact" element={<StaticPage page="contact" />} />
              <Route path="/privacy" element={<StaticPage page="privacy" />} />

              {/* 404 */}
              <Route path="*" element={
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold text-slate-600 mb-2">404</h1>
                  <p className="text-xs text-slate-400 font-mono">Page not found</p>
                  <a href="/" className="inline-block mt-4 px-4 py-2 bg-[#0A84FF] text-white rounded-xl text-xs font-semibold cursor-pointer no-underline">
                    Return Home
                  </a>
                </div>
              } />
            </Route>
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
