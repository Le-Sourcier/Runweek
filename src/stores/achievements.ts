// stores/achievements.ts
import { create } from "zustand";
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";
import {
  Achievement,
  AchievementState,
  AchievementFilter,
  AchievementStats,
  AvailableAchievement,
  UserStats,
  ActivityData,
} from "../types/achievements";
import { ApiError } from "../types";

export const useAchievementsStore = create<AchievementState>((set) => ({
  // États initiaux
  achievements: [],
  availableAchievements: {},
  achievementStats: null,
  isLoading: false,
  isUnlocking: false,
  error: null,

  // Récupérer les achievements de l'utilisateur
  getUserAchievements: async (filters?: AchievementFilter) => {
    try {
      set({ isLoading: true, error: null });

      const params = new URLSearchParams();
      if (filters?.category && filters.category !== "all") {
        params.append("category", filters.category);
      }
      if (filters?.earned) {
        params.append("earned", filters.earned);
      }

      const url = `${ApiUrl.ACHIEVEMENTS}?${params.toString()}`;

      const { data } = await apiUtils.get<Achievement[]>(url);

      set({
        achievements: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;

      if (error.message === "NO_ACHIEVEMENTS_FOUND") {
        set({ error: null, isLoading: false });
        throw new Error();
      }

      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Débloquer un achievement
  unlockAchievement: async (
    achievementId: string,
    activityData?: ActivityData
  ) => {
    try {
      set({ isUnlocking: true, error: null });

      const { data } = await apiUtils.post(`${ApiUrl.ACHIEVEMENTS}/unlock`, {
        achievement_id: achievementId,
        activityData,
      });

      // Mettre à jour la liste des achievements
      set((state) => ({
        achievements: state.achievements.map((achievement) =>
          achievement.achievement_id === achievementId
            ? { ...achievement, ...data, isLocked: false }
            : achievement
        ),
        isUnlocking: false,
      }));

      return data;
    } catch (err) {
      const error = err as ApiError;
      set({ error: error.message, isUnlocking: false });
      throw error;
    }
  },

  // Vérifier automatiquement les achievements
  checkAchievements: async (
    userStats: UserStats,
    activityData?: ActivityData
  ) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.post(`${ApiUrl.ACHIEVEMENTS}/check`, {
        userStats,
        activityData,
      });

      // Mettre à jour la liste des achievements avec les nouveaux débloqués
      if (data && data.length > 0) {
        set((state) => ({
          achievements: [
            ...state.achievements,
            ...data.map((achievement: Achievement) => ({
              ...achievement,
              isLocked: false,
            })),
          ],
          isLoading: false,
        }));
      } else {
        set({ isLoading: false });
      }

      return data;
    } catch (err) {
      const error = err as ApiError;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Récupérer les statistiques des achievements
  getAchievementStats: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.get<AchievementStats>(
        `${ApiUrl.ACHIEVEMENTS}/stats`
      );

      set({
        achievementStats: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Récupérer tous les achievements disponibles
  getAvailableAchievements: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.get<Record<string, AvailableAchievement>>(
        `${ApiUrl.ACHIEVEMENTS}/available`
      );

      set({
        availableAchievements: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Effacer les erreurs
  clearError: () => set({ error: null }),
}));
