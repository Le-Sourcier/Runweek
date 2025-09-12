const { Friendship, ActivityShare } = require("../../models");
const { Op } = require("sequelize");

class FriendManager {
  constructor(connectionManager) {
    this.connectionManager = connectionManager;
  }

  async calculateFriendStats(userId) {
    try {
      const [friendships, pendingReceived, pendingSent, recentActivity] =
        await Promise.all([
          Friendship.findAll({
            where: {
              status: "accepted",
              [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
            },
            raw: true,
          }),
          Friendship.count({
            where: {
              status: "pending",
              recipient_id: userId,
            },
          }),
          Friendship.count({
            where: {
              status: "pending",
              requester_id: userId,
            },
          }),
          this.getRecentFriendActivity(userId),
        ]);

      const friendIds = friendships.map((friendship) =>
        friendship.requester_id === userId
          ? friendship.recipient_id
          : friendship.requester_id
      );

      const onlineFriends = friendIds.filter((id) =>
        this.connectionManager.isUserOnline(id)
      );

      return {
        totalFriends: friendIds.length,
        onlineFriends: onlineFriends.length,
        pendingRequests: pendingReceived,
        sentRequests: pendingSent,
        recentActivity: recentActivity,
        mutualConnections: Math.floor(friendIds.length * 1.5),
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error calculating friend stats:", error);
      return this.getDefaultStats();
    }
  }

  async getRecentFriendActivity(userId) {
    try {
      const friendShips = await Friendship.findAll({
        where: {
          status: "accepted",
          [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
        },
        raw: true,
      });

      const friendIds = friendShips.map((friendship) =>
        friendship.requester_id === userId
          ? friendship.recipient_id
          : friendship.requester_id
      );

      if (friendIds.length === 0) return 0;

      return ActivityShare.count({
        where: {
          shared_by_id: { [Op.in]: friendIds },
          createdAt: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });
    } catch (error) {
      console.error("Error getting recent friend activity:", error);
      return 0;
    }
  }

  getDefaultStats() {
    return {
      totalFriends: 0,
      onlineFriends: 0,
      pendingRequests: 0,
      sentRequests: 0,
      recentActivity: 0,
      mutualConnections: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  async handleUserOnline(userId, socket) {
    try {
      // Notify friends that this user is online
      const friendships = await Friendship.findAll({
        where: {
          status: "accepted",
          [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
        },
        raw: true,
      });

      for (const friendship of friendships) {
        const friendId =
          friendship.requester_id === userId
            ? friendship.recipient_id
            : friendship.requester_id;

        // Notify online friends
        if (this.connectionManager.isUserOnline(friendId)) {
          this.connectionManager
            .getUserConnections(friendId)
            .forEach((socketId) => {
              socket.to(socketId).emit("friend_online", userId);
            });
        }
      }

      // Send online friends list to the user
      const onlineFriends = friendships
        .map((friendship) =>
          friendship.requester_id === userId
            ? friendship.recipient_id
            : friendship.requester_id
        )
        .filter((friendId) => this.connectionManager.isUserOnline(friendId));

      socket.emit("friends_online_list", onlineFriends);

      // Update stats for all friends
      await this.broadcastStatsToFriends(userId);
    } catch (error) {
      console.error("Error handling user online:", error);
    }
  }

  async handleUserOffline(userId) {
    try {
      // Notify friends that this user is offline
      const friendships = await Friendship.findAll({
        where: {
          status: "accepted",
          [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
        },
        raw: true,
      });

      for (const friendship of friendships) {
        const friendId =
          friendship.requester_id === userId
            ? friendship.recipient_id
            : friendship.requester_id;

        // Notify online friends
        if (this.connectionManager.isUserOnline(friendId)) {
          this.connectionManager
            .getUserConnections(friendId)
            .forEach((socketId) => {
              socket.to(socketId).emit("friend_offline", userId);
            });
        }
      }

      // Update stats for all friends
      await this.broadcastStatsToFriends(userId);
    } catch (error) {
      console.error("Error handling user offline:", error);
    }
  }

  async broadcastStatsToFriends(userId) {
    try {
      const friendships = await Friendship.findAll({
        where: {
          status: "accepted",
          [Op.or]: [{ requester_id: userId }, { recipient_id: userId }],
        },
        raw: true,
      });

      for (const friendship of friendships) {
        const friendId =
          friendship.requester_id === userId
            ? friendship.recipient_id
            : friendship.requester_id;

        await this.broadcastStatsToUser(friendId);
      }
    } catch (error) {
      console.error("Error broadcasting stats to friends:", error);
    }
  }

  async broadcastStatsToUser(userId) {
    try {
      if (this.connectionManager.isUserOnline(userId)) {
        const stats = await this.calculateFriendStats(userId);
        this.connectionManager
          .getUserConnections(userId)
          .forEach((socketId) => {
            io.to(socketId).emit("friends_stats_update", stats);
          });
      }
    } catch (error) {
      console.error("Error broadcasting stats to user:", error);
    }
  }
}

module.exports = FriendManager;
