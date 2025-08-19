const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Friend = sequelize.define('Friend', {
    status: {
      type: DataTypes.ENUM('pending', 'accepted'),
      defaultValue: 'pending',
    },
  });

  Friend.associate = (models) => {
    Friend.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user',
    });
    Friend.belongsTo(models.Users, {
      foreignKey: 'friend_id',
      as: 'friend',
    });
  };

  return Friend;
};