import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/AppLayout';
import CategoryPageTemplate from './components/CategoryPageTemplate';
import HomePage from './pages/HomePage';
import BBSCategoryPage from './pages/BBSCategoryPage';
import DashboardPage from './pages/DashboardPage';
import StaticPage from './pages/StaticPage';
import { trackPageView } from './utils/analytics';

// Lazy-loaded calculator pages for code splitting
const ConcreteVolumePage = lazy(() => import('./pages/calculators/ConcreteVolumePage'));
const RebarCalculatorPage = lazy(() => import('./pages/calculators/RebarCalculatorPage'));
const BrickCalculatorPage = lazy(() => import('./pages/calculators/BrickCalculatorPage'));
const BeamAnalysisPage = lazy(() => import('./pages/calculators/BeamAnalysisPage'));
const ColumnDesignPage = lazy(() => import('./pages/calculators/ColumnDesignPage'));
const SlabDeflectionPage = lazy(() => import('./pages/calculators/SlabDeflectionPage'));
const SteelWeightPage = lazy(() => import('./pages/calculators/SteelWeightPage'));
const HeightOfInstrumentPage = lazy(() => import('./pages/calculators/HeightOfInstrumentPage'));
const CoordinateTraversePage = lazy(() => import('./pages/calculators/CoordinateTraversePage'));
const BearingCapacityPage = lazy(() => import('./pages/calculators/BearingCapacityPage'));
const RetainingWallPage = lazy(() => import('./pages/calculators/RetainingWallPage'));
const UnitConverterPage = lazy(() => import('./pages/calculators/UnitConverterPage'));
const BBSCalculatorPage = lazy(() => import('./pages/BBSCalculatorPage'));
const BOQBuilderPage = lazy(() => import('./boq/BOQBuilderPage'));
const CollaborationHub = lazy(() => import('./collaboration/CollaborationHub'));

function SuspenseFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#0A84FF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-mono text-slate-400">Loading calculator...</p>
      </div>
    </div>
  );
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
          <AnalyticsTracker />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />

              {/* BBS Category */}
              <Route path="/bbs" element={<BBSCategoryPage />} />

              {/* BBS Structure Pages - all share one lazy chunk */}
              <Route path="/bbs/footing" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/combined-footing" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/strip-footing" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/raft-foundation" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/beam" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/plinth-beam" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/tie-beam" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/lintel-beam" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/column" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/pedestal" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/slab" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/staircase" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/retaining-wall" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />
              <Route path="/bbs/foundation-mesh" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />

              {/* Fallback BBS route for backward compatibility or new structure types */}
              <Route path="/bbs/:structureType" element={<Suspense fallback={<SuspenseFallback />}><BBSCalculatorPage /></Suspense>} />

              {/* Category Landing Pages */}
              <Route path="/structural" element={<CategoryPageTemplate category="structural" />} />
              <Route path="/concrete" element={<CategoryPageTemplate category="concrete" />} />
              <Route path="/geotechnical" element={<CategoryPageTemplate category="geotech" />} />
              <Route path="/surveying" element={<CategoryPageTemplate category="survey" />} />
              <Route path="/utilities" element={<CategoryPageTemplate category="utility" />} />

              {/* Concrete Calculator Pages */}
              <Route path="/concrete/volume" element={<Suspense fallback={<SuspenseFallback />}><ConcreteVolumePage /></Suspense>} />
              <Route path="/concrete/rebar" element={<Suspense fallback={<SuspenseFallback />}><RebarCalculatorPage /></Suspense>} />
              <Route path="/concrete/brick" element={<Suspense fallback={<SuspenseFallback />}><BrickCalculatorPage /></Suspense>} />

              {/* Structural Calculator Pages */}
              <Route path="/structural/beam" element={<Suspense fallback={<SuspenseFallback />}><BeamAnalysisPage /></Suspense>} />
              <Route path="/structural/column" element={<Suspense fallback={<SuspenseFallback />}><ColumnDesignPage /></Suspense>} />
              <Route path="/structural/slab" element={<Suspense fallback={<SuspenseFallback />}><SlabDeflectionPage /></Suspense>} />
              <Route path="/structural/steel-weight" element={<Suspense fallback={<SuspenseFallback />}><SteelWeightPage /></Suspense>} />

              {/* Surveying Calculator Pages */}
              <Route path="/surveying/hi" element={<Suspense fallback={<SuspenseFallback />}><HeightOfInstrumentPage /></Suspense>} />
              <Route path="/surveying/traverse" element={<Suspense fallback={<SuspenseFallback />}><CoordinateTraversePage /></Suspense>} />

              {/* Geotechnical Calculator Pages */}
              <Route path="/geotechnical/bearing-capacity" element={<Suspense fallback={<SuspenseFallback />}><BearingCapacityPage /></Suspense>} />
              <Route path="/geotechnical/retaining-wall" element={<Suspense fallback={<SuspenseFallback />}><RetainingWallPage /></Suspense>} />

              {/* Utility Calculator Pages */}
              <Route path="/utilities/unit-converter" element={<Suspense fallback={<SuspenseFallback />}><UnitConverterPage /></Suspense>} />

              {/* Backward Compatibility Redirects (old slug → new slug) */}
              <Route path="/concrete/rebar-calculator" element={<Navigate to="/concrete/rebar" replace />} />
              <Route path="/concrete/brick-calculator" element={<Navigate to="/concrete/brick" replace />} />
              <Route path="/structural/steel-calculator" element={<Navigate to="/structural/steel-weight" replace />} />
              <Route path="/geotechnical/bearing" element={<Navigate to="/geotechnical/bearing-capacity" replace />} />
              <Route path="/geotechnical/retaining" element={<Navigate to="/geotechnical/retaining-wall" replace />} />
              <Route path="/surveying/coordinate" element={<Navigate to="/surveying/traverse" replace />} />
              <Route path="/utilities/convert" element={<Navigate to="/utilities/unit-converter" replace />} />

              {/* BOQ Builder */}
              <Route path="/boq-builder" element={<Suspense fallback={<SuspenseFallback />}><BOQBuilderPage /></Suspense>} />

              {/* Project Management */}
              <Route path="/project-management" element={<Suspense fallback={<SuspenseFallback />}><CollaborationHub /></Suspense>} />

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
