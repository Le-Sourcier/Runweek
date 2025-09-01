// models/CalendarEvent.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CalendarEvent = sequelize.define(
    "CalendarEvent",
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
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: true,
          isAfter: new Date().toISOString().split("T")[0],
        },
      },
      time: {
        type: DataTypes.TIME,
        allowNull: true,
        validate: {
          is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
      },
      type: {
        type: DataTypes.ENUM("Run", "Bike", "Swim", "Gym", "Other"),
        allowNull: false,
      },
      distance: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 1000,
        },
      },
      duration: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
          is: /^([0-9]{1,2}:)?[0-5][0-9]:[0-5][0-9]$/,
        },
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [0, 500],
        },
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reminderSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "calendar_events",
      indexes: [
        {
          fields: ["user_id", "date"],
        },
        {
          fields: ["user_id", "completed"],
        },
        {
          fields: ["date"],
        },
      ],
    }
  );

  CalendarEvent.associate = (models) => {
    CalendarEvent.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  // Méthode pour vérifier si l'événement est dans le futur
  CalendarEvent.prototype.isFutureEvent = function () {
    const eventDateTime = new Date(`${this.date}T${this.time || "23:59"}`);
    return eventDateTime > new Date();
  };

  // Méthode pour vérifier si l'événement est aujourd'hui
  CalendarEvent.prototype.isToday = function () {
    const today = new Date().toISOString().split("T")[0];
    return this.date === today;
  };

  return CalendarEvent;
};
