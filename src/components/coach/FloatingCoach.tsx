import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFloatingCoach } from "../../context/FloatingCoachContext";
import { Bot, X, ChevronsLeftRight as PositionIcon } from "lucide-react"; // Using ChevronsLeftRight for position toggle

const FloatingCoach: React.FC = () => {
  const {
    isCoachPanelOpen,
    coachPosition,
    // toggleCoachPanelOpen, // Not directly used, open/close are more explicit
    setCoachPosition,
    closeCoachPanel,
    openCoachPanel,
    deactivateFloatingCoach, // Added deactivateFloatingCoach
  } = useFloatingCoach();

  const positionClasses =
    coachPosition === "bottom-right"
      ? "bottom-4 right-4 items-end"
      : "bottom-4 left-4 items-start";

  const panelVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeIn" },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 30,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const fabVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1, transition: { delay: 0.3 } }, // Delay to show after panel closes
    exit: { opacity: 0, scale: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      layout // Added layout prop for smooth position animation
      transition={{ type: "spring", stiffness: 300, damping: 30 }} // Optional: customize the spring
      className={`fixed z-50 flex flex-col ${positionClasses}`}
      // This outer div will be controlled by isFloatingCoachActive in Layout.tsx
      // So, its own animation can be simpler or part of a group animation there.
      // For now, let's ensure it's present for layout.
    >
      <AnimatePresence>
        {isCoachPanelOpen && (
          <motion.div
            className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-80 h-96 flex flex-col overflow-hidden"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-sm text-foreground">
                Coach AI
              </h3>
              <div className="flex items-center gap-1">
                <motion.button
                  onClick={() =>
                    setCoachPosition(
                      coachPosition === "bottom-left"
                        ? "bottom-right"
                        : "bottom-left"
                    )
                  }
                  className="p-1.5 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle coach position"
                  whileTap={{ scale: 0.9 }}
                >
                  <PositionIcon size={16} />
                </motion.button>
                <motion.button
                  title="Close Panel"
                  onClick={closeCoachPanel}
                  className="p-1.5 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close coach panel"
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-4 text-sm text-muted-foreground overflow-y-auto">
              Coach AI chat interface will be here.
              <p className="mt-4">Current Position: {coachPosition}</p>
              <p>Panel Open: {isCoachPanelOpen.toString()}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isCoachPanelOpen && (
          <motion.button
            onClick={openCoachPanel} // Use openCoachPanel to ensure coach becomes active if it wasn't
            className="mt-3 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 ease-in-out hover:scale-[1.05] active:scale-[0.95]"
            variants={fabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            aria-label="Open AI Coach"
            // whileHover & whileTap removed to rely on Tailwind class animations for consistency
          >
            <Bot size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FloatingCoach;
