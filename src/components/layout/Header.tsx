import { Bell, Menu, Search, Sun, Moon } from 'lucide-react'; // Added Sun and Moon icons
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; // Added useTheme import
import { motion } from 'framer-motion';

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { theme, setTheme } = useTheme(); // Added theme context

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/': 'Tableau de bord',
      '/statistics': 'Statistiques',
      '/coach': 'Coach IA',
      '/calendar': 'Calendrier',
      '/goals': 'Objectifs',
      '/achievements': 'Réalisations',
      '/profile': 'Profil',
      '/support': 'Aide & Support'
    };
    return titles[path] || 'Tableau de bord';
  };

  return (
    <header className="h-16 border-b bg-card border-border sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-muted md:hidden"
          >
            <Menu size={20} className="text-muted-foreground" />
          </button>
          <motion.h1
            className="text-xl font-semibold text-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            key={location.pathname}
          >
            {getPageTitle()}
          </motion.h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-64 pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground" size={18} />
          </div>

          {/* Notifications */}
          <button className="p-2 rounded-full hover:bg-muted relative">
            <Bell size={20} className="text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-full hover:bg-muted"
            aria-label="Toggle theme"
            data-testid="theme-toggle-button" // Added data-testid
          >
            {theme === 'light' ? <Moon size={20} className="text-muted-foreground" /> : <Sun size={20} className="text-muted-foreground" />}
          </button>
        </div>
      </div>
    </header>
  );
}