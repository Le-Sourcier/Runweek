// models/GoogleAuth.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoogleAuth = sequelize.define(
    "GoogleAuth",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      google_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Google user ID",
      },
      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Google refresh token",
      },
      access_token: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Google access token",
      },
      token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Access token expiration date",
      },
      scopes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Authorized scopes (comma-separated)",
      },
      is_linked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      last_sync: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Last time Google data was synchronized",
      },
    },
    {
      tableName: "google_auth",
      indexes: [
        {
          unique: true,
          fields: ["user_id"],
        },
        {
          fields: ["google_id"],
        },
      ],
    }
  );

  GoogleAuth.associate = (models) => {
    GoogleAuth.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return GoogleAuth;
};
