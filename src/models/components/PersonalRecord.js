const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PersonalRecord = sequelize.define(
    "PersonalRecord",
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
      distance: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      time: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          is: /^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}$/,
        },
      },
      timeInSeconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        validate: {
          len: [0, 500],
        },
      },
      location: {
        type: DataTypes.STRING(100),
        validate: {
          len: [0, 100],
        },
      },
      weather: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      heartRate: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      pace: {
        type: DataTypes.STRING(10),
      },
      elevation: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      splits: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verificationSource: {
        type: DataTypes.STRING(50),
      },
      tags: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
    },
    {
      tableName: "personal_records",
      indexes: [
        {
          fields: ["user_id", "distance"],
        },
        {
          fields: ["user_id", "date"],
        },
        {
          fields: ["user_id", "timeInSeconds"],
        },
      ],
    }
  );

  // Méthode pour calculer l'allure
  PersonalRecord.prototype.calculatePace = function () {
    if (this.distance <= 0 || this.timeInSeconds <= 0) return "0:00";

    const paceInSecondsPerKm = this.timeInSeconds / this.distance;
    const minutes = Math.floor(paceInSecondsPerKm / 60);
    const seconds = Math.round(paceInSecondsPerKm % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Méthode statique pour convertir le temps en secondes
  PersonalRecord.timeStringToSeconds = function (timeString) {
    const parts = timeString.split(":").map(Number);
    let seconds = 0;

    if (parts.length === 3) {
      // HH:MM:SS
      seconds += parts[0] * 3600;
      seconds += parts[1] * 60;
      seconds += parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      seconds += parts[0] * 60;
      seconds += parts[1];
    }

    return seconds;
  };

  // Hook avant sauvegarde pour calculer timeInSeconds et pace
  PersonalRecord.beforeSave((record) => {
    if (record.time) {
      record.timeInSeconds = PersonalRecord.timeStringToSeconds(record.time);
      record.pace = record.calculatePace();
    }
  });

  // Associations
  PersonalRecord.associate = (models) => {
    PersonalRecord.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return PersonalRecord;
};
