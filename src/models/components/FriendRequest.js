const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FriendRequest = sequelize.define('FriendRequest', {
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'declined'),
      defaultValue: 'pending',
    },
  });

  FriendRequest.associate = (models) => {
    FriendRequest.belongsTo(models.Users, {
      foreignKey: 'sender_id',
      as: 'sender',
    });
    FriendRequest.belongsTo(models.Users, {
      foreignKey: 'receiver_id',
      as: 'receiver',
    });
  };

  return FriendRequest;
};