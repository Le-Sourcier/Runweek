const dayjs = require("dayjs");

const { Notifications } = require("../../models");

const { serverMessage } = require("../../utils");
const { Op } = require("sequelize");

module.exports = {
  // Get all recent notif

  getAllNotif: async (req, res) => {
    try {
      const { id } = req.user;
      // if (!userId) return serverMessage(res, "UNAUTHORIZED", 401);

      const notifications = await Notifications.findAll({
        where: { user_id: id },
        order: [["createdAt", "DESC"]],
      });

      if (!notifications || notifications.length === 0) {
        return serverMessage(res, "NOTIF_NOT_FOUND");
      }

      const sanitizedNotifications = notifications.map((notif) => {
        const plain = notif.get({ plain: true });
        delete plain.user_id;
        return plain;
      });

      return serverMessage(res, "SUCCESS", sanitizedNotifications);
    } catch (error) {
      console.error("getUserNotifications error:", error);
      return serverMessage(res);
    }
  },

  // GET /api/notif/notif/:id
  readNotifDetails: async (req, res) => {
    const notifId = req.params.id;
    const userId = req.user.id;

    try {
      const notif = await Notifications.findOne({
        where: { id: notifId, user_id: userId },
      });

      if (!notif) return serverMessage(res, "NOTIF_NOT_FOUND", null, 404);

      return serverMessage(res, "SUCCESS", notif);
    } catch (err) {
      console.error("readNotifDetails error", err);
      return serverMessage(res);
    }
  },

  // PUT /api/notif/update-notif
  markAsRead: async (req, res) => {
    const { is_read = true } = req.body;
    const { id: notification_id } = req.params;
    const { id } = req.user;

    try {
      const notif = await Notifications.findOne({
        where: { id: notification_id, user_id: id },
      });

      if (!notif) return serverMessage(res, "NOTIF_NOT_FOUND");

      // Pas besoin de mettre à jour si la valeur est déjà celle demandée
      if (notif.is_read === is_read) {
        return serverMessage(res, "NO_CHANGE", notif);
      }

      await notif.update({ is_read });

      const message = is_read ? "MARKED_AS_READ" : "MARKED_AS_UNREAD";
      return serverMessage(res, message, notif);
    } catch (err) {
      console.error("markAsRead error", err);
      return serverMessage(res);
    }
  },

  // POST /api/notif/recent
  getRecentNotifications: async (req, res) => {
    const userId = req.user.id;

    try {
      const notifications = await Notifications.findAll({
        where: { user_id: userId },
        order: [["createdAt", "DESC"]],
        limit: 50, // ou + selon tes besoins
      });

      const data = notifications.map((notif) => ({
        id: notif.id,
        type: notif.type,
        label: notif.content,
        is_read: notif.is_read,
        createdAt: notif.createdAt,
        metadata: notif.metadata,
      }));

      return serverMessage(res, "SUCCESS", data);
    } catch (err) {
      console.error("getRecentNotifications error", err);
      return serverMessage(res);
    }
  },
};
