const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const NutritionGoals = sequelize.define(
    "NutritionGoals",
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
      dailyCalories: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1000,
          max: 5000,
        },
      },
      dailyProtein: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 20,
          max: 300,
        },
      },
      dailyCarbs: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 50,
          max: 500,
        },
      },
      dailyFat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 20,
          max: 200,
        },
      },
      dailyWater: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1000,
          max: 5000,
        },
      },
      activityLevel: {
        type: DataTypes.ENUM(
          "sedentary",
          "light",
          "moderate",
          "active",
          "very_active"
        ),
        defaultValue: "moderate",
      },
      goal: {
        type: DataTypes.ENUM(
          "maintain",
          "lose_weight",
          "gain_weight",
          "build_muscle",
          "improve_performance"
        ),
        defaultValue: "maintain",
      },
    },
    {
      tableName: "nutrition_goals",
      indexes: [
        {
          unique: true,
          fields: ["user_id"],
        },
      ],
    }
  );
  // Associations
  NutritionGoals.associate = (models) => {
    NutritionGoals.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return NutritionGoals;
};
