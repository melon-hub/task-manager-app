'use client';

import * as React from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'taskflow-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    // Initialize from defaultTheme which comes from server cookies
    return defaultTheme;
  });

  React.useEffect(() => {
    // Sync with client storage on mount
    const cookieTheme = document.cookie
      .split('; ')
      .find(row => row.startsWith('theme='))
      ?.split('=')[1] as Theme;
    
    if (cookieTheme && cookieTheme !== theme) {
      setTheme(cookieTheme);
    }
  }, []);

  React.useEffect(() => {
    const root = window.document.documentElement;
    const resolvedTheme = theme === 'system' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme;

    // Update theme - the script already set initial dark class
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = resolvedTheme;
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      const root = window.document.documentElement;
      
      // Add transitioning class for smooth theme change
      root.classList.add('transitioning');
      
      localStorage.setItem(storageKey, newTheme);
      document.cookie = `theme=${newTheme};path=/;max-age=31536000`;
      setTheme(newTheme);
      
      // Remove transitioning class after animation
      setTimeout(() => {
        root.classList.remove('transitioning');
      }, 300);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};