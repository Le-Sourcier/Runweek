// types/nutrition.ts
export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  category?: string;
  brand?: string;
  barcode?: string;
  servingSize?: {
    amount: number;
    unit: string;
  };
  isPublic: boolean;
  isCustom: boolean;
  createdBy?: string;
}

// export type SeachFoodFilter = query, category = "all", limit = 20

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  unit: "g" | "portion" | "ml" | "cup" | "tbsp" | "tsp";
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  timestamp: string;
}

export interface DailyNutrition {
  id?: string;
  user_id: string;
  date: string;
  meals: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NutritionGoals {
  id?: string;
  user_id: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  dailyWater: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal:
    | "maintain"
    | "lose_weight"
    | "gain_weight"
    | "build_muscle"
    | "improve_performance";
  createdAt?: string;
  updatedAt?: string;
}

export interface DietStats {
  avgCalories: number;
  avgProtein: number;
  avgWater: number;
  totalMeals: number;
  daysLogged: number;
  maxCalories: number;
  minCalories: number;
  streakDays: number;
}

export interface NutritionRecommendation {
  id?: string;
  type: "improvement" | "warning" | "suggestion" | "achievement";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  category:
    | "calories"
    | "protein"
    | "carbs"
    | "fat"
    | "hydration"
    | "timing"
    | "variety";
  actionable?: boolean;
  suggestedFoods?: string[];
}

export interface DietAnalysis {
  overallScore: number;
  recommendations: NutritionRecommendation[];
  strengths: string[];
  areasForImprovement: string[];
  weeklyTrend: "improving" | "stable" | "declining";
}

export interface NutritionState {
  // États
  foodItems: FoodItem[];
  dailyNutrition: DailyNutrition | null;
  nutritionGoals: NutritionGoals | null;
  weeklyNutrition: DailyNutrition[];
  nutritionStats: DietStats | null;
  dietAnalysis: DietAnalysis | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  searchFoods: (
    query: string,
    category?: string,
    limit?: number
  ) => Promise<void>;
  createFood: (foodData: Partial<FoodItem>) => Promise<void>;
  getDailyNutrition: (date: string) => Promise<void>;
  addMeal: (date: string, mealData: Partial<MealEntry>) => Promise<void>;
  deleteMeal: (date: string, mealId: string) => Promise<void>;
  updateWaterIntake: (date: string, waterIntake: number) => Promise<void>;
  getNutritionGoals: () => Promise<void>;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  getNutritionAnalysis: (date: string) => Promise<void>;
  getWeeklyNutrition: () => Promise<void>;
  getNutritionStats: () => Promise<void>;
  updateDailyNotes: (date: string, notes: string) => Promise<void>;
  generateRecommendations: () => NutritionRecommendation[];
  clearError: () => void;
}
