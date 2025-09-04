import { create } from "zustand";
import { DailyStats, MonthlyData, PaceData, RunTypeData, WeeklyStats } from "../types/Stats";
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";

interface StatisticState {
  weeklyData: WeeklyStats[];
  monthlyData: MonthlyData[];
  paceData: PaceData[];
  runTypeData: RunTypeData[];
  // getDailyData: () => void;
  getWeeklyData: () => Promise<void>;
  getMonthlyData: () => Promise<void>;
  getRunTypeData: () => Promise<void>;
  getPaceData: () => Promise<void>;
}

export const useStatisticStore = create<StatisticState>((set) => ({
  // dailyData: [],
  weeklyData: [],
  monthlyData: [],
  runTypeData: [],
  paceData: [],
  // getDailyData: async () => {
  //   const { data } = await apiUtils.get<DailyStats[]>(ApiUrl.GET_DAILY_STATS);
  //   set({ dailyData: data });
  // },

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
    const { data } = await apiUtils.get<PaceData[]>(ApiUrl.GET_MONTH_STATS);

    let paceData = data;
    if (data.length === 0)
      paceData = Array(4)
        .fill(null)
        .map((_, index) => ({
          name: `Week ${++index}`,
          value: 0
        }));
    set({ paceData: paceData });
  },

  getRunTypeData: async () => {
    const { data } = await apiUtils.get<RunTypeData[]>(ApiUrl.GET_ACTIVITY_TYPE_STATS);
    set({ runTypeData: data });
  },

}));