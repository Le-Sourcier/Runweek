import { create } from "zustand";
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";
import {
  BlockedFriendFilters,
  BlockedFriendsResponse,
  Conversation,
  Friend,
  FriendRequestType,
  FriendsState,
  FriendsStats,
  Message,
  SendMessageParams,
} from "../types/friends";
import { io } from "socket.io-client";
import sec from "react-secure-storage";
import { ApiError } from "../types";
import { useUserContext } from "../hooks/useUser";

export const useFriendsStore = create<FriendsState>((set, get) => ({
  // États initiaux
  friends: [],
  friendRequests: [],
  friendActivities: [],
  friendsStats: null,
  searchResults: [],
  isLoading: false,
  isRequestLoading: false,
  isActivityLoading: false,
  isSearching: false,
  error: null,
  onlineFriends: new Set(),
  socket: null,
  currentUser: null,
  blockedFriends: [],
  blockedFriendsPagination: null,
  isBlockedFriendsLoading: false,
  blockedFriendsError: null,
  // Message
  conversations: [],
  currentConversation: null,
  messages: [],
  isSendingMessage: false,
  isLoadingMessages: false,
  conversationError: null,
  typingTimeouts: new Map<string, NodeJS.Timeout>(),

  // Récupérer la liste des amis
  getFriends: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.sort) params.append("sort", filters.sort);

      const url = `${ApiUrl.FRIENDS}?${params.toString()}`;

      const { data } = await apiUtils.get<Friend[]>(url);

      // Mettre à jour le statut en ligne basé sur les données du socket

      const onlineFriends = get().onlineFriends;
      const friendsWithOnlineStatus = data.map((friend: Friend) => ({
        ...friend,
        isOnline: onlineFriends.has(friend.id),
      }));

      set({ friends: friendsWithOnlineStatus, isLoading: false });
      // set({ friends: data, isLoading: false });
    } catch (err) {
      const error = err as ApiError;

      if (error.message === "NO_FRIENDS_FOUND") {
        set({ error: null, isLoading: false });

        throw new Error();
      }

      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  getBlockedFriends: async (filters: BlockedFriendFilters = {}) => {
    set({ isBlockedFriendsLoading: true, blockedFriendsError: null });

    try {
      const params = new URLSearchParams();

      // Ajouter les paramètres de filtrage
      if (filters.sort) params.append("sort", filters.sort);
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.page) params.append("page", filters.page.toString());

      const url = `${ApiUrl.BLOCKED_FRIENDS}?${params.toString()}`;

      const { data } = await apiUtils.get<BlockedFriendsResponse>(url);

      set({
        blockedFriends: data.friends,
        blockedFriendsPagination: data.pagination,
        isBlockedFriendsLoading: false,
      });
    } catch (err) {
      const error = err as ApiError;

      if (error.message === "NO_BLOCKED_FRIENDS_FOUND") {
        set({
          blockedFriendsError: null,
          isBlockedFriendsLoading: false,
        });
        throw new Error();
      }

      set({
        blockedFriendsError: error.message,
        isBlockedFriendsLoading: false,
      });
      throw error;
    }
  },
  getFriendsRequest: async (filter: FriendRequestType = "all") => {
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      if (filter) params.append("type", filter);

      const url = `${ApiUrl.FRIENDS_REQUESTS}?${params.toString()}`;

      const { data } = await apiUtils.get(url);

      set({ friendRequests: data, isLoading: false });
    } catch (err) {
      const error = err as ApiError;

      if (error.message === "NO_FRIEND_REQUESTS_FOUND") {
        set({ error: null, isLoading: false });
        throw new Error();
      }

      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Envoyer une demande d'ami
  sendFriendRequest: async (email, message = "") => {
    set({ isRequestLoading: true, error: null });
    try {
      await apiUtils.post(ApiUrl.FRIENDS_REQUEST, {
        email,
        message,
      });
      set({ isRequestLoading: false });
      return true;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors de l'envoi de la demande d'ami");
      set({ error: error.message, isRequestLoading: false });
      throw error;
    }
  },

  // Accepter une demande d'ami
  acceptFriendRequest: async (requestId) => {
    set({ isRequestLoading: true, error: null });
    try {
      await apiUtils.put(`${ApiUrl.FRIENDS_REQUESTS}/${requestId}/accept`);

      // Mettre à jour l'état local - MAINTENANT SEULEMENT friendRequests
      set((state) => ({
        friendRequests: state.friendRequests.filter(
          (req) => req.id !== requestId
        ),
        isRequestLoading: false,
      }));
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors de l'acceptation de la demande");
      set({ error: error.message, isRequestLoading: false });
      throw error;
    }
  },

  // Refuser une demande d'ami
  declineFriendRequest: async (requestId) => {
    set({ isRequestLoading: true, error: null });
    try {
      await apiUtils.put(`${ApiUrl.FRIENDS_REQUESTS}/${requestId}/decline`);

      // Mettre à jour l'état local - MAINTENANT SEULEMENT friendRequests
      set((state) => ({
        friendRequests: state.friendRequests.filter(
          (req) => req.id !== requestId
        ),
        isRequestLoading: false,
      }));
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors du refus de la demande");
      set({ error: error.message, isRequestLoading: false });
      throw error;
    }
  },

  // Supprimer un ami
  removeFriend: async (friendId) => {
    set({ isLoading: true, error: null });
    try {
      await apiUtils.del(`${ApiUrl.FRIENDS}/${friendId}`);

      // Mettre à jour l'état local
      set((state) => ({
        friends: state.friends.filter((friend) => friend.id !== friendId),
        isLoading: false,
      }));
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors de la suppression de l'ami");
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Rechercher des utilisateurs
  searchUsers: async (query) => {
    set({ isSearching: true, error: null });
    try {
      const { data, message } = await apiUtils.get(
        `${ApiUrl.FRIENDS_SEARCH}?q=${encodeURIComponent(query)}`
      );

      console.log("DATA: ", message);
      set({ searchResults: data, isSearching: false });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors de la recherche d'utilisateurs");
      set({ error: error.message, isSearching: false });
      throw error;
    }
  },

  // Effacer les résultats de recherche
  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  // Bloquer un utilisateur
  blockUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await apiUtils.put(`${ApiUrl.FRIENDS}/${userId}/block`);

      // Mettre à jour l'état local
      set((state) => ({
        friends: state.friends.filter((friend) => friend.id !== userId),
        isLoading: false,
      }));
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors du blocage de l'utilisateur");
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  unblockUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await apiUtils.put(`${ApiUrl.FRIENDS}/${userId}/unblock`);

      // Mettre à jour l'état local
      set((state) => ({
        friends: state.friends.filter((friend) => friend.id !== userId),
        isLoading: false,
      }));
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors du deblocage de l'utilisateur");
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Signaler un utilisateur
  reportUser: async (userId, reason) => {
    set({ isLoading: true, error: null });
    try {
      await apiUtils.post(ApiUrl.FRIENDS_REPORT, {
        reportedUserId: userId,
        reason,
        details: "Signalé via l'interface utilisateur",
        severity: "medium",
      });
      set({ isLoading: false });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors du signalement de l'utilisateur");
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Mettre à jour les paramètres de confidentialité
  updatePrivacySettings: async (settings) => {
    set({ isLoading: true, error: null });
    try {
      // Cette route devrait être définie dans votre API
      await apiUtils.put("/user/privacy-settings", settings);
      set({ isLoading: false });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error(
              "Erreur lors de la mise à jour des paramètres de confidentialité"
            );
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getFriendActivities: async () => {
    set({ isActivityLoading: true, error: null });
    try {
      const { data } = await apiUtils.get("/friends/activities");
      set({ friendActivities: data, isActivityLoading: false });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors de la récupération des activités");
      set({ error: error.message, isActivityLoading: false });
      throw error;
    }
  },

  getFriendsStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiUtils.get<FriendsStats>("/friends/stats");

      // Get the current online friends count from the store
      const onlineFriendsCount = get().onlineFriends.size;

      // Inject the connected friends count into the stats
      const statsWithConnectedFriends = {
        ...data,
        onlineFriends: onlineFriendsCount, // Override the onlineFriends count with real-time data
        connectedFriends: onlineFriendsCount, // Add a new field for connected friends
      };

      set({ friendsStats: statsWithConnectedFriends, isLoading: false });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors de la récupération des statistiques");
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // ****************** MESSAGE************************
  // Envoyer un message à un ami
  // Dans la méthode getMessages
  getMessages: async (friend_id: string, page = 1, limit = 50) => {
    set({ isLoadingMessages: true, conversationError: null });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const { data } = await apiUtils.get<Message[]>(
        `${ApiUrl.FRIENDS}/conversations/${friend_id}/messages?${params}`
      );

      console.log("API response for messages:", data);

      set((state) => ({
        messages: page === 1 ? data : [...state.messages, ...data],
        isLoadingMessages: false,
      }));

      return data;
    } catch (err) {
      const error = err as ApiError;
      console.error("Error loading messages:", error);
      set({ conversationError: error.message, isLoadingMessages: false });
      throw error;
    }
  },

  // Dans la méthode sendMessage
  sendMessage: async ({
    friendId,
    content,
    messageType,
  }: SendMessageParams) => {
    set({ isSendingMessage: true, conversationError: null });

    try {
      const { data } = await apiUtils.post<Message>(
        `${ApiUrl.FRIENDS}/${friendId}/message`,
        { content, messageType }
      );

      console.log("Message sent successfully:", data);

      // NE PAS ajouter le message ici - il sera ajouté via socket ou par le re-fetch
      // Le socket ou une autre méthode se chargera de l'ajouter

      set({ isSendingMessage: false });
      return data;
    } catch (err) {
      const error = err as ApiError;
      console.error("Error sending message:", error);
      set({ conversationError: error.message, isSendingMessage: false });
      throw error;
    }
  },

  // Récupérer les conversations
  getConversations: async () => {
    set({ isLoading: true, conversationError: null });

    try {
      const { data } = await apiUtils.get<Conversation[]>(ApiUrl.CONVERSATIONS);
      // console.log("h: ", data);

      set({ conversations: data, isLoading: false });
    } catch (err) {
      const error = err as ApiError;
      set({ conversationError: error.message, isLoading: false });
      throw error;
    }
  },

  findConversationByParticipant: (friendId: string): string | null => {
    console.log("HHHH: ", friendId);

    const { conversations } = get();
    const conversation = conversations.find((conv) => {
      return conv.participants.some((participant) => participant === friendId);
    });
    return conversation ? conversation.id : null;
  },

  // Marquer les messages comme lus
  markAsRead: async (conversationId: string, messageIds?: string[]) => {
    try {
      await apiUtils.put(`${ApiUrl.CONVERSATIONS}/${conversationId}/read`, {
        messageIds,
      });

      // Mettre à jour l'état local
      set((state) => ({
        messages: state.messages.map((msg) =>
          (!messageIds || messageIds.includes(msg.id)) && !msg.read
            ? { ...msg, read: true }
            : msg
        ),
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ),
      }));
    } catch (err) {
      const error = err as ApiError;
      console.error("Error marking messages as read:", error);
      throw error;
    }
  },

  // Récupérer les messages d'une conversation
  getMessages2: async (conversationId: string, page = 1, limit = 50) => {
    set({ isLoadingMessages: true, conversationError: null });

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const { data } = await apiUtils.get<Message[]>(
        `${ApiUrl.CONVERSATIONS}/${conversationId}/messages?${params}`
      );

      set((state) => ({
        messages: page === 1 ? data : [...state.messages, ...data],
        isLoadingMessages: false,
      }));

      return data;
    } catch (err) {
      const error = err as ApiError;

      console.log("H: ", err);
      set({ conversationError: error.message, isLoadingMessages: false });
      throw error;
    }
  },

  // Mettre à jour l'état en temps réel avec les nouveaux messages
  // addNewMessage: (message: Message) => {
  //   set((state) => {
  //     // Vérifier si le message existe déjà pour éviter les doublons
  //     const messageExists = state.messages.some((msg) => msg.id === message.id);
  //     if (messageExists) {
  //       return state;
  //     }

  //     const updatedMessages = [...state.messages, message];

  //     return {
  //       messages: updatedMessages,
  //     };
  //   });
  // },

  addNewMessage: (message: Message) => {
    set((state) => {
      // Vérifier si le message existe déjà (par ID ou contenu + timestamp)
      const messageExists = state.messages.some(
        (msg) =>
          msg.id === message.id ||
          (msg.content === message.content &&
            Math.abs(
              new Date(msg.createdAt).getTime() -
                new Date(message.createdAt).getTime()
            ) < 1000)
      );

      if (messageExists) {
        console.log("Message already exists, skipping:", message.id);
        return state;
      }

      console.log("Adding new message to store:", message);
      return {
        messages: [...state.messages, message],
      };
    });
  },

  // Effacer les messages d'une conversation
  clearMessages: () => {
    set({ messages: [], currentConversation: null });
  },

  // Définir la conversation courante
  setCurrentConversation: (conversationId: string | null) => {
    set({ currentConversation: conversationId });

    // Si on définit une conversation, marquer les messages comme lus
    // if (conversationId) {
    //   get().markAsRead(conversationId).catch(console.error);
    // }
  },
  // **************************** END OF MESSAGE ***************************

  initializeSocket: (userId?: string) => {
    const token = sec.getItem("aspk") as string;
    

    if (!token) {
      console.error("No token found for socket connection");
      return;
    }

    const { socket: existingSocket } = get();
    if (existingSocket) {
      existingSocket.disconnect();
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL as string, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      extraHeaders: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    socket.on("connect", () => {
      // console.log("Connected to presence server");

      const currentUserId = userId || get().currentUser?.id;
      if (currentUserId) {
        socket.emit("user_online", currentUserId);
        // console.log(
        //   "Notified server of online status for user:",
        //   currentUserId
        // );

        // Demander la liste actuelle des amis en ligne
        socket.emit(
          "get_online_friends",
          currentUserId,
          (onlineFriends: string[]) => {
            set((state) => {
              const newOnlineFriends = new Set(state.onlineFriends);
              onlineFriends.forEach((friendId) =>
                newOnlineFriends.add(friendId)
              );

              // Mettre à jour aussi le statut dans la liste des amis
              const updatedFriends = state.friends.map((friend) =>
                onlineFriends.includes(friend.id)
                  ? { ...friend, isOnline: true }
                  : friend
              );

              return {
                onlineFriends: newOnlineFriends,
                friends: updatedFriends,
              };
            });
            // console.log("Initial online friends received:", onlineFriends);
          }
        );
      }
    });

    // Écouter les événements de frappe
    socket.on(
      "user_typing",
      (data: { userId: string; isTyping: boolean; friendId: string }) => {
        // Mettre à jour le statut de frappe dans le store
        get().setTypingStatus(data.userId, data.isTyping);

        console.log(
          `User ${data.userId} is ${
            data.isTyping ? "typing" : "not typing"
          } in conversation ${data.friendId}`
        );
      }
    );

    socket.on("friend_online", (userId: string) => {
      set((state) => {
        const onlineFriends = new Set(state.onlineFriends);
        onlineFriends.add(userId);

        const updatedFriends = state.friends.map((friend) =>
          friend.id === userId ? { ...friend, isOnline: true } : friend
        );

        return { onlineFriends, friends: updatedFriends };
      });
      // console.log(`Friend ${userId} is now online`);
    });

    socket.on("friend_offline", (userId: string) => {
      set((state) => {
        const onlineFriends = new Set(state.onlineFriends);
        onlineFriends.delete(userId);

        const updatedFriends = state.friends.map((friend) =>
          friend.id === userId ? { ...friend, isOnline: false } : friend
        );

        return { onlineFriends, friends: updatedFriends };
      });
      // console.log(`Friend ${userId} is now offline`);
    });

    // Recevoir la liste complète des amis en ligne
    socket.on("friends_online_list", (onlineFriends: string[]) => {
      set((state) => {
        const newOnlineFriends = new Set(onlineFriends);

        // Mettre à jour le statut dans la liste des amis
        const updatedFriends = state.friends.map((friend) =>
          onlineFriends.includes(friend.id)
            ? { ...friend, isOnline: true }
            : friend
        );

        return {
          onlineFriends: newOnlineFriends,
          friends: updatedFriends,
        };
      });
      // console.log("Received complete online friends list:", onlineFriends);
    });

    socket.on("reconnect", (attemptNumber) => {
      // console.log("Reconnected to server, attempt:", attemptNumber);
      const currentUserId = userId || get().currentUser?.id;
      if (currentUserId) {
        socket.emit("user_online", currentUserId);
      }
    });

    socket.on("connect_error", (error) => {
      // console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      // console.log("Disconnected from presence server:", reason);
    });

    socket.on("new_message", (message: Message) => {
      if (!message.friend_id || !message.sender || !message.content) {
        return;
      }

      get().addNewMessage(message);
    });

    socket.on("typing_start", (message: Message) => {
      if (!message.friend_id || !message.sender || !message.content) {
        return;
      }

      get().addNewMessage(message);
    });
    set({ socket });
  },

  disconnectSocket: () => {
    const { socket, currentUser } = get();
    if (socket) {
      if (currentUser && currentUser.id) {
        socket.emit("user_offline", currentUser.id);
      }
      socket.disconnect();
      set({ socket: null, onlineFriends: new Set() });
    }
  },

  setCurrentUser: (user: { id: string } | null) => {
    set({ currentUser: user });

    const { socket } = get();

    if (user) {
      if (socket && socket.connected) {
        socket.emit("user_online", user.id);
        // console.log("Notified server of new user online:", user.id);
      } else if (!socket) {
        get().initializeSocket(user.id);
      }
    }
  },

  // Méthode pour rafraîchir manuellement la liste des amis en ligne
  refreshOnlineFriends: async () => {
    const { socket, currentUser } = get();
    if (socket && currentUser && currentUser.id) {
      socket.emit(
        "get_online_friends",
        currentUser.id,
        (onlineFriends: string[]) => {
          set((state) => {
            const newOnlineFriends = new Set(onlineFriends);
            const updatedFriends = state.friends.map((friend) =>
              onlineFriends.includes(friend.id)
                ? { ...friend, isOnline: true }
                : friend
            );

            return {
              onlineFriends: newOnlineFriends,
              friends: updatedFriends,
            };
          });
        }
      );
    }
  },

  // Méthodes pour rejoindre/quitter les conversations
  joinConversation: (friendId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit("join_conversation", friendId);
    }
  },

  leaveConversation: (friendId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit("leave_conversation", friendId);
    }
  },

  getOnlineFriends: (friendId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit("get_online_friends", friendId);
    }
  },

  // Méthode pour envoyer des messages via socket
  sendRealTimeMessage: (
    messageData: Omit<Message, "id" | "createdAt"> & { friend_id: string }
  ) => {
    const { socket } = get();
    if (socket) {
      socket.emit(
        "send_message",
        messageData,
        (response: { success: boolean; error?: string }) => {
          if (!response.success) {
            console.error("Failed to send message:", response.error);
          }
        }
      );
    }
  },

  // Typing streaming
  // Dans votre store Zustand
  setTypingStatus: (friendId: string, isTyping: boolean) => {
    set((state) => ({
      friends: state.friends.map((friend) =>
        friend.id === friendId ? { ...friend, isTyping } : friend
      ),
    }));
  },

  // Méthodes pour gérer la frappe
  startTyping: (friendId: string) => {
    const { socket, currentUser, typingTimeouts } = get();

    // Clear existing timeout
    if (typingTimeouts.has(friendId)) {
      clearTimeout(typingTimeouts.get(friendId));
      typingTimeouts.delete(friendId);
    }

    if (socket && currentUser) {
      socket.emit("typing_start", {
        friendId,
        userId: currentUser.id,
      });

      // Set new timeout to automatically stop typing after 3 seconds
      const timeout = setTimeout(() => {
        get().stopTyping(friendId);
      }, 3000);

      typingTimeouts.set(friendId, timeout);
    }
  },

  stopTyping: (friendId: string) => {
    const { socket, currentUser, typingTimeouts } = get();

    // Clear timeout if exists
    if (typingTimeouts.has(friendId)) {
      clearTimeout(typingTimeouts.get(friendId));
      typingTimeouts.delete(friendId);
    }

    if (socket && currentUser) {
      socket.emit("typing_stop", {
        friendId,
        userId: currentUser.id,
      });
    }
  },
}));
