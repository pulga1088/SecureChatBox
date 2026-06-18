import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { theme } from './theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof theme.colors.light;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    setMode('dark');
  }, []);

  const toggleTheme = () => {
    // Force dark mode globally, toggle theme is disabled
  };

  const setThemeMode = (newMode: ThemeMode) => {
    // Keep dark mode
  };

  const colors = theme.colors.dark;
  const isDark = true;

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
