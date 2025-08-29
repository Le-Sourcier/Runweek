import { create } from "zustand";
import { apiUtils } from "../hooks/useApi";
// import { ApiUrl } from "../utils/api-url";
import {
  DailyNutrition,
  DietAnalysis,
  FoodItem,
  NutritionRecommendation,
  NutritionState,
} from "../types/diet";
import { ApiError } from "../types";
import { ApiUrl } from "../utils/api-url";

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

      const { data } = await apiUtils.get<FoodItem[]>(
        ApiUrl.queryable(
          ApiUrl.NUTRITION_SEARCH,
          {
            q: query,
            category: category,
            limit: limit.toString(),
          }
        )
      );

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

      const { data } = await apiUtils.post(
        ApiUrl.NUTRITION_FOODS,
        foodData
      );

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

      const { data } = await apiUtils.get<DailyNutrition>(
        ApiUrl.parameterized(ApiUrl.NUTRITION_DAILY, { date })
      );

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
        ApiUrl.parameterized(ApiUrl.NUTRITION_DAILY_MEALS, { date }),
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
    console.log("mealId:", mealId);
    
    try {
      set({ isLoading: true, error: null });
      
      const { data } = await apiUtils.del(
        ApiUrl.parameterized(
          ApiUrl.NUTRITION_DELETE_MEAL,
          {
            date,
            meal_id: mealId,
          },
        )
      );

      console.log("Ici");
      

      set({
        dailyNutrition: data,
        isLoading: false,
      });
    } catch (err) {
      console.log("Error:", mealId);
      
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

      const { data } = await apiUtils.put(
        ApiUrl.parameterized(ApiUrl.NUTRITION_UPDATE_WATER_INTAKE, { date }),
        {
          waterIntake,
        }
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

  // Récupérer les objectifs nutritionnels
  getNutritionGoals: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data } = await apiUtils.get(ApiUrl.NUTRITION_GET_GOALS);

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

      const { data } = await apiUtils.put(ApiUrl.NUTRITION_UPDATE_GOALS, goals);

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

      const { data } = await apiUtils.get<DietAnalysis>(ApiUrl.parameterized(ApiUrl.NUTRITION_GET_WEEKLY_ANALYSIS, { date }));
      
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

      const { data } = await apiUtils.get(ApiUrl.NUTRITION_GET_WEEKLY_NUTRITION);

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

      const { data } = await apiUtils.get(ApiUrl.NUTRITION_GET_NUTRITION_STATS);

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
  updateDailyNotes: async (_date: string, notes: string) => {
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
