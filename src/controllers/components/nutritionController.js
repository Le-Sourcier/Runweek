
const { Profiles, NutritionGoals, MealEntry, FoodItem, DailyNutrition, DietAnalysis, NutritionRecommendation, sequelize } = require('../../models');
const { askAI } = require('../../services/askAI');
const serverMessage = require('../../utils/components/serverMessage');
const { Op } = require('sequelize');
const { getAge } = require('../../utils/components/utils');



const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's profile, goals, and recent stats
    const profile = await Profiles.findOne({ where: { user_id: userId } });
    const goals = await NutritionGoals.findOne({ where: { user_id: userId } });
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyStats = await DailyNutrition.findAll({
      where: {
        user_id: userId,
        date: {
          [Op.gte]: sevenDaysAgo,
        },
      },
      order: [['date', 'ASC']],
    });

    if (!profile || !goals) {
      return serverMessage(res, 404, { error: 'Profile or nutrition goals not found. Please set them up first.' });
    }

    // Construct the prompt for the AI
    const prompt = `
      A user wants personalized nutrition recommendations.
      Generate a detailed meal plan for one day (Breakfast, Lunch, Dinner, Snacks) and provide general advice.
      The response should be in markdown format.

      User Profile:
      - Age: ${getAge(profile.date_of_birth)}
      - Gender: ${profile.gender}
      - Height: ${profile.height} cm
      - Weight: ${profile.weight} kg
      - Fitness Goals: ${profile.fitness_goals}
      - Activity Level: ${profile.activity_level}
      - Dietary Preferences: ${profile.dietary_preferences}
      - Allergies: ${profile.allergies}

      User's Goals:
      - Target Calories: ${goals.target_calories} kcal
      - Target Protein: ${goals.target_protein} g
      - Target Carbs: ${goals.target_carbs} g
      - Target Fat: ${goals.target_fat} g

      ${dailyStats.length > 0 ? `
      User's Recent Consumption (last ${dailyStats.length} days average):
      - Average Calories: ${(dailyStats.reduce((acc, stat) => acc + stat.total_calories, 0) / dailyStats.length).toFixed(2)} kcal
      - Average Protein: ${(dailyStats.reduce((acc, stat) => acc + stat.total_protein, 0) / dailyStats.length).toFixed(2)} g
      - Average Carbs: ${(dailyStats.reduce((acc, stat) => acc + stat.total_carbs, 0) / dailyStats.length).toFixed(2)} g
      - Average Fat: ${(dailyStats.reduce((acc, stat) => acc + stat.total_fat, 0) / dailyStats.length).toFixed(2)} g
      ` : ''}

      Based on all this information, provide a tailored meal plan and actionable recommendations to help the user reach their goals.
    `;

    // Call the AI service
    const recommendationText = await askAI(prompt);

    // Save the recommendation
    const recommendation = await NutritionRecommendation.create({
      user_id: userId,
      recommendation_text: recommendationText,
    });

    serverMessage(res, 200, 'Nutrition recommendation generated successfully', { recommendation });

  } catch (error) {
    console.error(error);
    serverMessage(res, 500, { error: 'An error occurred while generating nutrition recommendations' });
  }
};



const setNutritionGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { target_calories, target_protein, target_carbs, target_fat } = req.body;

    if (!target_calories || !target_protein || !target_carbs || !target_fat) {
      return serverMessage(res, 400, { error: 'Missing required fields' });
    }

    // Create or update nutrition goals
    const [goals, created] = await NutritionGoals.upsert({
      user_id: userId,
      target_calories,
      target_protein,
      target_carbs,
      target_fat,
    });

    const message = created ? 'Nutrition goals created successfully' : 'Nutrition goals updated successfully';
    serverMessage(res, 200, message, { goals });

  } catch (error) {
    console.error(error);
    serverMessage(res, 500, { error: 'An error occurred while setting nutrition goals' });
  }
};

const logMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { meal_type, food_items } = req.body;

    if (!meal_type || !food_items || !Array.isArray(food_items) || food_items.length === 0) {
      return serverMessage(res, 400, { error: 'Missing or invalid required fields' });
    }

    // Optional: Validate that the food items exist in the database
    const foodItemIds = food_items.map(item => item.food_item_id);
    const existingFoodItems = await FoodItem.findAll({ where: { id: foodItemIds } });
    if (existingFoodItems.length !== foodItemIds.length) {
      return serverMessage(res, 400, { error: 'One or more food items not found' });
    }

    const meal = await MealEntry.create({
      user_id: userId,
      meal_type,
      food_items,
    });

    serverMessage(res, 201, 'Meal logged successfully', { meal });

  } catch (error) {
    console.error(error);
    serverMessage(res, 500, { error: 'An error occurred while logging the meal' });
  }
};

const getDailyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);

    // Check if stats for this date already exist
    let dailyStats = await DailyNutrition.findOne({
      where: {
        user_id: userId,
        date: queryDate,
      },
    });

    if (dailyStats) {
      return serverMessage(res, 200, 'Daily stats retrieved successfully', { dailyStats });
    }

    // If not, calculate them
    const meals = await MealEntry.findAll({
      where: {
        user_id: userId,
        createdAt: {
          [Op.gte]: queryDate,
          [Op.lt]: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (meals.length === 0) {
      return serverMessage(res, 404, { error: 'No meals found for this date' });
    }

    let total_calories = 0;
    let total_protein = 0;
    let total_carbs = 0;
    let total_fat = 0;

    for (const meal of meals) {
      for (const item of meal.food_items) {
        const foodItem = await FoodItem.findByPk(item.food_item_id);
        if (foodItem) {
          total_calories += foodItem.calories * item.quantity;
          total_protein += foodItem.protein * item.quantity;
          total_carbs += foodItem.carbs * item.quantity;
          total_fat += foodItem.fat * item.quantity;
        }
      }
    }

    dailyStats = await DailyNutrition.create({
      user_id: userId,
      date: queryDate,
      total_calories,
      total_protein,
      total_carbs,
      total_fat,
    });

    serverMessage(res, 200, 'Daily stats calculated and retrieved successfully', { dailyStats });

  } catch (error) {
    console.error(error);
    serverMessage(res, 500, { error: 'An error occurred while retrieving daily stats' });
  }
};

const analyzeDiet = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's nutrition goals
    const goals = await NutritionGoals.findOne({ where: { user_id: userId } });
    if (!goals) {
      return serverMessage(res, 404, { error: 'Nutrition goals not found. Please set your goals first.' });
    }

    // Get user's daily nutrition stats for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyStats = await DailyNutrition.findAll({
      where: {
        user_id: userId,
        date: {
          [Op.gte]: sevenDaysAgo,
        },
      },
      order: [['date', 'ASC']],
    });

    if (dailyStats.length === 0) {
      return serverMessage(res, 404, { error: 'Not enough daily nutrition data to analyze. Please log your meals for a few days.' });
    }

    // Construct the prompt for the AI
    const prompt = `
      A user wants an analysis of their diet over the last ${dailyStats.length} days.
      Provide a constructive and encouraging analysis based on their goals and their actual consumption.
      The response should be in markdown format.

      User's Goals:
      - Target Calories: ${goals.target_calories} kcal
      - Target Protein: ${goals.target_protein} g
      - Target Carbs: ${goals.target_carbs} g
      - Target Fat: ${goals.target_fat} g

      User's Consumption Data (last ${dailyStats.length} days):
      ${dailyStats.map(stat => `
      - Date: ${stat.date}
        - Calories: ${stat.total_calories.toFixed(2)} kcal
        - Protein: ${stat.total_protein.toFixed(2)} g
        - Carbs: ${stat.total_carbs.toFixed(2)} g
        - Fat: ${stat.total_fat.toFixed(2)} g
      `).join('')}

      Please analyze the user's adherence to their goals, identify trends, and provide actionable advice for improvement.
    `;

    // Call the AI service
    const analysisText = await askAI(prompt);

    // Save the analysis
    const dietAnalysis = await DietAnalysis.create({
      user_id: userId,
      analysis_text: analysisText,
    });

    serverMessage(res, 200, 'Diet analysis generated successfully', { dietAnalysis });

  } catch (error) {
    console.error(error);
    serverMessage(res, 500, { error: 'An error occurred while analyzing the diet' });
  }
};

module.exports = {
  setNutritionGoals,
  logMeal,
  getDailyStats,
  analyzeDiet,
  getRecommendations,
};
