import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Friend, FriendRequest, SharedMeal, Comment } from '../types/diet';
import { toast } from 'react-toastify';

interface SocialContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  sharedMeals: SharedMeal[];
  addFriend: (friendId: string) => void;
  removeFriend: (friendId: string) => void;
  sendFriendRequest: (email: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  shareMeal: (mealId: string, description?: string) => void;
  likeMeal: (sharedMealId: string) => void;
  addComment: (sharedMealId: string, comment: string) => void;
  searchUsers: (query: string) => Promise<Friend[]>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

const FRIENDS_STORAGE_KEY = 'runweek_friends';
const SHARED_MEALS_STORAGE_KEY = 'runweek_shared_meals';
const FRIEND_REQUESTS_STORAGE_KEY = 'runweek_friend_requests';

// Données mock pour les amis
const mockFriends: Friend[] = [
  {
    id: 'friend1',
    name: 'Marie Dubois',
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: true,
    lastActivity: '2025-01-20T10:30:00Z',
    mutualFriends: 3,
  },
  {
    id: 'friend2',
    name: 'Thomas Martin',
    profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: false,
    lastActivity: '2025-01-19T18:45:00Z',
    mutualFriends: 1,
  },
  {
    id: 'friend3',
    name: 'Sophie Laurent',
    profileImage: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: true,
    lastActivity: '2025-01-20T14:20:00Z',
    mutualFriends: 5,
  },
  {
    id: 'friend4',
    name: 'Lucas Moreau',
    profileImage: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: true,
    lastActivity: '2025-01-20T16:15:00Z',
    mutualFriends: 2,
  },
];

// Mock shared meals
const mockSharedMeals: SharedMeal[] = [
  {
    id: 'shared1',
    user: mockFriends[0],
    meal: {
      id: 'meal1',
      foodItem: {
        id: 'f1',
        name: 'Salade de quinoa aux légumes',
        calories: 220,
        protein: 8,
        carbs: 35,
        fat: 6,
      },
      quantity: 250,
      unit: 'g',
      mealType: 'lunch',
      timestamp: new Date().toISOString(),
    },
    description: 'Délicieuse salade post-entraînement ! 🥗',
    likes: 5,
    comments: [
      {
        id: 'comment1',
        user: mockFriends[1],
        text: 'Ça a l\'air délicieux !',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      }
    ],
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isLiked: false,
  },
  {
    id: 'shared2',
    user: mockFriends[2],
    meal: {
      id: 'meal2',
      foodItem: {
        id: 'f2',
        name: 'Smoothie protéiné',
        calories: 180,
        protein: 25,
        carbs: 15,
        fat: 3,
      },
      quantity: 300,
      unit: 'ml',
      mealType: 'snack',
      timestamp: new Date().toISOString(),
    },
    description: 'Parfait après ma course matinale ! 💪',
    likes: 8,
    comments: [],
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    isLiked: true,
  },
];

export const SocialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [friends, setFriends] = useState<Friend[]>(() => {
    try {
      const stored = localStorage.getItem(FRIENDS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : mockFriends;
    } catch {
      return mockFriends;
    }
  });

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() => {
    try {
      const stored = localStorage.getItem(FRIEND_REQUESTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [sharedMeals, setSharedMeals] = useState<SharedMeal[]>(() => {
    try {
      const stored = localStorage.getItem(SHARED_MEALS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : mockSharedMeals;
    } catch {
      return mockSharedMeals;
    }
  });

  useEffect(() => {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem(FRIEND_REQUESTS_STORAGE_KEY, JSON.stringify(friendRequests));
  }, [friendRequests]);

  useEffect(() => {
    localStorage.setItem(SHARED_MEALS_STORAGE_KEY, JSON.stringify(sharedMeals));
  }, [sharedMeals]);

  const addFriend = (friendId: string) => {
    console.log('Adding friend:', friendId);
    toast.success('Ami ajouté avec succès !');
  };

  const removeFriend = (friendId: string) => {
    setFriends(prev => prev.filter(friend => friend.id !== friendId));
    toast.info('Ami supprimé');
  };

  const sendFriendRequest = async (email: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Sending friend request to:', email);
    toast.success('Demande d\'ami envoyée !');
    return true;
  };

  const acceptFriendRequest = (requestId: string) => {
    const request = friendRequests.find(req => req.id === requestId);
    if (request) {
      setFriends(prev => [...prev, request.from]);
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      toast.success(`${request.from.name} est maintenant votre ami !`);
    }
  };

  const declineFriendRequest = (requestId: string) => {
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    toast.info('Demande d\'ami refusée');
  };

  const shareMeal = (mealId: string, description?: string) => {
    // Simulate sharing a meal
    const mockSharedMeal: SharedMeal = {
      id: `shared_${Date.now()}`,
      user: {
        id: 'current_user',
        name: 'Vous',
        profileImage: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
        isOnline: true,
      },
      meal: {
        id: mealId,
        foodItem: {
          id: 'shared_food',
          name: 'Repas partagé',
          calories: 300,
          protein: 20,
          carbs: 30,
          fat: 10,
        },
        quantity: 1,
        unit: 'portion',
        mealType: 'lunch',
        timestamp: new Date().toISOString(),
      },
      description: description || '',
      likes: 0,
      comments: [],
      timestamp: new Date().toISOString(),
      isLiked: false,
    };

    setSharedMeals(prev => [mockSharedMeal, ...prev]);
    toast.success('Repas partagé avec vos amis !');
  };

  const likeMeal = (sharedMealId: string) => {
    setSharedMeals(prev => 
      prev.map(meal => 
        meal.id === sharedMealId 
          ? { 
              ...meal, 
              isLiked: !meal.isLiked, 
              likes: meal.isLiked ? meal.likes - 1 : meal.likes + 1 
            }
          : meal
      )
    );
  };

  const addComment = (sharedMealId: string, comment: string) => {
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      user: {
        id: 'current_user',
        name: 'Vous',
        profileImage: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
        isOnline: true,
      },
      text: comment,
      timestamp: new Date().toISOString(),
    };

    setSharedMeals(prev => 
      prev.map(meal => 
        meal.id === sharedMealId 
          ? { ...meal, comments: [...meal.comments, newComment] }
          : meal
      )
    );
    toast.success('Commentaire ajouté !');
  };

  const searchUsers = async (query: string): Promise<Friend[]> => {
    // Filter users based on their privacy settings (showInSearch)
    // In a real app, this would be handled by the backend
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate filtering based on privacy settings
    const searchableUsers = mockFriends.filter(friend => {
      // In a real app, this would check friend.preferences.dataSharing.showInSearch
      // For demo, we'll assume some users are searchable
      return friend.name.toLowerCase().includes(query.toLowerCase()) && 
             Math.random() > 0.3; // Simulate some users not being searchable
    });
    
    return searchableUsers;
  };

  return (
    <SocialContext.Provider value={{
      friends,
      friendRequests,
      sharedMeals,
      addFriend,
      removeFriend,
      sendFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      shareMeal,
      likeMeal,
      addComment,
      searchUsers,
    }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};