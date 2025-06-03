import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import debounce from 'lodash.debounce';
import { SearchResult, SearchHistory } from '../types';

interface SearchContextType {
  query: string;
  results: SearchResult[];
  history: SearchHistory[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  clearSearch: () => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

const HISTORY_STORAGE_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>(() => {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mock search function - replace with actual API call
  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock results
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'activity',
          title: 'Morning Run',
          description: 'A 5km run around the park',
          url: '/activities/1',
          category: 'Running',
          date: new Date().toISOString()
        },
        // Add more mock results as needed
      ];
      
      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
        
        // Add to history
        const newHistoryItem: SearchHistory = {
          id: Date.now().toString(),
          query: searchQuery,
          timestamp: Date.now()
        };
        
        setHistory(prev => {
          const newHistory = [newHistoryItem, ...prev.slice(0, MAX_HISTORY_ITEMS - 1)];
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
          return newHistory;
        });
      } else {
        setResults([]);
      }
    }, 300),
    []
  );

  const setQuery = (newQuery: string) => {
    setQueryState(newQuery);
    debouncedSearch(newQuery);
  };

  const clearSearch = () => {
    setQueryState('');
    setResults([]);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  return (
    <SearchContext.Provider
      value={{
        query,
        results,
        history,
        isLoading,
        setQuery,
        clearSearch,
        clearHistory,
        removeFromHistory
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}