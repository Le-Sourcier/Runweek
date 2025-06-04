import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import Card from '../ui/Card';
import { Users, Link2, Facebook, Twitter, Zap, BarChart2 } from 'lucide-react'; // Example icons
import { motion } from 'framer-motion';

interface ConnectedAccountsSettingsProps {
  onBack: () => void;
}

interface SocialAccountIntegration {
  id: string; // e.g., 'facebook', 'strava'
  name: string;
  icon: JSX.Element;
  description: string;
}

// Define this array based on available integrations
const availableSocialIntegrations: SocialAccountIntegration[] = [
  { id: 'facebook', name: 'Facebook', icon: <Facebook size={24} />, description: 'Share your activities and achievements.' },
  { id: 'twitter', name: 'Twitter', icon: <Twitter size={24} />, description: 'Post updates about your runs.' },
  { id: 'strava', name: 'Strava', icon: <Zap size={24} />, description: 'Sync your runs with the Strava community.' }, // Using Zap as a placeholder for Strava
  { id: 'garmin', name: 'Garmin Connect', icon: <BarChart2 size={24} />, description: 'Automatically sync activities from your Garmin device.' }, // Using BarChart2 for Garmin
];

// Assuming user.socialAccounts is an object like: { 'strava': { connected: true, username: 'runner123' }, 'facebook': { connected: false } }
// Or it could be an array of connected IDs: ['strava', 'garmin']
// For this example, let's assume it's an object where keys are integration IDs.
interface UserSocialAccounts {
  [accountId: string]: {
    connected: boolean;
    username?: string; // Optional: display username if connected
    linkedDate?: string; // Optional: display when it was linked
  };
}

export default function ConnectedAccountsSettings({ onBack }: ConnectedAccountsSettingsProps) {
  const { user, updateUserProfile } = useUser();

  // Local state to manage social accounts, initialized from user context.
  // This allows for optimistic updates or handling intermediate states if needed.
  const [socialAccounts, setSocialAccounts] = useState<UserSocialAccounts>(user?.socialAccounts || {});

  useEffect(() => {
    setSocialAccounts(user?.socialAccounts || {});
  }, [user?.socialAccounts]);

  const handleToggleAccountConnection = (accountId: string) => {
    const isConnected = socialAccounts[accountId]?.connected;

    if (isConnected) {
      // Simulate disconnection
      if (window.confirm(`Are you sure you want to disconnect from ${accountId}?`)) {
        const updatedAccounts = { ...socialAccounts, [accountId]: { connected: false } };
        setSocialAccounts(updatedAccounts);
        if (user) {
          updateUserProfile({ ...user, socialAccounts: updatedAccounts });
          console.log(`${accountId} disconnected.`);
        }
      }
    } else {
      // Simulate connection (e.g., OAuth flow)
      alert(`Simulating connection to ${accountId}... In a real app, this would trigger an OAuth flow.`);
      // For simulation, let's assume connection is successful
      const updatedAccounts = {
        ...socialAccounts,
        [accountId]: {
          connected: true,
          username: `User${Date.now().toString().slice(-4)}`, // Dummy username
          linkedDate: new Date().toISOString()
        }
      };
      setSocialAccounts(updatedAccounts);
      if (user) {
        updateUserProfile({ ...user, socialAccounts: updatedAccounts });
        console.log(`${accountId} connected.`);
      }
    }
  };

  return (
    <Card title="Connected Accounts" className="bg-card text-card-foreground border-border">
      <button onClick={onBack} className="btn btn-ghost mb-6 text-sm">
        &larr; Back to Account Settings
      </button>

      <div className="space-y-4">
        {availableSocialIntegrations.map((integration, index) => {
          const accountStatus = socialAccounts[integration.id];
          const isConnected = accountStatus?.connected;

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.075, duration: 0.25, ease: "easeOut" }}
              className="p-4 border border-border rounded-lg flex items-center justify-between hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-primary">{integration.icon}</span>
                <div>
                  <h4 className="font-medium text-foreground">{integration.name}</h4>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                  {isConnected && accountStatus.username && (
                    <p className="text-xs text-primary">Connected as: {accountStatus.username}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleToggleAccountConnection(integration.id)}
                className={`btn ${isConnected ? 'btn-outline dark:border-destructive dark:text-destructive dark:hover:bg-destructive/10' : 'btn-primary'}`}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
                <Link2 size={16} className="ml-2" />
              </button>
            </motion.div>
          );
        })}
      </div>
      {Object.values(socialAccounts).filter(acc => acc.connected).length === 0 && (
         <p className="text-muted-foreground text-center py-4 mt-4">No accounts connected. Connect to services to share your activities.</p>
      )}
    </Card>
  );
}
