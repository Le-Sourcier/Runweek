const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DietAnalysis = sequelize.define('DietAnalysis', {
    analysis_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  DietAnalysis.associate = (models) => {
    DietAnalysis.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return DietAnalysis;
};