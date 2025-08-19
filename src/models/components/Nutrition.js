const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FoodItem = sequelize.define(
    "FoodItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      calories: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      protein: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      carbs: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      fat: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      fiber: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      sugar: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      sodium: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      isCustom: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdBy: {
        type: DataTypes.UUID,
        references: {
          model: "Users",
          key: "id",
        },
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      category: {
        type: DataTypes.ENUM(
          "fruits",
          "vegetables",
          "grains",
          "protein",
          "dairy",
          "fats",
          "beverages",
          "snacks",
          "other"
        ),
        defaultValue: "other",
      },
      barcode: {
        type: DataTypes.STRING(50),
      },
      brand: {
        type: DataTypes.STRING(100),
      },
      servingSize: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      tableName: "food_items",
      indexes: [
        {
          fields: ["name"],
        },
        {
          fields: ["category"],
        },
        {
          fields: ["isPublic", "isCustom"],
        },
        {
          fields: ["createdBy"],
        },
      ],
    }
  );
  // Associations
  FoodItem.associate = (models) => {
    FoodItem.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return FoodItem;
};
