const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // Table pour les données de fréquence cardiaque
  const HeartRateData = sequelize.define(
    "HeartRateData",
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
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      heartRate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 30,
          max: 250,
        },
      },
      context: {
        type: DataTypes.ENUM("resting", "active", "exercise", "recovery"),
        defaultValue: "active",
      },
      confidence: {
        type: DataTypes.DECIMAL(3, 2),
        validate: {
          min: 0,
          max: 1,
        },
      },
      dataSource: {
        type: DataTypes.STRING(50),
        defaultValue: "google_fit",
      },
    },
    {
      tableName: "heart_rate_data",
      indexes: [
        {
          fields: ["user_id", "timestamp"],
        },
        {
          fields: ["user_id", "context"],
        },
      ],
    }
  );
  // Associations
  HeartRateData.associate = (models) => {
    // Association avec le modèle Users
    HeartRateData.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE", // Supprime les données de fréquence cardiaque si l'utilisateur est supprimé
    });
  };

  return HeartRateData;
};
