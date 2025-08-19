const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // Table de liaison pour les participants de conversation
  const ConversationParticipant = sequelize.define(
    "ConversationParticipant",
    {
      conversation_id: {
        type: DataTypes.UUID,
        references: {
          model: "conversations",
          key: "id",
        },
      },
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: "Users",
          key: "id",
        },
      },
      joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      leftAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "conversation_participants",
      indexes: [
        {
          fields: ["conversation_id"],
        },
        {
          fields: ["user_id"],
        },
      ],
    }
  );

  return ConversationParticipant;
};
