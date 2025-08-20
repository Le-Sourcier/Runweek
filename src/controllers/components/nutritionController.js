const Joi = require("joi");
const { FoodItem, DailyNutrition, NutritionGoals } = require("../../models");
const { serverMessage } = require("../../utils");

// Validation schemas
const createFoodSchema = Joi.object({
  name: Joi.string().required().trim().max(100),
  calories: Joi.number().min(0).required(),
  protein: Joi.number().min(0).required(),
  carbs: Joi.number().min(0).required(),
  fat: Joi.number().min(0).required(),
  fiber: Joi.number().min(0).default(0),
  sugar: Joi.number().min(0).default(0),
  sodium: Joi.number().min(0).default(0),
  category: Joi.string()
    .valid(
      "fruits",
      "vegetables",
      "grains",
      "protein",
      "dairy",
      "fats",
      "beverages",
      "snacks",
      "other"
    )
    .default("other"),
  brand: Joi.string().trim().allow(""),
  barcode: Joi.string().trim().allow(""),
  servingSize: Joi.object({
    amount: Joi.number().positive(),
    unit: Joi.string(),
  }).optional(),
  isPublic: Joi.boolean().default(false),
});

const mealEntrySchema = Joi.object({
  foodItem_id: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  unit: Joi.string()
    .valid("g", "portion", "ml", "cup", "tbsp", "tsp")
    .required(),
  mealType: Joi.string()
    .valid("breakfast", "lunch", "dinner", "snack")
    .required(),
  timestamp: Joi.date().iso().default(Date.now),
});

const nutritionGoalsSchema = Joi.object({
  dailyCalories: Joi.number().min(1000).max(5000).required(),
  dailyProtein: Joi.number().min(20).max(300).required(),
  dailyCarbs: Joi.number().min(50).max(500).required(),
  dailyFat: Joi.number().min(20).max(200).required(),
  dailyWater: Joi.number().min(1000).max(5000).required(),
  activityLevel: Joi.string()
    .valid("sedentary", "light", "moderate", "active", "very_active")
    .default("moderate"),
  goal: Joi.string()
    .valid(
      "maintain",
      "lose_weight",
      "gain_weight",
      "build_muscle",
      "improve_performance"
    )
    .default("maintain"),
});

module.exports = {
  // Rechercher des aliments
  searchFoods: async (req, res) => {
    try {
      const { q, category, limit = 20 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          error: true,
          message:
            "La requête de recherche doit contenir au moins 2 caractères",
        });
      }

      const filter = {
        $or: [{ isPublic: true }, { createdBy: req.user.id }],
        $text: { $search: q },
      };

      if (category && category !== "all") {
        filter.category = category;
      }

      const foods = await FoodItem.find(filter)
        .limit(parseInt(limit))
        .sort({ score: { $meta: "textScore" } })
        .lean();

      res.json({
        error: false,
        message: "Aliments trouvés avec succès",
        data: foods,
      });
    } catch (error) {
      console.error("Erreur lors de la recherche d'aliments:", error);
      res.status(500).json({
        error: true,
        message: "Erreur lors de la recherche d'aliments",
      });
    }
  },

  // Créer un nouvel aliment personnalisé
  createFood: async (req, res) => {
    try {
      const { error, value } = createFoodSchema.validate(req.body);

      if (error) {
        console.log(error.details[0].message);
        return serverMessage(res, "INVALID_FOOD_DATA");
      }

      const food = new FoodItem({
        ...value,
        isCustom: true,
        createdBy: req.user.id,
      });

      await food.save();

      return serverMessage(res, "FOOD_CREATED", food);
    } catch (error) {
      console.error("Erreur lors de la création de l'aliment:", error);
      return serverMessage(res);
    }
  },

  // Récupérer la nutrition d'un jour spécifique
  getDailyNutrition: async (req, res) => {
    try {
      const date = new Date(req.params.date);

      if (isNaN(date.getTime())) {
        console.log("Format de date invalide");
        return serverMessage(res, "INVALID_DATE_FORMAT");
      }

      const dailyNutrition = await DailyNutrition.findOne({
        user_id: req.user.id,
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      }).populate("meals.foodItem");

      if (!dailyNutrition) {
        console.log("Aucune donnée nutritionnelle pour cette date");
        return serverMessage(res, "NO_NUTRITION_DATA");
      }

      return serverMessage(res, "SUCCESS", dailyNutrition);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données nutritionnelles:",
        error
      );
      return serverMessage(res);
    }
  },

  // Ajouter un repas
  addMeal: async (req, res) => {
    try {
      const { error, value } = mealEntrySchema.validate(req.body);

      if (error) {
        console.log(error.details[0].message);
        return serverMessage(res, "INVALID_MEAL_DATA");
      }

      const date = new Date(req.params.date);

      if (isNaN(date.getTime())) {
        console.log("Format de date invalide");
        return serverMessage(res, "INVALID_DATE_FORMAT");
      }

      // Vérifier que l'aliment existe
      const foodItem = await FoodItem.findById(value.foodItem_id);
      if (!foodItem) {
        console.log("Aliment non trouvé");
        return serverMessage(res, "FOOD_NOT_FOUND");
      }

      // Trouver ou créer l'entrée nutritionnelle du jour
      let dailyNutrition = await DailyNutrition.findOne({
        user_id: req.user.id,
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      });

      if (!dailyNutrition) {
        dailyNutrition = new DailyNutrition({
          user_id: req.user.id,
          date: date,
          meals: [],
        });
      }

      // Ajouter le repas
      const mealEntry = {
        foodItem: value.foodItem_id,
        quantity: value.quantity,
        unit: value.unit,
        mealType: value.mealType,
        timestamp: value.timestamp,
      };

      dailyNutrition.meals.push(mealEntry);
      await dailyNutrition.save();

      // Repopuler pour la réponse
      await dailyNutrition.populate("meals.foodItem");

      return serverMessage(res, "MEAL_ADDED", dailyNutrition);
    } catch (error) {
      console.error("Erreur lors de l'ajout du repas:", error);
      return serverMessage(res);
    }
  },

  // Supprimer un repas
  deleteMeal: async (req, res) => {
    try {
      const date = new Date(req.params.date);

      const dailyNutrition = await DailyNutrition.findOne({
        user_id: req.user.id,
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      });

      if (!dailyNutrition) {
        console.log("Données nutritionnelles non trouvées");
        return serverMessage(res, "NO_NUTRITION_DATA");
      }

      dailyNutrition.meals = dailyNutrition.meals.filter(
        (meal) => meal.id.toString() !== req.params.meal_id
      );

      await dailyNutrition.save();

      return serverMessage(res, "MEAL_DELETED", dailyNutrition);
    } catch (error) {
      console.error("Erreur lors de la suppression du repas:", error);
      return serverMessage(res);
    }
  },

  // Mettre à jour la consommation d'eau
  updateWaterIntake: async (req, res) => {
    try {
      const { waterIntake } = req.body;

      if (typeof waterIntake !== "number" || waterIntake < 0) {
        console.log("Quantité d'eau invalide");
        return serverMessage(res, "INVALID_WATER_INTAKE");
      }

      const date = new Date(req.params.date);

      let dailyNutrition = await DailyNutrition.findOne({
        user_id: req.user.id,
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      });

      if (!dailyNutrition) {
        dailyNutrition = new DailyNutrition({
          user_id: req.user.id,
          date: date,
          meals: [],
          waterIntake: waterIntake,
        });
      } else {
        dailyNutrition.waterIntake = waterIntake;
      }

      await dailyNutrition.save();
      // await dailyNutrition.populate("meals.foodItem");
      return serverMessage(res, "WATER_UPDATED", dailyNutrition);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'eau:", error);
      return serverMessage(res);
    }
  },

  // Récupérer les objectifs nutritionnels
  getNutritionGoals: async (req, res) => {
    try {
      const goals = await NutritionGoals.findOne({ user_id: req.user.id });

      if (!goals) {
        // Retourner des objectifs par défaut
        const defaultGoals = {
          dailyCalories: 2200,
          dailyProtein: 120,
          dailyCarbs: 275,
          dailyFat: 75,
          dailyWater: 2500,
          activityLevel: "moderate",
          goal: "maintain",
        };

        return serverMessage(res, "DEFAULT_GOALS_RECOVER", defaultGoals);
      }

      return serverMessage(res, "SUCCESS", goals);
    } catch (error) {
      console.error("Erreur lors de la récupération des objectifs:", error);
      return serverMessage(res);
    }
  },

  // Mettre à jour les objectifs nutritionnels
  updateNutritionGoals: async (req, res) => {
    try {
      const { error, value } = nutritionGoalsSchema.validate(req.body);

      if (error) {
        console.log("Données invalides details: ", error.details[0].message);

        return serverMessage(res, "INVALID_NUTRITION_GOALS");
      }

      const goals = await NutritionGoals.findOneAndUpdate(
        { user_id: req.user.id },
        { ...value, user_id: req.user.id },
        { new: true, upsert: true }
      );

      return serverMessage(res, "SUCCESS", goals);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des objectifs:", error);
      return serverMessage(res);
    }
  },

  // Analyse nutritionnelle d'un jour
  getNutritionAnalysis: async (req, res) => {
    try {
      const date = new Date(req.params.date);

      const [dailyNutrition, goals] = await Promise.all([
        DailyNutrition.findOne({
          user_id: req.user.id,
          date: {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999)),
          },
        }).populate("meals.foodItem"),
        NutritionGoals.findOne({ user_id: req.user.id }),
      ]);

      if (!dailyNutrition) {
        const data = {
          message: "Aucune donnée nutritionnelle pour cette date",
          data: {
            overallScore: 0,
            recommendations: [],
            strengths: [],
            areasForImprovement: ["Commencez à enregistrer vos repas"],
            weeklyTrend: "stable",
          },
        };

        return serverMessage(res, "NO_NUTRITION_DATA", data);
      }

      const defaultGoals = {
        dailyCalories: 2200,
        dailyProtein: 120,
        dailyCarbs: 275,
        dailyFat: 75,
        dailyWater: 2500,
      };

      const nutritionGoals = goals || defaultGoals;

      // Calculer le score global
      let score = 0;
      const recommendations = [];
      const strengths = [];
      const areasForImprovement = [];

      // Analyse des calories (25 points)
      const caloriesRatio =
        dailyNutrition.totalCalories / nutritionGoals.dailyCalories;
      if (caloriesRatio >= 0.8 && caloriesRatio <= 1.2) {
        score += 25;
        strengths.push("Apport calorique équilibré");
      } else if (caloriesRatio < 0.7) {
        score += 5;
        areasForImprovement.push("Augmenter l'apport calorique");
        recommendations.push({
          type: "warning",
          title: "Apport calorique insuffisant",
          description: `Vous n'avez consommé que ${Math.round(
            dailyNutrition.totalCalories
          )} calories. Objectif: ${nutritionGoals.dailyCalories} cal.`,
          priority: "high",
          category: "calories",
        });
      } else if (caloriesRatio > 1.2) {
        score += 10;
        areasForImprovement.push("Réduire l'apport calorique");
      } else {
        score += 15;
      }

      // Analyse des protéines (25 points)
      const proteinRatio =
        dailyNutrition.totalProtein / nutritionGoals.dailyProtein;
      if (proteinRatio >= 0.9) {
        score += 25;
        strengths.push("Excellent apport en protéines");
      } else if (proteinRatio >= 0.7) {
        score += 15;
      } else {
        score += 5;
        areasForImprovement.push("Augmenter l'apport en protéines");
        recommendations.push({
          type: "improvement",
          title: "Augmentez votre apport en protéines",
          description: `Actuel: ${Math.round(
            dailyNutrition.totalProtein
          )}g, Objectif: ${nutritionGoals.dailyProtein}g.`,
          priority: "high",
          category: "protein",
        });
      }

      // Analyse de l'hydratation (20 points)
      const waterRatio = dailyNutrition.waterIntake / nutritionGoals.dailyWater;
      if (waterRatio >= 0.9) {
        score += 20;
        strengths.push("Excellente hydratation");
      } else if (waterRatio >= 0.6) {
        score += 12;
      } else {
        score += 3;
        areasForImprovement.push("Améliorer l'hydratation");
        recommendations.push({
          type: "warning",
          title: "Hydratation insuffisante",
          description: `Buvez plus d'eau ! Actuel: ${dailyNutrition.waterIntake}ml, Objectif: ${nutritionGoals.dailyWater}ml.`,
          priority: "high",
          category: "hydration",
        });
      }

      // Analyse de la variété (15 points)
      const uniqueFoods = new Set(
        dailyNutrition.meals.map((meal) => meal.foodItem.name)
      );
      const varietyScore = Math.min(uniqueFoods.size * 2, 15);
      score += varietyScore;

      if (uniqueFoods.size >= 6) {
        strengths.push("Alimentation variée");
      } else if (uniqueFoods.size < 4 && dailyNutrition.meals.length > 2) {
        areasForImprovement.push("Diversifier les aliments");
      }

      // Analyse des repas (15 points)
      const mealTypes = new Set(
        dailyNutrition.meals.map((meal) => meal.mealType)
      );
      score += mealTypes.size * 3;

      if (mealTypes.size >= 3) {
        strengths.push("Repas bien répartis");
      } else {
        areasForImprovement.push("Mieux répartir les repas");
      }

      const analysis = {
        overallScore: Math.min(Math.round(score), 100),
        recommendations,
        strengths,
        areasForImprovement,
        weeklyTrend: "stable", // Calculé séparément
      };

      return serverMessage(res, "SUCCESS", analysis);
    } catch (error) {
      console.error("Erreur lors de l'analyse nutritionnelle:", error);
      return serverMessage(res);
    }
  },

  // Récupérer les données nutritionnelles de la semaine
  getWeeklyNutrition: async (req, res) => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      const weeklyData = await DailyNutrition.find({
        user_id: req.user.id,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: 1 });

      return serverMessage(res, "SUCCESS", weeklyData);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données hebdomadaires:",
        error
      );
      return serverMessage(res);
    }
  },

  // Statistiques nutritionnelles
  getNutritionStats: async (req, res) => {
    try {
      const user_id = req.user.id;
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats = await DailyNutrition.aggregate([
        {
          $match: {
            user_id: user_id,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            avgCalories: { $avg: "$totalCalories" },
            avgProtein: { $avg: "$totalProtein" },
            avgWater: { $avg: "$waterIntake" },
            totalMeals: { $sum: { $size: "$meals" } },
            daysLogged: { $sum: 1 },
            maxCalories: { $max: "$totalCalories" },
            minCalories: { $min: "$totalCalories" },
          },
        },
      ]);

      const result = stats[0] || {
        avgCalories: 0,
        avgProtein: 0,
        avgWater: 0,
        totalMeals: 0,
        daysLogged: 0,
        maxCalories: 0,
        minCalories: 0,
      };

      // Calculer la série de jours
      const recentDays = await DailyNutrition.find({
        user_id: user_id,
        meals: { $exists: true, $not: { $size: 0 } },
      })
        .sort({ date: -1 })
        .limit(30);

      let streakDays = 0;
      const today = new Date();

      for (const day of recentDays) {
        const daysDiff = Math.floor(
          (today.getTime() - day.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff === streakDays) {
          streakDays++;
        } else {
          break;
        }
      }

      result.streakDays = streakDays;

      return serverMessage(res, "SUCCESS", result);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return serverMessage(res);
    }
  },
};
