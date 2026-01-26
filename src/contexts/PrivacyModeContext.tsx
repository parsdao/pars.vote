import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PrivacyMode, PRIVACY_MODES, PrivacyModeConfig } from '../types/privacy';

interface PrivacyModeContextValue {
  /** Current privacy mode */
  mode: PrivacyMode;
  /** Mode configuration */
  config: PrivacyModeConfig;
  /** Is protected mode active */
  isProtected: boolean;
  /** Toggle between modes */
  toggleMode: () => void;
  /** Set specific mode */
  setMode: (mode: PrivacyMode) => void;
}

const PrivacyModeContext = createContext<PrivacyModeContextValue | null>(null);

interface PrivacyModeProviderProps {
  children: ReactNode;
  defaultMode?: PrivacyMode;
}

export function PrivacyModeProvider({
  children,
  defaultMode = 'public',
}: PrivacyModeProviderProps) {
  const [mode, setModeState] = useState<PrivacyMode>(defaultMode);

  const toggleMode = useCallback(() => {
    setModeState(prev => (prev === 'public' ? 'protected' : 'public'));
  }, []);

  const setMode = useCallback((newMode: PrivacyMode) => {
    setModeState(newMode);
  }, []);

  const value: PrivacyModeContextValue = {
    mode,
    config: PRIVACY_MODES[mode],
    isProtected: mode === 'protected',
    toggleMode,
    setMode,
  };

  return (
    <PrivacyModeContext.Provider value={value}>
      {children}
    </PrivacyModeContext.Provider>
  );
}

export function usePrivacyMode(): PrivacyModeContextValue {
  const context = useContext(PrivacyModeContext);
  if (!context) {
    throw new Error('usePrivacyMode must be used within a PrivacyModeProvider');
  }
  return context;
}

/**
 * Hook for components that need to conditionally render based on privacy mode
 */
export function useIsProtectedMode(): boolean {
  const { isProtected } = usePrivacyMode();
  return isProtected;
}
