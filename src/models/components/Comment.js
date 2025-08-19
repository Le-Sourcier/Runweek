const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user',
    });
    Comment.belongsTo(models.SharedMeal, {
      foreignKey: 'shared_meal_id',
      as: 'shared_meal',
    });
  };

  return Comment;
};