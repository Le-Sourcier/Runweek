const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Message = sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      conversation_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "conversations",
          key: "id",
        },
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 1000],
        },
      },
      messageType: {
        type: DataTypes.ENUM(
          "text",
          "emoji",
          "system",
          "image",
          "video",
          "file"
        ),
        defaultValue: "text",
      },
      readBy: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      isEdited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      editedAt: {
        type: DataTypes.DATE,
      },
      reply_to_id: {
        type: DataTypes.UUID,
        references: {
          model: "messages",
          key: "id",
        },
      },
    },
    {
      tableName: "messages",
      indexes: [
        {
          fields: ["conversation_id", "createdAt"],
        },
        {
          fields: ["sender_id"],
        },
      ],
    }
  );

  Message.associate = (models) => {
    Message.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
      as: "conversation",
    });

    Message.belongsTo(models.Users, {
      foreignKey: "sender_id",
      as: "sender",
    });

    Message.belongsTo(models.Message, {
      foreignKey: "reply_to_id",
      as: "replyTo",
    });
  };

  return Message;
};
