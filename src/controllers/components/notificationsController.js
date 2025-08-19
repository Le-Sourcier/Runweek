const dayjs = require("dayjs");
const { Notifications } = require("../../models");
const { Op } = require("sequelize");

module.exports = {
  getAllNotif: async (req, res) => {
    try {
      const { id } = req.user;

      const notifications = await Notifications.findAll({
        where: { user_id: id },
        order: [["createdAt", "DESC"]],
      });

      if (!notifications || notifications.length === 0) {
        return res.status(404).json({ error: true, message: "Notifications not found" });
      }

      const sanitizedNotifications = notifications.map((notif) => {
        const plain = notif.get({ plain: true });
        delete plain.user_id;
        return plain;
      });

      return res.status(200).json({ error: false, message: "Success", data: sanitizedNotifications });
    } catch (error) {
      console.error("getUserNotifications error:", error);
      return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  readNotifDetails: async (req, res) => {
    const notifId = req.params.id;
    const userId = req.user.id;

    try {
      const notif = await Notifications.findOne({
        where: { id: notifId, user_id: userId },
      });

      if (!notif) {
        return res.status(404).json({ error: true, message: "Notification not found" });
      }

      return res.status(200).json({ error: false, message: "Success", data: notif });
    } catch (err) {
      console.error("readNotifDetails error", err);
      return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  markAsRead: async (req, res) => {
    const { is_read = true } = req.body;
    const { id: notification_id } = req.params;
    const { id } = req.user;

    try {
      const notif = await Notifications.findOne({
        where: { id: notification_id, user_id: id },
      });

      if (!notif) {
        return res.status(404).json({ error: true, message: "Notification not found" });
      }

      if (notif.is_read === is_read) {
        return res.status(200).json({ error: false, message: "No change", data: notif });
      }

      await notif.update({ is_read });

      const message = is_read ? "Marked as read" : "Marked as unread";
      return res.status(200).json({ error: false, message, data: notif });
    } catch (err) {
      console.error("markAsRead error", err);
      return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  getRecentNotifications: async (req, res) => {
    const userId = req.user.id;

    try {
      const notifications = await Notifications.findAll({
        where: { user_id: userId },
        order: [["createdAt", "DESC"]],
        limit: 50,
      });

      const data = notifications.map((notif) => ({
        id: notif.id,
        type: notif.type,
        label: notif.content,
        is_read: notif.is_read,
        createdAt: notif.createdAt,
        metadata: notif.metadata,
      }));

      return res.status(200).json({ error: false, message: "Success", data });
    } catch (err) {
      console.error("getRecentNotifications error", err);
      return res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },
};