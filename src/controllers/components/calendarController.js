// controllers/calendarController.js
const { CalendarEvent } = require("../../models");
const { serverMessage } = require("../../utils");
const {
  createEventSchema,
  updateEventSchema,
} = require("../../validators/components/calendarValidator");
const { Op } = require("sequelize");

module.exports = {
  // Récupérer tous les événements d'un utilisateur
  getEvents: async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        type,
        completed,
        page = 1,
        limit = 50,
      } = req.query;

      const where = {
        user_id: req.user.id,
      };

      // Filtrage par date
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [startDate, endDate],
        };
      } else if (startDate) {
        where.date = {
          [Op.gte]: startDate,
        };
      } else if (endDate) {
        where.date = {
          [Op.lte]: endDate,
        };
      }

      // Filtrage par type
      if (type && type !== "all") {
        where.type = type;
      }

      // Filtrage par statut de complétion
      if (completed !== undefined) {
        where.completed = completed === "true";
      }

      const events = await CalendarEvent.findAll({
        where,
        order: [
          ["date", "ASC"],
          ["time", "ASC"],
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      });

      if (!events) return serverMessage(res, "NO_EVENTS_FOUND");

      return serverMessage(res, "EVENTS_RETRIEVED", events);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
      return serverMessage(res, "EVENTS_RETRIEVAL_FAILED");
    }
  },

  // Récupérer un événement spécifique
  getEvent: async (req, res) => {
    try {
      const event = await CalendarEvent.findOne({
        where: {
          id: req.params.id,
          user_id: req.user.id,
        },
      });

      if (!event) {
        return serverMessage(res, "EVENT_NOT_FOUND");
      }

      return serverMessage(res, "EVENT_RETRIEVED", event);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'événement:", error);
      return serverMessage(res, "EVENT_RETRIEVAL_FAILED");
    }
  },

  // Créer un nouvel événement
  createEvent: async (req, res) => {
    try {
      const { error, value } = createEventSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return serverMessage(res, errorMessages[0]);
      }

      // Vérifier que la date est dans le futur
      const eventDate = new Date(value.date);
      if (eventDate < new Date().setHours(0, 0, 0, 0)) {
        return serverMessage(res, "DATE_CANNOT_BE_PAST");
      }

      const event = await CalendarEvent.create({
        ...value,
        user_id: req.user.id,
      });

      return serverMessage(res, "EVENT_CREATED", event);
    } catch (error) {
      console.error("Erreur lors de la création de l'événement:", error);
      return serverMessage(res, "EVENT_CREATION_FAILED");
    }
  },

  // Mettre à jour un événement
  updateEvent: async (req, res) => {
    try {
      const { error, value } = updateEventSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return serverMessage(res, errorMessages[0]);
      }

      // Vérifier que l'événement existe et appartient à l'utilisateur
      const event = await CalendarEvent.findOne({
        where: {
          id: req.params.id,
          user_id: req.user.id,
        },
      });

      if (!event) {
        return serverMessage(res, "EVENT_NOT_FOUND");
      }

      // Vérifier que la nouvelle date est dans le futur si fournie
      if (value.date) {
        const newDate = new Date(value.date);
        if (newDate < new Date().setHours(0, 0, 0, 0)) {
          return serverMessage(res, "DATE_CANNOT_BE_PAST");
        }
      }

      await event.update(value);

      return serverMessage(res, "EVENT_UPDATED", event);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement:", error);
      return serverMessage(res, "EVENT_UPDATE_FAILED");
    }
  },

  // Supprimer un événement
  deleteEvent: async (req, res) => {
    try {
      const deletedCount = await CalendarEvent.destroy({
        where: {
          id: req.params.id,
          user_id: req.user.id,
        },
      });

      if (deletedCount === 0) {
        return serverMessage(res, "EVENT_NOT_FOUND");
      }

      return serverMessage(res, "EVENT_DELETED");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error);
      return serverMessage(res, "EVENT_DELETION_FAILED");
    }
  },

  // Marquer un événement comme complété
  completeEvent: async (req, res) => {
    try {
      const event = await CalendarEvent.findOne({
        where: {
          id: req.params.id,
          user_id: req.user.id,
        },
      });

      if (!event) {
        return serverMessage(res, "EVENT_NOT_FOUND");
      }

      if (event.completed) {
        return serverMessage(res, "EVENT_ALREADY_COMPLETED");
      }

      await event.update({
        completed: true,
        completedAt: new Date(),
      });

      return serverMessage(res, "EVENT_COMPLETED", event);
    } catch (error) {
      console.error(
        "Erreur lors du marquage de l'événement comme complété:",
        error
      );
      return serverMessage(res, "EVENT_COMPLETION_FAILED");
    }
  },

  // Récupérer les événements à venir (pour les rappels)
  getUpcomingEvents: async (req, res) => {
    try {
      const { hours = 24 } = req.query; // Par défaut, 24 heures à venir

      const now = new Date();
      const futureDate = new Date(
        now.getTime() + parseInt(hours) * 60 * 60 * 1000
      );

      const events = await CalendarEvent.findAll({
        where: {
          user_id: req.user.id,
          completed: false,
          date: {
            [Op.between]: [
              now.toISOString().split("T")[0],
              futureDate.toISOString().split("T")[0],
            ],
          },
        },
        order: [
          ["date", "ASC"],
          ["time", "ASC"],
        ],
      });

      return serverMessage(res, "UPCOMING_EVENTS_RETRIEVED", events);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des événements à venir:",
        error
      );
      return serverMessage(res, "UPCOMING_EVENTS_RETRIEVAL_FAILED");
    }
  },

  // Service pour envoyer des rappels (à appeler via un cron job)
  sendReminders: async () => {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const eventsToRemind = await CalendarEvent.findAll({
        where: {
          completed: false,
          reminderSent: false,
          date: now.toISOString().split("T")[0],
          time: {
            [Op.between]: [
              now.toTimeString().slice(0, 5),
              oneHourFromNow.toTimeString().slice(0, 5),
            ],
          },
        },
        include: [{ model: sequelize.models.Users, as: "user" }],
      });

      for (const event of eventsToRemind) {
        try {
          // Ici vous intégreriez votre service d'envoi de notifications
          // (email, push notification, etc.)
          console.log(
            `Rappel pour ${event.user.email}: ${event.title} à ${event.time}`
          );

          await event.update({ reminderSent: true });
        } catch (reminderError) {
          console.error("Erreur lors de l'envoi du rappel:", reminderError);
        }
      }

      return { success: true, remindersSent: eventsToRemind.length };
    } catch (error) {
      console.error("Erreur lors de l'envoi des rappels:", error);
      return { success: false, error: error.message };
    }
  },
};
