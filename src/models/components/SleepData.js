const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // Table pour les données de sommeil
  const SleepData = sequelize.define(
    "SleepData",
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
      bedTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      wakeTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      totalSleepMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 1440, // 24 heures max
        },
      },
      deepSleepMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      lightSleepMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      remSleepMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      awakeMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      sleepQuality: {
        type: DataTypes.ENUM("poor", "fair", "good", "excellent"),
        defaultValue: "good",
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
      tableName: "sleep_data",
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
  // Associations
  SleepData.associate = (models) => {
    SleepData.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };
  return SleepData;
};
