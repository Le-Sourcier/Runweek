const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NutritionRecommendation = sequelize.define('NutritionRecommendation', {
    recommendation_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  NutritionRecommendation.associate = (models) => {
    NutritionRecommendation.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
    });
  };

  return NutritionRecommendation;
};