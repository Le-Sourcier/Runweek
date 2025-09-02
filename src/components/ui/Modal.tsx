import React, { Children, FC, ReactNode, useEffect, useRef, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl"; // Optional size prop
}

interface DraggableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  draggable?: boolean; // New prop to enable/disable dragging
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-full lg:max-w-sm",
    md: "w-full lg:max-w-md",
    lg: "w-full lg:max-w-lg",
    xl: "w-full lg:max-w-xl",
  };

  if (!isOpen) return null; // AnimatePresence handles this

  return (
    <AnimatePresence>
      {
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }} // Fast transition for overlay
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose} // Close on overlay click
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }} // Softened: scale 0.9 to 0.95, y 50 to 30
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }} // Softened: scale 0.9 to 0.95, y 50 to 30
            transition={{ duration: 0.25, ease: "easeOut" }} // Softened: duration 0.3 to 0.25
            key="modal-content"
            className={`bg-card text-card-foreground rounded-lg shadow-xl p-6 space-y-4 ${sizeClasses[size]}`}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
          >
            <div className="flex items-start">
              {title && (
                <h3 className="text-lg font-semibold text-foreground mr-4">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className="ml-auto flex-shrink-0 p-1 rounded-full text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card transition-all duration-200 ease-in-out hover:scale-[1.03] active:scale-[0.97]"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div>{children}</div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>
  );
};

export const DraggableModal: React.FC<DraggableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  draggable = true,
}) => {
  const sizeClasses = {
    sm: "w-full lg:max-w-sm",
    md: "w-full lg:max-w-md",
    lg: "w-full lg:max-w-lg",
    xl: "w-full lg:max-w-xl",
  };

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setPosition({ x: 0, y: 0 });
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.y > 150) {
      onClose();
      return;
    }
    setPosition({
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    });
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-0 bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
      >
        <motion.div
          ref={modalRef}
          drag={draggable && window.innerWidth >= 1024} // drag uniquement en lg+
          dragElastic={0.2}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: position.x,
            y: position.y,
          }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`bg-card text-card-foreground rounded-xl shadow-2xl p-6 space-y-4 
            ${sizeClasses[size]} 
            border border-border/50 select-none
            lg:fixed lg:left-1/2 lg:top-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2`}
          onClick={(e) => e.stopPropagation()}
          style={{
            cursor: draggable && window.innerWidth >= 1024
              ? (isDragging ? "grabbing" : "grab")
              : "auto",
          }}
        >
          {/* Drag handle visible seulement en lg+ */}
          {draggable && (
            <div className="hidden lg:block absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-muted-foreground/30 rounded-full cursor-grab" />
          )}

          <div className="flex items-start">
            {title && <h3 className="text-lg font-semibold text-foreground mr-4">{title}</h3>}
            <button
              onClick={onClose}
              className="ml-auto flex-shrink-0 p-1.5 rounded-full text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card transition-all duration-200 ease-in-out hover:scale-110 active:scale-95 hover:text-foreground"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[70vh]">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


export const DeleteConfirmModal: FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  return <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Confirmation de suppression"
    size="md"
  >
    <div className="space-y-4">

      <div className="grid grid-cols-1 items-center justify-center mb-4">
        <div className="flex items-center">
          <AlertCircle size={48} className="mr-2 text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-2" />
          <h3 className="text-sm text-red-500 text-center">
            Attention, cette action est irréversible.
          </h3>
        </div>
      </div>

      {children}
    </div>
  </Modal>
}
