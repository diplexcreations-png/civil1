import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const [activeCalcId, setActiveCalcId] = useState<string>('concrete-volume');
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem('civilmath_saved_calcs');
      if (stored) setSavedCalculations(JSON.parse(stored));
    } catch {}
  }, []);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleSaveCalculation = (newCalc: SavedCalculation) => {
    const updated = [newCalc, ...savedCalculations];
    setSavedCalculations(updated);
    localStorage.setItem('civilmath_saved_calcs', JSON.stringify(updated));
  };

  const handleDeleteCalculation = (id: string) => {
    const updated = savedCalculations.filter(c => c.id !== id);
    setSavedCalculations(updated);
    localStorage.setItem('civilmath_saved_calcs', JSON.stringify(updated));
  };

  const handleLoadSavedCalculation = (calc: SavedCalculation) => {
    setLoadedCalculation(calc);
    setActiveCalcId(calc.calculatorId);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 1500);
  };

  return (
    <AppContext.Provider value={{
      unitSystem, setUnitSystem, currency, setCurrency,
      theme, setTheme, toggleTheme,
      savedCalculations, setSavedCalculations, handleSaveCalculation, handleDeleteCalculation,
      handleLoadSavedCalculation, loadedCalculation, activeCalcId, setActiveCalcId,
      isDraftingDeskOpen, setIsDraftingDeskOpen, draftingNotes, setDraftingNotes,
      copiedText, handleCopy,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
