export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // en grammes
  carbs: number; // en grammes
  fat: number; // en grammes
  fiber?: number; // en grammes
  sugar?: number; // en grammes
  sodium?: number; // en mg
}

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number; // en grammes ou portions
  unit: "g" | "portion" | "ml";
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  timestamp: string; // ISO date string
}

export interface DailyNutrition {
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number; // en ml
  notes?: string;
}

export interface NutritionGoals {
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  dailyWater: number; // en ml
}

export interface Friend {
  id: string;
  name: string;
  profileImage: string;
  isOnline: boolean;
  lastActivity?: string;
  mutualFriends?: number;
}

export interface FriendRequest {
  id: string;
  from: Friend;
  to: Friend;
  status: "pending" | "accepted" | "declined";
  timestamp: string;
}

export interface SharedMeal {
  id: string;
  user: Friend;
  meal: MealEntry;
  description?: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  isLiked: boolean;
}

export interface Comment {
  id: string;
  user: Friend;
  text: string;
  timestamp: string;
}

export interface DietStats {
  weeklyCaloriesAvg: number;
  weeklyProteinAvg: number;
  streakDays: number;
  mealsLogged: number;
  favoriteFood: string;
}

export interface NutritionRecommendation {
  id: string;
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
  timestamp: string;
}

export interface DietAnalysis {
  overallScore: number; // 0-100
  recommendations: NutritionRecommendation[];
  strengths: string[];
  areasForImprovement: string[];
  weeklyTrend: "improving" | "stable" | "declining";
}
