import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { UnitSystem, SavedCalculation } from '../types';

interface AppContextType {
  unitSystem: UnitSystem;
  setUnitSystem: (s: UnitSystem) => void;
  currency: string;
  setCurrency: (c: string) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  savedCalculations: SavedCalculation[];
  setSavedCalculations: (c: SavedCalculation[]) => void;
  handleSaveCalculation: (calc: SavedCalculation) => void;
  handleDeleteCalculation: (id: string) => void;
  handleLoadSavedCalculation: (calc: SavedCalculation) => void;
  loadedCalculation: SavedCalculation | null;
  activeCalcId: string;
  setActiveCalcId: (id: string) => void;
  favoriteCalculatorIds: string[];
  toggleFavoriteCalculator: (id: string) => void;
  recentCalculatorIds: string[];
  isDraftingDeskOpen: boolean;
  setIsDraftingDeskOpen: (v: boolean) => void;
  draftingNotes: string;
  setDraftingNotes: (v: string) => void;
  copiedText: string | null;
  handleCopy: (text: string, label: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [currency, setCurrency] = useState<string>(() => localStorage.getItem('civilmath_currency') || 'USD');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('civilmath_theme') as 'light' | 'dark') || 'light');
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [loadedCalculation, setLoadedCalculation] = useState<SavedCalculation | null>(null);
  const [activeCalcId, setActiveCalcIdState] = useState<string>('concrete-volume');
  const [favoriteCalculatorIds, setFavoriteCalculatorIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('civilmath_favorite_calculators') || '[]'); } catch { return []; }
  });
  const [recentCalculatorIds, setRecentCalculatorIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('civilmath_recent_calculators') || '[]'); } catch { return []; }
  });
  const [isDraftingDeskOpen, setIsDraftingDeskOpen] = useState<boolean>(() => localStorage.getItem('civilmath_drafting_desk_open') === 'true');
  const [draftingNotes, setDraftingNotes] = useState<string>(() => localStorage.getItem('civilmath_drafting_notes') || '');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => { localStorage.setItem('civilmath_currency', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('civilmath_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('civilmath_drafting_desk_open', String(isDraftingDeskOpen)); }, [isDraftingDeskOpen]);
  useEffect(() => { localStorage.setItem('civilmath_drafting_notes', draftingNotes); }, [draftingNotes]);
  useEffect(() => { localStorage.setItem('civilmath_favorite_calculators', JSON.stringify(favoriteCalculatorIds)); }, [favoriteCalculatorIds]);
  useEffect(() => { localStorage.setItem('civilmath_recent_calculators', JSON.stringify(recentCalculatorIds)); }, [recentCalculatorIds]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('civilmath_saved_calcs');
      if (stored) setSavedCalculations(JSON.parse(stored));
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'light' ? 'dark' : 'light'), []);

  const setActiveCalcId = useCallback((id: string) => {
    setActiveCalcIdState(prev => prev === id ? prev : id);
    setRecentCalculatorIds(current => {
      if (current[0] === id) return current;
      return [id, ...current.filter(item => item !== id)].slice(0, 8);
    });
  }, []);

  const handleSaveCalculation = useCallback((newCalc: SavedCalculation) => {
    setSavedCalculations(prev => {
      const updated = [newCalc, ...prev];
      localStorage.setItem('civilmath_saved_calcs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleDeleteCalculation = useCallback((id: string) => {
    setSavedCalculations(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem('civilmath_saved_calcs', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleLoadSavedCalculation = useCallback((calc: SavedCalculation) => {
    setLoadedCalculation(calc);
    setActiveCalcId(calc.calculatorId);
  }, [setActiveCalcId]);

  const toggleFavoriteCalculator = useCallback((id: string) => {
    setFavoriteCalculatorIds(current => current.includes(id) ? current.filter(item => item !== id) : [id, ...current]);
  }, []);

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 1500);
  }, []);

  const contextValue = useMemo<AppContextType>(() => ({
    unitSystem, setUnitSystem, currency, setCurrency,
    theme, setTheme, toggleTheme,
    savedCalculations, setSavedCalculations, handleSaveCalculation, handleDeleteCalculation,
    handleLoadSavedCalculation, loadedCalculation, activeCalcId, setActiveCalcId,
    favoriteCalculatorIds, toggleFavoriteCalculator, recentCalculatorIds,
    isDraftingDeskOpen, setIsDraftingDeskOpen, draftingNotes, setDraftingNotes,
    copiedText, handleCopy,
  }), [
    unitSystem, currency, theme, toggleTheme,
    savedCalculations, handleSaveCalculation, handleDeleteCalculation,
    handleLoadSavedCalculation, loadedCalculation, activeCalcId, setActiveCalcId,
    favoriteCalculatorIds, toggleFavoriteCalculator, recentCalculatorIds,
    isDraftingDeskOpen, draftingNotes, copiedText, handleCopy
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
