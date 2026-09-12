import { Link } from 'react-router-dom';
import {
  Clock, MoreVertical, Box,
  ArrowLeftRight, FileText, BookOpen, Bookmark
} from 'lucide-react';

interface RecentCalc {
  id: string;
  name: string;
  value: string;
  detail: string;
  time: string;
  path: string;
  iconBg: string;
  iconColor: string;
}

const RECENT_CALCS: RecentCalc[] = [
  {
    id: '1',
    name: 'Concrete Volume',
    value: '3.00 m³',
    detail: '5.00 × 4.00 × 0.15',
    time: '2 min ago',
    path: '/concrete/volume',
    iconBg: 'rgba(101, 117, 101, 0.14)',
    iconColor: '#526052',
  },
  {
    id: '2',
    name: 'Rebar Weight',
    value: '5.33 kg',
    detail: '12 mm × 6 m',
    time: '1 hour ago',
    path: '/concrete/rebar',
    iconBg: 'rgba(154, 128, 98, 0.14)',
    iconColor: '#846B4E',
  },
  {
    id: '3',
    name: 'Brick Quantity',
    value: '1,728 pcs',
    detail: 'Wall 3.6 × 2.4 × 0.2',
    time: '3 hours ago',
    path: '/concrete/brick',
    iconBg: 'rgba(181, 111, 80, 0.14)',
    iconColor: '#9C4E2D',
  },
  {
    id: '4',
    name: 'Plaster Quantity',
    value: '0.76 m³',
    detail: '25.4 m²',
    time: '5 hours ago',
    path: '/concrete/brick',
    iconBg: 'rgba(156, 181, 196, 0.18)',
    iconColor: '#45677A',
  },
  {
    id: '5',
    name: 'Earthwork Volume',
    value: '180.00 m³',
    detail: 'Area 120 m² × 1.5 m',
    time: '1 day ago',
    path: '/construction',
    iconBg: 'rgba(217, 185, 110, 0.18)',
    iconColor: '#806626',
  },
];

const QUICK_TOOLS = [
  { name: 'Unit Converter', path: '/utilities/unit-converter', icon: ArrowLeftRight },
  { name: 'Formula Library', path: '/formulas', icon: FileText },
  { name: 'Material Guide', path: '/guides', icon: BookOpen },
  { name: 'Saved Items', path: '/dashboard', icon: Bookmark },
];

export default function RightUtilityPanel({ className = '' }: { className?: string }) {
  return (
    <aside className={`w-80 shrink-0 flex flex-col gap-6 py-6 px-4 bg-[#FAF9F6] dark:bg-[#1E221E] border-l border-[#D8D0C2] dark:border-[#333C33] select-none text-left ${className}`}>
      {/* 1. Recent Calculations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#7B8978]" />
            <h3 className="text-xs font-bold text-[#20231F] dark:text-[#EAE7E0]">
              Recent Calculations
            </h3>
          </div>
          <Link
            to="/dashboard"
            className="text-[10px] font-semibold text-[#7B8978] hover:text-[#20231F] dark:hover:text-white no-underline transition-colors"
          >
            See all
          </Link>
        </div>

        <div className="space-y-1.5">
          {RECENT_CALCS.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-white/80 dark:bg-[#242A24] border border-[#D8D0C2]/70 dark:border-[#384238] hover:border-[#7B8978]/60 transition-all no-underline group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                >
                  <Box className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11.5px] font-bold text-[#20231F] dark:text-[#EAE7E0] truncate">
                    {item.name}
                  </div>
                  <div className="text-[9.5px] font-mono text-[#7B8978] dark:text-[#8E9A8E] truncate">
                    {item.detail}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                <div className="text-right">
                  <div className="text-xs font-bold text-[#20231F] dark:text-[#EAE7E0]">
                    {item.value}
                  </div>
                  <div className="text-[9px] font-mono text-[#94A094] dark:text-[#7A867A]">
                    {item.time}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="p-1 rounded-lg text-[#94A094] hover:text-[#20231F] dark:hover:text-white transition-colors cursor-pointer"
                  title="More actions"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Quick Tools (2 x 2 grid) */}
      <div className="space-y-3">
        <div className="px-1 text-xs font-bold text-[#20231F] dark:text-[#EAE7E0]">
          Quick Tools
        </div>

        <div className="grid grid-cols-2 gap-2">
          {QUICK_TOOLS.map((tool) => {
            const IconComp = tool.icon;
            return (
              <Link
                key={tool.name}
                to={tool.path}
                className="flex items-center gap-2 p-3 rounded-2xl bg-white/80 dark:bg-[#242A24] border border-[#D8D0C2]/70 dark:border-[#384238] hover:border-[#7B8978]/60 transition-all no-underline group shadow-2xs text-left"
              >
                <div className="w-7 h-7 rounded-xl bg-[#F3F1EC] dark:bg-[#2E352E] flex items-center justify-center text-[#7B8978] group-hover:text-[#20231F] dark:group-hover:text-white shrink-0 transition-colors">
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#20231F] dark:text-[#EAE7E0] leading-tight">
                  {tool.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Architectural Inspiration Card */}
      <div className="mt-auto relative p-5 rounded-3xl bg-gradient-to-br from-[#FAF8F5] to-[#EAE7E0] dark:from-[#242A24] dark:to-[#1B1E1B] border border-[#D8D0C2] dark:border-[#384238] overflow-hidden shadow-2xs">
        {/* Faint architectural lines */}
        <div className="absolute inset-0 opacity-10 blueprint-grid pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <span className="text-2xl font-serif text-[#7B8978] leading-none block">“</span>
          <p className="text-xs font-semibold text-[#20231F] dark:text-[#EAE7E0] leading-snug">
            Measure twice, build once.
          </p>
          <div className="w-6 h-[1.5px] bg-[#9A8062] rounded-full my-1.5" />
          <p className="text-[10px] font-medium text-[#7B8978] dark:text-[#8E9A8E]">
            Good engineering lasts.
          </p>
        </div>
      </div>
    </aside>
  );
}
