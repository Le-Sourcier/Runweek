const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // Table pour stocker les données d'activité quotidiennes
  const ActivityData = sequelize.define(
    "ActivityData",
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
      steps: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      distance: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      calories: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      activeMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      dataSource: {
        type: DataTypes.STRING(50),
        defaultValue: "google_fit",
      },
      rawData: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      tableName: "activity_data",
      indexes: [
        {
          unique: true,
          fields: ["user_id", "date"],
        },
        {
          fields: ["user_id", "date"],
        },
      ],
    }
  );
  // Association avec le modèle Users
  ActivityData.associate = (models) => {
    ActivityData.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
    });
  };
  return ActivityData;
};
