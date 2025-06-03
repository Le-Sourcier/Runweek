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