import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PersonalRecord } from '../types';

// 1. Define PRContextType interface
interface PRContextType {
  prs: PersonalRecord[];
  addPR: (pr: Omit<PersonalRecord, 'id'>) => void;
  updatePR: (pr: PersonalRecord) => void;
  deletePR: (id: string) => void;
}

// 2. Create PRContext
const PRContext = createContext<PRContextType | undefined>(undefined);

// 3. Create PRProvider component
interface PRProviderProps {
  children: ReactNode;
}

const LOCAL_STORAGE_KEY = 'runweek_prs';

export const PRProvider: React.FC<PRProviderProps> = ({ children }) => {
  const [prs, setPRs] = useState<PersonalRecord[]>(() => {
    try {
      const storedPRs = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPRs) {
        return JSON.parse(storedPRs);
      }
    } catch (error) {
      console.error("Error loading PRs from local storage:", error);
    }
    return [];
  });

  // Effect to save PRs to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prs));
    } catch (error) {
      console.error("Error saving PRs to local storage:", error);
    }
  }, [prs]);

  const addPR = (prData: Omit<PersonalRecord, 'id'>) => {
    const newPR: PersonalRecord = {
      ...prData,
      id: Date.now().toString(), // Simple ID generation
    };
    setPRs(prevPRs => [...prevPRs, newPR]);
  };

  const updatePR = (updatedPR: PersonalRecord) => {
    setPRs(prevPRs =>
      prevPRs.map(pr => (pr.id === updatedPR.id ? updatedPR : pr))
    );
  };

  const deletePR = (id: string) => {
    setPRs(prevPRs => prevPRs.filter(pr => pr.id !== id));
  };

  return (
    <PRContext.Provider value={{ prs, addPR, updatePR, deletePR }}>
      {children}
    </PRContext.Provider>
  );
};

// 4. Create usePRs custom hook
export const usePRs = () => {
  const context = useContext(PRContext);
  if (context === undefined) {
    throw new Error('usePRs must be used within a PRProvider');
  }
  return context;
};
