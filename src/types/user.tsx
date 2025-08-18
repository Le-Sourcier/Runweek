import { GoalCategory } from ".";

export type UserStats = {
  totalDistance: number;
  weeklyDistance: number;
  totalRuns: number;
  averagePace: string;
  streakDays: number;
  level: number;
  points: number;
};

export type UserGoal = {
  id: string;
  title: string;
  category: GoalCategory;
  description?: string;
  target: number;
  current: number;
  unit: string; // e.g., 'km', 'miles', 'hours', 'minutes', 'runs', 'workouts'
  deadline: string; // ISO date string or simple YYYY-MM-DD
  completed: boolean;
};
export type UserAchievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string | null;
};

export type User = {
  id: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  image: string;
  createdAt: string;
  stats: UserStats;
  goals: UserGoal[];
  achievements: UserAchievement[];
  preferences?: UserPreferences; // Added preferences field
  connectedDevices?: ConnectedDevice[]; // New field
  socialAccounts?: SocialAccountConnection[]; // New field
};

export type SocialAccountConnection = {
  id: string; // e.g., 'facebook', 'strava'
  name: string;
  connected: boolean;
};

export type ConnectedDevice = {
  id: string;
  name: string;
  type: string; // e.g., 'Smartphone', 'Watch', 'Fitness Tracker'
  lastSync: string; // ISO date string
  status: "connected" | "disconnected_by_user" | "sync_error";
  // icon?: string; // Optional: for specific device icons later
};

// Define UserPreferences type
export interface UserPreferences {
  distanceUnit: "kilometers" | "miles";
  preferredRunDays: string[];
  preferredRunTime: "morning" | "afternoon" | "evening" | "any";
  trainingFocus:
    | "endurance"
    | "speed"
    | "race_training"
    | "weight_loss"
    | "general_fitness";
  // Privacy settings added here
  activityVisibility?: "only_me" | "friends" | "public";
  profileVisibility?: "only_me" | "friends" | "public";
  dataSharing?: {
    enabled: boolean;
    shareNutrition: boolean;
    shareActivities: boolean;
    shareGoals: boolean;
    shareAchievements: boolean;
    allowFriendRequests: boolean;
    showInSearch: boolean;
  };
  locationSharing?: boolean;
  // Language and Region settings
  language?: string; // e.g., 'en', 'fr'
  region?: string; // e.g., 'US', 'FR'
  notificationSettings?: {
    // New field
    email: boolean;
    push: boolean;
    achievements: boolean;
    reminders: boolean;
    updates: boolean; // e.g., for product updates, newsletters
  };
  isTwoFactorEnabled?: boolean; // New field for 2FA status
  syncSettings?: {
    // New field for sync preferences
    autoSync: boolean;
    backgroundSync: boolean;
  };
  dashboardWidgetsConfig?: {
    [widgetId: string]: {
      isVisible: boolean;
      order: number;
      defaultSpan?: number; // Added for column span on larger screens
    };
  };
}

// Define UserCredentials type for login
export type UserCredentials = {
  email: string;
  password?: string; // Password might be optional if using OAuth or magic links later
  rememberMe?: boolean;
};
export type UserRegistration = {
  fname: string;
  lname: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string; // Password might be optional if using OAuth or magic links later
};

export type RegisterRes = {
  error: boolean;
  message: string | null;
  // data: Record<string, string> | undefined;
};

export type MailVerificationStatus =
  | "loading"
  | "already-validated"
  | "success"
  | "error"
  | "expired"
  | "invalid";

export type MailVerification = {
  status: MailVerificationStatus;
  email?: string;
};

export type UserContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean; // Added for easier auth checks
  message: string | null; // For login/auth errors
  login: (credentials: UserCredentials) => Promise<void>; // Made async to mimic API call
  register: (auth: UserRegistration) => Promise<RegisterRes>; // Made async to mimic API call
  verifyMail: (token: string) => Promise<MailVerification>;
  resendVerificationMail: (
    email: string
  ) => Promise<{ message: string | null; resent: boolean }>;
  logout: () => void;
  updateUserProfile: (updatedProfileData: Partial<User>) => Promise<void>;
  updateUserPreferences: (preferences: UserPreferences) => void;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>; // Added changePassword
  unlockSpecificAchievement: () => void; // Added for new achievement simulation
  addGoal: (goalData: Omit<UserGoal, "id" | "current" | "completed">) => void;
  updateGoal: (
    goalId: string,
    updatedData: Partial<Omit<UserGoal, "id">>
  ) => void;
  deleteGoal: (goalId: string) => void;
  // setUser: React.Dispatch<React.SetStateAction<User | null>>; // Keep if direct manipulation is needed, or remove if only via login/logout
};
