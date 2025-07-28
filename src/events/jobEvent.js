module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Nouveau client connecté :", socket.id);

    socket.on("someEvent", (data) => {
      console.log("📩 Données reçues via socket :", data);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client déconnecté :", socket.id);
    });
  });
};
