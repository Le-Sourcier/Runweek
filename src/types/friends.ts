import { Socket } from "socket.io-client";

export interface Friend {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  isOnline: boolean;
  lastActivity: string;
  mutualFriends: number;
  joinedDate: string;
  isTyping?: boolean;
  stats?: {
    totalDistance: number;
    totalRuns: number;
    averagePace: string;
    level: number;
    experience: number;
  };
  preferences?: {
    profileVisibility: "public" | "friends" | "private";
    activityVisibility: "public" | "friends" | "private";
  };
}

export type FriendRequestType = "all" | "sent" | "received";

export interface FriendRequest {
  type: FriendRequestType;
  id: string;
  fname: string;
  lname: string;
  email: string;
  image: string;
  stats: {
    level: number;
  };
  status: "pending" | "accepted" | "declined";
  requestMessage: string;
  createdAt: string;
}

export interface FriendActivity {
  id: string;
  friend: Friend;
  type: "run" | "achievement" | "goal_completed" | "personal_record";
  title: string;
  description: string;
  timestamp: string;
  data?: any; // Additional data specific to activity type
}

export interface FriendsStats {
  totalFriends: number;
  onlineFriends: number;
  pendingRequests: number;
  mutualConnections: number;
  recentActivity: number;
}

export interface FriendFilter {
  status?: "all" | "online" | "offline";
  sort?: "name" | "level" | "recent" | "mutual";
}

export type BlockedFriendSort = "name" | "mutual" | "recent";

export interface BlockedFriendFilters {
  sort?: BlockedFriendSort;
  limit?: number;
  page?: number;
}

export interface BlockedFriend {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  mutualFriends: number;
  joinedDate: string;
  blockedAt: string;
  preferences: {
    profileVisibility: "public" | "private";
    activityVisibility: "friends" | "private";
  };
}

export interface BlockedFriendsResponse {
  friends: BlockedFriend[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ******************* MESSAGE *****************************
// export interface Message {
//   id: string;
//   conversation: string;
//   sender: {
//     id: string;
//     fname: string;
//     lname: string;
//     profile_image: string;
//   };
//   content: string;
//   messageType: "text" | "image" | "system";
//   createdAt: string;
//   // read: boolean;
// }

export interface Message {
  id: string;
  friend_id: string;
  sender: {
    id: string;
    email: string; // ← ajouter email
    profile: {
      fname: string;
      lname: string;
      image: string;
    };
  };
  content: string;
  messageType: "text" | "image" | "system";
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  friendName: string;
  friendImage: string;
  lastMessage: Message | null;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageParams {
  friendId: string;
  content: string;
  messageType: "text" | "image" | "system";
}
// api/friends?status=online&sort=name'
export interface FriendsState {
  // Données
  friends: Friend[];
  friendRequests: FriendRequest[];
  friendActivities: FriendActivity[];
  friendsStats: FriendsStats | null;
  searchResults: Friend[];

  currentUser: { id: string } | null; // Ici au bon endroit

  // États de chargement
  isLoading: boolean;
  isRequestLoading: boolean;
  isActivityLoading: boolean;
  isSearching: boolean;

  // Erreurs
  error: string | null;

  // Socket
  onlineFriends: Set<string>;
  socket: Socket | null;

  blockedFriends: BlockedFriend[];
  blockedFriendsPagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null;
  isBlockedFriendsLoading: boolean;
  blockedFriendsError: string | null;

  // Message
  conversations: Conversation[];
  currentConversation: string | null;
  messages: Message[];
  isSendingMessage: boolean;
  isLoadingMessages: boolean;
  conversationError: string | null;

  // Friends
  getFriends: (filters?: FriendFilter) => Promise<void>;
  getBlockedFriends: (filters?: BlockedFriendFilters) => Promise<void>;
  getFriendsRequest: (filter: FriendRequestType) => Promise<void>;
  sendFriendRequest: (email: string, message?: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => void;
  reportUser: (userId: string, reason: string) => Promise<void>;
  updatePrivacySettings: (settings: {
    profileVisibility: string;
    activityVisibility: string;
  }) => void;
  getFriendsStats: () => Promise<void>;
  getFriendActivities: () => void;

  // Socket
  initializeSocket: (id: string) => void;
  disconnectSocket: () => void;
  refreshOnlineFriends: () => void;
  setCurrentUser: (user: { id: string } | null) => void; // Ajoutez cette méthode

  // Message
  sendMessage: (params: SendMessageParams) => Promise<Message>;
  getConversations: () => Promise<void>;
  getMessages: (
    friend_id: string,
    page?: number,
    limit?: number
  ) => Promise<Message[]>;
  markAsRead: (conversationId: string, messageIds?: string[]) => Promise<void>;
  addNewMessage: (message: Message) => void;
  clearMessages: () => void;
  setCurrentConversation: (conversationId: string | null) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendRealTimeMessage: (messageData: Omit<Message, "id" | "createdAt">) => void;
  findConversationByParticipant: (friendId: string) => string | null;

  // Typing indicator:
  typingTimeouts: Map<string, NodeJS.Timeout>;
  setTypingStatus: (friendId: string, isTyping: boolean) => void;
  startTyping: (friendId: string) => void;
  stopTyping: (friendId: string) => void;
}
