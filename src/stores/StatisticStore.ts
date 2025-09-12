import { create } from "zustand";
import {
  HeartRateData,
  MonthlyData,
  PaceData,
  RunTypeData,
  WeeklyStats,
  Activity,
  PerformanceMetrics,
  StatisticsResponse,
} from "../types/Stats";
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";

const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const emptyHeartRateData = Array(7)
  .fill(null)
  .map(
    (_, index) =>
      ({
        day: days[index],
        value: 0,
      } as HeartRateData)
  );

const emptyRunTypeData = {
  name: "Aucun type de course à afficher",
  value: 0,
} as RunTypeData;

interface StatisticState {
  weeklyData: WeeklyStats[];
  monthlyData: MonthlyData[];
  paceData: PaceData[];
  runTypeData: RunTypeData[];
  heartRateData: HeartRateData[];
  recentActivities: Activity[];
  performanceMetrics: PerformanceMetrics | null;
  loading: boolean;
  error: string | null;

  getWeeklyData: () => Promise<void>;
  getMonthlyData: () => Promise<void>;
  getRunTypeData: () => Promise<void>;
  getHeartRateData: () => Promise<void>;
  getPaceData: () => Promise<void>;
  getRecentActivities: (limit?: number, offset?: number) => Promise<void>;
  getPerformanceMetrics: () => Promise<void>;
  getStatistics: () => Promise<void>;
}

export const useStatisticStore = create<StatisticState>((set) => ({
  weeklyData: [],
  monthlyData: [],
  runTypeData: [],
  paceData: [],
  heartRateData: emptyHeartRateData,
  recentActivities: [],
  performanceMetrics: null,
  loading: false,
  error: null,

  getWeeklyData: async () => {
    try {
      set({ loading: true, error: null });
      const { data } = await apiUtils.get<WeeklyStats[]>(
        ApiUrl.GET_WEEKLY_STATS
      );
      set({ weeklyData: data, loading: false });
    } catch (error) {
      set({
        weeklyData: [],
        loading: false,
        error: "Erreur lors de la récupération des données hebdomadaires",
      });
    }
  },

  getMonthlyData: async () => {
    try {
      set({ loading: true, error: null });
      const { data } = await apiUtils.get<MonthlyData[]>(
        ApiUrl.GET_MONTHLY_STATS
      );

      if (data.length === 0) {
        const emptyData = Array(4)
          .fill(null)
          .map(
            (_, index) =>
              ({
                name: `Week ${index + 1}`,
                distance: 0,
              } as MonthlyData)
          );
        set({ monthlyData: emptyData, loading: false });
        return;
      }

      set({ monthlyData: data, loading: false });
    } catch (error) {
      const emptyData = Array(4)
        .fill(null)
        .map(
          (_, index) =>
            ({
              name: `Week ${index + 1}`,
              distance: 0,
            } as MonthlyData)
        );
      set({
        monthlyData: emptyData,
        loading: false,
        error: "Erreur lors de la récupération des données mensuelles",
      });
    }
  },

  getPaceData: async () => {
    try {
      set({ loading: true, error: null });
      const { data } = await apiUtils.get<PaceData[]>(ApiUrl.GET_PACE_STATS);

      if (data.length === 0) {
        const emptyData = Array(4)
          .fill(null)
          .map(
            (_, index) =>
              ({
                name: `Week ${index + 1}`,
                value: 0,
              } as PaceData)
          );
        set({ paceData: emptyData, loading: false });
        return;
      }

      set({ paceData: data, loading: false });
    } catch (error) {
      const emptyData = Array(4)
        .fill(null)
        .map(
          (_, index) =>
            ({
              name: `Week ${index + 1}`,
              value: 0,
            } as PaceData)
        );
      set({
        paceData: emptyData,
        loading: false,
        error: "Erreur lors de la récupération des données de rythme",
      });
    }
  },

  getRunTypeData: async () => {
    try {
      set({ loading: true, error: null });
      const { data } = await apiUtils.get<RunTypeData[]>(
        ApiUrl.GET_RUN_TYPE_STATS
      );

      if (data.length === 0) {
        set({ runTypeData: [emptyRunTypeData], loading: false });
        return;
      }
      set({ runTypeData: data, loading: false });
    } catch (error) {
      set({
        runTypeData: [emptyRunTypeData],
        loading: false,
        error: "Erreur lors de la récupération des types de course",
      });
    }
  },

  getHeartRateData: async () => {
    try {
      set({ loading: true, error: null });
      const { data } = await apiUtils.get<HeartRateData[]>(
        ApiUrl.GET_HEART_RATE_STATS
      );

      if (data.length === 0 || data.length < 7) {
        set({ heartRateData: emptyHeartRateData, loading: false });
        return;
      }
      set({ heartRateData: data, loading: false });
    } catch (error) {
      set({
        heartRateData: emptyHeartRateData,
        loading: false,
        error: "Erreur lors de la récupération des données cardiaques",
      });
    }
  },

  getRecentActivities: async (limit = 20, offset = 0) => {
    try {
      set({ loading: true, error: null });
      const { data } = await apiUtils.get<Activity[]>(
        `${ApiUrl.GET_RECENT_ACTIVITIES}?limit=${limit}&offset=${offset}`
      );
      set({ recentActivities: data, loading: false });
    } catch (error) {
      set({
        recentActivities: [],
        loading: false,
        error: "Erreur lors de la récupération des activités récentes",
      });
    }
  },

  getPerformanceMetrics: async () => {
    try {
      set({ loading: true, error: null });
      const { data } = await apiUtils.get<PerformanceMetrics>(
        ApiUrl.GET_PERFORMANCE_METRICS
      );
      set({ performanceMetrics: data, loading: false });
    } catch (error) {
      set({
        performanceMetrics: null,
        loading: false,
        error: "Erreur lors de la récupération des métriques de performance",
      });
    }
  },

  getStatistics: async () => {
    try {
      set({ loading: true, error: null });
      const { data } = await apiUtils.get<StatisticsResponse>(
        ApiUrl.GET_STATISTICS
      );

      set({
        weeklyData: data.charts.weeklyData,
        monthlyData: data.charts.monthlyData,
        paceData: data.charts.paceData,
        runTypeData: data.charts.runTypeData,
        recentActivities: data.recentActivities,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: "Erreur lors de la récupération des statistiques complètes",
      });
    }
  },
}));
