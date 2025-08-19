const { SharedMeal, Comment, Friend, Users, MealEntry } = require('../../models');
const serverMessage = require('../../utils/components/serverMessage');
const { Op } = require('sequelize');

const shareMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mealId } = req.params;

    // Check if the meal exists and belongs to the user
    const meal = await MealEntry.findOne({ where: { id: mealId, user_id: userId } });
    if (!meal) {
        return serverMessage(res, 404, { error: 'Meal not found or does not belong to the user.' });
    }

    const sharedMeal = await SharedMeal.create({
      user_id: userId,
      meal_entry_id: mealId,
    });

    serverMessage(res, 201, 'Meal shared successfully', { sharedMeal });

  } catch (error) {
    console.error(error);
    serverMessage(res, 500, { error: 'An error occurred while sharing the meal' });
  }
};

const commentOnSharedMeal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sharedMealId } = req.params;
        const { text } = req.body;

        if (!text) {
            return serverMessage(res, 400, { error: 'Comment text is required.' });
        }

        // Check if the shared meal exists
        const sharedMeal = await SharedMeal.findByPk(sharedMealId);
        if (!sharedMeal) {
            return serverMessage(res, 404, { error: 'Shared meal not found.' });
        }

        // Check if the user is friends with the person who shared the meal
        const friend = await Friend.findOne({
            where: {
                status: 'accepted',
                [Op.or]: [
                    { user_id: userId, friend_id: sharedMeal.user_id },
                    { user_id: sharedMeal.user_id, friend_id: userId },
                ],
            },
        });

        if (!friend && userId !== sharedMeal.user_id) {
            return serverMessage(res, 403, { error: 'You can only comment on meals shared by your friends.' });
        }

        const comment = await Comment.create({
            user_id: userId,
            shared_meal_id: sharedMealId,
            text,
        });

        serverMessage(res, 201, 'Comment posted successfully', { comment });

    } catch (error) {
        console.error(error);
        serverMessage(res, 500, { error: 'An error occurred while posting the comment' });
    }
};

const getSharedMealsFeed = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get the user's friends
        const friends = await Friend.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [{ user_id: userId }, { friend_id: userId }],
            },
        });

        const friendIds = friends.map(friendship => {
            return friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
        });

        // Get shared meals from friends
        const sharedMeals = await SharedMeal.findAll({
            where: {
                user_id: {
                    [Op.in]: friendIds,
                },
            },
            include: [
                { model: Users, as: 'user', attributes: ['id', 'email'] },
                { model: MealEntry, as: 'meal_entry' },
                { model: Comment, as: 'comments', include: [{ model: Users, as: 'user', attributes: ['id', 'email'] }] },
            ],
            order: [['createdAt', 'DESC']],
        });

        serverMessage(res, 200, 'Shared meals feed retrieved successfully', { sharedMeals });

    } catch (error) {
        console.error(error);
        serverMessage(res, 500, { error: 'An error occurred while retrieving the shared meals feed' });
    }
};


module.exports = {
  shareMeal,
  commentOnSharedMeal,
  getSharedMealsFeed,
};