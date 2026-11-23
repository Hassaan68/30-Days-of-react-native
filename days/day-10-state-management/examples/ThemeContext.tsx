import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accent: string;
}

const LIGHT_COLORS: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  accent: '#2563EB',
};

const DARK_COLORS: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  accent: '#60A5FA',
};

export interface ThemeStateContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  colors: ThemeColors;
}

export interface ThemeActionsContextValue {
  setPreference: (next: ThemePreference) => void;
  cyclePreference: () => void;
}

// Splitting state and actions prevents action-only consumers (like a toggle button)
// from re-rendering whenever theme colors change.
const ThemeStateContext = createContext<ThemeStateContextValue | null>(null);
const ThemeActionsContext = createContext<ThemeActionsContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  initialPreference?: ThemePreference;
}

export function ThemeProvider({ children, initialPreference = 'system' }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(initialPreference);

  const resolvedTheme: ResolvedTheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
  }, []);

  const cyclePreference = useCallback(() => {
    setPreferenceState((current) => {
      if (current === 'system') return 'light';
      if (current === 'light') return 'dark';
      return 'system';
    });
  }, []);

  const stateValue = useMemo<ThemeStateContextValue>(
    () => ({
      preference,
      resolvedTheme,
      colors: resolvedTheme === 'dark' ? DARK_COLORS : LIGHT_COLORS,
    }),
    [preference, resolvedTheme],
  );

  const actionsValue = useMemo<ThemeActionsContextValue>(
    () => ({
      setPreference,
      cyclePreference,
    }),
    [setPreference, cyclePreference],
  );

  return (
    <ThemeStateContext.Provider value={stateValue}>
      <ThemeActionsContext.Provider value={actionsValue}>{children}</ThemeActionsContext.Provider>
    </ThemeStateContext.Provider>
  );
}

/**
 * Custom consumer hook for reading the active theme and colors.
 * Throws a helpful error if called outside <ThemeProvider>.
 */
export function useTheme(): ThemeStateContextValue {
  const context = useContext(ThemeStateContext);
  if (!context) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return context;
}

/**
 * Custom consumer hook for updating the theme preference without subscribing to color updates.
 */
export function useThemeActions(): ThemeActionsContextValue {
  const context = useContext(ThemeActionsContext);
  if (!context) {
    throw new Error('useThemeActions must be used within a <ThemeProvider>');
  }
  return context;
}
