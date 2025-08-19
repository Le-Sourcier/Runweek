const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NutritionGoals = sequelize.define('NutritionGoals', {
    target_calories: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    target_protein: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    target_carbs: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    target_fat: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });

  NutritionGoals.associate = (models) => {
    NutritionGoals.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return NutritionGoals;
};