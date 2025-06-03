import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define the state interface
interface FloatingCoachState {
  isFloatingCoachActive: boolean;
  coachPosition: 'bottom-left' | 'bottom-right';
  isCoachPanelOpen: boolean;
}

// 2. Define the context type
interface FloatingCoachContextType extends FloatingCoachState {
  toggleFloatingCoachActive: () => void;
  setCoachPosition: (position: 'bottom-left' | 'bottom-right') => void;
  toggleCoachPanelOpen: () => void;
  openCoachPanel: () => void;
  closeCoachPanel: () => void;
}

// 3. Create the context
const FloatingCoachContext = createContext<FloatingCoachContextType | undefined>(undefined);

// 4. Implement the FloatingCoachProvider component
interface FloatingCoachProviderProps {
  children: ReactNode;
}

export const FloatingCoachProvider: React.FC<FloatingCoachProviderProps> = ({ children }) => {
  const [isFloatingCoachActive, setIsFloatingCoachActive] = useState<boolean>(false);
  const [coachPosition, setCoachPositionState] = useState<'bottom-left' | 'bottom-right'>('bottom-right');
  const [isCoachPanelOpen, setIsCoachPanelOpen] = useState<boolean>(false);

  const toggleFloatingCoachActive = () => {
    setIsFloatingCoachActive(prev => {
      const newIsActive = !prev;
      if (!newIsActive) { // If coach is being deactivated
        setIsCoachPanelOpen(false); // Close the panel
      }
      return newIsActive;
    });
  };

  const setCoachPosition = (position: 'bottom-left' | 'bottom-right') => {
    setCoachPositionState(position);
  };

  const toggleCoachPanelOpen = () => {
    setIsCoachPanelOpen(prev => !prev);
  };

  const openCoachPanel = () => {
    if (!isFloatingCoachActive) { // Activate coach if not active when trying to open panel
        setIsFloatingCoachActive(true);
    }
    setIsCoachPanelOpen(true);
  };

  const closeCoachPanel = () => {
    setIsCoachPanelOpen(false);
  };

  const value = {
    isFloatingCoachActive,
    coachPosition,
    isCoachPanelOpen,
    toggleFloatingCoachActive,
    setCoachPosition,
    toggleCoachPanelOpen,
    openCoachPanel,
    closeCoachPanel,
  };

  return (
    <FloatingCoachContext.Provider value={value}>
      {children}
    </FloatingCoachContext.Provider>
  );
};

// 5. Create a custom hook useFloatingCoach
export const useFloatingCoach = (): FloatingCoachContextType => {
  const context = useContext(FloatingCoachContext);
  if (context === undefined) {
    throw new Error('useFloatingCoach must be used within a FloatingCoachProvider');
  }
  return context;
};
