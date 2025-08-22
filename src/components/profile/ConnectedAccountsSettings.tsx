import { useState, useEffect } from "react";
import { useUserContext } from "../../hooks/useUser";
import Card from "../ui/Card";
import { Link2 } from "lucide-react"; // Example icons
import { motion } from "framer-motion";
import {
  availableSocialIntegrations,
  SocialAccountConnection,
} from "../../types/user";

interface ConnectedAccountsSettingsProps {
  onBack: () => void;
}

// Define this array based on available integrations

export default function ConnectedAccountsSettings({
  onBack,
}: ConnectedAccountsSettingsProps) {
  const { user, updateUserProfile, linkedAccount, unlinkedAccount } =
    useUserContext();

  // Local state to manage social accounts, initialized from user context.
  // This allows for optimistic updates or handling intermediate states if needed.
  const [socialAccounts, setSocialAccounts] = useState<
    SocialAccountConnection[]
  >(user?.socialAccounts as SocialAccountConnection[]);

  useEffect(() => {
    setSocialAccounts(user?.socialAccounts as SocialAccountConnection[]);
  }, [user?.socialAccounts, socialAccounts]);

  const handleToggleAccountConnection = async (accountId: string) => {
    const isConnected = socialAccounts.find((acc) => acc.name === accountId);

    if (isConnected) {
      // Simulate disconnection
      if (
        window.confirm(`Are you sure you want to disconnect from ${accountId}?`)
      ) {
        const linkedAccounts = await unlinkedAccount(accountId);
        setSocialAccounts(linkedAccounts);
        if (user) {
          updateUserProfile({ ...user, socialAccounts: linkedAccounts });
          console.log(`${accountId} disconnected.`);
        }
      }
    } else {
      const linkedAccounts = await linkedAccount(accountId);
      setSocialAccounts(linkedAccounts);
      if (user) {
        updateUserProfile({ ...user, socialAccounts: linkedAccounts });
        console.log(`${accountId} connected.`);
      }
    }
  };

  return (
    <Card
      title="Connected Accounts"
      className="bg-card text-card-foreground border-border"
    >
      <button onClick={onBack} className="btn btn-ghost mb-6 text-sm">
        &larr; Back to Account Settings
      </button>

      <div className="space-y-4">
        {availableSocialIntegrations.map((integration, index) => {
          const accountStatus =
            socialAccounts &&
            socialAccounts.find((acc) => acc.name === integration.id);
          const isConnected = accountStatus?.connected;

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.075,
                duration: 0.25,
                ease: "easeOut",
              }}
              className="p-4 border border-border rounded-lg flex items-center justify-between hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-primary">{integration.icon}</span>
                <div>
                  <h4 className="font-medium text-foreground">
                    {integration.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  {isConnected && accountStatus.name && (
                    <p className="text-xs text-primary capitalize ">
                      Connected as: {accountStatus.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleToggleAccountConnection(integration.id)}
                className={`btn ${
                  isConnected
                    ? "btn-outline dark:border-destructive dark:text-destructive dark:hover:bg-destructive/10"
                    : "btn-primary"
                }`}
              >
                {isConnected ? "Disconnect" : "Connect"}
                <Link2 size={16} className="ml-2" />
              </button>
            </motion.div>
          );
        })}
      </div>
      {Object.values(socialAccounts).filter((acc) => acc.connected).length ===
        0 && (
        <p className="text-muted-foreground text-center py-4 mt-4">
          No accounts connected. Connect to services to share your activities.
        </p>
      )}
    </Card>
  );
}
