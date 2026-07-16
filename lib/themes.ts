export type Theme = 'dark' | 'light' | 'midnight';
export type FretboardTheme = 'classic' | 'black-silver';

export interface FretboardThemeConfig {
  name: string;
  fretboardBg: string;
  fretboardFret: string;
  fretboardString: string;
  fretMarker: string;
}

export interface ThemeConfig {
  name: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  fretboardBg: string;
  fretboardFret: string;
  fretboardString: string;
  fretMarker: string;
  sidebarBg: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonHover: string;
  accentPrimary: string;
  accentSecondary: string;
}

export const themes: Record<Theme, ThemeConfig> = {
  dark: {
    name: 'Dark Pro',
    bgPrimary: '#0a0a0a',
    bgSecondary: '#1a1a1a',
    bgTertiary: '#2a2a2a',
    textPrimary: '#ffffff',
    textSecondary: '#a0a0a0',
    border: '#333333',
    fretboardBg: '#1e1e1e',
    fretboardFret: '#4a4a4a',
    fretboardString: '#666666',
    fretMarker: '#888888',
    sidebarBg: '#141414',
    buttonPrimary: '#2563eb',
    buttonSecondary: '#374151',
    buttonHover: '#3b82f6',
    accentPrimary: '#3b82f6',
    accentSecondary: '#60a5fa',
  },
  light: {
    name: 'Light Studio',
    bgPrimary: '#ffffff',
    bgSecondary: '#f8f9fa',
    bgTertiary: '#e9ecef',
    textPrimary: '#1a1a1a',
    textSecondary: '#6c757d',
    border: '#dee2e6',
    fretboardBg: '#f5f5f5',
    fretboardFret: '#adb5bd',
    fretboardString: '#868e96',
    fretMarker: '#495057',
    sidebarBg: '#f1f3f5',
    buttonPrimary: '#0066cc',
    buttonSecondary: '#e9ecef',
    buttonHover: '#0052a3',
    accentPrimary: '#0066cc',
    accentSecondary: '#3399ff',
  },
  midnight: {
    name: 'Midnight Blue',
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    bgTertiary: '#334155',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#475569',
    fretboardBg: '#1e293b',
    fretboardFret: '#475569',
    fretboardString: '#64748b',
    fretMarker: '#94a3b8',
    sidebarBg: '#0f172a',
    buttonPrimary: '#0ea5e9',
    buttonSecondary: '#334155',
    buttonHover: '#0284c7',
    accentPrimary: '#0ea5e9',
    accentSecondary: '#38bdf8',
  },
};

// Fretboard-specific themes that can be applied independently
export const fretboardThemes: Record<FretboardTheme, FretboardThemeConfig> = {
  classic: {
    name: 'Classic',
    fretboardBg: '#1e1e1e',
    fretboardFret: '#4a4a4a',
    fretboardString: '#666666',
    fretMarker: '#888888',
  },
  'black-silver': {
    name: 'Black Silver',
    fretboardBg: '#000000',
    fretboardFret: '#c0c0c0',  // Silver frets
    fretboardString: '#808080',  // Gray strings (will be overridden by colorful strings if enabled)
    fretMarker: '#a8a8a8',  // Light gray markers
  },
};
