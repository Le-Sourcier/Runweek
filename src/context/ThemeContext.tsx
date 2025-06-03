import React, { createContext, useContext, useState, useEffect } from 'react';

// Interface for ThemeContext
interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  colorPalette: string;
  setColorPalette: (palette: string) => void;
}

// Create ThemeContext
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    return storedTheme || 'light'; // Default to 'light' if nothing is stored
  });
  const [currentColorPalette, setCurrentColorPaletteState] = useState<string>(() => {
    const storedPalette = localStorage.getItem('colorPalette');
    return storedPalette || 'default'; // Default to 'default' if nothing is stored
  });

  // Functions to be exposed via context
  const setTheme = (newTheme: 'light' | 'dark') => {
    setCurrentThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setColorPalette = (newPalette: string) => {
    setCurrentColorPaletteState(newPalette);
    localStorage.setItem('colorPalette', newPalette);
  };

  // Apply theme class to document.documentElement
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(currentTheme); // Use currentTheme from state
  }, [currentTheme]);

  // Define color palettes
  // HSL values should correspond to the definitions in index.css for the respective palettes
  const paletteColors: Record<string, Record<string, string>> = {
    default: { // Matches the :root variables in index.css
      '--primary': '238 82% 69%',
      '--primary-foreground': '0 0% 100%',
      // Add all shades for default if they need to be dynamically changed or ensure they are in :root
      '--secondary': '161 83% 39%',
      '--secondary-foreground': '0 0% 100%',
      '--accent': '38 93% 50%',
      '--accent-foreground': '215 28% 17%',
      // Destructive colors are usually constant, but can be added if they vary by palette
      // '--destructive': '0 84% 60%',
      // '--destructive-foreground': '0 0% 100%',
    },
    blue: { // Example: A blue-centric palette
      '--primary': '221 83% 53%', // hsl(221.2, 83.2%, 53.3%) - Tailwind's blue-600
      '--primary-foreground': '0 0% 100%',
      '--secondary': '217 91% 60%', // hsl(217.2, 91.2%, 59.8%) - Tailwind's blue-500
      '--secondary-foreground': '0 0% 100%',
      '--accent': '210 100% 56%', // hsl(210, 100%, 56%) - A vibrant sky blue for accent
      '--accent-foreground': '0 0% 100%',
      // Define shades 50-900 for primary, secondary, accent if needed for full theme switch
      // For brevity, only DEFAULT and foreground are shown here
    },
    green: { // Example: A green-centric palette
      '--primary': '142 76% 36%', // hsl(142.1, 76.2%, 36.3%) - Tailwind's green-600
      '--primary-foreground': '0 0% 100%',
      '--secondary': '145 63% 49%', // hsl(144.9, 63.2%, 49.0%) - Tailwind's green-500
      '--secondary-foreground': '0 0% 100%',
      '--accent': '150 80% 50%', // A vibrant lime green
      '--accent-foreground': '215 28% 17%',
    },
    purple: { // Example: A purple-centric palette
      '--primary': '262 84% 60%', // hsl(262.1, 83.6%, 60.1%) - Tailwind's purple-600
      '--primary-foreground': '0 0% 100%',
      '--secondary': '269 91% 65%', // hsl(268.7, 91.0%, 65.1%) - Tailwind's purple-500
      '--secondary-foreground': '0 0% 100%',
      '--accent': '280 100% 70%', // A vibrant magenta/violet
      '--accent-foreground': '0 0% 100%',
    },
    orange: { // Example: An orange-centric palette
      '--primary': '25 95% 53%', // hsl(24.6, 95.0%, 53.1%) - Tailwind's orange-600
      '--primary-foreground': '0 0% 100%',
      '--secondary': '30 96% 64%', // hsl(30.2, 96.0%, 63.9%) - Tailwind's orange-500
      '--secondary-foreground': '215 28% 17%',
      '--accent': '40 100% 50%', // A vibrant yellow-orange
      '--accent-foreground': '215 28% 17%',
    },
  };

  // Apply color palette CSS variables to the root element
  useEffect(() => {
    const root = window.document.documentElement;
    const selectedPalette = paletteColors[currentColorPalette] || paletteColors.default;

    console.log(`Applying palette: ${currentColorPalette}`);
    for (const [variable, value] of Object.entries(selectedPalette)) {
      root.style.setProperty(variable, value);
      // console.log(`Set ${variable} to ${value}`);
    }

    // If a palette doesn't define all shades, ensure defaults from :root or .dark are not overridden by stale values
    // This is a simplified approach. A more robust solution would be to:
    // 1. Store all shades (50-900) for each palette in paletteColors.
    // 2. Or, when switching, remove all dynamic palette variables and re-apply only the current ones.
    // For now, this assumes that the primary/secondary/accent variables are the main ones changed by palettes.
    // The base :root and .dark in index.css will provide the full shade spectrum for the "default" look.

  }, [currentColorPalette, currentTheme]); // Rerun if theme changes to re-apply palette over new base styles

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme, colorPalette: currentColorPalette, setColorPalette }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use ThemeContext
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
