const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Report = sequelize.define(
    "Report",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      reporter_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      reported_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      reason: {
        type: DataTypes.ENUM(
          "inappropriate_content",
          "harassment",
          "spam",
          "fake_profile",
          "abusive_behavior",
          "other"
        ),
        allowNull: false,
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 1000],
        },
      },
      severity: {
        type: DataTypes.ENUM("low", "medium", "high"),
        defaultValue: "medium",
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "under_review",
          "resolved",
          "dismissed"
        ),
        defaultValue: "pending",
      },
      reviewedBy: {
        type: DataTypes.UUID,
        references: {
          model: "Users",
          key: "id",
        },
      },
      reviewedAt: {
        type: DataTypes.DATE,
      },
      action: {
        type: DataTypes.ENUM(
          "none",
          "warning",
          "temporary_ban",
          "permanent_ban",
          "content_removal"
        ),
      },
      actionDetails: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "reports",
      indexes: [
        {
          fields: ["reported_id"],
        },
        {
          fields: ["reporter_id"],
        },
        {
          fields: ["status", "createdAt"],
        },
      ],
    }
  );

  return Report;
};
