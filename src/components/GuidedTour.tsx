import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, Sparkles, Rocket, ArrowRight, Calculator, Layers, GitCommit, Anchor, Compass, RefreshCw, Clipboard } from 'lucide-react';
import { CALCULATORS_LIST } from '../data/calculatorsData';

interface TourStep {
  id: string;
  target: string;
  mobileTarget?: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  mobilePlacement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  navigate?: string; // 'landing' | 'workspace'
  type?: 'normal' | 'calc-select';
}

interface GuidedTourProps {
  onNavigate?: (page: string, calcId?: string) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  bbs: Clipboard,
  structural: GitCommit,
  concrete: Layers,
  geotech: Anchor,
  survey: Compass,
  utility: RefreshCw,
};

const STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: '__center__',
    title: '🏗️ Welcome to CiviCore',
    content: 'Your all-in-one structural engineering suite. Let us show you around!',
    placement: 'center',
  },
  {
    id: 'logo',
    target: '#tour-logo',
    title: 'Home Button',
    content: 'Tap the CiviCore logo anytime to return to the main dashboard.',
    placement: 'bottom',
  },
  {
    id: 'nav-explore',
    target: '#tour-nav-explore',
    mobileTarget: '#tour-mob-explore',
    title: 'Explore Suite',
    content: 'Browse all available engineering calculators — concrete, structural, geotechnical and more.',
    placement: 'bottom',
    mobilePlacement: 'top',
    navigate: 'landing',
  },
  {
    id: 'nav-workspace',
    target: '#tour-nav-workspace',
    mobileTarget: '#tour-mob-workspace',
    title: 'Analysis Desk',
    content: 'Your main workspace. Open any calculator here to start crunching numbers.',
    placement: 'bottom',
    mobilePlacement: 'top',
  },
  {
    id: 'nav-analytics',
    target: '#tour-nav-analytics',
    mobileTarget: '#tour-mob-analytics',
    title: 'Analytics Dashboard',
    content: 'Track your saved calculations and engineering analytics over time.',
    placement: 'bottom',
    mobilePlacement: 'top',
  },
  {
    id: 'calc-card',
    target: '#tour-calc-card',
    title: 'Calculator Cards',
    content: 'Each card is a calculation module. Tap any card to open it instantly.',
    placement: 'bottom',
    navigate: 'landing',
  },
  {
    id: 'calc-select',
    target: '__center__',
    title: '🧮 Choose a Calculator',
    content: 'Pick a calculation module below. We\'ll open it and show you the workflow!',
    placement: 'center',
    type: 'calc-select',
  },
  {
    id: 'input-panel',
    target: '#tour-input-panel',
    title: 'Input Parameters',
    content: 'Fill in dimensions, material properties, and engineering parameters here.',
    placement: 'right',
    mobilePlacement: 'bottom',
    navigate: 'workspace',
  },
  {
    id: 'save',
    target: '#tour-save-btn',
    title: 'Save Your Work',
    content: 'Save your current calculation to local history. Reload it anytime.',
    placement: 'top',
  },
  {
    id: 'pdf',
    target: '#tour-export-pdf',
    title: 'Export as PDF',
    content: 'Generate a professional PDF report — ready for submission or print.',
    placement: 'top',
  },
  {
    id: 'excel',
    target: '#tour-export-excel',
    title: 'Export to Excel',
    content: 'Download data as CSV for further analysis in Excel or Sheets.',
    placement: 'top',
  },
  {
    id: 'complete',
    target: '__center__',
    title: '🎉 You\'re All Set!',
    content: 'You know all the essentials. Start exploring and build something amazing!',
    placement: 'center',
  },
];

export default function GuidedTour({ onNavigate }: GuidedTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedCalcId, setSelectedCalcId] = useState('concrete-volume');
  const selectedCalcRef = useRef('concrete-volume');
  const isMobileRef = useRef(false);

  // Keep ref in sync
  useEffect(() => { selectedCalcRef.current = selectedCalcId; }, [selectedCalcId]);

  // Detect mobile
  useEffect(() => {
    const check = () => { isMobileRef.current = window.innerWidth < 768; };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-start tour for first-time visitors
  useEffect(() => {
    const done = localStorage.getItem('civicore_tour_v4');
    if (!done) {
      const t = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(t);
    }
  }, []);

  const getTarget = useCallback((step: TourStep): string => {
    if (isMobileRef.current && step.mobileTarget) return step.mobileTarget;
    return step.target;
  }, []);

  const getPlacement = useCallback((step: TourStep): string => {
    if (isMobileRef.current && step.mobilePlacement) return step.mobilePlacement;
    return step.placement;
  }, []);

  // Compute tooltip and spotlight positions
  const positionStep = useCallback((step: TourStep) => {
    const target = getTarget(step);
    const placement = getPlacement(step);
    const mob = isMobileRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Center steps — no spotlight; modal is flex-centered in render (no transform clipping)
    if (target.startsWith('__')) {
      setSpotlightRect(null);
      setTooltipStyle({});
      return;
    }

    // Find target element
    const el = document.querySelector(target) as HTMLElement | null;
    if (!el) {
      // Fallback to center
      setSpotlightRect(null);
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: mob ? `${vw - 32}px` : '340px',
        maxWidth: '95vw',
        zIndex: 10000,
      });
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      setSpotlightRect(rect);

      const pad = 14;
      const tooltipW = mob ? vw - 32 : 330;
      let top = 0, left = 0;
      let transform = '';

      if (placement === 'bottom') {
        top = rect.bottom + pad;
        left = mob ? vw / 2 : rect.left + rect.width / 2;
        transform = 'translateX(-50%)';
        // If overflows bottom, flip to top
        if (top + 200 > vh) {
          top = rect.top - pad;
          transform = 'translate(-50%, -100%)';
        }
      } else if (placement === 'top') {
        top = rect.top - pad;
        left = mob ? vw / 2 : rect.left + rect.width / 2;
        transform = 'translate(-50%, -100%)';
        // If overflows top, flip to bottom
        if (top - 200 < 0) {
          top = rect.bottom + pad;
          transform = 'translateX(-50%)';
        }
      } else if (placement === 'right') {
        if (mob) {
          // On mobile, always go bottom instead of right
          top = rect.bottom + pad;
          left = vw / 2;
          transform = 'translateX(-50%)';
        } else {
          top = rect.top + rect.height / 2;
          left = rect.right + pad;
          transform = 'translateY(-50%)';
          // If overflows right, flip to bottom
          if (left + tooltipW > vw - 16) {
            top = rect.bottom + pad;
            left = rect.left + rect.width / 2;
            transform = 'translateX(-50%)';
          }
        }
      } else if (placement === 'left') {
        if (mob) {
          top = rect.bottom + pad;
          left = vw / 2;
          transform = 'translateX(-50%)';
        } else {
          top = rect.top + rect.height / 2;
          left = rect.left - pad;
          transform = 'translate(-100%, -50%)';
          if (left - tooltipW < 16) {
            top = rect.bottom + pad;
            left = rect.left + rect.width / 2;
            transform = 'translateX(-50%)';
          }
        }
      }

      // Final horizontal clamp
      if (transform.includes('translateX(-50%)')) {
        const halfW = tooltipW / 2;
        if (left - halfW < 16) left = halfW + 16;
        if (left + halfW > vw - 16) left = vw - halfW - 16;
      }

      setTooltipStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        transform,
        width: `${tooltipW}px`,
        maxWidth: '95vw',
        zIndex: 10000,
      });
    });
  }, [getTarget, getPlacement]);

  // Navigate + reposition when step changes
  useEffect(() => {
    if (!isActive) return;
    const step = STEPS[stepIdx];
    if (!step) return;

    setIsTransitioning(true);

    // Run navigation action if needed
    if (step.navigate) {
      if (step.navigate === 'workspace') {
        onNavigate?.('workspace', selectedCalcRef.current);
      } else {
        onNavigate?.(step.navigate);
      }
      // Wait for page to render
      const t = setTimeout(() => {
        positionStep(step);
        setIsTransitioning(false);
      }, 800);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      positionStep(step);
      setIsTransitioning(false);
    }, 250);
    return () => clearTimeout(t);
  }, [stepIdx, isActive, positionStep, onNavigate]);

  // Reposition on resize/scroll
  useEffect(() => {
    if (!isActive) return;
    const reposition = () => positionStep(STEPS[stepIdx]);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [isActive, stepIdx, positionStep]);

  const finish = () => {
    setIsActive(false);
    localStorage.setItem('civicore_tour_v4', 'true');
  };

  const next = () => stepIdx < STEPS.length - 1 ? setStepIdx(i => i + 1) : finish();
  const back = () => stepIdx > 0 && setStepIdx(i => i - 1);

  if (!isActive) return null;

  const step = STEPS[stepIdx];
  const isCenterStep = getTarget(step).startsWith('__');
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === STEPS.length - 1;
  const isCalcSelect = step.type === 'calc-select';
  const progress = ((stepIdx + 1) / STEPS.length) * 100;
  const mob = isMobileRef.current;
  const featuredCalcs = CALCULATORS_LIST.slice(0, 6);

  const tourCard = (
    <div className={`
      rounded-2xl border shadow-2xl shadow-black/40 flex flex-col overflow-hidden w-full
      ${isCenterStep
        ? 'bg-gradient-to-br from-[#0c1929] via-[#0F172A] to-[#0c1929] border-[#1e3a5f]/70 max-h-[90vh]'
        : 'bg-[#0F172A]/95 backdrop-blur-xl border-slate-700/50'
      }
    `}>

      <div className="h-1 w-full bg-gradient-to-r from-[#0A84FF] via-[#38BDF8] to-[#818CF8] flex-shrink-0" />

      {/* Scrollable body */}
      <div className={`overflow-y-auto flex-1 min-h-0 ${mob ? 'px-4 pt-4' : 'px-5 pt-5'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isCenterStep && (
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                {isLast ? <Rocket className="w-5 h-5 text-[#0A84FF]" /> :
                 isCalcSelect ? <Calculator className="w-5 h-5 text-[#0A84FF]" /> :
                 <Sparkles className="w-5 h-5 text-[#0A84FF]" />}
              </motion.div>
            )}
            <h3 className={`text-white font-bold tracking-tight ${mob ? 'text-[13px]' : 'text-sm'}`}>{step.title}</h3>
          </div>
          <button onClick={finish} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors flex-shrink-0" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className={`text-slate-300 leading-relaxed ${mob ? 'text-[11px] mb-3' : 'text-[13px] mb-4'}`}>{step.content}</p>

        {isCalcSelect && (
          <div className={`grid grid-cols-2 ${mob ? 'gap-1.5 mb-2' : 'gap-2 mb-3'}`}>
            {featuredCalcs.map((calc) => {
              const Icon = CATEGORY_ICONS[calc.category] || Calculator;
              const sel = selectedCalcId === calc.id;
              return (
                <button
                  key={calc.id}
                  onClick={() => { setSelectedCalcId(calc.id); selectedCalcRef.current = calc.id; }}
                  className={`
                    relative text-left ${mob ? 'p-2' : 'p-2.5'} rounded-xl border transition-all cursor-pointer
                    ${sel
                      ? 'bg-[#0A84FF]/15 border-[#0A84FF]/60 ring-1 ring-[#0A84FF]/25'
                      : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-500/60'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-lg flex-shrink-0 ${sel ? 'bg-[#0A84FF]/20 text-[#0A84FF]' : 'bg-slate-700/50 text-slate-400'}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`${mob ? 'text-[9px]' : 'text-[10px]'} font-bold truncate ${sel ? 'text-[#0A84FF]' : 'text-slate-200'}`}>
                        {calc.name}
                      </p>
                      <p className={`${mob ? 'text-[7px]' : 'text-[8px]'} text-slate-500 truncate`}>
                        {calc.category.toUpperCase()}
                      </p>
                    </div>
                    {sel && (
                      <div className="w-3.5 h-3.5 bg-[#0A84FF] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer — always visible, never clipped */}
      <div className={`flex-shrink-0 border-t border-slate-700/40 ${mob ? 'px-4 py-3' : 'px-5 py-4'} ${isCenterStep ? 'bg-[#0c1424]/95' : 'bg-[#0F172A]/95'}`}>
        <div className="w-full h-1 bg-slate-800 rounded-full mb-3 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#0A84FF] to-[#38BDF8]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-slate-500 font-mono ${mob ? 'text-[9px]' : 'text-[11px]'}`}>
            {stepIdx + 1}/{STEPS.length}
          </span>

          <div className="flex items-center gap-1.5">
            {stepIdx > 0 && (
              <button onClick={back}
                className={`flex items-center gap-0.5 px-2 py-1.5 rounded-lg font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer ${mob ? 'text-[10px]' : 'text-[12px]'}`}>
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
            )}
            {isFirst && (
              <button onClick={finish}
                className={`px-2 py-1.5 rounded-lg font-semibold text-slate-500 hover:text-white hover:bg-slate-800 transition-all cursor-pointer ${mob ? 'text-[10px]' : 'text-[12px]'}`}>
                Skip
              </button>
            )}
            <button onClick={next}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#0A84FF] to-[#3B82F6] shadow-lg shadow-blue-500/20 cursor-pointer active:scale-95 transition-transform ${mob ? 'text-[10px]' : 'text-[12px]'}`}>
              {isLast ? (<>Get Started <Rocket className="w-3 h-3" /></>)
               : isFirst ? (<>Start Tour <ArrowRight className="w-3 h-3" /></>)
               : isCalcSelect ? (<>Open <ArrowRight className="w-3 h-3" /></>)
               : (<>Next <ChevronRight className="w-3 h-3" /></>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* === OVERLAY === */}
      <AnimatePresence>
        {!isTransitioning && (
          spotlightRect ? (
            // 4-panel overlay leaving the target element completely visible
            <>
              <motion.div key="o-t" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.25}}
                className="fixed z-[9998] bg-black/55" onClick={finish}
                style={{ top:0, left:0, right:0, height: Math.max(0, spotlightRect.top - 8) }} />
              <motion.div key="o-b" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.25}}
                className="fixed z-[9998] bg-black/55" onClick={finish}
                style={{ top: spotlightRect.bottom + 8, left:0, right:0, bottom:0 }} />
              <motion.div key="o-l" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.25}}
                className="fixed z-[9998] bg-black/55" onClick={finish}
                style={{ top: spotlightRect.top - 8, left:0, width: Math.max(0, spotlightRect.left - 8), height: spotlightRect.height + 16 }} />
              <motion.div key="o-r" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.25}}
                className="fixed z-[9998] bg-black/55" onClick={finish}
                style={{ top: spotlightRect.top - 8, left: spotlightRect.right + 8, right:0, height: spotlightRect.height + 16 }} />
            </>
          ) : (
            <motion.div key="o-full" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}}
              className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[2px]" onClick={finish} />
          )
        )}
      </AnimatePresence>

      {/* === SPOTLIGHT RING === */}
      <AnimatePresence>
        {spotlightRect && !isTransitioning && (
          <motion.div
            key={`ring-${stepIdx}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="fixed z-[9999] pointer-events-none rounded-2xl"
            style={{
              top: spotlightRect.top - 8,
              left: spotlightRect.left - 8,
              width: spotlightRect.width + 16,
              height: spotlightRect.height + 16,
              border: '2px solid rgba(10,132,255,0.7)',
              boxShadow: '0 0 0 4px rgba(10,132,255,0.12), 0 0 32px rgba(10,132,255,0.2)',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl border-2 border-[#0A84FF]/30"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* === TOOLTIP === */}
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          isCenterStep ? (
            <div key={`center-${stepIdx}`} className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`pointer-events-auto w-full ${mob ? 'max-w-[95vw]' : 'max-w-[420px]'}`}
              >
                {tourCard}
              </motion.div>
            </div>
          ) : (
          <motion.div
            key={`tip-${stepIdx}`}
            initial={{ opacity: 0, scale: 0.93, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={tooltipStyle}
          >
            {tourCard}

            {(() => {
              const pl = getPlacement(step);
              if (pl === 'center') return null;
              const arrowStyle: React.CSSProperties = { position: 'absolute' };
              if (pl === 'bottom') { arrowStyle.top = -5; arrowStyle.left = '50%'; arrowStyle.marginLeft = -5; }
              if (pl === 'top') { arrowStyle.bottom = -5; arrowStyle.left = '50%'; arrowStyle.marginLeft = -5; }
              if (pl === 'right') { arrowStyle.left = -5; arrowStyle.top = '50%'; arrowStyle.marginTop = -5; }
              if (pl === 'left') { arrowStyle.right = -5; arrowStyle.top = '50%'; arrowStyle.marginTop = -5; }
              return <div className="w-2.5 h-2.5 bg-[#0F172A] border border-slate-700/50 rotate-45" style={arrowStyle} />;
            })()}
          </motion.div>
          )
        )}
      </AnimatePresence>
    </>
  );
}
