const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DataSharingPreferences = sequelize.define(
    "DataSharingPreferences",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Global toggle for data sharing",
      },
      shareNutrition: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Share nutrition data with friends",
      },
      shareActivities: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Share activity data with friends",
      },
      shareGoals: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Share goals with friends",
      },
      shareAchievements: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Share achievements with friends",
      },
      allowFriendRequests: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Allow other users to send friend requests",
      },
      showInSearch: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Show profile in user search results",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "data_sharing_preferences",
      indexes: [
        {
          unique: true,
          fields: ["user_id"],
        },
      ],
    }
  );

  DataSharingPreferences.associate = (models) => {
    DataSharingPreferences.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return DataSharingPreferences;
};
