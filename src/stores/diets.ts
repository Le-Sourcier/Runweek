import { create } from "zustand";
import { apiUtils } from "../hooks/useApi";
// import { ApiUrl } from "../utils/api-url";
import {
  FoodItem,
  NutritionRecommendation,
  NutritionState,
} from "../types/diet";
import { ApiError } from "../types";

export const useDietsStore = create<NutritionState>((set, get) => ({
  // États initiaux
  foodItems: [],
  dailyNutrition: null,
  nutritionGoals: null,
  weeklyNutrition: [],
  nutritionStats: null,
  dietAnalysis: null,
  isLoading: false,
  error: null,

  // Rechercher des aliments
  searchFoods: async (query, category = "all", limit = 20) => {
    try {
      set({ isLoading: true, error: null });

      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (category) params.append("category", category);
      if (limit) params.append("limit", `${limit}`);

      const url = `/nutrition/foods/search?${params.toString()}`;

      const { data } = await apiUtils.get<FoodItem[]>(url);

      set({
        foodItems: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;

      set({ error: error.message, isLoading: false });
    }
  },

  // Créer un aliment personnalisé
  createFood: async (foodData) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.post("/nutrition/foods", foodData);

      set({
        foodItems: [...get().foodItems, data],
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Récupérer la nutrition quotidienne
  getDailyNutrition: async (date) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.get(`/nutrition/daily/${date}`);

      set({
        dailyNutrition: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      // Si pas de données, créer un objet vide
      if (error.status === 404) {
        set({
          dailyNutrition: {
            date,
            meals: [],
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            waterIntake: 0,
            user_id: "",
          },
          isLoading: false,
        });
      } else {
        set({
          error: error.message,
          isLoading: false,
        });
      }
    }
  },

  // Ajouter un repas
  addMeal: async (date, mealData) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.post(
        `/nutrition/daily/${date}/meals`,
        mealData
      );

      set({
        dailyNutrition: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Supprimer un repas
  deleteMeal: async (date, mealId) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.del(
        `/nutrition/daily/${date}/meals/${mealId}`
      );

      set({
        dailyNutrition: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Mettre à jour la consommation d'eau
  updateWaterIntake: async (date, waterIntake) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.put(`/nutrition/daily/${date}/water`, {
        waterIntake,
      });

      set({
        dailyNutrition: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Récupérer les objectifs nutritionnels
  getNutritionGoals: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.get("/nutrition/goals");

      set({
        nutritionGoals: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Mettre à jour les objectifs nutritionnels
  updateNutritionGoals: async (goals) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.put("/nutrition/goals", goals);

      set({
        nutritionGoals: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Obtenir l'analyse nutritionnelle
  getNutritionAnalysis: async (date) => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.get(`/nutrition/analysis/${date}`);

      set({
        dietAnalysis: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Récupérer les données hebdomadaires
  getWeeklyNutrition: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.get("/nutrition/weekly");

      set({
        weeklyNutrition: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Obtenir les statistiques nutritionnelles
  getNutritionStats: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.get("/nutrition/stats");

      set({
        nutritionStats: data,
        isLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Fonction pour mettre à jour les notes quotidiennes (à implémenter côté API)
  updateDailyNotes: async (date: string, notes: string) => {
    try {
      set({ isLoading: true, error: null });
      // Implémentez l'appel API ici
      // Exemple: await apiUtils.put(`/nutrition/daily/${date}/notes`, { notes });

      // Mise à jour locale en attendant
      set((state) => ({
        dailyNutrition: state.dailyNutrition
          ? {
              ...state.dailyNutrition,
              notes,
            }
          : null,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as ApiError;
      set({ error: error.message, isLoading: false });
    }
  },

  // Fonction pour générer des recommandations (côté client)
  generateRecommendations: () => {
    const state = get();
    const currentDay = state.dailyNutrition;
    const goals = state.nutritionGoals;

    if (!currentDay || !goals) return [];

    const recommendations: NutritionRecommendation[] = [];

    // Logique de génération des recommandations
    if (currentDay.totalCalories < goals.dailyCalories * 0.7) {
      recommendations.push({
        type: "warning",
        title: "Apport calorique insuffisant",
        description: `Vous n'avez consommé que ${Math.round(
          currentDay.totalCalories
        )} calories. Objectif: ${goals.dailyCalories} cal.`,
        priority: "high",
        category: "calories",
        actionable: true,
        suggestedFoods: ["Amandes", "Avocat", "Yaourt grec", "Pain complet"],
      });
    }

    return recommendations;
  },

  // Effacer les erreurs
  clearError: () => set({ error: null }),
}));
