export interface WeeklyStats {
  day: string;
  distance: number;
  time: number;
  pace: number;
}

export interface DailyStats {
  date: string;
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
}