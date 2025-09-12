class MessageHandler {
  constructor(io, connectionManager) {
    this.io = io;
    this.connectionManager = connectionManager;
  }

  joinConversation(socket, friendId) {
    try {
      if (!friendId) {
        console.error("Missing friendId in join_conversation");
        return;
      }

      const roomName = `friend_${friendId}`;
      socket.join(roomName);
      console.log(
        `User ${socket.id} joined conversation for friend ${friendId}`
      );
    } catch (error) {
      console.error("Error joining conversation:", error);
    }
  }

  leaveConversation(socket, friendId) {
    try {
      if (!friendId) {
        console.error("Missing friendId in leave_conversation");
        return;
      }

      socket.leave(`friend_${friendId}`);
      console.log(`User ${socket.id} left conversation for friend ${friendId}`);
    } catch (error) {
      console.error("Error leaving conversation:", error);
    }
  }

  async sendMessage(socket, messageData, callback) {
    try {
      // Validate message structure
      if (
        !messageData.friend_id ||
        !messageData.sender ||
        !messageData.content
      ) {
        console.error("Invalid message structure:", messageData);
        if (callback)
          callback({ success: false, error: "Invalid message structure" });
        return;
      }

      // Format message
      const formattedMessage = {
        id: messageData.id || Date.now().toString(),
        friend_id: messageData.friend_id,
        sender: {
          id: messageData.sender.id,
          email: messageData.sender.email || "",
          profile: {
            lang: messageData.sender.profile?.lang,
            fname: messageData.sender.profile?.fname || "Utilisateur",
            lname: messageData.sender.profile?.lname || "",
            image: messageData.sender.profile?.image || "",
          },
        },
        content: messageData.content,
        messageType: messageData.messageType || "text",
        createdAt: messageData.createdAt || new Date().toISOString(),
      };

      console.log("Broadcasting formatted message:", formattedMessage);

      // Broadcast to all participants in the friend conversation
      this.io
        .to(`friend_${messageData.friend_id}`)
        .emit("new_message", formattedMessage);

      if (callback) callback({ success: true });
    } catch (error) {
      console.error("Error handling message:", error);
      if (callback) callback({ success: false, error: error.message });
    }
  }

  handleTypingStart(socket, data) {
    try {
      const { friendId, userId } = data;

      if (!friendId || !userId) {
        console.error("Missing friendId or userId in typing_start:", data);
        return;
      }

      console.log(
        `User ${userId} is typing in friend conversation ${friendId}`
      );

      // Broadcast to all participants in the conversation
      this.io.to(`friend_${friendId}`).emit("user_typing", {
        userId: userId,
        isTyping: true,
        friendId: friendId,
      });
    } catch (error) {
      console.error("Error in typing_start:", error);
    }
  }

  handleTypingStop(socket, data) {
    try {
      const { friendId, userId } = data;

      if (!friendId || !userId) {
        console.error("Missing friendId or userId in typing_stop:", data);
        return;
      }

      console.log(
        `User ${userId} stopped typing in friend conversation ${friendId}`
      );

      // Broadcast to all participants in the conversation
      this.io.to(`friend_${friendId}`).emit("user_typing", {
        userId: userId,
        isTyping: false,
        friendId: friendId,
      });
    } catch (error) {
      console.error("Error in typing_stop:", error);
    }
  }
}

module.exports = MessageHandler;
