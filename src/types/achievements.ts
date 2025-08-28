// types/achievements.ts
export interface Achievement {
  id: string;
  achievement_id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  requirements: {
    totalRuns?: number;
    totalDistance?: number;
    singleRunDistance?: number;
    consecutiveDays?: number;
    averagePace?: number;
    elevationGain?: number;
  };
  earnedDate: string | null;
  isLocked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AchievementStats {
  totalAvailable: number;
  totalEarned: number;
  totalPoints: number;
  completionRate: number;
  categoriesEarned: string[];
  raritiesEarned: string[];
  recentAchievements: Achievement[];
}

export interface AvailableAchievement {
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  requirements: {
    totalRuns?: number;
    totalDistance?: number;
    singleRunDistance?: number;
    consecutiveDays?: number;
    averagePace?: number;
    elevationGain?: number;
  };
}

export interface UserStats {
  totalRuns: number;
  totalDistance: number;
  streakDays: number;
  averagePace: number;
  elevationGain?: number;
}

export interface ActivityData {
  distance?: number;
  time?: string;
  pace?: string;
  date?: string;
  elevationGain?: number;
}

export interface AchievementFilter {
  category?:
    | "running"
    | "distance"
    | "consistency"
    | "speed"
    | "challenge"
    | "all";
  earned?: "true" | "false";
  sort?: "date" | "points" | "category" | "rarity";
}

export interface AchievementState {
  // États
  achievements: Achievement[];
  availableAchievements: Record<string, AvailableAchievement>;
  achievementStats: AchievementStats | null;
  isLoading: boolean;
  isUnlocking: boolean;
  error: string | null;

  // Actions
  getUserAchievements: (filters?: AchievementFilter) => Promise<void>;
  unlockAchievement: (
    achievementId: string,
    activityData?: ActivityData
  ) => Promise<void>;
  checkAchievements: (
    userStats: UserStats,
    activityData?: ActivityData
  ) => Promise<Achievement[]>;
  getAchievementStats: () => Promise<void>;
  getAvailableAchievements: () => Promise<void>;
  clearError: () => void;
}
