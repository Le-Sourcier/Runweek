import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import Card from '../ui/Card';
import { Bell } from 'lucide-react'; // Assuming Bell icon is suitable

interface NotificationSettingsProps {
  onBack: () => void;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  achievements: boolean;
  reminders: boolean;
  updates: boolean;
}

const defaultNotificationSettings: NotificationPreferences = {
  email: true,
  push: true,
  achievements: true,
  reminders: false,
  updates: true,
};

export default function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const { user, updateUserPreferences } = useUser();
  const [currentNotificationSettings, setCurrentNotificationSettings] = useState<NotificationPreferences>(
    user?.preferences?.notificationSettings || defaultNotificationSettings
  );

  useEffect(() => {
    if (user?.preferences?.notificationSettings) {
      setCurrentNotificationSettings(user.preferences.notificationSettings);
    } else {
      setCurrentNotificationSettings(defaultNotificationSettings);
    }
  }, [user?.preferences?.notificationSettings]);

  const handleNotificationToggle = (key: keyof NotificationPreferences) => {
    setCurrentNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotificationSettings = () => {
    // Ensure other preferences are preserved
    const preferencesToSave = {
      ...user?.preferences, // Spread existing preferences
      notificationSettings: currentNotificationSettings, // Apply updated notification settings
    };
    // Remove undefined fields that might have come from user.preferences if it was initially null/undefined
    if (preferencesToSave.distanceUnit === undefined) preferencesToSave.distanceUnit = 'kilometers';
    if (preferencesToSave.preferredRunDays === undefined) preferencesToSave.preferredRunDays = ['Mon', 'Wed', 'Fri'];
    if (preferencesToSave.preferredRunTime === undefined) preferencesToSave.preferredRunTime = 'morning';
    if (preferencesToSave.trainingFocus === undefined) preferencesToSave.trainingFocus = 'endurance';
    if (preferencesToSave.activityVisibility === undefined) preferencesToSave.activityVisibility = 'friends';
    if (preferencesToSave.profileVisibility === undefined) preferencesToSave.profileVisibility = 'friends';
    if (preferencesToSave.dataSharing === undefined) preferencesToSave.dataSharing = false;
    if (preferencesToSave.locationSharing === undefined) preferencesToSave.locationSharing = true;


    updateUserPreferences(preferencesToSave);
    // Optionally: show a success notification/toast
    console.log('Notification settings saved:', preferencesToSave);
    // onBack(); // Optionally navigate back after saving
  };

  const notificationOptions: Array<{ key: keyof NotificationPreferences; label: string; description: string }> = [
    { key: 'email', label: 'Email Notifications', description: 'Receive important updates and summaries via email.' },
    { key: 'push', label: 'Push Notifications', description: 'Get real-time alerts on your mobile device.' },
    { key: 'achievements', label: 'Achievement Alerts', description: 'Notify me when I unlock new achievements.' },
    { key: 'reminders', label: 'Training Reminders', description: 'Get reminders for scheduled runs and activities.' },
    { key: 'updates', label: 'Product Updates', description: 'Receive news about new features and improvements.' },
  ];

  return (
    <Card title="Notification Preferences" className="bg-card text-card-foreground border-border">
      <button onClick={onBack} className="btn btn-ghost mb-6 text-sm">
        &larr; Back to Account Settings
      </button>

      <div className="space-y-6">
        {notificationOptions.map((option) => (
          <div key={option.key} className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">{option.label}</h4>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                id={`toggle-${option.key}`}
                className="sr-only peer"
                checked={currentNotificationSettings[option.key]}
                onChange={() => handleNotificationToggle(option.key)}
              />
              <label
                htmlFor={`toggle-${option.key}`}
                className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors ${
                  currentNotificationSettings[option.key] ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span className={`block h-6 w-6 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${
                  currentNotificationSettings[option.key] ? 'translate-x-6' : ''
                }`}></span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-border flex justify-end">
        <button onClick={handleSaveNotificationSettings} className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </Card>
  );
}
