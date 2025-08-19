const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SharedMeal = sequelize.define('SharedMeal', {
    // No specific fields needed here for now, relationships are key
  });

  SharedMeal.associate = (models) => {
    SharedMeal.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user',
    });
    SharedMeal.belongsTo(models.MealEntry, {
      foreignKey: 'meal_entry_id',
      as: 'meal_entry',
    });
  };

  return SharedMeal;
};