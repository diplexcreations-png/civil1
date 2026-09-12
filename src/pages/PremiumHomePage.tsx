import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Layers, Grid, GitCommit, Compass, RefreshCw,
  HardHat, BookOpen, Calculator, ArrowRight, ShieldCheck,
  CheckCircle2, Box, Sparkles, Scale, ExternalLink, FileSpreadsheet, FileText
} from 'lucide-react';
import {
  SEO,
  generateOrganizationSchema,
  generateWebsiteSchema,
} from '../utils/seo';
import { useApp } from '../context/AppContext';

// 8 Primary Engineering Disciplines matching the Left Sidebar
const ENGINEERING_DISCIPLINES = [
  {
    id: 'concrete',
    title: 'Concrete & Materials',
    count: '6 Calculators',
    path: '/concrete',
    desc: 'Slab volumes, cement bags, sand/gravel ratios, brickwork, and mortar batching.',
    icon: Layers,
    color: '#657565',
    tag: 'ACI 318 / IS 456',
    popularCalc: { name: 'Concrete Volume', path: '/concrete/volume' },
  },
  {
    id: 'structural',
    title: 'Structural Engineering',
    count: '5 Calculators',
    path: '/structural',
    desc: 'Shear force, bending moment diagrams, short column capacity, and deflection checks.',
    icon: GitCommit,
    color: '#B56F50',
    tag: 'AISC 360 / EC2',
    popularCalc: { name: 'Beam Analysis', path: '/structural/beam' },
  },
  {
    id: 'bbs',
    title: 'Reinforcement (BBS)',
    count: '12 Structures',
    path: '/bbs',
    desc: 'Bar bending schedules, cutting lengths, weight takeoffs, and shape codes.',
    icon: Grid,
    color: '#7B8978',
    tag: 'BS 8666 / IS 2502',
    popularCalc: { name: 'Footing BBS', path: '/bbs/footing' },
  },
  {
    id: 'geotech',
    title: 'Geotechnical & Soils',
    count: '4 Calculators',
    path: '/geotechnical',
    desc: 'Terzaghi ultimate bearing capacity, Rankine lateral earth pressure, and slope checks.',
    icon: ShieldCheck,
    color: '#9A8062',
    tag: 'Terzaghi / Meyerhof',
    popularCalc: { name: 'Bearing Capacity', path: '/geotechnical/bearing-capacity' },
  },
  {
    id: 'survey',
    title: 'Surveying & Leveling',
    count: '4 Calculators',
    path: '/surveying',
    desc: 'Height of instrument differential leveling, Bowditch traverse balancing, and elevations.',
    icon: Compass,
    color: '#9CB5C4',
    tag: 'Bowditch Rule',
    popularCalc: { name: 'HI Leveling', path: '/surveying/hi' },
  },
  {
    id: 'construction',
    title: 'Construction & Site',
    count: '5 Estimators',
    path: '/construction',
    desc: 'Cut/fill earthwork, formwork contact areas, asphalt layers, and scaffolding logistics.',
    icon: HardHat,
    color: '#D9B96E',
    tag: 'Site Standards',
    popularCalc: { name: 'Site Estimators', path: '/construction' },
  },
  {
    id: 'boq',
    title: 'BOQ & Takeoffs',
    count: 'Master Builder',
    path: '/boq-builder',
    desc: 'Itemized material quantity takeoff schedules, cost estimators, and unified export.',
    icon: FileSpreadsheet,
    color: '#B7A8C5',
    tag: 'CESMM4 / SMM7',
    popularCalc: { name: 'BOQ Takeoff', path: '/boq-builder' },
  },
  {
    id: 'utility',
    title: 'Engineering Converters',
    count: '8 Tools',
    path: '/utilities/unit-converter',
    desc: 'Instant SI Metric and US Customary conversions for stress, force, density, and volume.',
    icon: RefreshCw,
    color: '#7B8978',
    tag: 'ISO 80000',
    popularCalc: { name: 'Unit Converter', path: '/utilities/unit-converter' },
  },
];

// Highlighted Interactive Tool Previews
const SHOWCASE_CALCS = [
  {
    id: 'concrete-volume',
    name: 'Concrete Volume & Materials',
    category: 'Concrete',
    path: '/concrete/volume',
    metric: '3.00 m³',
    submetric: '5.00 × 4.00 × 0.15 m',
    standard: 'ACI 318-19',
    details: 'Calculates concrete volume, cement bags, fine sand, coarse aggregate, and water requirements with 5% waste tolerance.',
  },
  {
    id: 'structural-beam',
    name: 'Simply Supported Beam Analysis',
    category: 'Structural',
    path: '/structural/beam',
    metric: '42.5 kNm',
    submetric: 'Mmax = qL² / 8',
    standard: 'AISC 360-16',
    details: 'Live shear force (SFD), bending moment (BMD), and elastic deflection profiles with serviceability limit checks.',
  },
  {
    id: 'bbs-footing',
    name: 'Isolated Footing BBS Schedule',
    category: 'Reinforcement',
    path: '/bbs/footing',
    metric: '184.2 kg',
    submetric: 'Shape Code 21 & 00',
    standard: 'BS 8666:2020',
    details: 'Complete cutting length schedules, hook deductions, rebar weights, and professional export to PDF and Excel.',
  },
];

// Recognized Design Codes & Engineering Reference
const DESIGN_CODES = [
  { code: 'ACI 318-19', org: 'American Concrete Institute', topic: 'Reinforced concrete design, slab thickness & rebar development' },
  { code: 'Eurocode 2 / EN 1992', org: 'European Standards Committee', topic: 'Design of concrete structures & limit state safety factors' },
  { code: 'IS 456:2000', org: 'Bureau of Indian Standards', topic: 'Plain and reinforced concrete code of practice for construction' },
  { code: 'BS 8110 / BS 8666', org: 'British Standards Institution', topic: 'Structural use of concrete, scheduling, bending & cutting lengths' },
  { code: 'AISC 360-16', org: 'American Institute of Steel', topic: 'Specification for structural steel buildings & section analysis' },
  { code: 'Bowditch Compass Rule', org: 'Geodetic Surveying Standard', topic: 'Angular closing error distribution for closed boundary traverses' },
];

export default function PremiumHomePage() {
  const navigate = useNavigate();
  const { setActiveCalcId } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'structural' | 'concrete' | 'bbs' | 'site'>('all');

  return (
    <div className="space-y-10">
      <SEO
        title="Civil Engineering Calculators & Design Tools | CivilMath"
        description="Free professional civil engineering calculators for concrete volume, beam analysis, rebar BBS, column design, and surveying. Fast, accurate, and code-aligned."
        canonicalUrl="https://civilmath.com/"
        keywords={['civil engineering calculators', 'concrete calculator', 'beam analysis', 'bar bending schedule', 'civil math']}
        type="website"
        schema={[generateOrganizationSchema(), generateWebsiteSchema()]}
      />

      {/* 1. ARCHITECTURAL STUDIO HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-[#FAF8F5] dark:bg-[#202520] border border-[#D8D0C2] dark:border-[#384238] p-6 sm:p-10 lg:p-12 shadow-xs">
        {/* Subtle architectural grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#D8D0C2_1px,transparent_1px)] dark:bg-[radial-gradient(#384238_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Studio status tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAE7E0] dark:bg-[#2A312A] border border-[#D8D0C2] dark:border-[#384238] text-[10px] font-mono font-bold tracking-widest uppercase text-[#657565]">
            <span className="w-2 h-2 rounded-full bg-[#657565] animate-pulse" />
            <span>PRECISION WORKSPACE · SCALE 1:100 · METRIC & IMPERIAL</span>
          </div>

          {/* Canonical H1 Page Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#20231F] dark:text-[#EAE7E0] tracking-tight leading-[1.12]">
            Civil Engineering Calculators & Design Tools
          </h1>

          <p className="text-sm sm:text-base text-[#7B8978] dark:text-[#A1AFA0] leading-relaxed max-w-2xl">
            Accurate, code-aligned engineering calculators and drafting workspaces for structural analysis, 
            concrete estimating, rebar bar bending schedules, and construction site quantities.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/calculators')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#657565] hover:bg-[#536153] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Explore All 50+ Calculators</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => {
                setActiveCalcId('concrete-volume');
                navigate('/concrete/volume');
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/80 dark:bg-[#242A24]/80 hover:bg-[#F3F1EC] dark:hover:bg-[#2D352D] border border-[#D8D0C2] dark:border-[#384238] text-[#20231F] dark:text-[#EAE7E0] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <Box className="w-4 h-4 text-[#657565]" />
              <span>Launch Concrete Volume 3D</span>
            </button>

            <button
              onClick={() => navigate('/guides')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-transparent hover:bg-[#EAE7E0]/50 dark:hover:bg-[#2A312A]/50 text-[#7B8978] hover:text-[#20231F] dark:hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Reference Guides</span>
            </button>
          </div>

          {/* Technical Spec Metrics Bar */}
          <div className="pt-4 border-t border-[#D8D0C2]/60 dark:border-[#384238]/60 flex flex-wrap items-center gap-6 sm:gap-10 text-xs font-mono text-[#7B8978]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#20231F] dark:text-[#EAE7E0] text-base font-sans">50+</span>
              <span>Tools</span>
            </div>
            <div className="w-1 h-3 bg-[#D8D0C2] dark:bg-[#384238]" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#20231F] dark:text-[#EAE7E0] text-base font-sans">8</span>
              <span>Disciplines</span>
            </div>
            <div className="w-1 h-3 bg-[#D8D0C2] dark:bg-[#384238]" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#20231F] dark:text-[#EAE7E0] text-base font-sans">0.01</span>
              <span>Precision</span>
            </div>
            <div className="w-1 h-3 bg-[#D8D0C2] dark:bg-[#384238]" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#657565] text-base font-sans">Free</span>
              <span>Open Engineering</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EIGHT PRIMARY ENGINEERING DISCIPLINES GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7B8978]">DISCIPLINES</div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#20231F] dark:text-[#EAE7E0]">
              Engineering Calculation Categories
            </h2>
          </div>
          <Link
            to="/calculators"
            className="text-xs font-semibold text-[#657565] hover:underline inline-flex items-center gap-1 no-underline"
          >
            <span>View All Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ENGINEERING_DISCIPLINES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => navigate(item.path)}
                className="group relative bg-[#FAF8F5] dark:bg-[#202520] border border-[#D8D0C2] dark:border-[#384238] hover:border-[#657565] dark:hover:border-[#7B8978] p-5 rounded-2xl transition-all cursor-pointer shadow-xs hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#EAE7E0] dark:bg-[#2A312A] text-[#7B8978] border border-[#D8D0C2] dark:border-[#384238]">
                      {item.count}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#20231F] dark:text-[#EAE7E0] group-hover:text-[#657565] transition-colors mb-1.5">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#7B8978] dark:text-[#A1AFA0] leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D8D0C2]/50 dark:border-[#384238]/50 flex items-center justify-between text-[10px] font-mono text-[#7B8978]">
                  <span>{item.tag}</span>
                  <span className="text-[#657565] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Open →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SHOWCASE WORKSPACES WITH ARCHITECTURAL CAD PREVIEWS */}
      <section className="space-y-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7B8978]">FEATURED WORKSPACES</div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#20231F] dark:text-[#EAE7E0]">
            Flagship Engineering Calculators
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {SHOWCASE_CALCS.map((tool) => (
            <div
              key={tool.id}
              onClick={() => {
                setActiveCalcId(tool.id);
                navigate(tool.path);
              }}
              className="bg-[#FAF8F5] dark:bg-[#202520] border border-[#D8D0C2] dark:border-[#384238] hover:border-[#657565] dark:hover:border-[#7B8978] rounded-2xl p-5 sm:p-6 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-[#657565]/10 text-[#657565] border border-[#657565]/20">
                    {tool.category}
                  </span>
                  <span className="text-[10px] font-mono text-[#7B8978]">{tool.standard}</span>
                </div>

                <h3 className="text-base font-bold text-[#20231F] dark:text-[#EAE7E0] group-hover:text-[#657565] transition-colors">
                  {tool.name}
                </h3>

                <p className="text-xs text-[#7B8978] leading-relaxed">
                  {tool.details}
                </p>

                {/* Hero Output Metric Box */}
                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-[#242A24]/90 border border-[#D8D0C2] dark:border-[#384238] flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-mono text-[#7B8978] uppercase">Sample Result</div>
                    <div className="text-xl font-bold text-[#20231F] dark:text-[#EAE7E0]">{tool.metric}</div>
                  </div>
                  <div className="text-[10px] font-mono text-[#657565] bg-[#EAE7E0] dark:bg-[#2A312A] px-2 py-1 rounded-md border border-[#D8D0C2] dark:border-[#384238]">
                    {tool.submetric}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#D8D0C2]/50 dark:border-[#384238]/50 flex items-center justify-between text-xs font-semibold text-[#657565]">
                <span>Launch Interactive Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DESIGN CODES & ENGINEERING STANDARDS REFERENCE */}
      <section className="bg-[#FAF8F5] dark:bg-[#202520] border border-[#D8D0C2] dark:border-[#384238] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7B8978]">METHODOLOGY</div>
            <h2 className="text-lg sm:text-xl font-bold text-[#20231F] dark:text-[#EAE7E0]">
              Built on Recognized Engineering Standards
            </h2>
          </div>
          <Link
            to="/formulas"
            className="text-xs font-semibold text-[#657565] hover:underline inline-flex items-center gap-1 no-underline"
          >
            <span>Browse Formula Library</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {DESIGN_CODES.map((code) => (
            <div
              key={code.code}
              className="p-3.5 rounded-xl bg-white/80 dark:bg-[#242A24]/80 border border-[#D8D0C2]/80 dark:border-[#384238]/80 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#20231F] dark:text-[#EAE7E0]">{code.code}</span>
                <span className="text-[9px] font-mono text-[#7B8978]">{code.org}</span>
              </div>
              <p className="text-[11px] text-[#7B8978] leading-tight">{code.topic}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ENGINEERING DISCLAIMER & QUALITY PLEDGE */}
      <section className="p-5 rounded-2xl bg-[#EAE7E0]/60 dark:bg-[#242924]/60 border border-[#D8D0C2] dark:border-[#384238] flex flex-col sm:flex-row items-start gap-4 text-xs text-[#7B8978]">
        <ShieldCheck className="w-6 h-6 text-[#657565] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-[#20231F] dark:text-[#EAE7E0]">
            Engineering Disclaimer & Professional Verification
          </h4>
          <p className="leading-relaxed">
            All formulas and calculators provided on this platform are designed for professional estimation, educational review, 
            and preliminary planning purposes. Calculations should always be verified against project-specific contract documents, 
            local building codes, geotechnical soil reports, and applicable structural safety factors by a licensed Professional Engineer.
          </p>
        </div>
      </section>
    </div>
  );
}
