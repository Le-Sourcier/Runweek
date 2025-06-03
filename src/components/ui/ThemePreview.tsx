import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ColorDisplayProps {
  colorVar: string;
  name: string;
}

const ColorSwatch: React.FC<ColorDisplayProps> = ({ colorVar, name }) => {
  const [bgColor, setBgColor] = useState('');

  useEffect(() => {
    // Function to fetch CSS variable value
    const getColorValue = () => {
      const colorValue = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
      if (colorValue) {
        setBgColor(colorValue);
      }
    };

    getColorValue();

    // Optional: Listen for theme changes if variables might be updated without a full re-render
    // This might be overkill if useTheme already triggers re-renders effectively
    const observer = new MutationObserver(getColorValue);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });

    return () => observer.disconnect();
  }, [colorVar]);

  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className="w-16 h-16 rounded-full border border-border shadow-md"
        style={{ backgroundColor: bgColor }}
      />
      <span className="text-sm font-medium text-foreground">{name}</span>
      <span className="text-xs text-muted-foreground">{bgColor || colorVar}</span>
    </div>
  );
};

const ThemePreview: React.FC = () => {
  const { theme, colorPalette } = useTheme(); // Use theme and colorPalette to re-render on change

  // The actual color values are read from CSS variables,
  // but we depend on theme/colorPalette to trigger updates.
  // The ColorSwatch component will read the CSS variables directly.

  return (
    <div className="mt-6 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">Color Palette Preview</h3>
      <div className="grid grid-cols-3 gap-4 pt-2">
        <ColorSwatch colorVar="--primary" name="Primary" />
        <ColorSwatch colorVar="--secondary" name="Secondary" />
        <ColorSwatch colorVar="--accent" name="Accent" />
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Current theme: {theme}, Current palette: {colorPalette}. Colors are derived from CSS variables.
      p>
    </div>
  );
};

export default ThemePreview;
