const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // Table pour les données de sommeil
  // Table pour les sessions d'exercice
  const ExerciseSession = sequelize.define(
    "ExerciseSession",
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
      googleSessionId: {
        type: DataTypes.STRING(100),
        unique: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      activityType: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      activityName: {
        type: DataTypes.STRING(50),
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      distance: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
      },
      calories: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
      },
      averageSpeed: {
        type: DataTypes.DECIMAL(8, 2),
      },
      maxSpeed: {
        type: DataTypes.DECIMAL(8, 2),
      },
      averageHeartRate: {
        type: DataTypes.INTEGER,
      },
      maxHeartRate: {
        type: DataTypes.INTEGER,
      },
      elevation: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      route: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      splits: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      dataSource: {
        type: DataTypes.STRING(50),
        defaultValue: "google_fit",
      },
    },
    {
      tableName: "exercise_sessions",
      indexes: [
        {
          fields: ["user_id", "startTime"],
        },
        {
          fields: ["user_id", "activityType"],
        },
        {
          unique: true,
          fields: ["googleSessionId"],
        },
      ],
    }
  );

  ExerciseSession.associate = (models) => {
    ExerciseSession.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };
  return ExerciseSession;
};
