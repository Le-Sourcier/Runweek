const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET env var is required");
}

module.exports = (sequelize) => {
  const Users = sequelize.define(
    "Users",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: uuidv4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("UNVERIFIED", "VERIFIED", "ARCHIVED", "BLOCKED"),
        allowNull: false,
        defaultValue: "UNVERIFIED",
      },
      role: {
        type: DataTypes.ENUM("USER", "ADMIN", "SUPER_ADMIN"),
        allowNull: false,
        defaultValue: "USER",
      },
      reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      reset_token_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      hooks: {
        // 1) Ensure an ID and a token exist BEFORE validation
        beforeValidate: (user, options) => {
          // If no id, generate one (though defaultValue usually does this)
          if (!user.id) {
            user.id = uuidv4();
          }
        },

        // 2) Hash password right before saving to DB
        beforeCreate: async (user, options) => {
          user.password = await bcrypt.hash(user.password, 10);
        },
        afterCreate: async (user, options) => {
          try {
            // Créer des préférences de partage par défaut pour le nouvel utilisateur
            await sequelize.models.DataSharingPreferences.create({
              user_id: user.id,
              // Les valeurs par défaut sont déjà définies dans le modèle
            });
          } catch (error) {
            console.error(
              "Error creating default data sharing preferences:",
              error
            );
          }
        },
      },
      paranoid: true, // Activer la suppression douce (soft delete)
    }
  );

  // Définition des associations
  Users.associate = (models) => {
    // 1. Relation One-to-One avec Profile
    Users.hasOne(models.Profiles, {
      foreignKey: "user_id",
      as: "profile",
      onDelete: "CASCADE", // Supprime le profil si l'utilisateur est supprimé
      hooks: true, // Active les hooks pour la suppression en cascade
    });

    // 2. Relation One-to-One avec Role (si nécessaire)
    Users.hasOne(models.Roles, {
      foreignKey: "user_id",
      as: "role_data",
      onDelete: "CASCADE",
    });

    // 3. Relation One-to-Many avec Sessions
    Users.hasMany(models.Sessions, {
      foreignKey: "user_id",
      as: "sessions",
      onDelete: "CASCADE",
    });

    // 4. Relation One-to-Many avec Subscriptions
    Users.hasMany(models.Subscriptions, {
      foreignKey: "user_id",
      as: "subscriptions",
    });

    // 5. Relation One-to-Many avec Notifications
    Users.hasMany(models.Notifications, {
      foreignKey: "user_id",
      as: "notifications",
      onDelete: "CASCADE",
    });

    // 6. Relations d'amitié (requérant et receveur)
    Users.hasMany(models.Friendship, {
      foreignKey: "requester_id",
      as: "sentFriendRequests",
    });

    Users.hasMany(models.Friendship, {
      foreignKey: "recipient_id",
      as: "receivedFriendRequests",
    });

    // 7. Relations de conversation
    Users.belongsToMany(models.Conversation, {
      through: models.ConversationParticipant,
      foreignKey: "user_id",
      as: "conversations",
    });

    // 8. Messages envoyés
    Users.hasMany(models.Message, {
      foreignKey: "sender_id",
      as: "messages",
    });

    // 9. Activités partagées
    Users.hasMany(models.ActivityShare, {
      foreignKey: "shared_by_id",
      as: "sharedActivities",
    });

    // 10. Rapports envoyés/reçus
    Users.hasMany(models.Report, {
      foreignKey: "reporter_id",
      as: "reportsSent",
    });

    Users.hasMany(models.Report, {
      foreignKey: "reported_id",
      as: "reportsReceived",
    });

    // 11. Relations de parrainage
    Users.hasMany(models.UserRelations, {
      foreignKey: "user_id",
      as: "relationsReceived",
    });

    Users.hasMany(models.UserRelations, {
      foreignKey: "related_by",
      as: "relationsSent",
    });

    // 12. Relation One-to-Many avec Achievements
    Users.hasMany(models.Achievement, {
      foreignKey: "user_id",
      as: "achievements",
      onDelete: "CASCADE", // Supprime les goals si l'utilisateur est supprimé
    });

    // 13. Relation One-to-Many avec ActivityData
    Users.hasMany(models.ActivityData, {
      foreignKey: "user_id",
      as: "activity_data",
      onDelete: "CASCADE", // Supprime les goals si l'utilisateur est supprimé
    });

    // 14. Relation One-to-Many avec Goals
    Users.hasMany(models.Goal, {
      foreignKey: "user_id",
      as: "goals",
      onDelete: "CASCADE", // Supprime les goals si l'utilisateur est supprimé
    });

    // 15. Relation One-to-Many avec HeartRateData
    Users.hasMany(models.HeartRateData, {
      foreignKey: "user_id",
      as: "heartRateData",
      onDelete: "CASCADE", // Supprime les données de fréquence cardiaque si l'utilisateur est supprimé
    });
    // 16. Relation One-to-Many avec SleepData
    Users.hasMany(models.SleepData, {
      foreignKey: "user_id",
      as: "sleepData",
      onDelete: "CASCADE", // Supprime les données de sommeil si l'utilisateur est supprimé
    });
    // 17. Relation One-to-Many avec ExerciseSession
    Users.hasMany(models.ExerciseSession, {
      foreignKey: "user_id",
      as: "exerciseSessions",
      onDelete: "CASCADE", // Supprime les sessions d'exercice si l'utilisateur est supprimé
    });

    // 18. Relation One-to-Many avec DataSync
    Users.hasMany(models.DataSync, {
      foreignKey: "user_id",
      as: "dataSyncs",
      onDelete: "CASCADE", // Supprime les synchronisations de données si l'utilisateur est supprimé
    });

    // 19. Relation One-to-Many avec Nutrition
    Users.hasMany(models.FoodItem, {
      foreignKey: "user_id",
      as: "foodItem",
      onDelete: "CASCADE", // Supprime les données de nutrition si l'utilisateur est supprimé
    });

    // 20. Relation One-to-Many avec DailyNutrition
    Users.hasMany(models.DailyNutrition, {
      foreignKey: "user_id",
      as: "dailyNutrition",
      onDelete: "CASCADE", // Supprime les données de DailyNutrition si l'utilisateur est supprimé
    });

    // 21. Relation One-to-Many avec NutritionGoals
    Users.hasMany(models.NutritionGoals, {
      foreignKey: "user_id",
      as: "nutritionGoals",
      onDelete: "CASCADE", // Supprime les données de NutritionGoals si l'utilisateur est supprimé
    });
    // 22. Relation One-to-Many avec PersonalRecord
    Users.hasMany(models.PersonalRecord, {
      foreignKey: "user_id",
      as: "personalRecord",
      onDelete: "CASCADE", // Supprime les Records personelles de repas si l'utilisateur est supprimé
    });

    // 23. Relation One-to-One avec GoogleAuth
    Users.hasOne(models.GoogleAuth, {
      foreignKey: "user_id",
      as: "googleAuth",
      onDelete: "CASCADE",
    });

    //24. Relation on-to-One whith DataSharingPreferences
    Users.hasOne(models.DataSharingPreferences, {
      foreignKey: "user_id",
      as: "dataSharingPreferences",
      onDelete: "CASCADE",
    });

    //25. Relation on-to-One whith UserStats
    Users.hasOne(models.UserStats, {
      foreignKey: "user_id",
      as: "stats",
      onDelete: "CASCADE",
    });
  };
  Users.prototype.generateTokens = function () {
    const payload = { id: this.id, email: this.email };

    const accessToken = jwt.sign(payload, SECRET, {
      expiresIn: "2h",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  };

  Users.prototype.generateVerificationToken = function () {
    const expiresIn = "15m";

    const payload = { id: this.id, email: this.email };
    return jwt.sign(payload, SECRET, { expiresIn: expiresIn }); // Plus court et temporaire
  };

  Users.prototype.verifyPassword = function (password) {
    // Verify if the password matches the stored password
    // Use bcrypt to compare the plain text password with the hashed password
    const isMatch = bcrypt.compareSync(password, this.password);

    return isMatch;
  };
  return Users;
};
