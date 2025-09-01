// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const DailyNutrition = sequelize.define(
//     "DailyNutrition",
//     {
//       id: {
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4,
//         primaryKey: true,
//       },
//       user_id: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         references: {
//           model: "Users",
//           key: "id",
//         },
//       },
//       date: {
//         type: DataTypes.DATEONLY,
//         allowNull: false,
//       },
//       meals: {
//         type: DataTypes.JSONB,
//         defaultValue: [],
//       },
//       totalCalories: {
//         type: DataTypes.DECIMAL(8, 2),
//         defaultValue: 0,
//       },
//       totalProtein: {
//         type: DataTypes.DECIMAL(8, 2),
//         defaultValue: 0,
//       },
//       totalCarbs: {
//         type: DataTypes.DECIMAL(8, 2),
//         defaultValue: 0,
//       },
//       totalFat: {
//         type: DataTypes.DECIMAL(8, 2),
//         defaultValue: 0,
//       },
//       waterIntake: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//       },
//       notes: {
//         type: DataTypes.TEXT,
//       },
//       mood: {
//         type: DataTypes.ENUM(
//           "excellent",
//           "good",
//           "average",
//           "poor",
//           "terrible"
//         ),
//       },
//       energyLevel: {
//         type: DataTypes.INTEGER,
//         validate: {
//           min: 1,
//           max: 10,
//         },
//       },
//     },
//     {
//       tableName: "daily_nutrition",
//       indexes: [
//         {
//           fields: ["user_id", "date"],
//         },
//       ],
//     }
//   );

//   // Méthodes pour calculer les totaux nutritionnels
//   // DailyNutrition.prototype.calculateTotals = async function () {
//   //   let totalCalories = 0;
//   //   let totalProtein = 0;
//   //   let totalCarbs = 0;
//   //   let totalFat = 0;

//   //   for (const meal of this.meals) {
//   //     if (meal.foodItemId) {
//   //       const foodItem = await sequelize.FoodItem.findByPk(meal.foodItemId);
//   //       if (foodItem) {
//   //         const multiplier =
//   //           meal.unit === "g" ? meal.quantity / 100 : meal.quantity;
//   //         totalCalories += foodItem.calories * multiplier;
//   //         totalProtein += foodItem.protein * multiplier;
//   //         totalCarbs += foodItem.carbs * multiplier;
//   //         totalFat += foodItem.fat * multiplier;
//   //       }
//   //     }
//   //   }

//   //   this.totalCalories = totalCalories;
//   //   this.totalProtein = totalProtein;
//   //   this.totalCarbs = totalCarbs;
//   //   this.totalFat = totalFat;
//   // };

//   DailyNutrition.prototype.calculateTotals = async function () {
//     let totalCalories = 0;
//     let totalProtein = 0;
//     let totalCarbs = 0;
//     let totalFat = 0;

//     for (const meal of this.meals) {
//       if (meal.foodItem_id) {
//         const foodItem = await sequelize.models.FoodItem.findByPk(
//           meal.foodItem_id
//         );
//         if (foodItem) {
//           const multiplier =
//             meal.unit === "g" ? meal.quantity / 100 : meal.quantity;
//           totalCalories += parseFloat(foodItem.calories) * multiplier;
//           totalProtein += parseFloat(foodItem.protein) * multiplier;
//           totalCarbs += parseFloat(foodItem.carbs) * multiplier;
//           totalFat += parseFloat(foodItem.fat) * multiplier;
//         }
//       }
//     }

//     this.totalCalories = totalCalories;
//     this.totalProtein = totalProtein;
//     this.totalCarbs = totalCarbs;
//     this.totalFat = totalFat;
//   };
//   // Associations
//   DailyNutrition.associate = (models) => {
//     DailyNutrition.belongsTo(models.Users, {
//       foreignKey: "user_id",
//       as: "user",
//       onDelete: "CASCADE",
//     });
//   };

//   // Hook avant sauvegarde pour recalculer les totaux
//   DailyNutrition.beforeSave(async (record) => {
//     await record.calculateTotals();
//   });

//   return DailyNutrition;
// };

const { DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

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
        // Ajouter un getter pour s'assurer que chaque meal a un ID
        get() {
          const meals = this.getDataValue("meals") || [];
          return meals.map((meal) => {
            if (!meal.id) {
              return {
                ...meal,
                id: uuidv4(), // Générer un ID si absent
              };
            }
            return meal;
          });
        },
        // Ajouter un setter pour normaliser les données
        set(value) {
          const meals = (value || []).map((meal) => {
            // Garder l'ID existant ou en générer un nouveau
            return {
              ...meal,
              id: meal.id || uuidv4(),
            };
          });
          this.setDataValue("meals", meals);
        },
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

  // Méthode pour calculer les totaux nutritionnels
  DailyNutrition.prototype.calculateTotals = async function () {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const meals = this.meals || [];

    for (const meal of meals) {
      if (meal.foodItem_id) {
        const foodItem = await sequelize.models.FoodItem.findByPk(
          meal.foodItem_id
        );
        if (foodItem) {
          const multiplier =
            meal.unit === "g" ? meal.quantity / 100 : meal.quantity;
          totalCalories += parseFloat(foodItem.calories) * multiplier;
          totalProtein += parseFloat(foodItem.protein) * multiplier;
          totalCarbs += parseFloat(foodItem.carbs) * multiplier;
          totalFat += parseFloat(foodItem.fat) * multiplier;
        }
      }
    }

    this.totalCalories = totalCalories;
    this.totalProtein = totalProtein;
    this.totalCarbs = totalCarbs;
    this.totalFat = totalFat;
  };

  // Hook pour s'assurer que chaque meal a un ID avant la sauvegarde
  DailyNutrition.beforeSave(async (record) => {
    // S'assurer que chaque meal a un ID
    const meals = (record.meals || []).map((meal) => {
      return {
        ...meal,
        id: meal.id || uuidv4(),
      };
    });

    record.meals = meals;
    await record.calculateTotals();
  });

  // Associations
  DailyNutrition.associate = (models) => {
    DailyNutrition.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return DailyNutrition;
};
