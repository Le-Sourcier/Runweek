const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Goal = sequelize.define(
    "Goal",
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
      description: {
        type: DataTypes.TEXT,
        validate: {
          len: [0, 500],
        },
      },
      category: {
        type: DataTypes.ENUM(
          "distance",
          "speed",
          "consistency",
          "event",
          "other"
        ),
        allowNull: false,
      },
      target: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      current: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      unit: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      deadline: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      completedAt: {
        type: DataTypes.DATE,
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high"),
        defaultValue: "medium",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      progress: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      progressPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
    },
    {
      tableName: "goals",
      indexes: [
        {
          fields: ["user_id", "completed"],
        },
        {
          fields: ["user_id", "deadline"],
        },
        {
          fields: ["category"],
        },
        {
          fields: ["isActive"],
        },
        {
          fields: ["progressPercentage"], // Nouvel index
        },
      ],
    }
  );

  Goal.associate = (models) => {
    Goal.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  // Hook pour calculer automatiquement le pourcentage de progression
  Goal.beforeSave(async (goal) => {
    if (goal.target > 0) {
      goal.progressPercentage = Math.min(
        (goal.current / goal.target) * 100,
        100
      );
    } else {
      goal.progressPercentage = 0;
    }

    // Marquer comme complété si la progression atteint 100%
    if (goal.progressPercentage >= 100 && !goal.completed) {
      goal.completed = true;
      goal.completedAt = new Date();
    } else if (goal.progressPercentage < 100 && goal.completed) {
      goal.completed = false;
      goal.completedAt = null;
    }
  });

  // Méthode pour calculer le pourcentage de progression
  Goal.prototype.getProgressPercentage = function () {
    return this.target > 0
      ? Math.min((this.current / this.target) * 100, 100)
      : 0;
  };

  // Méthode pour vérifier si l'objectif est en retard
  Goal.prototype.isOverdue = function () {
    return !this.completed && new Date() > this.deadline;
  };

  return Goal;
};
