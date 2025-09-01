import { create } from "zustand";
import { UserGoal } from "../types/user";
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";
import { extractErrorMessage } from "../utils/error-handler";
import { UserGoalFormData } from "../components/goals/AddEditGoalModal";

interface GoalState {
  goals: UserGoal[];
  getGoals: () => Promise<void>;
  createGoal: (goal: UserGoalFormData) => Promise<void>;
  updateGoal: (updatedGoal: UserGoal) => Promise<UserGoal>;
  deleteGoal: (goalId: string) => Promise<void>;
  getGoalStatistic: () => Promise<void>;
  addProgressToGoal: (goalId: string, progress: number) => Promise<void>;
}

export const goalStore = create<GoalState>((set, state) => ({
  goals: [],
  getGoals: async () => {
    try {
      const { data } = await apiUtils.get<{ goals: UserGoal[] }>(ApiUrl.GOALS);
      set({ goals: data.goals });
    } catch (error) {
      if (extractErrorMessage(error).message === "GOALS_NOT_FOUND") {
        set({ goals: [] });
        return;
      }
      throw error;
    }
  },
  createGoal: async (goal: UserGoalFormData) => {
    try {
      const { data } = await apiUtils.post<UserGoal>(ApiUrl.GOALS, goal);
      set({ goals: [...state().goals, data] });
    } catch (error) {
      throw error;
    }
  },
  updateGoal: async (updatedGoal: UserGoal) => {
    try {
      const { id, ..._ } = updatedGoal;
      const { data } = await apiUtils.put<UserGoal>(ApiUrl.parameterized(ApiUrl.UPDATE_GOAL, updatedGoal.id), _);
      set((state) => ({ goals: state.goals.map((_) => (_.id === updatedGoal.id ? updatedGoal : _)) }));
      return data;
    } catch (error) {
      throw error;
    }
  },
  deleteGoal: async (goalId: string) => {
    try {
      await apiUtils.del(ApiUrl.parameterized(ApiUrl.DELETE_GOAL, goalId));
      set((state) => ({ goals: state.goals.filter((goal) => goal.id !== goalId) }));
    } catch (error) {
      throw error;
    }
  },

  getGoalStatistic: async () => {
    try {
      const { data } = await apiUtils.get<UserGoal[]>(ApiUrl.GET_GOALS_STATISTIC);
      set({ goals: data });
    } catch (error) {
      if (extractErrorMessage(error).message === "GOALS_NOT_FOUND") {
        set({ goals: [] });
        return;
      }
      throw error;
    }
  },

  addProgressToGoal: async (goalId: string, progress: number) => {
    try {
      await apiUtils.post(ApiUrl.parameterized(ApiUrl.ADD_PROGRESS_TO_GOAL, goalId), { progress });
      set((state) => ({ goals: state.goals.map((_) => (_.id === goalId ? { ..._, current: _.current + progress } : _)) }));
    } catch (error) {
      throw error;
    }
  }
}));
