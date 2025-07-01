import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  isDarkMode: false,
  toggleTheme: () => {},
  toggleColorScheme: () => {},
  setColorScheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useColorScheme() as ColorScheme;
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');

  useEffect(() => {
    // Initialize with device color scheme
    setColorScheme('light');
  }, [deviceColorScheme]);

  const toggleColorScheme = () => {
    setColorScheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleTheme = () => {
    setColorScheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDarkMode = colorScheme === 'dark';

  return (
    <ThemeContext.Provider value={{ 
      colorScheme, 
      isDarkMode,
      toggleTheme,
      toggleColorScheme, 
      setColorScheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};