import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserStats = {
  totalDistance: number;
  weeklyDistance: number;
  totalRuns: number;
  averagePace: string;
  streakDays: number;
  level: number;
  points: number;
};

type UserGoal = {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  completed: boolean;
};

type UserAchievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  joinedDate: string;
  stats: UserStats;
  goals: UserGoal[];
  achievements: UserAchievement[];
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  
  // Simulating user fetch
  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUser({
        id: '1',
        name: 'Alex Runner',
        email: 'alex@example.com',
        profileImage: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
        joinedDate: '2023-05-15',
        stats: {
          totalDistance: 327.5,
          weeklyDistance: 23.4,
          totalRuns: 42,
          averagePace: '5:32',
          streakDays: 12,
          level: 8,
          points: 3450,
        },
        goals: [
          {
            id: 'g1',
            title: 'Weekly Distance',
            target: 40,
            current: 23.4,
            unit: 'km',
            deadline: '2025-06-01',
            completed: false,
          },
          {
            id: 'g2',
            title: 'Run a Half Marathon',
            target: 21.1,
            current: 15,
            unit: 'km',
            deadline: '2025-07-15',
            completed: false,
          },
          {
            id: 'g3',
            title: 'Morning Runs',
            target: 15,
            current: 12,
            unit: 'runs',
            deadline: '2025-06-30',
            completed: false,
          },
        ],
        achievements: [
          {
            id: 'a1',
            title: 'First Run',
            description: 'Completed your first run',
            icon: 'Award',
            earnedDate: '2023-05-18',
          },
          {
            id: 'a2',
            title: '10K Club',
            description: 'Completed a 10K run',
            icon: 'Medal',
            earnedDate: '2023-06-02',
          },
          {
            id: 'a3',
            title: 'Early Bird',
            description: 'Completed 5 runs before 7 AM',
            icon: 'Sunrise',
            earnedDate: '2023-07-10',
          },
          {
            id: 'a4',
            title: 'Half Marathon',
            description: 'Completed a half marathon distance',
            icon: 'Trophy',
            earnedDate: null,
          },
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, []);
  
  return (
    <UserContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}