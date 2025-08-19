const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ActivityShare = sequelize.define(
    "ActivityShare",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      shared_by_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      activityType: {
        type: DataTypes.ENUM(
          "run",
          "achievement",
          "goal_completed",
          "personal_record",
          "nutrition"
        ),
        allowNull: false,
      },
      activityData: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        validate: {
          len: [0, 500],
        },
      },
      visibility: {
        type: DataTypes.ENUM("friends", "public"),
        defaultValue: "friends",
      },
      likes: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      comments: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "activity_shares",
      indexes: [
        {
          fields: ["shared_by_id", "createdAt"],
        },
        {
          fields: ["visibility", "createdAt"],
        },
      ],
    }
  );

  return ActivityShare;
};
