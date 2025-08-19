const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FoodItem = sequelize.define('FoodItem', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    calories: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    protein: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    carbs: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    fat: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });

  return FoodItem;
};