const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // Table pour les synchronisations
  const DataSync = sequelize.define(
    "DataSync",
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
      syncType: {
        type: DataTypes.ENUM("full", "incremental", "manual"),
        defaultValue: "incremental",
      },
      dataTypes: {
        type: DataTypes.JSONB,
        defaultValue: ["activity", "heartRate", "sleep", "exercise"],
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "in_progress", "completed", "failed"),
        defaultValue: "pending",
      },
      recordsProcessed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      errors: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      completedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "data_syncs",
      indexes: [
        {
          fields: ["user_id", "status"],
        },
      ],
    }
  );
  // Associations

  DataSync.associate = (models) => {
    DataSync.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };
  return DataSync;
};
