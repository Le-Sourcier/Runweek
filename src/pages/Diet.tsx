import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../hooks/useUser";
import { useSocial } from "../context/SocialContext";
import Card from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import Badge from "../components/ui/Badge";
import {
  Plus,
  Search,
  Utensils,
  Droplets,
  Target,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  TrendingUp,
  Coffee,
  Sun,
  Moon,
  Sunset,
  Trash2,
  Settings,
  ChefHat,
  Lightbulb,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DailyNutrition,
  DietStats,
  FoodItem,
  NutritionGoals,
} from "../types/diet";
import NutritionChart from "../components/diet/NutritionChart";
import WeeklyNutritionTrend from "../components/diet/WeeklyNutritionTrend";
import SocialFeed from "../components/diet/SocialFeed";
import { useDietsStore } from "../stores/diets";
import { RequiredInputStar } from "../components/ui/RequiredInputStar";
import { toast } from "react-toastify";
import Spiner from "../components/ui/Spiner";
import { useFriendsStore } from "../stores/friends";
import { ProfileNameCircle } from "../components/ui/ProfileNameCircle";
import { getInitials } from "../utils/get-initial";

const Diet: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { sharedMeals, shareMeal, likeMeal, addComment } = useSocial();
  const { friends } = useFriendsStore();
  const {
    foodItems,
    dailyNutrition,
    nutritionGoals,
    weeklyNutrition,
    nutritionStats,
    dietAnalysis,
    isLoading: storeIsLoading,
    error,
    searchFoods,
    createFood,
    getDailyNutrition,
    addMeal,
    deleteMeal,
    updateWaterIntake,
    getNutritionGoals,
    updateNutritionGoals,
    getNutritionAnalysis,
    getWeeklyNutrition,
    getNutritionStats,
    clearError,
  } = useDietsStore();

  // États locaux
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [isSavingNewFood, setIsSavingNewFood] = useState(false);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [isLoading, setIsLoading] = useState(storeIsLoading);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isCreateFoodModalOpen, setIsCreateFoodModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("breakfast");
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<"g" | "portion">("g");
  const [waterIntake, setWaterIntakeLocal] = useState(
    dailyNutrition?.waterIntake || 0
  );
  const [dailyNotes, setDailyNotes] = useState(dailyNutrition?.notes || "");
  const [customFoodForm, setCustomFoodForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
  });
  const [goalsForm, setGoalsForm] = useState({
    dailyCalories: nutritionGoals?.dailyCalories.toString() || "2200",
    dailyProtein: nutritionGoals?.dailyProtein.toString() || "120",
    dailyCarbs: nutritionGoals?.dailyCarbs.toString() || "275",
    dailyFat: nutritionGoals?.dailyFat.toString() || "75",
    dailyWater: nutritionGoals?.dailyWater.toString() || "2500",
  });

  const today = new Date().toISOString().split("T")[0];
  const canShare = user?.preferences?.dataSharing?.enabled || false;

  // Charger les données au montage du composant
  useEffect(() => {
    getDailyNutrition(today);
    getNutritionGoals();
    getNutritionAnalysis(today);
    getWeeklyNutrition();
    getNutritionStats();
    setIsLoading(false);
  }, [
    getDailyNutrition,
    getNutritionAnalysis,
    getNutritionGoals,
    getNutritionStats,
    getWeeklyNutrition,
    today,
  ]);


  // Mettre à jour l'eau locale quand le store change
  useEffect(() => {
    if (dailyNutrition) {
      console.log("Called");

      setWaterIntakeLocal(dailyNutrition.waterIntake);
    }
  }, [dailyNutrition]);

  // Mettre à jour les objectifs quand le store change
  useEffect(() => {
    if (nutritionGoals) {
      setGoalsForm({
        dailyCalories: nutritionGoals.dailyCalories.toString(),
        dailyProtein: nutritionGoals.dailyProtein.toString(),
        dailyCarbs: nutritionGoals.dailyCarbs.toString(),
        dailyFat: nutritionGoals.dailyFat.toString(),
        dailyWater: nutritionGoals.dailyWater.toString(),
      });
    }
  }, [nutritionGoals]);

  const handleFoodSearch = async (query: string) => {
    setFoodSearchQuery(query);
    if (query.trim().length > 1) {
      await searchFoods(query);
      setSearchResults(useDietsStore.getState().foodItems);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddMeal = async () => {
    if (!selectedFood) return;

    const mealData = {
      foodItem_id: selectedFood.id,
      quantity,
      unit,
      mealType: selectedMealType,
      timestamp: new Date().toISOString(),
    };

    try {
      await addMeal(today, mealData);
      setIsAddMealModalOpen(false);
      setSelectedFood(null);
      setFoodSearchQuery("");
      setSearchResults([]);
      setQuantity(100);
      toast.success("Repas ajouté avec succès");
    } catch (error) {
      console.error("Erreur lors de l'ajout du repas:", error);
      toast.error("Erreur lors de l'ajout du repas");
    } finally {
      setIsAddingMeal(false);
    }
  };

  const handleWaterUpdate = async (amount: number) => {
    const newAmount = Math.max(0, waterIntake + amount);
    setWaterIntakeLocal(newAmount);
    await updateWaterIntake(today, newAmount);
  };

  const handleSaveDailyNotes = () => {
    // Cette fonctionnalité nécessiterait une route API spécifique
    console.log("Notes sauvegardées:", dailyNotes);
  };

  const handleShareMeal = (mealId: string) => {
    const description = prompt(
      "Ajouter une description pour ce repas partagé (optionnel):"
    );
    shareMeal(mealId, description || undefined);
  };

  const handleCreateCustomFood = async () => {
    if (!customFoodForm.name || !customFoodForm.calories) {
      toast.error("Nom et calories sont requis");
      return;
    }
    setIsSavingNewFood(true);
    const foodData = {
      name: customFoodForm.name,
      calories: parseFloat(customFoodForm.calories),
      protein: parseFloat(customFoodForm.protein) || 0,
      carbs: parseFloat(customFoodForm.carbs) || 0,
      fat: parseFloat(customFoodForm.fat) || 0,
      fiber: parseFloat(customFoodForm.fiber) || 0,
    };

    try {
      const newFood = await createFood(foodData);
      setSelectedFood(newFood);
      setIsCreateFoodModalOpen(false);
      setCustomFoodForm({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
      });
      toast.success("Aliment personnalisé créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création de l'aliment personnalisé:", error);
      toast.error("Erreur lors de la création de l'aliment personnalisé");
    } finally {
      setIsSavingNewFood(false);
    }
  };

  const handleUpdateGoals = async () => {
    const goals = {
      dailyCalories: parseInt(goalsForm.dailyCalories),
      dailyProtein: parseInt(goalsForm.dailyProtein),
      dailyCarbs: parseInt(goalsForm.dailyCarbs),
      dailyFat: parseInt(goalsForm.dailyFat),
      dailyWater: parseInt(goalsForm.dailyWater),
    };

    await updateNutritionGoals(goals);
    setIsGoalsModalOpen(false);
  };

  // Fonctions manquantes qui doivent être implémentées localement
  const dismissRecommendation = (recommendationId: string) => {
    // Implémentation locale de la suppression des recommandations
    console.log("Recommandation ignorée:", recommendationId);
  };

  const getFoodSuggestions = (
    mealType: string,
    currentNutrition: DailyNutrition
  ) => {
    // Logique de suggestion locale simplifiée
    const suggestions: FoodItem[] = [];

    if (mealType === "breakfast") {
      suggestions.push(
        {
          id: "f2",
          name: "Avoine",
          calories: 389,
          protein: 16.9,
          carbs: 66,
          fat: 6.9,
          isPublic: true,
          isCustom: false,
        },
        {
          id: "f7",
          name: "Yaourt grec",
          calories: 59,
          protein: 10,
          carbs: 3.6,
          fat: 0.4,
          isPublic: true,
          isCustom: false,
        },
        {
          id: "f1",
          name: "Banane",
          calories: 89,
          protein: 1.1,
          carbs: 23,
          fat: 0.3,
          isPublic: true,
          isCustom: false,
        }
      );
    }

    return suggestions.slice(0, 3);
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return <Coffee size={20} className="text-orange-500" />;
      case "lunch":
        return <Sun size={20} className="text-yellow-500" />;
      case "dinner":
        return <Moon size={20} className="text-purple-500" />;
      case "snack":
        return <Sunset size={20} className="text-pink-500" />;
      default:
        return <Utensils size={20} />;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={16} className="text-red-500" />;
      case "improvement":
        return <TrendingUp size={16} className="text-yellow-500" />;
      case "achievement":
        return <CheckCircle size={16} className="text-green-500" />;
      case "suggestion":
        return <Lightbulb size={16} className="text-blue-500" />;
      default:
        return <Info size={16} className="text-gray-500" />;
    }
  };

  // Valeurs par défaut pour éviter les erreurs
  const currentDayNutrition = dailyNutrition || {
    date: today,
    meals: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    waterIntake: 0,
    user_id: user?.id || "",
  } as DailyNutrition;

  const defaultNutritionGoals: NutritionGoals = {
    dailyCalories: 2200,
    dailyProtein: 120,
    dailyCarbs: 275,
    dailyFat: 75,
    dailyWater: 2500,
    activityLevel: "moderate",
    goal: "maintain",
    user_id: user?.id || "",
  };

  const goals = nutritionGoals || defaultNutritionGoals;
  const stats = nutritionStats || {
    avgCalories: 0,
    avgProtein: 0,
    avgWater: 0,
    totalMeals: 0,
    daysLogged: 0,
    maxCalories: 0,
    minCalories: 0,
    streakDays: 0,
  };

  const analysis = dietAnalysis || {
    overallScore: 0,
    recommendations: [],
    strengths: [],
    areasForImprovement: [],
    weeklyTrend: "stable",
  };

  const currentCalories = currentDayNutrition.totalCalories || 0;
  const currentProtein = currentDayNutrition.totalProtein || 0;
  const currentCarbs = currentDayNutrition.totalCarbs || 0;
  const currentFat = currentDayNutrition.totalFat || 0;

  const suggestions = getFoodSuggestions(selectedMealType, currentDayNutrition);

  const dietStats: DietStats = {
    avgCalories: 0,
    avgProtein: 0,
    avgWater: 0,
    totalMeals: 0,
    daysLogged: 0,
    maxCalories: 0,
    minCalories: 0,
    streakDays: 0,
  };

  if (isLoading) {
    return <div className="p-4 text-center">Chargement...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nutrition</h1>
          <p className="text-muted-foreground">
            Suivez votre alimentation et obtenez des recommandations IA
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-4 lg:w-auto lg:flex">
          <button
            onClick={() => setIsGoalsModalOpen(true)}
            className="btn btn-outline flex items-center gap-2 
            col-span-2 md:col-span-1"
          >
            <Settings size={16} />
            Objectifs
          </button>
          <button
            onClick={() => setIsAddMealModalOpen(true)}
            className="btn btn-primary flex items-center gap-2 col-span-2 md:col-span-1"
          >
            <Plus size={16} />
            Ajouter un repas
          </button>
        </div>
      </div>

      {/* Résumé nutritionnel du jour */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Calories</span>
            <Target size={16} className="text-primary" />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {Math.round(currentCalories)}
              </span>
              <span className="text-sm text-muted-foreground">
                / {nutritionGoals?.dailyCalories ?? 0}
              </span>
            </div>
            <ProgressBar
              value={currentCalories}
              max={nutritionGoals?.dailyCalories ?? 0}
              height="sm"
              color="primary"
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Protéines</span>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {Math.round(currentProtein)}g
              </span>
              <span className="text-sm text-muted-foreground">
                / {nutritionGoals?.dailyProtein ?? 0}g
              </span>
            </div>
            <ProgressBar
              value={currentProtein}
              max={nutritionGoals?.dailyProtein ?? 0}
              height="sm"
              color="secondary"
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Glucides</span>
            <Calendar size={16} className="text-blue-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {Math.round(currentCarbs)}g
              </span>
              <span className="text-sm text-muted-foreground">
                / {nutritionGoals?.dailyCarbs ?? 0}g
              </span>
            </div>
            <ProgressBar
              value={currentCarbs}
              max={nutritionGoals?.dailyCarbs ?? 0}
              height="sm"
              color="accent"
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Lipides</span>
            <Heart size={16} className="text-red-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {Math.round(currentFat)}g
              </span>
              <span className="text-sm text-muted-foreground">
                / {nutritionGoals?.dailyFat ?? 0}g
              </span>
            </div>
            <ProgressBar
              value={currentFat}
              max={nutritionGoals?.dailyFat ?? 0}
              height="sm"
              color="accent"
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Eau</span>
            <Droplets size={16} className="text-blue-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {waterIntake}ml
              </span>
              <span className="text-sm text-muted-foreground">
                / {nutritionGoals?.dailyWater ?? 0}ml
              </span>
            </div>
            <ProgressBar
              value={waterIntake}
              max={nutritionGoals?.dailyWater ?? 0}
              height="sm"
              color="primary"
            />
            <div className="flex flex-wrap gap-1 mt-2">
              <button
                onClick={() => handleWaterUpdate(250)}
                className="btn btn-outline btn-sm text-xs px-1.5 py-1 min-w-0 flex-shrink-0"
              >
                +250ml
              </button>
              <button
                onClick={() => handleWaterUpdate(500)}
                className="btn btn-outline btn-sm text-xs px-1.5 py-1 min-w-0 flex-shrink-0"
              >
                +500ml
              </button>
              <button
                onClick={() => handleWaterUpdate(-250)}
                className="btn btn-outline btn-sm text-xs px-1.5 py-1 min-w-0 flex-shrink-0"
              >
                -250ml
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommandations IA */}
          {dietAnalysis && dietAnalysis.recommendations.length > 0 && (
            <Card title="Recommandations IA">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${dietAnalysis.overallScore >= 80
                        ? "bg-green-500"
                        : dietAnalysis.overallScore >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                        }`}
                    ></div>
                    <span className="text-lg font-semibold text-foreground">
                      Score: {dietAnalysis.overallScore}/100
                    </span>
                  </div>
                  <Badge
                    variant={
                      dietAnalysis.weeklyTrend === "improving"
                        ? "success"
                        : dietAnalysis.weeklyTrend === "declining"
                          ? "error"
                          : "default"
                    }
                  >
                    {dietAnalysis.weeklyTrend === "improving"
                      ? "📈 En amélioration"
                      : dietAnalysis.weeklyTrend === "declining"
                        ? "📉 En baisse"
                        : "➡️ Stable"}
                  </Badge>
                </div>

                <AnimatePresence>
                  {dietAnalysis?.recommendations?.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${rec.type === "warning"
                        ? "border-red-500 bg-red-50/50 dark:bg-red-900/10"
                        : rec.type === "improvement"
                          ? "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10"
                          : rec.type === "achievement"
                            ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
                            : "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          {getRecommendationIcon(rec.type)}
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              {rec.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {rec.description}
                            </p>
                            {rec.suggestedFoods &&
                              rec.suggestedFoods.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  <span className="text-xs text-muted-foreground mr-2">
                                    Suggestions:
                                  </span>
                                  {rec.suggestedFoods.map((food) => (
                                    <button
                                      key={food}
                                      onClick={() => {
                                        setFoodSearchQuery(food);
                                        handleFoodSearch(food);
                                        setIsAddMealModalOpen(true);
                                      }}
                                      className="bg-primary/10 text-primary px-2 py-1 rounded text-xs hover:bg-primary/20 transition-colors"
                                    >
                                      {food}
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                        <button
                          onClick={() => dismissRecommendation(rec.id)}
                          className="text-muted-foreground hover:text-foreground p-1 ml-2"
                          title="Ignorer cette recommandation"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          )}

          {/* Graphiques nutritionnels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Répartition des macronutriments">
              <NutritionChart
                currentDay={currentDayNutrition}
                goals={nutritionGoals}
              />
            </Card>
            <Card title="Tendance des calories (7 jours)">
              <WeeklyNutritionTrend
                dailyNutrition={dailyNutrition!}
                type="calories"
              />
            </Card>
          </div>

          {/* Repas du jour */}
          <Card title="Repas d'aujourd'hui">
            {currentDayNutrition?.meals &&
              currentDayNutrition.meals.length > 0 ? (
              <div className="space-y-4">
                {["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
                  const mealsOfType = currentDayNutrition.meals.filter(
                    (meal) => meal.mealType === mealType
                  );
                  if (mealsOfType.length === 0) return null;

                  const mealNutrition = {
                    calories: mealsOfType.reduce((sum, meal) => {
                      const multiplier =
                        meal.unit === "g" ? meal.quantity / 100 : meal.quantity;
                      return sum + meal.foodItem.calories * multiplier;
                    }, 0),
                    protein: mealsOfType.reduce((sum, meal) => {
                      const multiplier =
                        meal.unit === "g" ? meal.quantity / 100 : meal.quantity;
                      return sum + meal.foodItem.protein * multiplier;
                    }, 0),
                  };

                  return (
                    <motion.div
                      key={mealType}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-border rounded-lg p-4 bg-background"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getMealIcon(mealType)}
                          <h4 className="font-semibold text-foreground capitalize">
                            {mealType === "breakfast"
                              ? "Petit-déjeuner"
                              : mealType === "lunch"
                                ? "Déjeuner"
                                : mealType === "dinner"
                                  ? "Dîner"
                                  : "Collation"}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-foreground">
                            {Math.round(mealNutrition.calories)} cal
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {Math.round(mealNutrition.protein)}g protéines
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {mealsOfType.map((meal) => (
                          <div
                            key={meal.id}
                            className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {meal.foodItem.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {meal.quantity}
                                  {meal.unit}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {Math.round(
                                  meal.foodItem.calories *
                                  (meal.unit === "g"
                                    ? meal.quantity / 100
                                    : meal.quantity)
                                )}{" "}
                                cal •
                                {Math.round(
                                  meal.foodItem.protein *
                                  (meal.unit === "g"
                                    ? meal.quantity / 100
                                    : meal.quantity)
                                )}
                                g protéines
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleShareMeal(meal.id)}
                                className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded"
                                title="Partager ce repas"
                              >
                                <Share2 size={14} />
                              </button>
                              <button
                                onClick={() => deleteMeal(currentDayNutrition.date, meal.id)}
                                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded"
                                title="Supprimer ce repas"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChefHat
                  size={48}
                  className="mx-auto text-muted-foreground mb-4"
                />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucun repas enregistré
                </h3>
                <p className="text-muted-foreground mb-4">
                  Commencez à suivre votre alimentation dès maintenant
                </p>
                <button
                  onClick={() => setIsAddMealModalOpen(true)}
                  className="btn btn-primary"
                >
                  <Plus size={16} className="mr-2" />
                  Ajouter votre premier repas
                </button>
              </div>
            )}
          </Card>

          {/* Notes du jour */}
          <Card title="Notes du jour">
            <div className="space-y-3">
              <textarea
                value={dailyNotes}
                onChange={(e) => setDailyNotes(e.target.value)}
                placeholder="Comment vous sentez-vous aujourd'hui ? Notez vos observations sur votre alimentation, votre énergie, vos envies..."
                className="input w-full h-24 resize-none"
              />
              <button
                onClick={handleSaveDailyNotes}
                className="btn btn-primary btn-sm"
              >
                Sauvegarder les notes
              </button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Feed social - only if sharing enabled */}
          {canShare ? (
            <SocialFeed />
          ) : (
            <Card title="Fonctionnalités sociales">
              <div className="text-center py-6">
                <Users
                  size={32}
                  className="mx-auto text-muted-foreground mb-3"
                />
                <h3 className="font-medium text-foreground mb-2">
                  Partage désactivé
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Activez le partage de données nutritionnelles dans vos
                  paramètres pour accéder aux fonctionnalités sociales.
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate("/settings?tab=privacy&section=dataSharing")
                  }
                  className="btn-sm"
                >
                  Aller aux paramètres
                </Button>
              </div>
            </Card>
          )}

          {/* Analyse IA */}
          <Card title="Analyse IA">
            <div className="space-y-4">
              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold text-white mb-2 ${dietAnalysis && dietAnalysis.overallScore >= 80
                    ? "bg-green-500"
                    : dietAnalysis && dietAnalysis.overallScore >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                    }`}
                >
                  {dietAnalysis && dietAnalysis.overallScore}
                </div>
                <p className="text-sm text-muted-foreground">
                  Score nutritionnel
                </p>
              </div>

              {dietAnalysis && dietAnalysis.strengths.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                    <CheckCircle size={14} />
                    Points forts
                  </h4>
                  <div className="space-y-1">
                    {dietAnalysis.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-foreground">
                          {strength}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dietAnalysis && dietAnalysis.areasForImprovement.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                    <AlertTriangle size={14} />À améliorer
                  </h4>
                  <div className="space-y-1">
                    {dietAnalysis.areasForImprovement.map((area, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-xs text-foreground">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Statistiques */}
          <Card title="Statistiques">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Calories/semaine
                </span>
                <span className="font-semibold text-foreground">
                  {Math.round(dietStats.avgCalories)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Protéines/semaine
                </span>
                <span className="font-semibold text-foreground">
                  {Math.round(dietStats.avgProtein)}g
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Série de jours
                </span>
                <span className="font-semibold text-foreground">
                  {dietStats.streakDays} jours
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Repas enregistrés
                </span>
                <span className="font-semibold text-foreground">
                  {dietStats.maxCalories}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Aliment favori
                </span>
                <span className="font-semibold text-foreground text-xs">
                  {/* {dietStats.favoriteFood} */}
                </span>
              </div>
            </div>
          </Card>

          {/* Amis actifs */}
          <Card title="Amis actifs">
            <div className="space-y-3">
              {friends
                .filter((f) => f.isOnline)
                .slice(0, 4)
                .map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative">
                      <ProfileNameCircle name={getInitials(friend.name)} radius={12}/>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">
                        {friend.name}
                      </span>
                      <p className="text-xs text-muted-foreground">En ligne</p>
                    </div>
                    <button className="p-1 text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle size={14} />
                    </button>
                  </div>
                ))}
              {friends.filter((f) => f.isOnline).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun ami en ligne
                </p>
              )}
            </div>
          </Card>

          {/* Repas partagés récents */}
          <Card title="Repas partagés">
            <div className="space-y-4">
              {sharedMeals.slice(0, 3).map((sharedMeal) => (
                <div
                  key={sharedMeal.id}
                  className="border border-border rounded-lg p-3 bg-background"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={sharedMeal.user.profileImage}
                      alt={sharedMeal.user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {sharedMeal.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(sharedMeal.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {sharedMeal.meal.foodItem.name}
                  </p>
                  {sharedMeal.description && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {sharedMeal.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs">
                    <button
                      onClick={() => likeMeal(sharedMeal.id)}
                      className={`flex items-center gap-1 transition-colors ${sharedMeal.isLiked
                        ? "text-red-500"
                        : "text-muted-foreground hover:text-red-500"
                        }`}
                    >
                      <Heart
                        size={12}
                        fill={sharedMeal.isLiked ? "currentColor" : "none"}
                      />
                      {sharedMeal.likes}
                    </button>
                    <button
                      onClick={() => {
                        const comment = prompt("Ajouter un commentaire:");
                        if (comment) addComment(sharedMeal.id, comment);
                      }}
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageCircle size={12} />
                      {sharedMeal.comments.length}
                    </button>
                  </div>
                </div>
              ))}
              {sharedMeals.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun repas partagé récemment
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal d'ajout de repas */}
      <Modal
        isOpen={isAddMealModalOpen}
        onClose={() => {
          setIsAddMealModalOpen(false);
          setSelectedFood(null);
          setFoodSearchQuery("");
          setSearchResults([]);
        }}
        title="Ajouter un repas"
        size="lg"
      >
        <div className="space-y-6">
          {/* Type de repas */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Type de repas
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "breakfast",
                  label: "Petit-déjeuner",
                  icon: <Coffee size={16} />,
                },
                { value: "lunch", label: "Déjeuner", icon: <Sun size={16} /> },
                { value: "dinner", label: "Dîner", icon: <Moon size={16} /> },
                {
                  value: "snack",
                  label: "Collation",
                  icon: <Sunset size={16} />,
                },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedMealType(type.value as any)}
                  className={`p-3 rounded-lg border flex items-center gap-2 text-sm transition-all ${selectedMealType === type.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions IA */}
          {suggestions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Suggestions IA pour ce repas
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setFoodSearchQuery(food.name);
                      setSearchResults([]);
                    }}
                    className="p-2 bg-primary/10 text-primary rounded-lg text-xs hover:bg-primary/20 transition-colors flex items-center gap-1"
                  >
                    <Lightbulb size={12} />
                    {food.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recherche d'aliment */}
          <div>
            {
              !selectedFood && (
                <>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Rechercher un aliment
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={foodSearchQuery}
                      onChange={(e) => handleFoodSearch(e.target.value)}
                      placeholder="Ex: pizza, salade, poulet..."
                      className="pl-10"
                    />
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      size={16}
                    />
                  </div>
                </>
              )}

            {searchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-border rounded-lg bg-background">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setSearchResults([]);
                      setFoodSearchQuery("");
                    }}
                    className="w-full p-3 text-left hover:bg-muted flex justify-between items-center transition-colors"
                  >
                    <div>
                      <span className="font-medium text-foreground">
                        {food.name}
                      </span>
                      <div className="text-xs text-muted-foreground mt-1">
                        Protéines: {food.protein}g • Glucides: {food.carbs}g
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {food.calories} cal
                    </span>
                  </button>
                ))}
              </div>
            )}

            {selectedFood && <div className="relative mt-2 max-h-48 overflow-y-auto border border-border rounded-lg bg-background">
              <div
                className="w-full p-3 pr-8 text-left flex justify-between items-center"
              >
                <div>
                  <span className="font-medium text-foreground">
                    {selectedFood!.name}
                  </span>
                  <div className="text-xs text-muted-foreground mt-1">
                    Protéines: {selectedFood!.protein}g • Glucides: {selectedFood!.carbs}g
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {selectedFood!.calories} cal
                </span>
              </div>
              <button
                onClick={() => setSelectedFood(null)}
                className="absolute top-1 right-1 p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
                aria-label="Désélectionner l'aliment"
              >
                <X size={14} />
              </button>
            </div>}

            {!selectedFood && foodSearchQuery.length > 2 && searchResults.length === 0 && (
              <div className="mt-2 p-3 border border-border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Aliment non trouvé pour "<strong>{foodSearchQuery}</strong>"
                </p>
                <button
                  onClick={() => setIsCreateFoodModalOpen(true)}
                  className="btn btn-outline btn-sm"
                >
                  <Plus size={14} className="mr-1" />
                  Créer un aliment personnalisé
                </button>
              </div>
            )}
          </div>

          {/* Quantité */}
          {selectedFood && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Quantité
                </label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Unité
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as "g" | "portion")}
                  className="input w-full"
                >
                  <option value="g">Grammes</option>
                  <option value="portion">Portion</option>
                </select>
              </div>
            </div>
          )}

          {/* Aperçu nutritionnel */}
          {selectedFood && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target size={16} />
                Aperçu nutritionnel
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calories:</span>
                  <span className="font-semibold">
                    {Math.round(
                      selectedFood.calories *
                      (unit === "g" ? quantity / 100 : quantity)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protéines:</span>
                  <span className="font-semibold">
                    {Math.round(
                      selectedFood.protein *
                      (unit === "g" ? quantity / 100 : quantity)
                    )}
                    g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Glucides:</span>
                  <span className="font-semibold">
                    {Math.round(
                      selectedFood.carbs *
                      (unit === "g" ? quantity / 100 : quantity)
                    )}
                    g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lipides:</span>
                  <span className="font-semibold">
                    {Math.round(
                      selectedFood.fat *
                      (unit === "g" ? quantity / 100 : quantity)
                    )}
                    g
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddMealModalOpen(false);
                setSelectedFood(null);
                setFoodSearchQuery("");
                setSearchResults([]);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleAddMeal} disabled={!selectedFood || isAddingMeal}>
              {isAddingMeal ? <><Spiner /> Enregistrement en cours ...</> : "Ajouter le repas"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de création d'aliment personnalisé */}
      <Modal
        isOpen={isCreateFoodModalOpen}
        onClose={() => setIsCreateFoodModalOpen(false)}
        title="Créer un aliment personnalisé"
        size="md"
      >
        <form>
          <div className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="name" className="text-sm font-medium text-foreground mb-1">
                Nom de l'aliment <RequiredInputStar />
              </label>
              <Input
                type="text"
                value={customFoodForm.name}
                onChange={(e) =>
                  setCustomFoodForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nom de l'aliment"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="calories" className="text-sm font-medium text-foreground mb-1">
                  Calories (pour 100g) <RequiredInputStar />
                </label>
                <Input
                  type="number"
                  value={customFoodForm.calories}
                  onChange={(e) =>
                    setCustomFoodForm((prev) => ({
                      ...prev,
                      calories: e.target.value,
                    }))
                  }
                  placeholder="Calories (pour 100g)"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="protein" className="text-sm font-medium text-foreground mb-1">Protéines (g)</label>
                <Input
                  type="number"
                  value={customFoodForm.protein}
                  onChange={(e) =>
                    setCustomFoodForm((prev) => ({
                      ...prev,
                      protein: e.target.value,
                    }))
                  }
                  placeholder="Protéines (g)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="carbs" className="text-sm font-medium text-foreground mb-1">Glucides (g)</label>
                <Input
                  type="number"
                  value={customFoodForm.carbs}
                  onChange={(e) =>
                    setCustomFoodForm((prev) => ({
                      ...prev,
                      carbs: e.target.value,
                    }))
                  }
                  placeholder="Glucides (g)"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="fat" className="text-sm font-medium text-foreground mb-1">Lipides (g)</label>
                <Input
                  type="number"
                  value={customFoodForm.fat}
                  onChange={(e) =>
                    setCustomFoodForm((prev) => ({ ...prev, fat: e.target.value }))
                  }
                  placeholder="Lipides (g)"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="fiber" className="text-sm font-medium text-foreground mb-1">Fibres (g) - optionnel</label>
              <Input
                type="number"
                value={customFoodForm.fiber}
                onChange={(e) =>
                  setCustomFoodForm((prev) => ({ ...prev, fiber: e.target.value }))
                }
                placeholder="Fibres (g) - optionnel"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateFoodModalOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateCustomFood} type="button">
                {isSavingNewFood ? <><Spiner /> Enregistrement en cours ...</> : "Créer l'aliment"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal des objectifs nutritionnels */}
      <Modal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        title="Objectifs nutritionnels"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Calories quotidiennes
              </label>
              <Input
                type="number"
                value={goalsForm.dailyCalories}
                onChange={(e) =>
                  setGoalsForm((prev) => ({
                    ...prev,
                    dailyCalories: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Protéines (g)
              </label>
              <Input
                type="number"
                value={goalsForm.dailyProtein}
                onChange={(e) =>
                  setGoalsForm((prev) => ({
                    ...prev,
                    dailyProtein: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Glucides (g)
              </label>
              <Input
                type="number"
                value={goalsForm.dailyCarbs}
                onChange={(e) =>
                  setGoalsForm((prev) => ({
                    ...prev,
                    dailyCarbs: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Lipides (g)
              </label>
              <Input
                type="number"
                value={goalsForm.dailyFat}
                onChange={(e) =>
                  setGoalsForm((prev) => ({
                    ...prev,
                    dailyFat: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Eau quotidienne (ml)
            </label>
            <Input
              type="number"
              value={goalsForm.dailyWater}
              onChange={(e) =>
                setGoalsForm((prev) => ({
                  ...prev,
                  dailyWater: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsGoalsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleUpdateGoals}>Sauvegarder</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Diet;
