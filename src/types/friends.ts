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
// api/friends?status=online&sort=name'
export interface FriendsState {
  // Données
  friends: Friend[];
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
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

  // Actions pour les amis
  getFriends: (filters?: FriendFilter) => Promise<void>;
  getBlockedFriends: (filters?: BlockedFriendFilters) => Promise<void>;
  getFriendsRequest: (filter: FriendRequestType) => Promise<void>;
  sendFriendRequest: (email: string, message?: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
  searchUsers: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  reportUser: (userId: string, reason: string) => void;
  updatePrivacySettings: (settings: {
    profileVisibility: string;
    activityVisibility: string;
  }) => void;
  getFriendsStats: () => Promise<void>;
  getFriendActivities: () => void;
  initializeSocket: (id: string) => void;
  disconnectSocket: () => void;
  refreshOnlineFriends: () => void;
  setCurrentUser: (user: { id: string } | null) => void; // Ajoutez cette méthode
}
