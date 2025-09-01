const {
  FoodItem,
  DailyNutrition,
  NutritionGoals,
  sequelize,
  Sequelize,
} = require("../../models");
const { serverMessage } = require("../../utils");
const {
  createFoodValidator,
  mealEntryValidator,
  nutritionGoalsValidator,
} = require("./../../validators");
const Op = Sequelize.Op; // Importez Op

module.exports = {
  // Rechercher des aliments
  searchFoods: async (req, res) => {
    try {
      const { q, category, limit = 20 } = req.query;

      if (!q || q.trim().length < 2) {
        return serverMessage(res, "SEARCH_QUERY_TOO_SHORT");
      }

      const where = {
        [Op.or]: [{ isPublic: true }, { createdBy: req.user.id }],
        name: {
          [Op.iLike]: `%${q}%`,
        },
      };

      if (category && category !== "all") {
        where.category = category;
      }

      const foods = await FoodItem.findAll({
        where: where,
        limit: parseInt(limit),
        order: [["name", "ASC"]],
      });

      return serverMessage(res, "FOODS_FOUND", foods);
    } catch (error) {
      console.error("Erreur lors de la recherche d'aliments:", error);
      return serverMessage(res);
    }
  },

  // Créer un nouvel aliment personnalisé
  createFood: async (req, res) => {
    try {
      const { error, value } = createFoodValidator.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return serverMessage(res, errorMessages[0]);
      }

      const food = await FoodItem.create({
        ...value,
        isCustom: true,
        createdBy: req.user.id,
      });

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
        return serverMessage(res, "INVALID_DATE_FORMAT");
      }

      // Normaliser la date (sans l'heure)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const dailyNutrition = await DailyNutrition.findOne({
        where: {
          user_id: req.user.id,
          date: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      if (!dailyNutrition) {
        return serverMessage(res, "NO_NUTRITION_DATA");
      }

      // Récupérer les FoodItems complets pour chaque meal
      const mealsWithFoodItems = await Promise.all(
        dailyNutrition.meals.map(async (meal) => {
          if (meal.foodItem_id) {
            const foodItem = await FoodItem.findByPk(meal.foodItem_id);
            return {
              ...meal,
              foodItem: foodItem, // Ajouter l'objet foodItem complet
            };
          }
          return meal;
        })
      );

      // Créer une copie de l'objet dailyNutrition avec les meals peuplés
      const populatedDailyNutrition = {
        ...dailyNutrition.toJSON(),
        meals: mealsWithFoodItems,
      };

      return serverMessage(res, "SUCCESS", populatedDailyNutrition);
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
      const { error, value } = mealEntryValidator.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return serverMessage(res, errorMessages[0]);
      }

      const date = new Date(req.params.date);

      if (isNaN(date.getTime())) {
        return serverMessage(res, "INVALID_DATE_FORMAT");
      }

      // Vérifier que l'aliment existe
      const foodItem = await FoodItem.findByPk(value.foodItem_id);
      if (!foodItem) {
        return serverMessage(res, "FOOD_NOT_FOUND");
      }

      // Normaliser la date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Trouver ou créer l'entrée nutritionnelle du jour
      let [dailyNutrition] = await DailyNutrition.findOrCreate({
        where: {
          user_id: req.user.id,
          date: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
        defaults: {
          user_id: req.user.id,
          date: date,
          meals: [],
          waterIntake: 0,
        },
      });

      // Ajouter le repas
      const mealEntry = {
        foodItem_id: value.foodItem_id,
        quantity: value.quantity,
        unit: value.unit,
        mealType: value.mealType,
        timestamp: value.timestamp || new Date(),
      };

      // Mettre à jour le tableau des meals
      const updatedMeals = [...dailyNutrition.meals, mealEntry];
      await dailyNutrition.update({ meals: updatedMeals });

      // Récupérer les FoodItems complets pour chaque meal
      const mealsWithFoodItems = await Promise.all(
        dailyNutrition.meals.map(async (meal) => {
          if (meal.foodItem_id) {
            const foodItem = await FoodItem.findByPk(meal.foodItem_id);
            return {
              ...meal,
              foodItem: foodItem, // Ajouter l'objet foodItem complet
            };
          }
          return meal;
        })
      );

      // Créer une copie de l'objet dailyNutrition avec les meals peuplés
      const populatedDailyNutrition = {
        ...dailyNutrition.toJSON(),
        meals: mealsWithFoodItems,
      };

      return serverMessage(res, "MEAL_ADDED", populatedDailyNutrition);
    } catch (error) {
      console.error("Erreur lors de l'ajout du repas:", error);
      return serverMessage(res);
    }
  },

  // Supprimer un repas
  deleteMeal: async (req, res) => {
    try {
      const date = new Date(req.params.date);

      // Normaliser la date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const dailyNutrition = await DailyNutrition.findOne({
        where: {
          user_id: req.user.id,
          date: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      if (!dailyNutrition) {
        return serverMessage(res, "NO_NUTRITION_DATA");
      }

      // Filtrer le repas à supprimer
      dailyNutrition.meals = dailyNutrition.meals.filter(
        (meal) => meal.id !== req.params.meal_id
      );

      await dailyNutrition.save();
      await dailyNutrition.calculateTotals();

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
        return serverMessage(res, "INVALID_WATER_INTAKE");
      }

      const date = new Date(req.params.date);

      // Normaliser la date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      let [dailyNutrition] = await DailyNutrition.findOrCreate({
        where: {
          user_id: req.user.id,
          date: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      if (dailyNutrition) {
        dailyNutrition.waterIntake = waterIntake;
        await dailyNutrition.save();
      }

      // Récupérer les FoodItems complets pour chaque meal
      const mealsWithFoodItems = await Promise.all(
        dailyNutrition.meals.map(async (meal) => {
          if (meal.foodItem_id) {
            const foodItem = await FoodItem.findByPk(meal.foodItem_id);
            return {
              ...meal,
              foodItem: foodItem, // Ajouter l'objet foodItem complet
            };
          }
          return meal;
        })
      );

      // Créer une copie de l'objet dailyNutrition avec les meals peuplés
      const populatedDailyNutrition = {
        ...dailyNutrition.toJSON(),
        meals: mealsWithFoodItems,
      };

      return serverMessage(res, "WATER_UPDATED", populatedDailyNutrition);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'eau:", error);
      return serverMessage(res);
    }
  },

  // Récupérer les objectifs nutritionnels
  getNutritionGoals: async (req, res) => {
    try {
      const goals = await NutritionGoals.findOne({
        where: { user_id: req.user.id },
      });

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
      console.error(
        "Erreur lors de la récupération des objectifs:",
        error.message
      );
      return serverMessage(res);
    }
  },

  // Mettre à jour les objectifs nutritionnels
  updateNutritionGoals: async (req, res) => {
    try {
      const { error, value } = nutritionGoalsValidator.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return serverMessage(res, errorMessages[0]);
      }

      const [goals, created] = await NutritionGoals.upsert(
        {
          ...value,
          user_id: req.user.id,
        },
        {
          returning: true,
        }
      );

      return serverMessage(
        res,
        created ? "GOALS_CREATED" : "GOALS_UPDATED",
        goals
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour des objectifs:", error);
      return serverMessage(res);
    }
  },

  // Analyse nutritionnelle d'un jour
  getNutritionAnalysis: async (req, res) => {
    try {
      const date = new Date(req.params.date);

      // Normaliser la date
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const [dailyNutrition, goals] = await Promise.all([
        DailyNutrition.findOne({
          where: {
            user_id: req.user.id,
            date: {
              [Op.between]: [startOfDay, endOfDay],
            },
          },
        }),
        NutritionGoals.findOne({
          where: { user_id: req.user.id },
        }),
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
      const uniqueFoods = new Set();
      if (dailyNutrition.meals && dailyNutrition.meals.length > 0) {
        for (const meal of dailyNutrition.meals) {
          if (meal.foodItem_id) {
            const foodItem = await FoodItem.findByPk(meal.foodItem_id);
            if (foodItem) {
              uniqueFoods.add(foodItem.name);
            }
          }
        }
      }

      const varietyScore = Math.min(uniqueFoods.size * 2, 15);
      score += varietyScore;

      if (uniqueFoods.size >= 6) {
        strengths.push("Alimentation variée");
      } else if (uniqueFoods.size < 4 && dailyNutrition.meals.length > 2) {
        areasForImprovement.push("Diversifier les aliments");
      }

      // Analyse des repas (15 points)
      const mealTypes = new Set();
      if (dailyNutrition.meals && dailyNutrition.meals.length > 0) {
        for (const meal of dailyNutrition.meals) {
          if (meal.mealType) {
            mealTypes.add(meal.mealType);
          }
        }
      }

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
        weeklyTrend: "stable",
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

      const weeklyData = await DailyNutrition.findAll({
        where: {
          user_id: req.user.id,
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["date", "ASC"]],
      });

      // Pour chaque entrée quotidienne, peupler les FoodItems de chaque meal
      const populatedWeeklyData = await Promise.all(
        weeklyData.map(async (dailyNutrition) => {
          if (dailyNutrition.meals && dailyNutrition.meals.length > 0) {
            const mealsWithFoodItems = await Promise.all(
              dailyNutrition.meals.map(async (meal) => {
                if (meal.foodItem_id) {
                  const foodItem = await FoodItem.findByPk(meal.foodItem_id);
                  return {
                    ...meal,
                    foodItem: foodItem, // Ajouter l'objet foodItem complet
                  };
                }
                return meal;
              })
            );

            // Retourner l'objet dailyNutrition avec les meals peuplés
            return {
              ...dailyNutrition.toJSON(),
              meals: mealsWithFoodItems,
            };
          }

          // Si pas de meals, retourner l'objet tel quel
          return dailyNutrition.toJSON();
        })
      );

      return serverMessage(res, "SUCCESS", populatedWeeklyData);
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

      // Utiliser les fonctions d'agrégation de Sequelize
      const stats = await DailyNutrition.findOne({
        where: {
          user_id: user_id,
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        attributes: [
          [sequelize.fn("AVG", sequelize.col("totalCalories")), "avgCalories"],
          [sequelize.fn("AVG", sequelize.col("totalProtein")), "avgProtein"],
          [sequelize.fn("AVG", sequelize.col("waterIntake")), "avgWater"],
          [sequelize.fn("COUNT", sequelize.col("id")), "daysLogged"],
          [sequelize.fn("MAX", sequelize.col("totalCalories")), "maxCalories"],
          [sequelize.fn("MIN", sequelize.col("totalCalories")), "minCalories"],
        ],
        raw: true,
      });

      // Compter le nombre total de repas
      const allRecords = await DailyNutrition.findAll({
        where: {
          user_id: user_id,
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      let totalMeals = 0;
      for (const record of allRecords) {
        totalMeals += record.meals ? record.meals.length : 0;
      }

      const result = {
        avgCalories: parseFloat(stats?.avgCalories) || 0,
        avgProtein: parseFloat(stats?.avgProtein) || 0,
        avgWater: parseFloat(stats?.avgWater) || 0,
        totalMeals: totalMeals,
        daysLogged: parseInt(stats?.daysLogged) || 0,
        maxCalories: parseFloat(stats?.maxCalories) || 0,
        minCalories: parseFloat(stats?.minCalories) || 0,
      };

      // Calculer la série de jours
      const recentDays = await DailyNutrition.findAll({
        where: {
          user_id: user_id,
          meals: {
            [Op.ne]: null,
          },
        },
        order: [["date", "DESC"]],
        limit: 30,
      });

      let streakDays = 0;
      const today = new Date();

      for (const day of recentDays) {
        const daysDiff = Math.floor((today - day.date) / (1000 * 60 * 60 * 24));
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
