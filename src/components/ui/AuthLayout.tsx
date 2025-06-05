import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  leftPanelContent: React.ReactNode;
  rightPanelContent: React.ReactNode;
  className?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  leftPanelContent,
  rightPanelContent,
  className,
}) => {
  // Note: For page exit animations (exit prop on motion.div) to work correctly
  // with React Router, <AnimatePresence> must wrap the router's <Outlet />
  // or the <Routes /> component in the main application setup (e.g., App.tsx).
  return (
    <motion.div
      className={`flex flex-col md:flex-row min-h-screen ${className}`} // Changed to flex-col, then md:flex-row
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left panel slot */}
      {/* The content passed as leftPanelContent is responsible for its own visibility control
          (e.g. RegistrationPage's left panel is 'hidden lg:flex').
          For other pages, this slot will make their left panel w-full on mobile and w-1/2 on md+.
      */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center relative">
        {leftPanelContent}
      </div>

      {/* Right panel slot */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-6 sm:p-8"> {/* Adjusted padding */}
        {rightPanelContent}
      </div>
    </motion.div>
  );
};

export default AuthLayout;
