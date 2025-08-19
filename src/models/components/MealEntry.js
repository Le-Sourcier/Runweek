const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MealEntry = sequelize.define('MealEntry', {
    meal_type: {
      type: DataTypes.ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack'),
      allowNull: false,
    },
    food_items: {
      type: DataTypes.JSONB,
      allowNull: false, // Stores an array of { food_item_id, quantity }
    },
  });

  MealEntry.associate = (models) => {
    MealEntry.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return MealEntry;
};