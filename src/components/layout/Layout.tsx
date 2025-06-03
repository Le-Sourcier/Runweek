import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'; // Import framer-motion components
import Sidebar from './Sidebar';
import Header from './Header';
import { useUser } from '../../context/UserContext';
import LoadingScreen from '../ui/LoadingScreen';
import { useFloatingCoach } from '../../context/FloatingCoachContext'; // Import useFloatingCoach
import FloatingCoach from '../../components/coach/FloatingCoach'; // Import FloatingCoach component

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isLoading } = useUser();
  const { isFloatingCoachActive } = useFloatingCoach(); // Consume FloatingCoach context
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for desktop */}
      <Sidebar className="hidden md:block sticky top-0 h-screen" />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Mobile sidebar */}
        <Sidebar 
          className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 transform md:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClose={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname} // Use location.pathname from useLocation()
              initial="initial"
              animate="animate"
              exit="exit"
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -20 },
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }} // Adjust duration and easing as needed
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {isFloatingCoachActive && <FloatingCoach />} {/* Conditionally render FloatingCoach */}
    </div>
  );
}