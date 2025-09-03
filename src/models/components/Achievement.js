// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const Achievement = sequelize.define(
//     "Achievement",
//     {
//       id: {
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4,
//         primaryKey: true,
//       },
//       user_id: {
//         type: DataTypes.UUID,
//         allowNull: false,
//         references: {
//           model: "Users",
//           key: "id",
//         },
//       },
//       achievement_id: {
//         type: DataTypes.STRING(50),
//         allowNull: false,
//       },
//       title: {
//         type: DataTypes.STRING(100),
//         allowNull: false,
//       },
//       description: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//       },
//       icon: {
//         type: DataTypes.STRING(50),
//         allowNull: false,
//       },
//       category: {
//         type: DataTypes.ENUM(
//           "beginner",
//           "distance",
//           "speed",
//           "habit",
//           "consistency",
//           "challenge",
//           "milestone"
//         ),
//         allowNull: false,
//       },
//       earnedDate: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//       },
//       points: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0,
//       },
//       rarity: {
//         type: DataTypes.ENUM("common", "rare", "epic", "legendary"),
//         defaultValue: "common",
//       },
//       requirements: {
//         type: DataTypes.JSONB,
//       },
//       isVisible: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: true,
//       },
//     },
//     {
//       tableName: "achievements",
//       indexes: [
//         {
//           fields: ["user_id", "earnedDate"],
//         },
//         {
//           fields: ["achievement_id"],
//         },
//         {
//           fields: ["category"],
//         },
//         {
//           unique: true,
//           fields: ["user_id", "achievement_id"],
//         },
//       ],
//     }
//   );

//   // Ajoutez cette méthode dans votre modèle Achievement
//   Achievement.associate = (models) => {
//     Achievement.belongsTo(models.Users, {
//       foreignKey: "user_id",
//       as: "user",
//     });
//   };

//   // Définition des achievements disponibles
//   const AVAILABLE_ACHIEVEMENTS = {
//     first_run: {
//       title: "Premier Pas",
//       description: "Complété votre première course",
//       icon: "Award",
//       category: "beginner",
//       points: 50,
//       rarity: "common",
//       requirements: { totalRuns: 1 },
//     },
//     distance_5k: {
//       title: "Club 5K",
//       description: "Complété une course de 5 kilomètres",
//       icon: "Medal",
//       category: "distance",
//       points: 100,
//       rarity: "common",
//       requirements: { singleRunDistance: 5 },
//     },
//     distance_10k: {
//       title: "Club 10K",
//       description: "Complété une course de 10 kilomètres",
//       icon: "Trophy",
//       category: "distance",
//       points: 200,
//       rarity: "rare",
//       requirements: { singleRunDistance: 10 },
//     },
//     half_marathon: {
//       title: "Semi-Marathonien",
//       description: "Complété un semi-marathon (21.1 km)",
//       icon: "Flag",
//       category: "distance",
//       points: 500,
//       rarity: "epic",
//       requirements: { singleRunDistance: 21.1 },
//     },
//     marathon: {
//       title: "Marathonien",
//       description: "Complété un marathon complet (42.2 km)",
//       icon: "Trophy",
//       category: "distance",
//       points: 1000,
//       rarity: "legendary",
//       requirements: { singleRunDistance: 42.2 },
//     },
//     early_bird: {
//       title: "Lève-tôt",
//       description: "Complété 5 courses avant 7h du matin",
//       icon: "Zap",
//       category: "habit",
//       points: 150,
//       rarity: "rare",
//       requirements: { earlyMorningRuns: 5 },
//     },
//     week_streak: {
//       title: "Série Hebdomadaire",
//       description: "Couru 7 jours consécutifs",
//       icon: "Flame",
//       category: "consistency",
//       points: 300,
//       rarity: "rare",
//       requirements: { consecutiveDays: 7 },
//     },
//     speed_demon: {
//       title: "Démon de Vitesse",
//       description: "Couru 1 km en moins de 4 minutes",
//       icon: "Timer",
//       category: "speed",
//       points: 400,
//       rarity: "epic",
//       requirements: { bestPace: 4.0 },
//     },
//     elevation_master: {
//       title: "Maître de l'Élévation",
//       description: "Accumulé 1000m de dénivelé positif",
//       icon: "MapPin",
//       category: "challenge",
//       points: 250,
//       rarity: "rare",
//       requirements: { totalElevation: 1000 },
//     },
//     total_100k: {
//       title: "Club 100K",
//       description: "Couru un total de 100 kilomètres",
//       icon: "Medal",
//       category: "milestone",
//       points: 300,
//       rarity: "rare",
//       requirements: { totalDistance: 100 },
//     },
//     total_500k: {
//       title: "Club 500K",
//       description: "Couru un total de 500 kilomètres",
//       icon: "Trophy",
//       category: "milestone",
//       points: 750,
//       rarity: "epic",
//       requirements: { totalDistance: 500 },
//     },
//     night_runner: {
//       title: "Coureur Nocturne",
//       description: "Complété 5 courses après 20h",
//       icon: "Zap",
//       category: "habit",
//       points: 150,
//       rarity: "rare",
//       requirements: { nightRuns: 5 },
//     },
//   };

//   Achievement.getAvailableAchievements = function () {
//     return AVAILABLE_ACHIEVEMENTS;
//   };

//   return Achievement;
// };

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Achievement = sequelize.define(
    "Achievement",
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
      achievement_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM(
          "beginner",
          "distance",
          "speed",
          "habit",
          "consistency",
          "challenge",
          "milestone"
        ),
        allowNull: false,
      },
      earnedDate: {
        type: DataTypes.DATE,
        defaultValue: null, // Changez à null par défaut
      },
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      rarity: {
        type: DataTypes.ENUM("common", "rare", "epic", "legendary"),
        defaultValue: "common",
      },
      requirements: {
        type: DataTypes.JSONB,
      },
      isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "achievements",
      indexes: [
        {
          fields: ["user_id", "earnedDate"],
        },
        {
          fields: ["achievement_id"],
        },
        {
          fields: ["category"],
        },
        {
          unique: true,
          fields: ["user_id", "achievement_id"],
        },
      ],
    }
  );

  Achievement.associate = (models) => {
    Achievement.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
    });

    // Ajoutez cette association
    Achievement.belongsTo(models.AchievementDefinition, {
      foreignKey: "achievement_id",
      targetKey: "id",
      as: "definition",
    });
  };

  // Supprimez la méthode getAvailableAchievements et AVAILABLE_ACHIEVEMENTS
  // Elles seront maintenant gérées par le modèle AchievementDefinition

  return Achievement;
};
