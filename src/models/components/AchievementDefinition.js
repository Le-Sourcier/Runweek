// models/AchievementDefinition.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AchievementDefinition = sequelize.define(
    "AchievementDefinition",
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM(
          "beginner",
          "distance",
          "speed",
          "habit",
          "consistency",
          "challenge",
          "milestone"
        ),
        allowNull: false,
      },
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      rarity: {
        type: DataTypes.ENUM("common", "rare", "epic", "legendary"),
        defaultValue: "common",
      },
      requirements: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "achievement_definitions",
      timestamps: true,
    }
  );

  return AchievementDefinition;
};
