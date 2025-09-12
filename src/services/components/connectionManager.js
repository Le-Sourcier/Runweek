class ConnectionManager {
  constructor() {
    this.userConnections = new Map(); // userId -> Set(socketIds)
    this.socketToUser = new Map(); // socketId -> userId
  }

  addConnection(userId, socketId) {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId).add(socketId);
    this.socketToUser.set(socketId, userId);
  }

  removeConnection(userId, socketId) {
    if (this.userConnections.has(userId)) {
      this.userConnections.get(userId).delete(socketId);

      if (this.userConnections.get(userId).size === 0) {
        this.userConnections.delete(userId);
      }
    }

    this.socketToUser.delete(socketId);
  }

  removeAllConnections(userId) {
    if (this.userConnections.has(userId)) {
      // Remove all socket mappings
      this.userConnections.get(userId).forEach((socketId) => {
        this.socketToUser.delete(socketId);
      });

      this.userConnections.delete(userId);
    }
  }

  getUserConnections(userId) {
    return this.userConnections.get(userId) || new Set();
  }

  isUserOnline(userId) {
    return (
      this.userConnections.has(userId) &&
      this.userConnections.get(userId).size > 0
    );
  }

  async handleDisconnection(userId, socketId) {
    // Wait a bit to handle quick reconnections
    setTimeout(() => {
      if (
        this.userConnections.has(userId) &&
        this.userConnections.get(userId).has(socketId)
      ) {
        this.removeConnection(userId, socketId);
        return true; // User was fully disconnected
      }
      return false; // User reconnected quickly
    }, 2000);
  }
}

module.exports = ConnectionManager;
