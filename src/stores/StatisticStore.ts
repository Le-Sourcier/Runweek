import { create } from "zustand";
import { HeartRateData, MonthlyData, PaceData, RunTypeData, WeeklyStats } from "../types/Stats";
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";

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
  heartRateData: [],

  getWeeklyData: async () => {
    const { data } = await apiUtils.get<WeeklyStats[]>(ApiUrl.GET_WEEKLY_STATS);
    set({ weeklyData: data });
  },


  getMonthlyData: async () => {
    const { data } = await apiUtils.get<MonthlyData[]>(ApiUrl.GET_MONTH_STATS);
    let monthlyData = data;
    if (data.length === 0)
      monthlyData = Array(4)
        .fill(null)
        .map((_, index) => ({
          name: `Week ${++index}`,
          distance: 0
        }));

    set({ monthlyData: monthlyData });
  },

  getPaceData: async () => {
    const emptyData = Array(4)
      .fill(null)
      .map((_, index) => ({
        name: `Week ${++index}`,
        value: 0
      }));

    try {
      const { data } = await apiUtils.get<PaceData[]>(ApiUrl.GET_MONTH_STATS);

      if (data.length === 0)
        set({ paceData: emptyData });
      set({ paceData: data });
    } catch (error) {
      set({ paceData: emptyData });
      throw error;
    }
  },

  getRunTypeData: async () => {
    const { data } = await apiUtils.get<RunTypeData[]>(ApiUrl.GET_ACTIVITY_TYPE_STATS);
    set({ runTypeData: data });
  },

  getHeartRateData: async () => {
    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const emptyData = Array(7).fill(null).map((_, index) => ({
      day: days[index],
      value: 0
    }));;
    try {
      const { data } = await apiUtils.get<HeartRateData[]>(ApiUrl.GET_HEART_RATE_STATS);
      if (data.length === 0 || data.length < 7) {
        set({ heartRateData: emptyData });
        return;
      }
      set({ heartRateData: data });
    } catch (error) {
      set({ heartRateData: emptyData });
      throw error;
    }
  },

}));