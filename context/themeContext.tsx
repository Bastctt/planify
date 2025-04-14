import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextProps {
  theme: NonNullable<ColorSchemeName>;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  themeMode: 'system',
  setThemeMode: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemTheme = Appearance.getColorScheme() || 'light';
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  // Le thème effectif appliqué
  const theme = themeMode === 'system' ? systemTheme : themeMode;

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
        // Déclenche un re-render si le thème système change
        setThemeMode('system');
      }
    });
    return () => listener.remove();
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
