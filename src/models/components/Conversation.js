const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Conversation = sequelize.define(
    "Conversation",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      last_message_id: {
        type: DataTypes.UUID,
        references: {
          model: "messages",
          key: "id",
        },
      },
      lastActivity: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "conversations",
      indexes: [
        {
          fields: ["lastActivity"],
        },
      ],
    }
  );
  Conversation.associate = (models) => {
    Conversation.belongsTo(models.Message, {
      foreignKey: "last_message_id",
      as: "lastMessage",
    });

    Conversation.belongsToMany(models.Users, {
      through: models.ConversationParticipant,
      foreignKey: "conversation_id",
      as: "participants",
    });

    Conversation.hasMany(models.Message, {
      foreignKey: "conversation_id",
      as: "messages",
    });
  };

  return Conversation;
};
