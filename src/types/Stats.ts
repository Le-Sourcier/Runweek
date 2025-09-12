// types/Stats.ts

export interface WeeklyStats {
  day: string;
  distance: number;
  time: number;
  pace: number;
}

export interface MonthlyData {
  name: string;
  distance: number;
}

export interface PaceData {
  name: string;
  value: number;
}

export interface RunTypeData {
  name: string;
  value: number;
  distance?: number; // Optionnel selon vos besoins
}

export interface HeartRateData {
  day: string;
  value: number;
}

export interface Activity {
  id: string;
  type: string;
  distance: number;
  time: string;
  date: string;
  location: string;
  heartRate?: number;
  elevation?: number;
  pace?: string;
}

export interface PerformanceMetricItem {
  value: number | string;
  trend: number;
  unit: string;
}

export interface PerformanceMetrics {
  totalDistance: PerformanceMetricItem;
  averagePace: PerformanceMetricItem;
  totalActivities: PerformanceMetricItem;
  averageHeartRate: PerformanceMetricItem;
}

// Interfaces pour les données complètes de statistiques
export interface UserStats {
  points: number;
  level: number;
  experience: number;
  weekly_distance: number;
  streak_days: number;
  average_pace: string;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  target: number;
  current: number;
  progressPercentage: number;
  deadline: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: string;
  points: number;
  rarity: string;
}

export interface SleepData {
  id: string;
  date: string;
  totalSleepMinutes: number;
  deepSleepMinutes: number;
  lightSleepMinutes?: number;
  sleepQuality: string;
}

export interface PersonalRecord {
  id: string;
  distance: number;
  time: string;
  date: string;
  pace: string;
  location: string;
  isVerified: boolean;
}

export interface StatisticsResponse {
  userStats: UserStats;
  recentActivities: Activity[];
  goals: Goal[];
  achievements: Achievement[];
  sleepData: SleepData[];
  personalRecords: PersonalRecord[];
  charts: {
    weeklyData: WeeklyStats[];
    monthlyData: MonthlyData[];
    paceData: PaceData[];
    runTypeData: RunTypeData[];
  };
}

// export interface WeeklyStats {
//   day: string;
//   distance: number;
//   time: number;
//   pace: number;
// }

// export interface DailyStats {
//   date: string;
//   distance: number;
//   time: number;
//   pace: number;
// }

// export interface MonthlyData {
//   name: string;
//   distance: number;
// }

// export interface PaceData {
//   name: string;
//   value: number;
// }

// export interface RunTypeData {
//   name: string;
//   value: number;
// }

// export interface Activity {
//   id: number;
//   type: string;
//   distance: number;
//   time: string; // HH:MM:SS or MM:SS
//   date: string; // YYYY-MM-DD
//   location: string;
//   heartRate?: number; // Optional
//   elevation?: number; // Optional
// }

// export interface HeartRateData {
//   day: string;
//   value: number;
// }
