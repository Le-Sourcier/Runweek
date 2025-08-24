import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Friend, FriendRequest, FriendActivity, FriendsStats } from '../types/friends';
import { toast } from 'react-toastify';

interface FriendsContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  friendActivities: FriendActivity[];
  friendsStats: FriendsStats;
  searchResults: Friend[];
  isSearching: boolean;
  sendFriendRequest: (email: string, message?: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
  searchUsers: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  blockUser: (userId: string) => void;
  reportUser: (userId: string, reason: string) => void;
  updatePrivacySettings: (settings: { profileVisibility: string; activityVisibility: string }) => void;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FRIENDS: 'runweek_friends',
  FRIEND_REQUESTS: 'runweek_friend_requests',
  SENT_REQUESTS: 'runweek_sent_requests',
  FRIEND_ACTIVITIES: 'runweek_friend_activities',
};

// Mock data
const mockFriends: Friend[] = [
  {
    id: 'friend1',
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: true,
    lastActivity: '2025-01-20T10:30:00Z',
    mutualFriends: 3,
    joinedDate: '2024-03-15',
    stats: {
      totalDistance: 245.8,
      totalRuns: 32,
      averagePace: '5:45',
      level: 6,
    },
    preferences: {
      profileVisibility: 'friends',
      activityVisibility: 'friends',
    },
  },
  {
    id: 'friend2',
    name: 'Thomas Martin',
    email: 'thomas.martin@email.com',
    profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: false,
    lastActivity: '2025-01-19T18:45:00Z',
    mutualFriends: 1,
    joinedDate: '2024-01-20',
    stats: {
      totalDistance: 189.3,
      totalRuns: 28,
      averagePace: '6:12',
      level: 4,
    },
    preferences: {
      profileVisibility: 'public',
      activityVisibility: 'friends',
    },
  },
  {
    id: 'friend3',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@email.com',
    profileImage: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: true,
    lastActivity: '2025-01-20T14:20:00Z',
    mutualFriends: 5,
    joinedDate: '2024-06-10',
    stats: {
      totalDistance: 312.7,
      totalRuns: 45,
      averagePace: '5:28',
      level: 8,
    },
    preferences: {
      profileVisibility: 'friends',
      activityVisibility: 'public',
    },
  },
];

const mockFriendRequests: FriendRequest[] = [
  {
    id: 'req1',
    from: {
      id: 'user4',
      name: 'Lucas Moreau',
      email: 'lucas.moreau@email.com',
      profileImage: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
      isOnline: false,
      lastActivity: '2025-01-19T20:15:00Z',
      mutualFriends: 2,
      joinedDate: '2024-08-05',
    },
    to: mockFriends[0], // Placeholder
    status: 'pending',
    timestamp: '2025-01-20T09:30:00Z',
    message: 'Salut ! J\'ai vu qu\'on avait des amis en commun. On pourrait courir ensemble !',
  },
];

const mockFriendActivities: FriendActivity[] = [
  {
    id: 'activity1',
    friend: mockFriends[0],
    type: 'run',
    title: 'Course matinale terminée',
    description: '8.5 km en 42 minutes - Excellent rythme !',
    timestamp: '2025-01-20T08:30:00Z',
    data: { distance: 8.5, time: '42:15', pace: '4:58' },
  },
  {
    id: 'activity2',
    friend: mockFriends[2],
    type: 'achievement',
    title: 'Nouveau badge débloqué',
    description: 'Badge "Marathonien" - Premier marathon terminé !',
    timestamp: '2025-01-19T16:45:00Z',
    data: { achievementId: 'marathon_finisher' },
  },
  {
    id: 'activity3',
    friend: mockFriends[1],
    type: 'personal_record',
    title: 'Nouveau record personnel',
    description: 'Nouveau record sur 5K : 23:45 !',
    timestamp: '2025-01-19T19:20:00Z',
    data: { distance: 5, time: '23:45', previousTime: '24:12' },
  },
];

export const FriendsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [friends, setFriends] = useState<Friend[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FRIENDS);
      return stored ? JSON.parse(stored) : mockFriends;
    } catch {
      return mockFriends;
    }
  });

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FRIEND_REQUESTS);
      return stored ? JSON.parse(stored) : mockFriendRequests;
    } catch {
      return mockFriendRequests;
    }
  });

  const [sentRequests, setSentRequests] = useState<FriendRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SENT_REQUESTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [friendActivities, setFriendActivities] = useState<FriendActivity[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FRIEND_ACTIVITIES);
      return stored ? JSON.parse(stored) : mockFriendActivities;
    } catch {
      return mockFriendActivities;
    }
  });

  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(friendRequests));
  }, [friendRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SENT_REQUESTS, JSON.stringify(sentRequests));
  }, [sentRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FRIEND_ACTIVITIES, JSON.stringify(friendActivities));
  }, [friendActivities]);

  // Calculate stats
  const friendsStats: FriendsStats = {
    totalFriends: friends.length,
    onlineFriends: friends.filter(f => f.isOnline).length,
    pendingRequests: friendRequests.length,
    mutualConnections: friends.reduce((sum, friend) => sum + friend.mutualFriends, 0),
  };

  const sendFriendRequest = async (email: string, message?: string): Promise<boolean> => {
    try {
      // Check if already friends
      const existingFriend = friends.find(f => f.email.toLowerCase() === email.toLowerCase());
      if (existingFriend) {
        toast.error('Cette personne est déjà dans votre liste d\'amis');
        return false;
      }

      // Check if request already sent
      const existingRequest = sentRequests.find(r => r.to.email.toLowerCase() === email.toLowerCase());
      if (existingRequest) {
        toast.error('Demande d\'ami déjà envoyée à cette personne');
        return false;
      }

      // Create new friend request and add to sent requests
      const newRequest: FriendRequest = {
        id: `req_${Date.now()}`,
        from: {
          id: 'current_user',
          name: 'Vous',
          email: 'current@user.com',
          profileImage: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
          isOnline: true,
          lastActivity: new Date().toISOString(),
          mutualFriends: 0,
          joinedDate: '2024-01-01',
        },
        to: {
          id: `user_${Date.now()}`,
          name: email.split('@')[0],
          email: email,
          profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
          isOnline: false,
          lastActivity: new Date().toISOString(),
          mutualFriends: Math.floor(Math.random() * 5),
          joinedDate: '2024-05-15',
        },
        status: 'pending',
        timestamp: new Date().toISOString(),
        message,
      };

      setSentRequests(prev => [...prev, newRequest]);
      
      // Simulate that the request was also received by the target user
      // In a real app, this would be handled by the backend
      setTimeout(() => {
        setFriendRequests(prev => [...prev, newRequest]);
      }, 2000);
      
      toast.success('Demande d\'ami envoyée avec succès !');
      return true;
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la demande d\'ami');
      return false;
    }
  };

  const acceptFriendRequest = (requestId: string) => {
    const request = friendRequests.find(req => req.id === requestId);
    if (request) {
      setFriends(prev => [...prev, request.from]);
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Add activity
      const newActivity: FriendActivity = {
        id: `activity_${Date.now()}`,
        friend: request.from,
        type: 'achievement',
        title: 'Nouvelle connexion',
        description: `${request.from.name} et vous êtes maintenant amis !`,
        timestamp: new Date().toISOString(),
      };
      setFriendActivities(prev => [newActivity, ...prev]);
      
      toast.success(`${request.from.name} est maintenant votre ami !`);
    }
  };

  const declineFriendRequest = (requestId: string) => {
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    toast.info('Demande d\'ami refusée');
  };

  const removeFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
    
    // Remove related activities
    setFriendActivities(prev => prev.filter(activity => activity.friend.id !== friendId));
    
    // Remove from sent/received requests if any
    setSentRequests(prev => prev.filter(req => req.to.id !== friendId));
    setFriendRequests(prev => prev.filter(req => req.from.id !== friendId));
  };

  const searchUsers = async (query: string): Promise<void> => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock search results (excluding current friends)
      const mockUsers: Friend[] = [
        {
          id: 'search1',
          name: 'Emma Rousseau',
          email: 'emma.rousseau@email.com',
          profileImage: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
          isOnline: true,
          lastActivity: '2025-01-20T12:00:00Z',
          mutualFriends: 2,
          joinedDate: '2024-07-20',
          stats: {
            totalDistance: 156.4,
            totalRuns: 22,
            averagePace: '6:05',
            level: 3,
          },
        },
        {
          id: 'search2',
          name: 'Pierre Durand',
          email: 'pierre.durand@email.com',
          profileImage: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150',
          isOnline: false,
          lastActivity: '2025-01-18T16:30:00Z',
          mutualFriends: 1,
          joinedDate: '2024-09-10',
          stats: {
            totalDistance: 298.7,
            totalRuns: 41,
            averagePace: '5:52',
            level: 7,
          },
        },
      ];

      const filteredResults = mockUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      ).filter(user => 
        !friends.some(friend => friend.id === user.id)
      );

      setSearchResults(filteredResults);
    } catch (error) {
      toast.error('Erreur lors de la recherche d\'utilisateurs');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearchResults = () => {
    setSearchResults([]);
  };

  const blockUser = (userId: string) => {
    // Remove from friends list
    setFriends(prev => prev.filter(f => f.id !== userId));
    
    // Remove from search results
    setSearchResults(prev => prev.filter(u => u.id !== userId));
    
    // Remove all activities from this user
    setFriendActivities(prev => prev.filter(activity => activity.friend.id !== userId));
    
    // Remove any pending requests
    setFriendRequests(prev => prev.filter(req => req.from.id !== userId));
    setSentRequests(prev => prev.filter(req => req.to.id !== userId));
    
    // Add to blocked users list (you could create a separate state for this)
    const blockedUsers = JSON.parse(localStorage.getItem('runweek_blocked_users') || '[]');
    const user = friends.find(f => f.id === userId) || searchResults.find(u => u.id === userId);
    if (user) {
      blockedUsers.push({ id: userId, name: user.name, blockedAt: new Date().toISOString() });
      localStorage.setItem('runweek_blocked_users', JSON.stringify(blockedUsers));
    }
  };

  const reportUser = (userId: string, reason: string) => {
    // Store report in localStorage (in real app, this would go to backend)
    const reports = JSON.parse(localStorage.getItem('runweek_user_reports') || '[]');
    const user = friends.find(f => f.id === userId) || searchResults.find(u => u.id === userId);
    
    if (user) {
      const newReport = {
        id: `report_${Date.now()}`,
        reportedUserId: userId,
        reportedUserName: user.name,
        reason,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      reports.push(newReport);
      localStorage.setItem('runweek_user_reports', JSON.stringify(reports));
      
      // Optionally remove from friends list if it's a serious report
      if (reason.includes('Harcèlement') || reason.includes('Comportement abusif')) {
        setFriends(prev => prev.filter(f => f.id !== userId));
        setFriendActivities(prev => prev.filter(activity => activity.friend.id !== userId));
      }
      
      toast.success(`${user.name} a été signalé. Notre équipe examinera le rapport.`);
    }
  };

  const updatePrivacySettings = (settings: { profileVisibility: string; activityVisibility: string }) => {
    console.log('Paramètres de confidentialité mis à jour:', settings);
    toast.success('Paramètres de confidentialité mis à jour');
  };

  return (
    <FriendsContext.Provider value={{
      friends,
      friendRequests,
      sentRequests,
      friendActivities,
      friendsStats,
      searchResults,
      isSearching,
      sendFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      removeFriend,
      searchUsers,
      clearSearchResults,
      blockUser,
      reportUser,
      updatePrivacySettings,
    }}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};