import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { PersonalRecord } from '../types';
import { timeStringToSeconds } from '../utils/formatters';

// Define types for sorting
export type SortablePRKey = 'date' | 'distance' | 'time';
export type SortDirection = 'ascending' | 'descending';

// 1. Define PRContextType interface
interface PRContextType {
  originalPRs: PersonalRecord[];
  processedPRs: PersonalRecord[];
  addPR: (pr: Omit<PersonalRecord, 'id'>) => void;
  updatePR: (pr: PersonalRecord) => void;
  deletePR: (id: string) => void;
  sortConfig: { key: SortablePRKey; direction: SortDirection } | null;
  setSortConfig: (key: SortablePRKey, direction?: SortDirection) => void;
  distanceFilter: string | null;
  setDistanceFilter: (filter: string | null) => void;
}

// 2. Create PRContext
const PRContext = createContext<PRContextType | undefined>(undefined);

// 3. Create PRProvider component
interface PRProviderProps {
  children: ReactNode;
}

const LOCAL_STORAGE_KEY = 'runweek_prs';

export const PRProvider: React.FC<PRProviderProps> = ({ children }) => {
  const [originalPRs, setOriginalPRs] = useState<PersonalRecord[]>(() => {
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

  const [sortConfigState, setSortConfigState] = useState<{ key: SortablePRKey; direction: SortDirection } | null>(null);
  const [distanceFilterState, setDistanceFilterState] = useState<string | null>(null);

  // Effect to save PRs to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(originalPRs));
    } catch (error) {
      console.error("Error saving PRs to local storage:", error);
    }
  }, [originalPRs]);

  const setSortConfig = (key: SortablePRKey, direction?: SortDirection) => {
    setSortConfigState(prevConfig => {
      if (direction) return { key, direction };
      if (prevConfig && prevConfig.key === key) {
        return { key, direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending' };
      }
      return { key, direction: 'ascending' };
    });
  };

  const setDistanceFilter = (filter: string | null) => {
    setDistanceFilterState(filter);
  };

  const processedPRs = useMemo(() => {
    let filteredList = [...originalPRs];

    if (distanceFilterState && distanceFilterState.toLowerCase() !== 'all') {
      const filterDistanceMeters = parseFloat(distanceFilterState);
      if (!isNaN(filterDistanceMeters)) {
        filteredList = filteredList.filter(pr => pr.distance === filterDistanceMeters);
      }
    }

    if (sortConfigState) {
      filteredList.sort((a, b) => {
        let valA: any;
        let valB: any;
        if (sortConfigState.key === 'time') {
          valA = timeStringToSeconds(a.time);
          valB = timeStringToSeconds(b.time);
        } else if (sortConfigState.key === 'date') {
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        } else { // 'distance'
          valA = a[sortConfigState.key];
          valB = b[sortConfigState.key];
        }
        // Handle NaN values by pushing them to the end regardless of sort order
        if (isNaN(valA) && isNaN(valB)) return 0;
        if (isNaN(valA)) return 1; // Push NaN valA to the end
        if (isNaN(valB)) return -1; // Push NaN valB to the end

        if (valA < valB) return sortConfigState.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfigState.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filteredList;
  }, [originalPRs, sortConfigState, distanceFilterState]);

  const addPR = (prData: Omit<PersonalRecord, 'id'>) => {
    const newPR: PersonalRecord = {
      ...prData,
      id: Date.now().toString(), // Simple ID generation
    };
    setOriginalPRs(prevPRs => [...prevPRs, newPR]);
  };

  const updatePR = (updatedPR: PersonalRecord) => {
    setOriginalPRs(prevPRs =>
      prevPRs.map(pr => (pr.id === updatedPR.id ? updatedPR : pr))
    );
  };

  const deletePR = (id: string) => {
    setOriginalPRs(prevPRs => prevPRs.filter(pr => pr.id !== id));
  };

  return (
    <PRContext.Provider value={{
      originalPRs,
      processedPRs,
      addPR,
      updatePR,
      deletePR,
      sortConfig: sortConfigState,
      setSortConfig,
      distanceFilter: distanceFilterState,
      setDistanceFilter
    }}>
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
