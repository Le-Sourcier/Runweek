const Joi = require("joi");
const { PersonalRecord } = require("../../models");
const { serverMessage } = require("../../utils");
const { sequelize, Sequelize } = require("../../models"); // Ajoutez Sequelize
const Op = Sequelize.Op; // Importez Op
// Validation schemas
const createPRSchema = Joi.object({
  distance: Joi.number().positive().required(),
  time: Joi.string()
    .pattern(/^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}$/)
    .required(),
  date: Joi.date().iso().required(),
  notes: Joi.string().max(500).trim().allow(""),
  location: Joi.string().max(100).trim().allow(""),
  weather: Joi.object({
    temperature: Joi.number(),
    conditions: Joi.string(),
    humidity: Joi.number().min(0).max(100),
    windSpeed: Joi.number().min(0),
  }).optional(),
  heartRate: Joi.object({
    average: Joi.number().min(40).max(220),
    max: Joi.number().min(40).max(220),
    min: Joi.number().min(40).max(220),
  }).optional(),
  elevation: Joi.object({
    gain: Joi.number().min(0),
    loss: Joi.number().min(0),
    maxAltitude: Joi.number(),
  }).optional(),
  splits: Joi.array()
    .items(
      Joi.object({
        distance: Joi.number().positive(),
        time: Joi.string(),
        pace: Joi.string(),
      })
    )
    .optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

const updatePRSchema = Joi.object({
  distance: Joi.number().positive(),
  time: Joi.string().pattern(/^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}$/),
  date: Joi.date().iso(),
  notes: Joi.string().max(500).trim().allow(""),
  location: Joi.string().max(100).trim().allow(""),
  weather: Joi.object({
    temperature: Joi.number(),
    conditions: Joi.string(),
    humidity: Joi.number().min(0).max(100),
    windSpeed: Joi.number().min(0),
  }).optional(),
  heartRate: Joi.object({
    average: Joi.number().min(40).max(220),
    max: Joi.number().min(40).max(220),
    min: Joi.number().min(40).max(220),
  }).optional(),
  elevation: Joi.object({
    gain: Joi.number().min(0),
    loss: Joi.number().min(0),
    maxAltitude: Joi.number(),
  }).optional(),
  splits: Joi.array()
    .items(
      Joi.object({
        distance: Joi.number().positive(),
        time: Joi.string(),
        pace: Joi.string(),
      })
    )
    .optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  // Récupérer tous les records personnels
  getAllRecords: async (req, res) => {
    try {
      const { distance, sort = "date", order = "desc", limit = 50 } = req.query;

      // Créer l'objet where pour le filtrage
      const where = { user_id: req.user.id };

      if (distance && distance !== "all") {
        where.distance = parseFloat(distance);
      }

      // INVALID_QUERY_PARAMETERS
      if (isNaN(limit) || limit <= 0 || limit > 100) {
        return serverMessage(res, "INVALID_QUERY_PARAMETERS");
      }

      // Définir les options de tri pour Sequelize
      const orderOptions = [];

      switch (sort) {
        case "date":
          orderOptions.push(["date", order.toUpperCase()]);
          break;
        case "distance":
          orderOptions.push(["distance", order.toUpperCase()]);
          break;
        case "time":
        case "pace":
          orderOptions.push(["timeInSeconds", order.toUpperCase()]);
          break;
        default:
          orderOptions.push(["date", "DESC"]);
      }

      const records = await PersonalRecord.findAll({
        where: where,
        order: orderOptions,
        limit: parseInt(limit),
        raw: true, // Équivalent de .lean() dans Mongoose
      });
      if (!records || records.length === 0) {
        return serverMessage(res, "NO_RECORDS_FOUND");
      }
      // Convertir les temps en secondes pour chaque record
      records.forEach((record) => {
        record.timeInSeconds = PersonalRecord.timeStringToSeconds(record.time);
      });

      serverMessage(res, "SUCCESS", records);
    } catch (error) {
      console.error("Erreur lors de la récupération des records:", error);
      serverMessage(res);
    }
  },

  // Récupérer un record spécifique
  getRecordById: async (req, res) => {
    try {
      const record = await PersonalRecord.findOne({
        where: {
          // Ajoutez where
          id: req.params.id,
          user_id: req.user.id,
        },
      });

      if (!record) {
        return serverMessage(res, "RECORD_NOT_FOUND");
      }

      return serverMessage(res, "SUCCESS", record);
    } catch (error) {
      console.error("Erreur lors de la récupération du record:", error);
      return serverMessage(res);
    }
  },

  // Créer un nouveau record personnel
  createRecord: async (req, res) => {
    try {
      const { error, value } = createPRSchema.validate(req.body);

      if (error) {
        console.log("Données invalides details: ", error.details[0].message);
        return serverMessage(res, "INVALID_RECORD_DATA");
      }

      // Calculer timeInSeconds avant toute opération
      const timeInSeconds = PersonalRecord.timeStringToSeconds(value.time);

      // Vérifier si c'est un record
      const existingBestRecord = await PersonalRecord.findOne({
        where: {
          user_id: req.user.id,
          distance: value.distance,
        },
        order: [["timeInSeconds", "ASC"]],
      });

      if (
        existingBestRecord &&
        timeInSeconds >= existingBestRecord.timeInSeconds
      ) {
        console.log(
          "Ce temps n'est pas un record personnel pour cette distance"
        );
        return serverMessage(res, "INVALID_RECORD_DATA");
      }

      // Calculer le pace
      const pace =
        timeInSeconds && value.distance > 0
          ? `${Math.floor(timeInSeconds / value.distance / 60)}:${Math.round(
              (timeInSeconds / value.distance) % 60
            )
              .toString()
              .padStart(2, "0")}`
          : null;

      // Créer le record avec tous les champs calculés
      const record = await PersonalRecord.create({
        ...value,
        user_id: req.user.id,
        timeInSeconds: timeInSeconds,
        pace: pace,
      });

      return serverMessage(res, "RECORD_CREATED", record);
    } catch (error) {
      console.error("Erreur lors de la création du record:", error);
      return serverMessage(res);
    }
  },
  // Mettre à jour un record
  updateRecord: async (req, res) => {
    try {
      const { error, value } = updatePRSchema.validate(req.body);

      if (error) {
        console.log("Données invalides details: ", error.details[0].message);
        return serverMessage(res, "INVALID_RECORD_DATA");
      }

      const [updatedCount] = await PersonalRecord.update(value, {
        where: {
          id: req.params.id,
          user_id: req.user.id,
        },
      });

      if (updatedCount === 0) {
        return serverMessage(res, "RECORD_NOT_FOUND");
      }

      const updatedRecord = await PersonalRecord.findByPk(req.params.id);
      return serverMessage(res, "RECORD_UPDATED", updatedRecord);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du record:", error);
      return serverMessage(res);
    }
  },

  // Supprimer un record
  deleteRecord: async (req, res) => {
    try {
      const deletedCount = await PersonalRecord.destroy({
        where: {
          // Syntaxe correcte pour destroy
          id: req.params.id,
          user_id: req.user.id,
        },
      });

      if (deletedCount === 0) {
        return serverMessage(res, "RECORD_NOT_FOUND");
      }

      return serverMessage(res, "RECORD_DELETED", { id: req.params.id });
    } catch (error) {
      console.error("Erreur lors de la suppression du record:", error);
      return serverMessage(res);
    }
  },

  // Statistiques des records
  getRecordsStats: async (req, res) => {
    try {
      const user_id = req.user.id;

      // Récupérer les statistiques de base
      const stats = await PersonalRecord.findAll({
        where: { user_id: user_id },
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "totalRecords"],
          [
            sequelize.fn("MIN", sequelize.col("timeInSeconds")),
            "bestOverallPace",
          ],
          [sequelize.fn("MAX", sequelize.col("distance")), "longestDistance"],
        ],
        raw: true,
      });

      // Récupérer les records des 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRecords = await PersonalRecord.findAll({
        where: {
          user_id: user_id,
          date: {
            [Op.gte]: thirtyDaysAgo, // Utilisez Op directement
          },
        },
        order: [["date", "DESC"]],
        limit: 10,
      });

      // Récupérer la répartition par distance
      const distanceBreakdown = await PersonalRecord.findAll({
        where: { user_id: user_id },
        attributes: [
          "distance",
          [sequelize.fn("MIN", sequelize.col("timeInSeconds")), "bestTime"],
          [sequelize.fn("MAX", sequelize.col("date")), "latestDate"],
        ],
        group: ["distance"],
        raw: true,
      });

      // Calculer les records par distance populaire
      const popularDistances = [1, 5, 10, 21.1, 42.2];
      const recordsByDistance = {};

      for (const distance of popularDistances) {
        const bestRecord = await PersonalRecord.findOne({
          where: {
            user_id: user_id,
            distance: distance,
          },
          order: [["timeInSeconds", "ASC"]],
        });

        if (bestRecord) {
          recordsByDistance[distance] = bestRecord;
        }
      }

      // Formater le résultat
      const result = {
        totalRecords: stats[0]?.totalRecords || 0,
        bestOverallPace: stats[0]?.bestOverallPace || null,
        longestDistance: stats[0]?.longestDistance || 0,
        recentRecords: recentRecords,
        distanceBreakdown: distanceBreakdown.map((item) => ({
          distance: item.distance,
          time: item.bestTime,
          date: item.latestDate,
        })),
        recordsByDistance: recordsByDistance,
      };

      return serverMessage(res, "SUCCESS", result);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return serverMessage(res);
    }
  },
  // Récupérer le meilleur record pour une distance
  getBestRecordByDistance: async (req, res) => {
    try {
      const distance = parseFloat(req.params.distance);

      if (isNaN(distance) || distance <= 0) {
        console.log("Distance invalide");
        return serverMessage(res, "INVALID_DISTANCE_FOR_RECORD_DATA");
      }

      const bestRecord = await PersonalRecord.findOne({
        where: {
          // Ajoutez where
          user_id: req.user.id,
          distance: distance,
        },
        order: [["timeInSeconds", "ASC"]], // Syntaxe correcte pour order
      });

      if (!bestRecord) {
        console.log("Aucun record trouvé pour cette distance");
        return serverMessage(res, "NO_RECORD_FOUND_FOR_DISTANCE");
      }

      return serverMessage(res, "SUCCESS", bestRecord);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du meilleur record:",
        error
      );
      return serverMessage(res);
    }
  },
};
