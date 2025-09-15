// models/Suggestion.js
module.exports = (sequelize, DataTypes) => {
  const Suggestion = sequelize.define(
    "Suggestion",
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
      type: {
        type: DataTypes.ENUM(
          "motivation",
          "advices",
          "workout",
          "plan",
          "nutrition"
        ),
        allowNull: false,
      },
      frequency: {
        type: DataTypes.ENUM("daily", "3days", "weekly"),
        defaultValue: "daily",
      },
      content: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      generated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "suggestions",
      underscored: true,
      indexes: [
        {
          fields: ["user_id", "type", "frequency"],
        },
        {
          fields: ["expires_at"],
        },
      ],
    }
  );

  Suggestion.associate = function (models) {
    Suggestion.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return Suggestion;
};
