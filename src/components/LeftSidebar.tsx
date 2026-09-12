import { Link, useLocation } from 'react-router-dom';
import {
  Home, Box, Grid, Compass,
  Layers, ArrowLeftRight, ClipboardList,
  FileText, Bookmark, BookOpen, ChevronRight,
  HardHat
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  count: number;
  path: string;
  icon: any;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'concrete', name: 'Concrete', count: 6, path: '/concrete', icon: Box, color: '#657565' },
  { id: 'reinforcement', name: 'Reinforcement', count: 5, path: '/concrete/rebar', icon: Grid, color: '#9A8062' },
  { id: 'masonry', name: 'Masonry', count: 4, path: '/concrete/brick', icon: Layers, color: '#B56F50' },
  { id: 'earthwork', name: 'Earthwork', count: 5, path: '/construction', icon: HardHat, color: '#D9B96E' },
  { id: 'surveying', name: 'Surveying', count: 4, path: '/surveying', icon: Compass, color: '#9CB5C4' },
  { id: 'area-volume', name: 'Area & Volume', count: 6, path: '/calculators', icon: Layers, color: '#7B8978' },
  { id: 'quantity', name: 'Quantity Estimation', count: 5, path: '/bbs', icon: ClipboardList, color: '#B7A8C5' },
  { id: 'conversions', name: 'Conversions', count: 8, path: '/utilities/unit-converter', icon: ArrowLeftRight, color: '#A89F91' },
];

const TOOLS = [
  { name: 'Unit Converter', path: '/utilities/unit-converter', icon: ArrowLeftRight },
  { name: 'Formula Library', path: '/formulas', icon: FileText },
  { name: 'Material Guide', path: '/guides', icon: BookOpen },
  { name: 'Saved Calculations', path: '/dashboard', icon: Bookmark },
];

interface LeftSidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export default function LeftSidebar({ onItemClick, className = '' }: LeftSidebarProps) {
  const location = useLocation();

  const isCategoryActive = (item: CategoryItem) => {
    if (item.id === 'concrete') {
      return location.pathname.startsWith('/concrete') && !location.pathname.includes('/rebar') && !location.pathname.includes('/brick');
    }
    if (item.id === 'reinforcement') {
      return location.pathname.includes('/rebar') || location.pathname.includes('/steel');
    }
    if (item.id === 'masonry') {
      return location.pathname.includes('/brick');
    }
    if (item.id === 'earthwork') {
      return location.pathname.startsWith('/construction');
    }
    if (item.id === 'surveying') {
      return location.pathname.startsWith('/surveying');
    }
    if (item.id === 'quantity') {
      return location.pathname.startsWith('/bbs') || location.pathname.startsWith('/boq');
    }
    if (item.id === 'conversions') {
      return location.pathname.includes('/unit-converter');
    }
    if (item.id === 'area-volume') {
      return location.pathname === '/calculators';
    }
    return location.pathname === item.path;
  };

  return (
    <aside className={`w-64 shrink-0 flex flex-col justify-between py-6 px-4 bg-[#FAF9F6] dark:bg-[#1E221E] border-r border-[#D8D0C2] dark:border-[#333C33] select-none text-left ${className}`}>
      {/* Top Section */}
      <div className="space-y-6">
        {/* Geometric Engineering Logo (No brand name) */}
        <Link to="/" onClick={onItemClick} className="flex items-center gap-3 px-2 no-underline group">
          <div className="w-9 h-9 rounded-xl bg-[#20231F] dark:bg-[#EAE7E0] flex items-center justify-center text-white dark:text-[#20231F] shadow-xs group-hover:scale-105 transition-transform">
            {/* Geometric isometric engineering mark */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-extrabold tracking-wider uppercase text-[#20231F] dark:text-[#EAE7E0] leading-tight">
              Engineering Tools
            </div>
            <div className="text-[9.5px] font-medium tracking-wide text-[#7B8978] dark:text-[#9CA899]">
              Precision Workspace
            </div>
          </div>
        </Link>

        {/* Home Button */}
        <div>
          <Link
            to="/"
            onClick={onItemClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors no-underline ${
              location.pathname === '/'
                ? 'bg-[#EAE7E0] dark:bg-[#2A312A] text-[#20231F] dark:text-[#EAE7E0]'
                : 'text-[#555C55] dark:text-[#A4B2A4] hover:bg-[#F3F1EC] dark:hover:bg-[#262C26] hover:text-[#20231F]'
            }`}
          >
            <Home className="w-4 h-4 text-[#7B8978]" />
            <span>Home</span>
          </Link>
        </div>

        {/* Calculators Categories */}
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[9px] font-bold font-mono uppercase tracking-wider text-[#7B8978] dark:text-[#9CA899]">
            Calculators
          </div>

          <div className="space-y-0.5">
            {CATEGORIES.map((cat) => {
              const active = isCategoryActive(cat);
              const IconComp = cat.icon;

              return (
                <Link
                  key={cat.id}
                  to={cat.path}
                  onClick={onItemClick}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all no-underline ${
                    active
                      ? 'bg-[#657565] text-white shadow-xs font-semibold'
                      : 'text-[#3E453E] dark:text-[#C5D0C5] hover:bg-[#F3F1EC] dark:hover:bg-[#262C26]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        active ? 'bg-white/20 text-white' : 'text-slate-700 dark:text-slate-200'
                      }`}
                      style={{ color: active ? '#ffffff' : cat.color }}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[10px] font-mono ${active ? 'text-white/80' : 'text-[#7B8978] dark:text-[#8C988C]'}`}>
                      {cat.count}
                    </span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-white/90" />}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Tools Section */}
      <div className="pt-4 border-t border-[#D8D0C2] dark:border-[#333C33] space-y-1">
        <div className="px-3 pb-1 text-[9px] font-bold font-mono uppercase tracking-wider text-[#7B8978] dark:text-[#9CA899]">
          Tools
        </div>

        {TOOLS.map((t) => {
          const IconComp = t.icon;
          const active = location.pathname === t.path;

          return (
            <Link
              key={t.name}
              to={t.path}
              onClick={onItemClick}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs transition-colors no-underline ${
                active
                  ? 'bg-[#EAE7E0] dark:bg-[#2A312A] text-[#20231F] dark:text-[#EAE7E0] font-semibold'
                  : 'text-[#555C55] dark:text-[#A4B2A4] hover:bg-[#F3F1EC] dark:hover:bg-[#262C26] hover:text-[#20231F]'
              }`}
            >
              <IconComp className="w-3.5 h-3.5 text-[#7B8978]" />
              <span className="truncate">{t.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
