import { create } from "zustand";
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";
import { Friend, FriendRequestType, FriendsState } from "../types/friends";
import { io } from "socket.io-client";
import sec from "react-secure-storage";

export const useFriendsStore = create<FriendsState>((set, get) => ({
  // États initiaux
  friends: [],
  friendRequests: [],
  sentRequests: [],
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
  currentUser: null, // Ajout de currentUser

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
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors de la récupération des amis");
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  getFriendsRequest: async (filter: FriendRequestType) => {
    set({ isLoading: true, error: null });

    try {
      const params = new URLSearchParams();
      if (filter) params.append("type", filter);

      const url = `${ApiUrl.FRIENDS_REQUESTS}?${params.toString()}`;

      const { data } = await apiUtils.get(url);

      //   console.log("data: ", data);

      set({ friendRequests: data, isLoading: false });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors de la récupération des amis");
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  //   /friends/requests?type=sent

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

      // Mettre à jour l'état local
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

      // Mettre à jour l'état local
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

  // Dans votre store
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
      const { data } = await apiUtils.get("/friends/stats");
      set({ friendsStats: data, isLoading: false });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Erreur lors de la récupération des statistiques");
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
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

    const socket = io("http://localhost:3001", {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on("connect", () => {
      console.log("Connected to presence server");

      const currentUserId = userId || get().currentUser?.id;
      if (currentUserId) {
        socket.emit("user_online", currentUserId);
        console.log(
          "Notified server of online status for user:",
          currentUserId
        );

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
            console.log("Initial online friends received:", onlineFriends);
          }
        );
      }
    });

    socket.on("friend_online", (userId: string) => {
      set((state) => {
        const onlineFriends = new Set(state.onlineFriends);
        onlineFriends.add(userId);

        const updatedFriends = state.friends.map((friend) =>
          friend.id === userId ? { ...friend, isOnline: true } : friend
        );

        return { onlineFriends, friends: updatedFriends };
      });
      console.log(`Friend ${userId} is now online`);
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
      console.log(`Friend ${userId} is now offline`);
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
      console.log("Received complete online friends list:", onlineFriends);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected to server, attempt:", attemptNumber);
      const currentUserId = userId || get().currentUser?.id;
      if (currentUserId) {
        socket.emit("user_online", currentUserId);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected from presence server:", reason);
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
        console.log("Notified server of new user online:", user.id);
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
}));
