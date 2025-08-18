const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ChatMessages = sequelize.define(
    "ChatMessages",
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
      message_content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sender: {
        type: DataTypes.ENUM("bot", "user"),
        allowNull: false,
      },
      message_type: {
        type: DataTypes.ENUM("text", "recommandation", "conseil", "advices"),
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSONB, // Store additional data like icon, category, originalData
        allowNull: true,
      },
    },
    {
      tableName: "chat_messages",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  ChatMessages.associate = (models) => {
    ChatMessages.belongsTo(models.Users, { foreignKey: "user_id", as: "user" });
  };

  return ChatMessages;
};
