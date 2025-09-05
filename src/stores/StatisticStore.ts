import { create } from "zustand";
import { HeartRateData, MonthlyData, PaceData, RunTypeData, WeeklyStats } from "../types/Stats";
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";

const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const emptyHeartRateData = Array(7).fill(null).map((_, index) => ({
  day: days[index],
  value: 0
} as HeartRateData));

const emptyRunTypeData = {
  name: "Aucun type de course à afficher",
  value: 0
} as RunTypeData

interface StatisticState {
  weeklyData: WeeklyStats[];
  monthlyData: MonthlyData[];
  paceData: PaceData[];
  runTypeData: RunTypeData[];
  heartRateData: HeartRateData[];
  getWeeklyData: () => Promise<void>;
  getMonthlyData: () => Promise<void>;
  getRunTypeData: () => Promise<void>;
  getHeartRateData: () => Promise<void>;
  getPaceData: () => Promise<void>;
}

export const useStatisticStore = create<StatisticState>((set) => ({
  weeklyData: [],
  monthlyData: [],
  runTypeData: [],
  paceData: [],
  heartRateData: emptyHeartRateData,

  getWeeklyData: async () => {
    const { data } = await apiUtils.get<WeeklyStats[]>(ApiUrl.GET_WEEKLY_STATS);
    set({ weeklyData: data });
  },


  getMonthlyData: async () => {
    const { data } = await apiUtils.get<MonthlyData[]>(ApiUrl.GET_MONTH_STATS);
    const emptyData = Array(4)
      .fill(null)
      .map((_, index) => ({
        name: `Week ${++index}`,
        distance: 0
      } as MonthlyData));
    if (data.length === 0) {
      set({ monthlyData: emptyData });
      return;
    }
    set({ monthlyData: data });
  },

  getPaceData: async () => {
    const emptyData = Array(4)
      .fill(null)
      .map((_, index) => ({
        name: `Week ${++index}`,
        value: 0
      } as PaceData));

    try {
      const { data } = await apiUtils.get<PaceData[]>(ApiUrl.GET_MONTH_STATS);

      if (data.length === 0) {
        set({ paceData: emptyData });
        return;
      }

      set({ paceData: data });
    } catch (error) {
      set({ paceData: emptyData });
      throw error;
    }
  },

  getRunTypeData: async () => {
    try {
      const { data } = await apiUtils.get<RunTypeData[]>(ApiUrl.GET_ACTIVITY_TYPE_STATS);

      if (data.length === 0) {
        set({ runTypeData: [emptyRunTypeData] });
        return;
      }
      set({ runTypeData: data });
    } catch (error) {
      set({ runTypeData: [emptyRunTypeData] });
      throw error;
    }
  },

  getHeartRateData: async () => {
    try {
      const { data } = await apiUtils.get<HeartRateData[]>(ApiUrl.GET_HEART_RATE_STATS);
      if (data.length === 0 || data.length < 7) {
        set({ heartRateData: emptyHeartRateData });
        return;
      }
      set({ heartRateData: data });
    } catch (error) {
      set({ heartRateData: emptyHeartRateData });
      throw error;
    }
  },

}));