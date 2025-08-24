// models/UserStats.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserStats = sequelize.define(
    "UserStats",
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
      },
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
      level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        validate: {
          min: 1,
          max: 100,
        },
      },
      experience: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      // total_distance: {
      //   type: DataTypes.DECIMAL(10, 2),
      //   defaultValue: 0,
      // },
      weekly_distance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      // total_runs: {
      //   type: DataTypes.INTEGER,
      //   defaultValue: 0,
      // },
      streak_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      average_pace: {
        type: DataTypes.STRING,
        defaultValue: "0:00",
      },
    },
    {
      tableName: "user_stats",
      indexes: [
        {
          unique: true,
          fields: ["user_id"],
        },
      ],
    }
  );

  UserStats.associate = (models) => {
    UserStats.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return UserStats;
};
