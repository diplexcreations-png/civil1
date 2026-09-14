import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun, Moon, Menu, X, Bell,
  Home, Calculator, Search as SearchIcon, Wrench, Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useProject } from '../context/ProjectContext';
import { ProjectBOQDrawer } from './ProjectBOQDrawer';
import GlobalSearch from './GlobalSearch';
import LeftSidebar from './LeftSidebar';
import RightUtilityPanel from './RightUtilityPanel';
import { ChatBot } from './ChatBot';

export default function AppLayout() {
  const { theme, toggleTheme, activeCalcId, unitSystem } = useApp();
  const { toggleBOQDrawer, totals } = useProject();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen text-[#161A2C] dark:text-[#E7EAF7] flex font-sans transition-colors duration-300">
      {/* 1. Left Sidebar (Desktop Persistent) */}
      <LeftSidebar className="hidden xl:flex sticky top-0 h-screen" />

      {/* Mobile Drawer (Left Sidebar on small screens) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 xl:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-10 w-72 h-full shadow-2xl"
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-[#141830] text-[#7C88B8] shadow-xs cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
              <LeftSidebar onItemClick={() => setMobileMenuOpen(false)} className="w-full h-full" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Center Column + Header */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Floating Top Header */}
        <header className="sticky top-0 z-30 bg-white/60 dark:bg-[#0B0D16]/70 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 border-b border-white/60 dark:border-[#232A3D]">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden p-2 rounded-xl border border-[#DCE3F5] dark:border-[#2A3350] backdrop-blur-xl backdrop-saturate-150 bg-[#F7F9FF]/70 dark:bg-[#141826]/70 text-[#161A2C] dark:text-[#E7EAF7] hover:border-[#7C88B8] transition-colors cursor-pointer shadow-2xs"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Search Input with Ctrl+K */}
            <GlobalSearch />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Project BOQ Quick Button */}
            <button
              onClick={toggleBOQDrawer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE3F5] dark:border-[#2A3350] backdrop-blur-xl backdrop-saturate-150 bg-[#F7F9FF]/70 dark:bg-[#141826]/70 text-xs font-semibold text-[#161A2C] dark:text-[#E7EAF7] hover:border-[#7C88B8] transition-colors cursor-pointer shadow-2xs"
              title="Open Project Master BOQ"
            >
              <Building2 className="w-3.5 h-3.5 text-[#7C88B8]" />
              <span className="hidden sm:inline">BOQ</span>
              {totals.itemCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#4C5FE0] text-white text-[9px] font-bold">
                  {totals.itemCount}
                </span>
              )}
            </button>

            {/* Theme Toggle (Light Warm / Charcoal) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#DCE3F5] dark:border-[#2A3350] backdrop-blur-xl backdrop-saturate-150 bg-[#F7F9FF]/70 dark:bg-[#141826]/70 text-[#7C88B8] hover:text-[#161A2C] dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
              title={theme === 'light' ? 'Switch to Warm Studio Mode' : 'Switch to Warm Light Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#D9B96E]" />}
            </button>

            {/* Notifications Bell */}
            <button
              className="relative p-2 rounded-xl border border-[#DCE3F5] dark:border-[#2A3350] backdrop-blur-xl backdrop-saturate-150 bg-[#F7F9FF]/70 dark:bg-[#141826]/70 text-[#7C88B8] hover:text-[#161A2C] dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#B56F50] rounded-full" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-1 sm:pl-2">
              <div className="w-8 h-8 rounded-full bg-[#4C5FE0] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                E
              </div>
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-[#7C88B8] font-medium">Good to see you!</span>
                <span className="text-xs font-bold text-[#161A2C] dark:text-[#E7EAF7]">Engineer</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* 3. Right Utility Panel (Desktop Persistent on wide screens) */}
      <RightUtilityPanel className="hidden 2xl:flex sticky top-0 h-screen" />

      {/* Floating Bottom Mobile Navigation Bar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 xl:hidden flex items-center gap-1 px-3 py-2 bg-white/90 dark:bg-[#11141F]/90 backdrop-blur-xl border border-[#DCE3F5] dark:border-[#2A3350] rounded-2xl shadow-xl">
        <Link
          to="/"
          className={`flex flex-col items-center px-3 py-1 rounded-xl text-[10px] font-bold no-underline transition-colors ${
            location.pathname === '/' ? 'text-[#4C5FE0] bg-[#E7EAF7]/60 dark:bg-[#1D2438]' : 'text-[#7C88B8]'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </Link>
        <Link
          to="/calculators"
          className={`flex flex-col items-center px-3 py-1 rounded-xl text-[10px] font-bold no-underline transition-colors ${
            location.pathname.startsWith('/calculators') || location.pathname.startsWith('/concrete') ? 'text-[#4C5FE0] bg-[#E7EAF7]/60 dark:bg-[#1D2438]' : 'text-[#7C88B8]'
          }`}
        >
          <Calculator className="w-4 h-4 mb-0.5" />
          <span>Calculators</span>
        </Link>
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
          }}
          className="flex flex-col items-center px-3 py-1 rounded-xl text-[10px] font-bold text-[#7C88B8] transition-colors cursor-pointer"
        >
          <SearchIcon className="w-4 h-4 mb-0.5" />
          <span>Search</span>
        </button>
        <Link
          to="/construction"
          className={`flex flex-col items-center px-3 py-1 rounded-xl text-[10px] font-bold no-underline transition-colors ${
            location.pathname.startsWith('/construction') ? 'text-[#4C5FE0] bg-[#E7EAF7]/60 dark:bg-[#1D2438]' : 'text-[#7C88B8]'
          }`}
        >
          <Wrench className="w-4 h-4 mb-0.5" />
          <span>Tools</span>
        </Link>
      </div>

      {/* Floating ChatBot Assistant */}
      <ChatBot activeCalcId={activeCalcId} unitSystem={unitSystem} />

      {/* Slide-over Project BOQ Drawer */}
      <ProjectBOQDrawer />
    </div>
  );
}
