import { Bell, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  
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
    <header className="h-16 border-b bg-white sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick} 
            className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
          >
            <Menu size={20} />
          </button>
          <motion.h1 
            className="text-xl font-semibold"
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
              className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          {/* Notifications */}
          <button className="p-2 rounded-full hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}