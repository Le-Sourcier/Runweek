const { SharedMeal, Comment, Friend, Users, MealEntry } = require('../../models');
const { Op } = require('sequelize');

const shareMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mealId } = req.params;

    const meal = await MealEntry.findOne({ where: { id: mealId, user_id: userId } });
    if (!meal) {
        return res.status(404).json({ error: true, message: 'Meal not found or does not belong to the user.' });
    }

    const sharedMeal = await SharedMeal.create({
      user_id: userId,
      meal_entry_id: mealId,
    });

    return res.status(201).json({ error: false, message: 'Meal shared successfully', data: { sharedMeal } });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: 'An error occurred while sharing the meal' });
  }
};

const commentOnSharedMeal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sharedMealId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: true, message: 'Comment text is required.' });
        }

        const sharedMeal = await SharedMeal.findByPk(sharedMealId);
        if (!sharedMeal) {
            return res.status(404).json({ error: true, message: 'Shared meal not found.' });
        }

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
            return res.status(403).json({ error: true, message: 'You can only comment on meals shared by your friends.' });
        }

        const comment = await Comment.create({
            user_id: userId,
            shared_meal_id: sharedMealId,
            text,
        });

        return res.status(201).json({ error: false, message: 'Comment posted successfully', data: { comment } });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'An error occurred while posting the comment' });
    }
};

const getSharedMealsFeed = async (req, res) => {
    try {
        const userId = req.user.id;

        const friends = await Friend.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [{ user_id: userId }, { friend_id: userId }],
            },
        });

        const friendIds = friends.map(friendship => {
            return friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
        });

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

        return res.status(200).json({ error: false, message: 'Shared meals feed retrieved successfully', data: { sharedMeals } });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, message: 'An error occurred while retrieving the shared meals feed' });
    }
};


module.exports = {
  shareMeal,
  commentOnSharedMeal,
  getSharedMealsFeed,
};