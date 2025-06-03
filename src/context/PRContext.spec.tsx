import React from 'react';
import { render, act } from '@testing-library/react';
import { PRProvider, usePRs } from './PRContext';
import { PersonalRecord } from '../types';

// Mock local storage
let store: { [key: string]: string } = {};
const localStorageMock = (() => {
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const TestConsumerComponent = () => {
  const context = usePRs();
  return (
    <div>
      <span data-testid="pr-count">{context.prs.length}</span>
      <div data-testid="prs-data">{JSON.stringify(context.prs)}</div>
    </div>
  );
};

const mockPR1: Omit<PersonalRecord, 'id'> = {
  distance: 5,
  time: '00:25:00',
  date: '2024-01-01',
  notes: 'Morning run',
};

const mockPR2: Omit<PersonalRecord, 'id'> = {
  distance: 10,
  time: '00:50:00',
  date: '2024-01-15',
};

describe('PRContext and PRProvider', () => {
  beforeEach(() => {
    // Clear local storage mock before each test
    localStorageMock.clear();
    // Reset Date.now mock if it was used, for consistent ID generation
    jest.spyOn(Date, 'now').mockRestore?.();
  });

  describe('Initialization and Local Storage', () => {
    it('should initialize with an empty array if local storage is empty', () => {
      const { getByTestId } = render(
        <PRProvider>
          <TestConsumerComponent />
        </PRProvider>
      );
      expect(getByTestId('pr-count').textContent).toBe('0');
      expect(JSON.parse(getByTestId('prs-data').textContent || '[]')).toEqual([]);
    });

    it('should load PRs from local storage on initialization', () => {
      const initialPRs: PersonalRecord[] = [
        { id: '1', ...mockPR1 },
        { id: '2', ...mockPR2, notes: 'Evening run' },
      ];
      localStorageMock.setItem('runweek_prs', JSON.stringify(initialPRs));

      const { getByTestId } = render(
        <PRProvider>
          <TestConsumerComponent />
        </PRProvider>
      );
      expect(getByTestId('pr-count').textContent).toBe('2');
      expect(JSON.parse(getByTestId('prs-data').textContent || '[]')).toEqual(initialPRs);
    });

    it('should handle invalid JSON in local storage by initializing with an empty array', () => {
      localStorageMock.setItem('runweek_prs', 'invalid_json_string');
      // Mock console.error to check if it's called
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { getByTestId } = render(
        <PRProvider>
          <TestConsumerComponent />
        </PRProvider>
      );
      expect(getByTestId('pr-count').textContent).toBe('0');
      expect(JSON.parse(getByTestId('prs-data').textContent || '[]')).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('addPR function', () => {
    it('should add a new PR and save to local storage', () => {
      // Mock Date.now for predictable ID
      jest.spyOn(Date, 'now').mockReturnValue(1700000000000); // Example timestamp

      let contextValue: any;
      const Consumer = () => {
        contextValue = usePRs();
        return null;
      };
      render(
        <PRProvider>
          <Consumer />
        </PRProvider>
      );

      act(() => {
        contextValue.addPR(mockPR1);
      });

      expect(contextValue.prs.length).toBe(1);
      expect(contextValue.prs[0]).toMatchObject(mockPR1);
      expect(contextValue.prs[0].id).toBe('1700000000000');

      const storedPRs = JSON.parse(localStorageMock.getItem('runweek_prs') || '[]');
      expect(storedPRs.length).toBe(1);
      expect(storedPRs[0]).toMatchObject(mockPR1);
      expect(storedPRs[0].id).toBe('1700000000000');
    });
  });

  describe('updatePR function', () => {
    it('should update an existing PR and save to local storage', () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(1700000000000); // For initial add
      let contextValue: any;
      const Consumer = () => {
        contextValue = usePRs();
        return null;
      };
      render(
        <PRProvider>
          <Consumer />
        </PRProvider>
      );

      act(() => {
        contextValue.addPR(mockPR1);
      });

      const addedPR = contextValue.prs[0];
      const updatedPRData: PersonalRecord = {
        ...addedPR,
        time: '00:23:00',
        notes: 'New best time!',
      };

      act(() => {
        contextValue.updatePR(updatedPRData);
      });

      expect(contextValue.prs.length).toBe(1);
      expect(contextValue.prs[0]).toEqual(updatedPRData); // ID should remain the same

      const storedPRs = JSON.parse(localStorageMock.getItem('runweek_prs') || '[]');
      expect(storedPRs.length).toBe(1);
      expect(storedPRs[0]).toEqual(updatedPRData);
    });

     it('should not change PRs if ID to update is not found', () => {
      let contextValue: any;
      const Consumer = () => {
        contextValue = usePRs();
        return null;
      };
      render(
        <PRProvider>
          <Consumer />
        </PRProvider>
      );
       act(() => {
        contextValue.addPR(mockPR1);
      });

      const originalPRs = [...contextValue.prs];
      const nonExistentPR: PersonalRecord = {
        id: 'non-existent-id',
        distance: 1,
        time: '00:05:00',
        date: '2024-02-01',
      };

      act(() => {
        contextValue.updatePR(nonExistentPR);
      });

      expect(contextValue.prs).toEqual(originalPRs);
      const storedPRs = JSON.parse(localStorageMock.getItem('runweek_prs') || '[]');
      expect(storedPRs).toEqual(originalPRs);
    });
  });

  describe('deletePR function', () => {
    it('should delete a PR and save to local storage', () => {
      jest.spyOn(Date, 'now')
        .mockReturnValueOnce(1700000000000) // For PR1
        .mockReturnValueOnce(1700000000001); // For PR2

      let contextValue: any;
      const Consumer = () => {
        contextValue = usePRs();
        return null;
      };
      render(
        <PRProvider>
          <Consumer />
        </PRProvider>
      );

      act(() => {
        contextValue.addPR(mockPR1);
        contextValue.addPR(mockPR2);
      });

      expect(contextValue.prs.length).toBe(2);
      const idToDelete = contextValue.prs[0].id;

      act(() => {
        contextValue.deletePR(idToDelete);
      });

      expect(contextValue.prs.length).toBe(1);
      expect(contextValue.prs[0].id).not.toBe(idToDelete);
      expect(contextValue.prs[0].distance).toBe(mockPR2.distance); // Check if the correct PR remains

      const storedPRs = JSON.parse(localStorageMock.getItem('runweek_prs') || '[]');
      expect(storedPRs.length).toBe(1);
      expect(storedPRs[0].id).not.toBe(idToDelete);
    });
  });

  describe('usePRs hook', () => {
    it('should return context values when used within PRProvider', () => {
      let contextValue: any;
      const Consumer = () => {
        contextValue = usePRs();
        return null;
      };
      render(
        <PRProvider>
          <Consumer />
        </PRProvider>
      );

      expect(contextValue).toBeDefined();
      expect(contextValue.prs).toEqual([]);
      expect(typeof contextValue.addPR).toBe('function');
      expect(typeof contextValue.updatePR).toBe('function');
      expect(typeof contextValue.deletePR).toBe('function');
    });

    it('should throw an error when used outside PRProvider', () => {
      // Suppress console.error output from React for this specific test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const ConsumerOutsideProvider = () => {
        try {
          usePRs();
        } catch (error: any) {
          return <div>{error.message}</div>;
        }
        return <div>No error</div>;
      };

      const { getByText } = render(<ConsumerOutsideProvider />);
      expect(getByText('usePRs must be used within a PRProvider')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });
  });
});
