import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <Activity className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Runweek</h1>
        <p className="text-gray-500 mb-8">Loading your fitness dashboard...</p>
        
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}