// import React from 'react';
// import { render, screen, fireEvent, act, within } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
// import Settings from './Settings';
// import { ThemeProvider, ThemeContextType } from '../context/ThemeContext';
// import { UserProvider, UserContextType } from '../context/UserContext'; // Assuming UserContextType is exported or can be defined
// import '@testing-library/jest-dom';
// import { vi } from 'vitest';

// // Mock Lucide icons used in Settings to avoid rendering issues if not needed for assertions
// vi.mock('lucide-react', async () => {
//   const actual = await vi.importActual('lucide-react');
//   const IconMock = (props: any) => <svg {...props} data-testid={props['data-lucide'] || 'lucide-icon'} />;

//   const icons: Record<string, any> = {};
//   for (const key in actual) {
//     icons[key] = IconMock;
//   }
//   return { ...icons };
// });

// describe('Settings Page', () => {
//   let mockSetColorPalette: ReturnType<typeof vi.fn>;
//   let mockThemeContextValue: ThemeContextType;
//   let mockUserContextValue: UserContextType;

//   const setup = (initialThemePalette: string = 'default') => {
//     mockSetColorPalette = vi.fn();
//     mockThemeContextValue = {
//       theme: 'light',
//       setTheme: vi.fn(),
//       colorPalette: initialThemePalette,
//       setColorPalette: mockSetColorPalette,
//     };

//     // Define a basic mock user for UserContext
//     mockUserContextValue = {
//       user: { id: 'test-user', email: 'test@example.com', name: 'Test User', createdAt: new Date().toISOString() },
//       isAuthenticated: true,
//       isLoading: false,
//       login: vi.fn(),
//       logout: vi.fn(),
//       register: vi.fn(),
//       updateUser: vi.fn(),
//       deleteUser: vi.fn(),
//     };

//     render(
//       <MemoryRouter>
//         <UserProvider value={mockUserContextValue}>
//           <ThemeProvider value={mockThemeContextValue}>
//             <Settings />
//           </ThemeProvider>
//         </UserProvider>
//       </MemoryRouter>
//     );
//   };

//   it('should switch to "Apparence" tab and allow changing color palette', () => {
//     setup();

//     // Find and click the "Apparence" tab button
//     // The button text can be found by its content if unique enough, or more robustly by role + name/text content
//     const appearanceTabButton = screen.getByRole('button', { name: /Apparence Personnalisez l'apparence de l'application/i });
//     expect(appearanceTabButton).toBeInTheDocument();
//     act(() => {
//       fireEvent.click(appearanceTabButton);
//     });

//     // Verify the "Apparence" card title is visible
//     // The title is part of a Card component, so we might need to be specific
//     // Or check for an element unique to the appearance tab.
//     // For now, let's assume the "Palette de couleurs" heading is unique enough and appears.
//     expect(screen.getByText('Palette de couleurs')).toBeInTheDocument();

//     // Find the "blue" color palette option using the data-testid
//     const bluePaletteButton = screen.getByTestId('palette-option-blue');
//     expect(bluePaletteButton).toBeInTheDocument();

//     // Click the blue palette button
//     act(() => {
//       fireEvent.click(bluePaletteButton);
//     });

//     // Assert that setColorPalette was called with 'blue'
//     expect(mockSetColorPalette).toHaveBeenCalledTimes(1);
//     expect(mockSetColorPalette).toHaveBeenCalledWith('blue');

//     // Test changing to another palette, e.g., "green"
//     const greenPaletteButton = screen.getByTestId('palette-option-green');
//     expect(greenPaletteButton).toBeInTheDocument();

//     act(() => {
//       fireEvent.click(greenPaletteButton);
//     });
//     expect(mockSetColorPalette).toHaveBeenCalledTimes(2); // Called once before, now again
//     expect(mockSetColorPalette).toHaveBeenCalledWith('green');
//   });

//   it('should indicate the currently active color palette', () => {
//     setup('blue'); // Initial palette is blue

//     const appearanceTabButton = screen.getByRole('button', { name: /Apparence Personnalisez l'apparence de l'application/i });
//     act(() => {
//       fireEvent.click(appearanceTabButton);
//     });

//     const bluePaletteButton = screen.getByTestId('palette-option-blue');
//     // Active palette should have a ring or similar style.
//     // The provided className for active is: 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-primary'
//     // We check for part of this distinctive style.
//     expect(bluePaletteButton.className).toContain('ring-primary');

//     const defaultPaletteButton = screen.getByTestId('palette-option-default');
//     expect(defaultPaletteButton.className).not.toContain('ring-primary');
//   });
// });
