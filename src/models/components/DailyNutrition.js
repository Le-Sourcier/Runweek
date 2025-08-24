const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DailyNutrition = sequelize.define(
    "DailyNutrition",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      meals: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      totalCalories: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
      },
      totalProtein: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
      },
      totalCarbs: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
      },
      totalFat: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
      },
      waterIntake: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      notes: {
        type: DataTypes.TEXT,
      },
      mood: {
        type: DataTypes.ENUM(
          "excellent",
          "good",
          "average",
          "poor",
          "terrible"
        ),
      },
      energyLevel: {
        type: DataTypes.INTEGER,
        validate: {
          min: 1,
          max: 10,
        },
      },
    },
    {
      tableName: "daily_nutrition",
      indexes: [
        {
          fields: ["user_id", "date"],
        },
      ],
    }
  );

  // Méthodes pour calculer les totaux nutritionnels
  DailyNutrition.prototype.calculateTotals = async function () {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const meal of this.meals) {
      if (meal.foodItemId) {
        const foodItem = await sequelize.FoodItem.findByPk(meal.foodItemId);
        if (foodItem) {
          const multiplier =
            meal.unit === "g" ? meal.quantity / 100 : meal.quantity;
          totalCalories += foodItem.calories * multiplier;
          totalProtein += foodItem.protein * multiplier;
          totalCarbs += foodItem.carbs * multiplier;
          totalFat += foodItem.fat * multiplier;
        }
      }
    }

    this.totalCalories = totalCalories;
    this.totalProtein = totalProtein;
    this.totalCarbs = totalCarbs;
    this.totalFat = totalFat;
  };
  // Associations
  DailyNutrition.associate = (models) => {
    DailyNutrition.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  // Hook avant sauvegarde pour recalculer les totaux
  DailyNutrition.beforeSave(async (record) => {
    await record.calculateTotals();
  });

  return DailyNutrition;
};
