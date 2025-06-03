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
  preferences?: UserPreferences; // Added preferences field
};

// Define UserPreferences type
export interface UserPreferences {
  distanceUnit: 'kilometers' | 'miles';
  preferredRunDays: string[];
  preferredRunTime: 'morning' | 'afternoon' | 'evening' | 'any';
  trainingFocus: 'endurance' | 'speed' | 'race_training' | 'weight_loss' | 'general_fitness';
  // Privacy settings added here
  activityVisibility?: 'only_me' | 'friends' | 'public';
  profileVisibility?: 'only_me' | 'friends' | 'public';
  dataSharing?: boolean;
  locationSharing?: boolean;
  // Language and Region settings
  language?: string; // e.g., 'en', 'fr'
  region?: string;   // e.g., 'US', 'FR'
}

// Define UserCredentials type for login
export type UserCredentials = {
  email: string;
  password?: string; // Password might be optional if using OAuth or magic links later
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean; // Added for easier auth checks
  error: string | null; // For login/auth errors
  login: (credentials: UserCredentials) => Promise<void>; // Made async to mimic API call
  logout: () => void;
  updateUserProfile: (updatedProfileData: Partial<User>) => void;
  updateUserPreferences: (preferences: UserPreferences) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>; // Added changePassword
  // setUser: React.Dispatch<React.SetStateAction<User | null>>; // Keep if direct manipulation is needed, or remove if only via login/logout
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Hardcoded sample user for login
const sampleUser: User = {
  id: '1',
  name: 'Alex Runner',
  email: 'alex@example.com', // Login with this email
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
    { id: 'g1', title: 'Weekly Distance', target: 40, current: 23.4, unit: 'km', deadline: '2025-06-01', completed: false },
    { id: 'g2', title: 'Run a Half Marathon', target: 21.1, current: 15, unit: 'km', deadline: '2025-07-15', completed: false },
  ],
  achievements: [
    { id: 'a1', title: 'First Run', description: 'Completed your first run', icon: 'Award', earnedDate: '2023-05-18' },
    { id: 'a2', title: '10K Club', description: 'Completed a 10K run', icon: 'Medal', earnedDate: '2023-06-02' },
  ],
  preferences: {
    distanceUnit: 'kilometers',
    preferredRunDays: ['Mon', 'Wed', 'Fri'],
    preferredRunTime: 'morning',
    trainingFocus: 'endurance',
    // Default privacy settings for sampleUser
    activityVisibility: 'friends',
    profileVisibility: 'friends',
    dataSharing: false,
    locationSharing: true,
    // Default language and region for sampleUser
    language: 'en',
    region: 'US',
  }
};


export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(false); // Default to false, login will set loading
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Remove the automatic user fetch, login will handle setting the user
  // React.useEffect(() => {
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     setUser(sampleUser); // Or null if no persisted session
  //     setIsLoading(false);
  //   }, 1000);
  // }, []);

  const login = async (credentials: UserCredentials) => {
    setIsLoading(true);
    setError(null);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (credentials.email === sampleUser.email && credentials.password === 'password123') { // Hardcoded credentials
      setUser(sampleUser);
      setIsLoading(false);
    } else {
      setError('Invalid email or password.');
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  const updateUserProfile = (updatedProfileData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null; // Should not happen if called correctly
      return { ...prevUser, ...updatedProfileData };
    });
    // In a real app, also save to localStorage if user session is persisted there
    // localStorage.setItem('user', JSON.stringify({ ...user, ...updatedProfileData }));
  };

  const updateUserPreferences = (preferences: UserPreferences) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        preferences: { ...prevUser.preferences, ...preferences }
      };
    });
    // Persist to localStorage if using it
    // if (user) {
    //   localStorage.setItem('user', JSON.stringify({ ...user, preferences: { ...user.preferences, ...preferences } }));
    // }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    console.log('UserContext: Attempting to change password.');
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));

    // Mock validation: In a real app, verify currentPassword against the stored one.
    // For this mock, let's assume 'password123' is the "current" password for the sampleUser if a user is logged in.
    // This check should ideally be against the actual current user's password hash.
    if (user && currentPassword === 'password123') { // Simple mock check
      console.log('UserContext: Password change successful (mocked). New password would be:', newPassword);
      // In a real app, you might update a lastPasswordChangedAt field in user state,
      // and the backend would handle storing the new hashed password.
      return { success: true, message: 'Password changed successfully! (This is a mock response)' };
    } else {
      console.warn('UserContext: Password change failed - incorrect current password or no user (mocked).');
      return { success: false, message: 'Incorrect current password. (This is a mock response)' };
    }
  };
  
  return (
    <UserContext.Provider value={{ user, isLoading, isAuthenticated, error, login, logout, updateUserProfile, updateUserPreferences, changePassword }}>
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