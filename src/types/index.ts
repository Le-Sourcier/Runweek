export type SearchResult = {
  id: string;
  type: 'activity' | 'achievement' | 'goal' | 'route';
  title: string;
  description?: string;
  url: string;
  category?: string;
  date?: string;
};

export type SearchHistory = {
  id: string;
  query: string;
  timestamp: number;
};

export type NotificationType = 'achievement' | 'goal' | 'system' | 'social' | 'reminder';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  icon?: string;
  category?: string;
};

export type NotificationPreferences = {
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    [key in NotificationType]: boolean;
  };
};

export type PersonalRecord = {
  id: string; // unique identifier
  distance: number; // in kilometers, e.g., 5, 10, 21.1, 42.2
  time: string; // formatted as HH:MM:SS
  date: string; // ISO date string, e.g., "2024-07-28"
  notes?: string; // optional, for any additional details
};