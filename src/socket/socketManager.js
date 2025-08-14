const { Server } = require('socket.io');

let io;

module.exports = {
  init: (httpServer, corsOptions) => {
    io = new Server(httpServer, {
      cors: corsOptions,
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.IO not initialized!');
    }
    return io;
  },
};