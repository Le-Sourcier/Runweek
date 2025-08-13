import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme, ThemeContextType } from './ThemeContext'; // Assuming ThemeContextType is exported
import '@testing-library/jest-dom'; // For .toBeInTheDocument()

// Test component to consume the theme context
const TestThemeComponent: React.FC = () => {
  const { theme, setTheme, colorPalette, setColorPalette } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="current-palette">{colorPalette}</span>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <button onClick={() => setColorPalette('blue')}>
        Set Blue Palette
      </button>
      <button onClick={() => setColorPalette('green')}>
        Set Green Palette
      </button>
    </div>
  );
};

describe('ThemeContext and ThemeProvider', () => {
  let mockSetProperty: ReturnType<typeof vi.spyOn>;
  let mockClassListAdd: ReturnType<typeof vi.spyOn>;
  let mockClassListRemove: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock documentElement properties
    mockSetProperty = vi.spyOn(document.documentElement.style, 'setProperty').mockImplementation(() => {});
    mockClassListAdd = vi.spyOn(document.documentElement.classList, 'add').mockImplementation(() => {});
    mockClassListRemove = vi.spyOn(document.documentElement.classList, 'remove').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore mocks
    mockSetProperty.mockRestore();
    mockClassListAdd.mockRestore();
    mockClassListRemove.mockRestore();
    // Reset theme to light for next test by clearing inline styles and classes
    document.documentElement.className = '';
    document.documentElement.style.cssText = '';
  });

  describe('Initialization', () => {
    it('should initialize with "light" theme and "default" colorPalette', () => {
      render(
        <ThemeProvider>
          <TestThemeComponent />
        </ThemeProvider>
      );
      expect(screen.getByTestId('current-theme').textContent).toBe('light');
      expect(screen.getByTestId('current-palette').textContent).toBe('default');
      // Check if 'light' class is added on init
      expect(mockClassListAdd).toHaveBeenCalledWith('light');
    });
  });

  describe('Theme Toggling', () => {
    it('should toggle theme and update documentElement class', () => {
      render(
        <ThemeProvider>
          <TestThemeComponent />
        </ThemeProvider>
      );

      // Initial is light
      expect(screen.getByTestId('current-theme').textContent).toBe('light');
      expect(mockClassListAdd).toHaveBeenCalledWith('light'); // From initialization

      // Toggle to dark
      act(() => {
        fireEvent.click(screen.getByText('Toggle Theme'));
      });
      expect(screen.getByTestId('current-theme').textContent).toBe('dark');
      expect(mockClassListRemove).toHaveBeenCalledWith('light'); // ortoHaveBeenCalledTimes(1) if add('light') is always first
      expect(mockClassListAdd).toHaveBeenCalledWith('dark');

      // Toggle back to light
      act(() => {
        fireEvent.click(screen.getByText('Toggle Theme'));
      });
      expect(screen.getByTestId('current-theme').textContent).toBe('light');
      expect(mockClassListRemove).toHaveBeenCalledWith('dark');
      expect(mockClassListAdd).toHaveBeenCalledWith('light'); // Check it's added again
    });
  });

  describe('Color Palette Change', () => {
    it('should change colorPalette and update CSS variables', () => {
      render(
        <ThemeProvider>
          <TestThemeComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-palette').textContent).toBe('default');

      // Change to blue palette
      act(() => {
        fireEvent.click(screen.getByText('Set Blue Palette'));
      });
      expect(screen.getByTestId('current-palette').textContent).toBe('blue');

      // Check if setProperty was called for the blue palette
      // These values are from ThemeContext's paletteColors.blue
      expect(mockSetProperty).toHaveBeenCalledWith('--primary', '221 83% 53%');
      expect(mockSetProperty).toHaveBeenCalledWith('--primary-foreground', '0 0% 100%');
      expect(mockSetProperty).toHaveBeenCalledWith('--secondary', '217 91% 60%');
      // Add more checks for other variables if necessary

      mockSetProperty.mockClear(); // Clear previous calls before next palette change

      // Change to green palette
      act(() => {
        fireEvent.click(screen.getByText('Set Green Palette'));
      });
      expect(screen.getByTestId('current-palette').textContent).toBe('green');
      // These values are from ThemeContext's paletteColors.green
      expect(mockSetProperty).toHaveBeenCalledWith('--primary', '142 76% 36%');
      expect(mockSetProperty).toHaveBeenCalledWith('--primary-foreground', '0 0% 100%');
    });
  });

  describe('useTheme hook', () => {
    it('should return context values when used within ThemeProvider', () => {
      let contextValue: ThemeContextType | null = null;
      const Consumer = () => {
        contextValue = useTheme();
        return null;
      };
      render(
        <ThemeProvider>
          <Consumer />
        </ThemeProvider>
      );

      expect(contextValue).toBeDefined();
      expect(contextValue?.theme).toBe('light');
      expect(contextValue?.colorPalette).toBe('default');
      expect(typeof contextValue?.setTheme).toBe('function');
      expect(typeof contextValue?.setColorPalette).toBe('function');
    });

    it('should throw an error when used outside ThemeProvider', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const ConsumerOutsideProvider = () => {
        let errorMessage = '';
        try {
          useTheme();
        } catch (error: any) {
          errorMessage = error.message;
        }
        return <div>{errorMessage}</div>;
      };

      render(<ConsumerOutsideProvider />);
      expect(screen.getByText('useTheme must be used within a ThemeProvider')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });
});
