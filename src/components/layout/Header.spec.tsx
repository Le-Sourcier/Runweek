import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { ThemeProvider, ThemeContextType } from '../../context/ThemeContext';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Lucide icons to simplify assertion
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return {
    ...actual,
    Moon: (props: any) => <svg data-testid="moon-icon" {...props} />,
    Sun: (props: any) => <svg data-testid="sun-icon" {...props} />,
    Bell: (props: any) => <svg data-testid="bell-icon" {...props} />,
    Menu: (props: any) => <svg data-testid="menu-icon" {...props} />,
    Search: (props: any) => <svg data-testid="search-icon" {...props} />,
  };
});

describe('Header Component', () => {
  let mockSetTheme: ReturnType<typeof vi.fn>;
  let mockThemeContextValue: ThemeContextType;

  const renderHeaderWithProvider = (themeValue: 'light' | 'dark') => {
    mockSetTheme = vi.fn();
    mockThemeContextValue = {
      theme: themeValue,
      setTheme: mockSetTheme,
      colorPalette: 'default', // Not directly tested here, but needed by context
      setColorPalette: vi.fn(), // Not directly tested here
    };

    return render(
      <MemoryRouter>
        <ThemeProvider value={mockThemeContextValue}>
          <Header onMenuClick={vi.fn()} />
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('should display Moon icon and call setTheme with "dark" when current theme is "light"', () => {
    renderHeaderWithProvider('light');

    const toggleButton = screen.getByTestId('theme-toggle-button');
    expect(toggleButton).toBeInTheDocument();

    // Check for Moon icon when theme is light
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();

    fireEvent.click(toggleButton);

    // Check if setTheme was called correctly
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should display Sun icon and call setTheme with "light" when current theme is "dark"', () => {
    renderHeaderWithProvider('dark');

    const toggleButton = screen.getByTestId('theme-toggle-button');
    expect(toggleButton).toBeInTheDocument();

    // Check for Sun icon when theme is dark
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();

    fireEvent.click(toggleButton);

    // Check if setTheme was called correctly
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should display the correct page title based on location', () => {
    render(
      <MemoryRouter initialEntries={['/statistics']}>
        <ThemeProvider value={{ theme: 'light', setTheme: vi.fn(), colorPalette: 'default', setColorPalette: vi.fn() }}>
          <Header onMenuClick={vi.fn()} />
        </ThemeProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Statistiques')).toBeInTheDocument();
  });

  it('should call onMenuClick when menu button is clicked', () => {
    const mockOnMenuClick = vi.fn();
    render(
      <MemoryRouter>
        <ThemeProvider value={{ theme: 'light', setTheme: vi.fn(), colorPalette: 'default', setColorPalette: vi.fn() }}>
          <Header onMenuClick={mockOnMenuClick} />
        </ThemeProvider>
      </MemoryRouter>
    );

    // The menu button is only visible in the "mobile" version,
    // but testing libraries often render all elements.
    // We select it by its aria-label or a test-id if it had one.
    // For now, assuming the menu icon is unique enough.
    const menuButton = screen.getByTestId('menu-icon').closest('button');
    if (menuButton) {
      fireEvent.click(menuButton);
      expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
    } else {
      throw new Error("Menu button not found");
    }
  });
});
