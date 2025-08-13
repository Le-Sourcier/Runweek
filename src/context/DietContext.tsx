import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DailyNutrition, MealEntry, NutritionGoals, FoodItem, DietStats, NutritionRecommendation, DietAnalysis } from '../types/diet';
import { toast } from 'react-toastify';

interface DietContextType {
  dailyNutrition: DailyNutrition[];
  currentDayNutrition: DailyNutrition | null;
  nutritionGoals: NutritionGoals;
  dietStats: DietStats;
  dietAnalysis: DietAnalysis;
  addMealEntry: (entry: Omit<MealEntry, 'id'>) => void;
  updateMealEntry: (entryId: string, updates: Partial<MealEntry>) => void;
  deleteMealEntry: (entryId: string) => void;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => void;
  updateWaterIntake: (date: string, amount: number) => void;
  addDailyNotes: (date: string, notes: string) => void;
  searchFood: (query: string) => Promise<FoodItem[]>;
  generateRecommendations: () => NutritionRecommendation[];
  dismissRecommendation: (recommendationId: string) => void;
  createCustomFood: (food: Omit<FoodItem, 'id'>) => FoodItem;
  getFoodSuggestions: (mealType: string, currentNutrition: DailyNutrition) => FoodItem[];
  calculateMealNutrition: (meals: MealEntry[]) => { calories: number; protein: number; carbs: number; fat: number };
}

const DietContext = createContext<DietContextType | undefined>(undefined);

const STORAGE_KEY = 'runweek_diet_data';
const GOALS_STORAGE_KEY = 'runweek_nutrition_goals';
const CUSTOM_FOODS_KEY = 'runweek_custom_foods';

const defaultNutritionGoals: NutritionGoals = {
  dailyCalories: 2200,
  dailyProtein: 120,
  dailyCarbs: 275,
  dailyFat: 75,
  dailyWater: 2500,
};

const baseFoodDatabase: FoodItem[] = [
  { id: 'f1', name: 'Banane', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12 },
  { id: 'f2', name: 'Avoine', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6 },
  { id: 'f3', name: 'Poulet grillé', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 'f4', name: 'Riz brun', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
  { id: 'f5', name: 'Brocoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  { id: 'f6', name: 'Saumon', calories: 208, protein: 22, carbs: 0, fat: 12, sodium: 59 },
  { id: 'f7', name: 'Yaourt grec', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, sugar: 3.6 },
  { id: 'f8', name: 'Amandes', calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12 },
  { id: 'f9', name: 'Pizza margherita', calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3 },
  { id: 'f10', name: 'Salade verte', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3 },
  { id: 'f11', name: 'Pâtes complètes', calories: 124, protein: 5, carbs: 25, fat: 1.1, fiber: 3.2 },
  { id: 'f12', name: 'Œuf', calories: 155, protein: 13, carbs: 1.1, fat: 11, sodium: 124 },
  { id: 'f13', name: 'Pomme', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10 },
  { id: 'f14', name: 'Thon en conserve', calories: 132, protein: 28, carbs: 0, fat: 1.3, sodium: 247 },
  { id: 'f15', name: 'Pain complet', calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 7 },
];

export const DietProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>(() => {
    try {
      const stored = localStorage.getItem(GOALS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultNutritionGoals;
    } catch {
      return defaultNutritionGoals;
    }
  });

  const [customFoods, setCustomFoods] = useState<FoodItem[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_FOODS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [dismissedRecommendations, setDismissedRecommendations] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('runweek_dismissed_recommendations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Combine base foods with custom foods
  const allFoods = [...baseFoodDatabase, ...customFoods];

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyNutrition));
  }, [dailyNutrition]);

  useEffect(() => {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(nutritionGoals));
  }, [nutritionGoals]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(customFoods));
  }, [customFoods]);

  useEffect(() => {
    localStorage.setItem('runweek_dismissed_recommendations', JSON.stringify(dismissedRecommendations));
  }, [dismissedRecommendations]);

  const today = new Date().toISOString().split('T')[0];
  const currentDayNutrition = dailyNutrition.find(day => day.date === today) || null;

  // Calculate statistics
  const dietStats: DietStats = {
    weeklyCaloriesAvg: dailyNutrition.slice(-7).reduce((sum, day) => sum + day.totalCalories, 0) / Math.max(1, dailyNutrition.slice(-7).length),
    weeklyProteinAvg: dailyNutrition.slice(-7).reduce((sum, day) => sum + day.totalProtein, 0) / Math.max(1, dailyNutrition.slice(-7).length),
    streakDays: calculateStreakDays(dailyNutrition),
    mealsLogged: dailyNutrition.reduce((sum, day) => sum + day.meals.length, 0),
    favoriteFood: getMostLoggedFood(dailyNutrition),
  };

  const addMealEntry = (entryData: Omit<MealEntry, 'id'>) => {
    const newEntry: MealEntry = {
      ...entryData,
      id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };

    const entryDate = new Date(entryData.timestamp).toISOString().split('T')[0];
    
    setDailyNutrition(prev => {
      const existingDayIndex = prev.findIndex(day => day.date === entryDate);
      
      if (existingDayIndex >= 0) {
        const updatedDays = [...prev];
        const updatedDay = { ...updatedDays[existingDayIndex] };
        updatedDay.meals = [...updatedDay.meals, newEntry];
        updatedDay.totalCalories = calculateTotalCalories(updatedDay.meals);
        updatedDay.totalProtein = calculateTotalProtein(updatedDay.meals);
        updatedDay.totalCarbs = calculateTotalCarbs(updatedDay.meals);
        updatedDay.totalFat = calculateTotalFat(updatedDay.meals);
        updatedDays[existingDayIndex] = updatedDay;
        return updatedDays;
      } else {
        const newDay: DailyNutrition = {
          date: entryDate,
          meals: [newEntry],
          totalCalories: calculateCaloriesForEntry(newEntry),
          totalProtein: calculateProteinForEntry(newEntry),
          totalCarbs: calculateCarbsForEntry(newEntry),
          totalFat: calculateFatForEntry(newEntry),
          waterIntake: 0,
        };
        return [...prev, newDay];
      }
    });

    toast.success(`${newEntry.foodItem.name} ajouté à votre ${getMealTypeName(newEntry.mealType)}`);
  };

  const updateMealEntry = (entryId: string, updates: Partial<MealEntry>) => {
    setDailyNutrition(prev => 
      prev.map(day => ({
        ...day,
        meals: day.meals.map(meal => 
          meal.id === entryId ? { ...meal, ...updates } : meal
        ),
      })).map(day => ({
        ...day,
        totalCalories: calculateTotalCalories(day.meals),
        totalProtein: calculateTotalProtein(day.meals),
        totalCarbs: calculateTotalCarbs(day.meals),
        totalFat: calculateTotalFat(day.meals),
      }))
    );
    toast.success('Repas mis à jour');
  };

  const deleteMealEntry = (entryId: string) => {
    setDailyNutrition(prev => 
      prev.map(day => ({
        ...day,
        meals: day.meals.filter(meal => meal.id !== entryId),
      })).map(day => ({
        ...day,
        totalCalories: calculateTotalCalories(day.meals),
        totalProtein: calculateTotalProtein(day.meals),
        totalCarbs: calculateTotalCarbs(day.meals),
        totalFat: calculateTotalFat(day.meals),
      }))
    );
    toast.success('Repas supprimé');
  };

  const updateNutritionGoals = (goals: Partial<NutritionGoals>) => {
    setNutritionGoals(prev => ({ ...prev, ...goals }));
    toast.success('Objectifs nutritionnels mis à jour');
  };

  const updateWaterIntake = (date: string, amount: number) => {
    setDailyNutrition(prev => {
      const existingDayIndex = prev.findIndex(day => day.date === date);
      
      if (existingDayIndex >= 0) {
        const updatedDays = [...prev];
        updatedDays[existingDayIndex] = {
          ...updatedDays[existingDayIndex],
          waterIntake: amount,
        };
        return updatedDays;
      } else {
        const newDay: DailyNutrition = {
          date,
          meals: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          waterIntake: amount,
        };
        return [...prev, newDay];
      }
    });
  };

  const addDailyNotes = (date: string, notes: string) => {
    setDailyNutrition(prev => {
      const existingDayIndex = prev.findIndex(day => day.date === date);
      
      if (existingDayIndex >= 0) {
        const updatedDays = [...prev];
        updatedDays[existingDayIndex] = {
          ...updatedDays[existingDayIndex],
          notes,
        };
        return updatedDays;
      }
      return prev;
    });
    toast.success('Notes sauvegardées');
  };

  const searchFood = async (query: string): Promise<FoodItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return allFoods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const createCustomFood = (foodData: Omit<FoodItem, 'id'>): FoodItem => {
    const newFood: FoodItem = {
      ...foodData,
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    setCustomFoods(prev => [...prev, newFood]);
    toast.success(`Aliment personnalisé "${newFood.name}" créé`);
    return newFood;
  };

  const getFoodSuggestions = (mealType: string, currentNutrition: DailyNutrition): FoodItem[] => {
    const remainingCalories = nutritionGoals.dailyCalories - currentNutrition.totalCalories;
    const remainingProtein = nutritionGoals.dailyProtein - currentNutrition.totalProtein;
    
    let suggestions: FoodItem[] = [];

    if (mealType === 'breakfast') {
      suggestions = allFoods.filter(food => 
        ['Avoine', 'Yaourt grec', 'Banane', 'Œuf', 'Pain complet'].includes(food.name)
      );
    } else if (mealType === 'lunch' || mealType === 'dinner') {
      if (remainingProtein > 20) {
        suggestions = allFoods.filter(food => food.protein > 15);
      } else {
        suggestions = allFoods.filter(food => 
          food.calories < remainingCalories / 2 && food.protein > 5
        );
      }
    } else { // snack
      suggestions = allFoods.filter(food => 
        food.calories < 200 && ['Pomme', 'Amandes', 'Yaourt grec'].includes(food.name)
      );
    }

    return suggestions.slice(0, 5);
  };

  const calculateMealNutrition = (meals: MealEntry[]) => {
    return {
      calories: calculateTotalCalories(meals),
      protein: calculateTotalProtein(meals),
      carbs: calculateTotalCarbs(meals),
      fat: calculateTotalFat(meals),
    };
  };

  const generateRecommendations = (): NutritionRecommendation[] => {
    const recommendations: NutritionRecommendation[] = [];
    const today = currentDayNutrition;
    const recentDays = dailyNutrition.slice(-7);
    
    if (!today) {
      recommendations.push({
        id: 'start_tracking',
        type: 'suggestion',
        title: 'Commencez à suivre votre alimentation',
        description: 'Enregistrez vos repas pour obtenir des recommandations personnalisées.',
        priority: 'high',
        category: 'calories',
        actionable: true,
        timestamp: new Date().toISOString(),
      });
      return recommendations.filter(rec => !dismissedRecommendations.includes(rec.id));
    }

    // Analyse des calories
    if (today.totalCalories < nutritionGoals.dailyCalories * 0.7) {
      recommendations.push({
        id: 'low_calories',
        type: 'warning',
        title: 'Apport calorique insuffisant',
        description: `Vous n'avez consommé que ${Math.round(today.totalCalories)} calories. Objectif: ${nutritionGoals.dailyCalories} cal.`,
        priority: 'high',
        category: 'calories',
        actionable: true,
        suggestedFoods: ['Amandes', 'Avocat', 'Yaourt grec', 'Pain complet'],
        timestamp: new Date().toISOString(),
      });
    } else if (today.totalCalories > nutritionGoals.dailyCalories * 1.2) {
      recommendations.push({
        id: 'high_calories',
        type: 'warning',
        title: 'Apport calorique élevé',
        description: `Vous avez consommé ${Math.round(today.totalCalories)} calories. Essayez de réduire les portions.`,
        priority: 'medium',
        category: 'calories',
        actionable: true,
        suggestedFoods: ['Salade verte', 'Brocoli', 'Pomme'],
        timestamp: new Date().toISOString(),
      });
    }

    // Analyse des protéines
    if (today.totalProtein < nutritionGoals.dailyProtein * 0.8) {
      recommendations.push({
        id: 'low_protein',
        type: 'improvement',
        title: 'Augmentez votre apport en protéines',
        description: `Actuel: ${Math.round(today.totalProtein)}g, Objectif: ${nutritionGoals.dailyProtein}g. Important pour la récupération musculaire.`,
        priority: 'high',
        category: 'protein',
        actionable: true,
        suggestedFoods: ['Poulet grillé', 'Saumon', 'Thon', 'Œuf', 'Yaourt grec'],
        timestamp: new Date().toISOString(),
      });
    }

    // Analyse de l'hydratation
    if (today.waterIntake < nutritionGoals.dailyWater * 0.6) {
      recommendations.push({
        id: 'low_hydration',
        type: 'warning',
        title: 'Hydratation insuffisante',
        description: `Buvez plus d'eau ! Actuel: ${today.waterIntake}ml, Objectif: ${nutritionGoals.dailyWater}ml.`,
        priority: 'high',
        category: 'hydration',
        actionable: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Analyse de la variété
    const uniqueFoods = new Set(today.meals.map(meal => meal.foodItem.name));
    if (uniqueFoods.size < 4 && today.meals.length > 2) {
      recommendations.push({
        id: 'food_variety',
        type: 'suggestion',
        title: 'Diversifiez votre alimentation',
        description: 'Ajoutez plus de variété pour un meilleur équilibre nutritionnel.',
        priority: 'medium',
        category: 'variety',
        actionable: true,
        suggestedFoods: ['Brocoli', 'Salade verte', 'Pomme', 'Saumon'],
        timestamp: new Date().toISOString(),
      });
    }

    // Analyse des repas manqués
    const mealTypes = new Set(today.meals.map(meal => meal.mealType));
    if (!mealTypes.has('breakfast') && new Date().getHours() > 10) {
      recommendations.push({
        id: 'missing_breakfast',
        type: 'improvement',
        title: 'Petit-déjeuner manqué',
        description: 'Le petit-déjeuner est important pour démarrer la journée avec énergie.',
        priority: 'medium',
        category: 'timing',
        actionable: true,
        suggestedFoods: ['Avoine', 'Banane', 'Yaourt grec', 'Œuf'],
        timestamp: new Date().toISOString(),
      });
    }

    // Recommandations positives
    if (today.totalProtein >= nutritionGoals.dailyProtein * 0.9) {
      recommendations.push({
        id: 'good_protein',
        type: 'achievement',
        title: 'Excellent apport en protéines !',
        description: 'Parfait pour la récupération après vos entraînements.',
        priority: 'low',
        category: 'protein',
        actionable: false,
        timestamp: new Date().toISOString(),
      });
    }

    if (today.waterIntake >= nutritionGoals.dailyWater * 0.9) {
      recommendations.push({
        id: 'good_hydration',
        type: 'achievement',
        title: 'Excellente hydratation !',
        description: 'Vous êtes bien hydraté pour vos performances sportives.',
        priority: 'low',
        category: 'hydration',
        actionable: false,
        timestamp: new Date().toISOString(),
      });
    }

    return recommendations.filter(rec => !dismissedRecommendations.includes(rec.id));
  };

  const dismissRecommendation = (recommendationId: string) => {
    setDismissedRecommendations(prev => [...prev, recommendationId]);
  };

  // Calculate diet analysis
  const dietAnalysis: DietAnalysis = {
    overallScore: calculateOverallScore(currentDayNutrition, nutritionGoals),
    recommendations: generateRecommendations(),
    strengths: calculateStrengths(currentDayNutrition, nutritionGoals),
    areasForImprovement: calculateAreasForImprovement(currentDayNutrition, nutritionGoals),
    weeklyTrend: calculateWeeklyTrend(dailyNutrition),
  };

  return (
    <DietContext.Provider value={{
      dailyNutrition,
      currentDayNutrition,
      nutritionGoals,
      dietStats,
      dietAnalysis,
      addMealEntry,
      updateMealEntry,
      deleteMealEntry,
      updateNutritionGoals,
      updateWaterIntake,
      addDailyNotes,
      searchFood,
      generateRecommendations,
      dismissRecommendation,
      createCustomFood,
      getFoodSuggestions,
      calculateMealNutrition,
    }}>
      {children}
    </DietContext.Provider>
  );
};

export const useDiet = () => {
  const context = useContext(DietContext);
  if (context === undefined) {
    throw new Error('useDiet must be used within a DietProvider');
  }
  return context;
};

// Utility functions
function calculateTotalCalories(meals: MealEntry[]): number {
  return meals.reduce((total, meal) => {
    const multiplier = meal.unit === 'g' ? meal.quantity / 100 : meal.quantity;
    return total + (meal.foodItem.calories * multiplier);
  }, 0);
}

function calculateTotalProtein(meals: MealEntry[]): number {
  return meals.reduce((total, meal) => {
    const multiplier = meal.unit === 'g' ? meal.quantity / 100 : meal.quantity;
    return total + (meal.foodItem.protein * multiplier);
  }, 0);
}

function calculateTotalCarbs(meals: MealEntry[]): number {
  return meals.reduce((total, meal) => {
    const multiplier = meal.unit === 'g' ? meal.quantity / 100 : meal.quantity;
    return total + (meal.foodItem.carbs * multiplier);
  }, 0);
}

function calculateTotalFat(meals: MealEntry[]): number {
  return meals.reduce((total, meal) => {
    const multiplier = meal.unit === 'g' ? meal.quantity / 100 : meal.quantity;
    return total + (meal.foodItem.fat * multiplier);
  }, 0);
}

function calculateCaloriesForEntry(entry: MealEntry): number {
  const multiplier = entry.unit === 'g' ? entry.quantity / 100 : entry.quantity;
  return entry.foodItem.calories * multiplier;
}

function calculateProteinForEntry(entry: MealEntry): number {
  const multiplier = entry.unit === 'g' ? entry.quantity / 100 : entry.quantity;
  return entry.foodItem.protein * multiplier;
}

function calculateCarbsForEntry(entry: MealEntry): number {
  const multiplier = entry.unit === 'g' ? entry.quantity / 100 : entry.quantity;
  return entry.foodItem.carbs * multiplier;
}

function calculateFatForEntry(entry: MealEntry): number {
  const multiplier = entry.unit === 'g' ? entry.quantity / 100 : entry.quantity;
  return entry.foodItem.fat * multiplier;
}

function calculateStreakDays(dailyNutrition: DailyNutrition[]): number {
  if (dailyNutrition.length === 0) return 0;
  
  const sortedDays = dailyNutrition
    .filter(day => day.meals.length > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let streak = 0;
  const today = new Date();
  
  for (const day of sortedDays) {
    const dayDate = new Date(day.date);
    const daysDiff = Math.floor((today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function getMostLoggedFood(dailyNutrition: DailyNutrition[]): string {
  const foodCounts: Record<string, number> = {};
  
  dailyNutrition.forEach(day => {
    day.meals.forEach(meal => {
      foodCounts[meal.foodItem.name] = (foodCounts[meal.foodItem.name] || 0) + 1;
    });
  });
  
  const mostLogged = Object.entries(foodCounts).reduce((max, [food, count]) => 
    count > max.count ? { food, count } : max, { food: 'Aucun', count: 0 }
  );
  
  return mostLogged.food;
}

function calculateOverallScore(currentDay: DailyNutrition | null, goals: NutritionGoals): number {
  if (!currentDay) return 0;
  
  let score = 0;
  
  // Score calories (25 points max)
  const caloriesRatio = currentDay.totalCalories / goals.dailyCalories;
  if (caloriesRatio >= 0.8 && caloriesRatio <= 1.2) {
    score += 25;
  } else if (caloriesRatio >= 0.6 && caloriesRatio <= 1.4) {
    score += 15;
  } else {
    score += 5;
  }
  
  // Score protéines (25 points max)
  const proteinRatio = currentDay.totalProtein / goals.dailyProtein;
  if (proteinRatio >= 0.9) {
    score += 25;
  } else if (proteinRatio >= 0.7) {
    score += 15;
  } else {
    score += 5;
  }
  
  // Score hydratation (20 points max)
  const waterRatio = currentDay.waterIntake / goals.dailyWater;
  if (waterRatio >= 0.9) {
    score += 20;
  } else if (waterRatio >= 0.6) {
    score += 12;
  } else {
    score += 3;
  }
  
  // Score variété (15 points max)
  const uniqueFoods = new Set(currentDay.meals.map(meal => meal.foodItem.name));
  score += Math.min(uniqueFoods.size * 2, 15);
  
  // Score équilibre des repas (15 points max)
  const mealTypes = new Set(currentDay.meals.map(meal => meal.mealType));
  score += mealTypes.size * 3;
  
  return Math.min(Math.round(score), 100);
}

function calculateStrengths(currentDay: DailyNutrition | null, goals: NutritionGoals): string[] {
  if (!currentDay) return [];
  
  const strengths: string[] = [];
  
  if (currentDay.totalProtein >= goals.dailyProtein * 0.9) {
    strengths.push('Excellent apport en protéines');
  }
  
  if (currentDay.waterIntake >= goals.dailyWater * 0.8) {
    strengths.push('Bonne hydratation');
  }
  
  const uniqueFoods = new Set(currentDay.meals.map(meal => meal.foodItem.name));
  if (uniqueFoods.size >= 6) {
    strengths.push('Alimentation variée');
  }
  
  const mealTypes = new Set(currentDay.meals.map(meal => meal.mealType));
  if (mealTypes.size >= 3) {
    strengths.push('Repas bien répartis');
  }

  const caloriesRatio = currentDay.totalCalories / goals.dailyCalories;
  if (caloriesRatio >= 0.9 && caloriesRatio <= 1.1) {
    strengths.push('Apport calorique équilibré');
  }
  
  return strengths;
}

function calculateAreasForImprovement(currentDay: DailyNutrition | null, goals: NutritionGoals): string[] {
  if (!currentDay) return ['Commencez à enregistrer vos repas'];
  
  const improvements: string[] = [];
  
  if (currentDay.totalCalories < goals.dailyCalories * 0.8) {
    improvements.push('Augmenter l\'apport calorique');
  }
  
  if (currentDay.totalProtein < goals.dailyProtein * 0.8) {
    improvements.push('Consommer plus de protéines');
  }
  
  if (currentDay.waterIntake < goals.dailyWater * 0.7) {
    improvements.push('Améliorer l\'hydratation');
  }
  
  const uniqueFoods = new Set(currentDay.meals.map(meal => meal.foodItem.name));
  if (uniqueFoods.size < 4) {
    improvements.push('Diversifier les aliments');
  }
  
  if (currentDay.totalFat > goals.dailyFat * 1.3) {
    improvements.push('Réduire les lipides');
  }

  const mealTypes = new Set(currentDay.meals.map(meal => meal.mealType));
  if (mealTypes.size < 3) {
    improvements.push('Mieux répartir les repas');
  }
  
  return improvements;
}

function calculateWeeklyTrend(dailyNutrition: DailyNutrition[]): 'improving' | 'stable' | 'declining' {
  if (dailyNutrition.length < 7) return 'stable';
  
  const lastWeek = dailyNutrition.slice(-7);
  const previousWeek = dailyNutrition.slice(-14, -7);
  
  if (previousWeek.length < 7) return 'stable';
  
  const lastWeekAvg = lastWeek.reduce((sum, day) => sum + day.totalCalories, 0) / 7;
  const previousWeekAvg = previousWeek.reduce((sum, day) => sum + day.totalCalories, 0) / 7;
  
  const difference = Math.abs(lastWeekAvg - previousWeekAvg);
  
  if (difference < 100) return 'stable';
  
  // Consider improving if calories are closer to goals
  const lastWeekGoalDiff = Math.abs(lastWeekAvg - 2200); // Using default goal
  const previousWeekGoalDiff = Math.abs(previousWeekAvg - 2200);
  
  return lastWeekGoalDiff < previousWeekGoalDiff ? 'improving' : 'declining';
}

function getMealTypeName(mealType: string): string {
  const names: Record<string, string> = {
    breakfast: 'petit-déjeuner',
    lunch: 'déjeuner', 
    dinner: 'dîner',
    snack: 'collation'
  };
  return names[mealType] || mealType;
}