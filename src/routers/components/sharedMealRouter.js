const express = require('express');
const router = express.Router();
const {
  shareMeal,
  commentOnSharedMeal,
  getSharedMealsFeed,
} = require('../../controllers/components/sharedMealController');
const { authorize } = require("../../middlewares/authMiddleware");

router.post('/meals/:mealId/share', authorize, shareMeal);
router.post('/:sharedMealId/comment', authorize, commentOnSharedMeal);
router.get('/', authorize, getSharedMealsFeed);

module.exports = router;