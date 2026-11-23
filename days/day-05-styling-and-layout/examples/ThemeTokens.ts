import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface ColorPalette {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const typography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.4,
  } satisfies TextStyle,
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  } satisfies TextStyle,
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  } satisfies TextStyle,
} as const;

export const lightColors: ColorPalette = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  border: '#E2E8F0',
  primary: '#2563EB',
  primaryText: '#FFFFFF',
  accent: '#0EA5E9',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
};

export const darkColors: ColorPalette = {
  background: '#0B1120',
  surface: '#111827',
  surfaceElevated: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',
  primary: '#60A5FA',
  primaryText: '#0B1120',
  accent: '#38BDF8',
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#F87171',
};

export function getThemeColors(mode: ThemeMode): ColorPalette {
  return mode === 'dark' ? darkColors : lightColors;
}

export type Breakpoint = 'compact' | 'medium' | 'expanded';

export function getBreakpoint(width: number): Breakpoint {
  if (width >= 900) {
    return 'expanded';
  }
  if (width >= 600) {
    return 'medium';
  }
  return 'compact';
}

export function createCardShadow(mode: ThemeMode): ViewStyle {
  const shadowColor = mode === 'dark' ? '#000000' : '#0F172A';

  return (
    Platform.select<ViewStyle>({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: mode === 'dark' ? 0.35 : 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: mode === 'dark' ? 6 : 3,
      },
      default: {
        shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
    }) ?? {}
  );
}
