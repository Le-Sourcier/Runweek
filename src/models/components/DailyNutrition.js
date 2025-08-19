const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DailyNutrition = sequelize.define('DailyNutrition', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    total_calories: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total_protein: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total_carbs: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total_fat: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });

  DailyNutrition.associate = (models) => {
    DailyNutrition.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return DailyNutrition;
};