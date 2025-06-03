import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Optional size prop
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  // if (!isOpen) return null; // AnimatePresence handles this

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }} // Fast transition for overlay
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose} // Close on overlay click
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }} // Start further down and smaller
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }} // Exit to the same state
            transition={{ duration: 0.3, ease: "easeOut" }} // Slightly longer duration for a smoother feel
            className={`bg-card text-card-foreground rounded-lg shadow-xl p-6 space-y-4 w-full ${sizeClasses[size]}`}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
          >
            <div className="flex items-center justify-between">
              {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
              <button
                onClick={onClose}
                className="p-1 rounded-full text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card transition-all duration-200 ease-in-out hover:scale-[1.03] active:scale-[0.97]"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
