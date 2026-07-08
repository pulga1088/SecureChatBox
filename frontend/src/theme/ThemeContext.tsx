import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from './theme';

export type ThemeMode = 'light' | 'dark' | 'obsidian';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof theme.colors.dark; // Use dark as base type representation (all have same keys)
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@secure_chat_theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_KEY);
        if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'obsidian')) {
          setMode(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference from AsyncStorage:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    loadSavedTheme();
  }, []);

  const saveThemeMode = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, newMode);
      setMode(newMode);
    } catch (error) {
      console.error('Failed to save theme preference to AsyncStorage:', error);
    }
  };

  const toggleTheme = () => {
    let nextMode: ThemeMode = 'dark';
    if (mode === 'light') {
      nextMode = 'dark';
    } else if (mode === 'dark') {
      nextMode = 'obsidian';
    } else if (mode === 'obsidian') {
      nextMode = 'light';
    }
    saveThemeMode(nextMode);
  };

  const setThemeMode = (newMode: ThemeMode) => {
    saveThemeMode(newMode);
  };

  const colors = theme.colors[mode];
  const isDark = mode !== 'light';

  // Prevent flash or children loading before theme is resolved if necessary,
  // but for react-native keeping a default state of 'dark' and rendering is usually fine.
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

