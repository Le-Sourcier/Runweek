import { useState, useEffect, useMemo } from "react"; // Added useEffect
import { useLocation } from "react-router-dom"; // Added useLocation
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { useFloatingCoach } from "../context/FloatingCoachContext"; // Import useFloatingCoach
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import ThemePreview from "../components/ui/ThemePreview"; // Import ThemePreview
import {
  Bell,
  Globe,
  Lock,
  Smartphone,
  Palette,
  Languages,
  CreditCard,
  Shield,
  Activity,
  Trash2,
  ChevronRight,
  Check,
  X,
  Users, // Added Users icon
  Facebook, // Added Facebook icon
  Twitter, // Added Twitter icon
  Instagram, // Added Instagram icon
  Linkedin, // Added Linkedin icon
  Link2, // Added Link2 icon as a fallback
  Download, // Added Download icon for billing history
} from "lucide-react";
import { motion } from "framer-motion";

type SettingSection = {
  id: string;
  title: string;
  icon: JSX.Element;
  description: string;
  badge?: {
    text: string;
    variant: "primary" | "warning" | "error";
  };
};

export default function Settings() {
  const { user, updateUserPreferences, updateUserProfile } = useUser(); // Added updateUserProfile
  const { colorPalette, setColorPalette } = useTheme();
  const { isFloatingCoachActive, toggleFloatingCoachActive } =
    useFloatingCoach(); // Consume FloatingCoach context
  const location = useLocation();

  // Determine initial tab from URL query parameter or default to 'general'
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tabFromQuery = params.get("tab");
    if (tabFromQuery && settingSections.find((s) => s.id === tabFromQuery)) {
      return tabFromQuery;
    }
    return "general"; // Default tab
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [currentThemeOption, setCurrentThemeOption] = useState("system");
  // Language and Region States
  const [selectedLanguage, setSelectedLanguage] = useState("fr"); // Renamed from language
  const [selectedRegion, setSelectedRegion] = useState("FR");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    achievements: true,
    reminders: true,
    updates: false,
  });
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    backgroundSync: false,
  });

  const settingSections: SettingSection[] = useMemo(
    () => [
      {
        id: "notifications",
        title: "Notifications",
        icon: <Bell size={20} />,
        description: "Gérez vos préférences de notifications",
        badge: {
          text: "3 nouveaux",
          variant: "primary",
        },
      },
      {
        id: "appearance",
        title: "Apparence",
        icon: <Palette size={20} />,
        description: "Personnalisez l'apparence de l'application",
      },
      {
        id: "language",
        title: "Langue et région",
        icon: <Globe size={20} />,
        description: "Définissez vos préférences régionales",
      },
      {
        id: "devices",
        title: "Appareils connectés",
        icon: <Smartphone size={20} />,
        description: "Gérez vos appareils connectés",
        badge: {
          text: "2 actifs",
          variant: "primary",
        },
      },
      {
        id: "privacy",
        title: "Confidentialité",
        icon: <Lock size={20} />,
        description: "Contrôlez vos données et leur utilisation",
      },
      {
        id: "billing",
        title: "Facturation",
        icon: <CreditCard size={20} />,
        description: "Gérez vos abonnements et paiements",
        badge: {
          text: "Pro",
          variant: "primary",
        },
      },
      {
        id: "connected-accounts",
        title: "Comptes connectés",
        icon: <Users size={20} />,
        description: "Liez vos comptes de médias sociaux",
      },
    ],
    []
  );

  // const connectedDevices = [...] // This will be removed, data comes from user context

  const availableColorPalettes = [
    { name: "Default", id: "default", color: "#6366F1" }, // Example primary color
    { name: "Ocean Blue", id: "blue", color: "#3B82F6" },
    { name: "Forest Green", id: "green", color: "#10B981" },
    { name: "Royal Purple", id: "purple", color: "#8B5CF6" },
    { name: "Sunset Orange", id: "orange", color: "#F59E0B" },
  ];

  // This list defines the available accounts and their icons.
  // The `connected` status will come from user.socialAccounts.
  const availableSocialIntegrations = [
    { id: "facebook", name: "Facebook", icon: <Facebook size={24} /> },
    { id: "twitter", name: "Twitter", icon: <Twitter size={24} /> },
    { id: "instagram", name: "Instagram", icon: <Instagram size={24} /> },
    { id: "linkedin", name: "LinkedIn", icon: <Linkedin size={24} /> },
    { id: "strava", name: "Strava", icon: <Link2 size={24} /> }, // Using Link2 as per original
  ];

  // Effect to update activeTab if URL query parameter changes and load preferences
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromQuery = params.get("tab");
    if (
      tabFromQuery &&
      settingSections.find((s) => s.id === tabFromQuery) &&
      tabFromQuery !== activeTab
    ) {
      setActiveTab(tabFromQuery);
    }

    if (user?.preferences) {
      setSelectedLanguage(user.preferences.language || "fr");
      setSelectedRegion(user.preferences.region || "FR");
      // Load notification settings
      if (user.preferences.notificationSettings) {
        setNotifications(user.preferences.notificationSettings);
      } else {
        // If not set in user's preferences, initialize with some defaults
        // (or keep the useState defaults if they are desired as the fallback)
        // For example, to ensure all keys are present if structure varies:
        setNotifications((currentSettings) => ({
          email:
            user.preferences?.notificationSettings?.email ??
            currentSettings.email,
          push:
            user.preferences?.notificationSettings?.push ??
            currentSettings.push,
          achievements:
            user.preferences?.notificationSettings?.achievements ??
            currentSettings.achievements,
          reminders:
            user.preferences?.notificationSettings?.reminders ??
            currentSettings.reminders,
          updates:
            user.preferences?.notificationSettings?.updates ??
            currentSettings.updates,
        }));
      }
      // Load sync settings
      if (user.preferences.syncSettings) {
        setSyncSettings(user.preferences.syncSettings);
      } else if (typeof user.preferences.syncSettings === "undefined") {
        // If syncSettings is not defined, initialize with defaults (no immediate save)
        setSyncSettings({ autoSync: true, backgroundSync: false });
      }
    }
    // Make sure settingSections is included in dependency array if it's defined inside the component
    // or if its contents can change and affect getInitialTab logic indirectly via find.
    // For now, assuming settingSections is stable or defined outside if getInitialTab relies on it at mount.
  }, [location.search, activeTab, user, settingSections]); // Added settingSections

  const handleToggleAccountConnection = (accountId: string) => {
    if (!user || !updateUserProfile) return;

    // Get current status or assume false if not present
    const currentAccountState = user.socialAccounts?.find(
      (acc) => acc.id === accountId
    );
    const newConnectedStatus = !(currentAccountState?.connected || false);

    if (newConnectedStatus) {
      // Simulate OAuth flow for connecting
      alert(
        `Simulating connection to ${accountId}... In a real app, this would involve an OAuth flow.`
      );
      // For a real app, you'd only proceed to update context after successful OAuth.
    } else {
      alert(`Disconnecting from ${accountId}...`);
    }

    const updatedSocialAccounts = [...(user.socialAccounts || [])];
    const accountIndex = updatedSocialAccounts.findIndex(
      (acc) => acc.id === accountId
    );

    if (accountIndex > -1) {
      updatedSocialAccounts[accountIndex] = {
        ...updatedSocialAccounts[accountIndex],
        connected: newConnectedStatus,
      };
    } else {
      // If account not in context yet (e.g. first time connecting one from the static list)
      const accountDetails = availableSocialIntegrations.find(
        (acc) => acc.id === accountId
      );
      if (accountDetails) {
        updatedSocialAccounts.push({
          id: accountDetails.id,
          name: accountDetails.name,
          connected: newConnectedStatus,
        });
      }
    }

    updateUserProfile({ socialAccounts: updatedSocialAccounts });
  };

  const handleRevokeDevice = (deviceId: string) => {
    if (!user || !user.connectedDevices || !updateUserProfile) return; // Added updateUserProfile check
    // Option 1: Filter out the device
    const updatedDevices = user.connectedDevices.filter(
      (device) => device.id !== deviceId
    );
    // Option 2: Change status (uncomment to use this instead)
    // const updatedDevices = user.connectedDevices.map(device =>
    //   device.id === deviceId ? { ...device, status: 'disconnected_by_user' as const } : device
    // );
    updateUserProfile({ connectedDevices: updatedDevices }); // Pass only the changed part of the user
  };

  const handleSyncToggle = (key: keyof typeof syncSettings) => {
    const newSyncSettings = {
      ...syncSettings,
      [key]: !syncSettings[key],
    };
    setSyncSettings(newSyncSettings);
    if (user && updateUserPreferences) {
      updateUserPreferences({
        ...user.preferences,
        distanceUnit: user.preferences?.distanceUnit || "kilometers", // Ensure distanceUnit is defined
        syncSettings: newSyncSettings,
      });
    }
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    const newSettings = {
      ...notifications,
      [key]: !notifications[key],
    };
    setNotifications(newSettings); // Update local state immediately for UI responsiveness

    if (user && updateUserPreferences) {
      updateUserPreferences({
        ...(user.preferences || {}), // Spread existing preferences
        notificationSettings: newSettings, // Update with new notification settings
      });
      // console.log('Notification preferences saved!'); // Optional: for debugging or success message
    }
  };

  const handleSaveLanguageRegion = () => {
    if (user && updateUserPreferences) {
      updateUserPreferences({
        // It's crucial to spread existing preferences to not overwrite them
        ...(user.preferences || {}), // Ensure preferences object exists before spreading
        language: selectedLanguage,
        region: selectedRegion,
      });
      console.log("Language and region preferences saved!");
      // Optionally, show a success toast/notification
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Paramètres
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos préférences et votre compte
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-4 bg-white dark:bg-gray-800">
          <nav className="space-y-1">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`w-full p-3 flex items-center justify-between rounded-lg transition-colors duration-200 ease-in-out ${
                  activeTab === section.id
                    ? "bg-primary-50 text-primary dark:bg-primary-900 dark:text-primary-300"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`${
                      activeTab === section.id
                        ? "text-primary dark:text-primary-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {section.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{section.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {section.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {section.badge && (
                    <Badge variant={section.badge.variant}>
                      {section.badge.text}
                    </Badge>
                  )}
                  <ChevronRight
                    size={16}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t dark:border-gray-700">
            <button className="w-full p-3 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 ease-in-out hover:scale-[1.03] active:scale-[0.97]">
              <Trash2 size={20} />
              <span className="font-medium">Supprimer le compte</span>
            </button>
          </div>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "appearance" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card title="Apparence" className="bg-white dark:bg-gray-800">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">
                      Thème
                    </h3>
                    <div className="flex gap-4">
                      {["light", "dark", "system"].map((option) => (
                        <button
                          key={option}
                          onClick={() => setCurrentThemeOption(option)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ease-in-out hover:scale-[1.03] active:scale-[0.97] ${
                            currentThemeOption === option
                              ? "bg-primary text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-white">
                      Palette de couleurs
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {availableColorPalettes.map((palette) => (
                        <button
                          key={palette.id}
                          onClick={() => setColorPalette(palette.id)}
                          className={`p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-transform duration-200 ease-in-out hover:scale-[1.03] active:scale-[0.97] ${
                            colorPalette === palette.id
                              ? "ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-primary"
                              : ""
                          }`}
                          title={palette.name}
                          data-testid={`palette-option-${palette.id}`} // Added data-testid
                        >
                          <div
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: palette.color }}
                          ></div>
                          <span className="sr-only">{palette.name}</span>
                        </button>
                      ))}
                    </div>
                    {colorPalette !== "default" && (
                      <button
                        onClick={() => setColorPalette("default")}
                        className="mt-4 text-sm text-primary hover:underline transition-colors duration-150 ease-in-out"
                      >
                        Réinitialiser la palette
                      </button>
                    )}
                  </div>
                  {/* Floating Coach Toggle */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">
                          Floating Coach AI
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Show the AI Coach as a floating button for quick
                          access.
                        </p>
                      </div>
                      <label
                        htmlFor="floating-coach-toggle"
                        className="flex items-center cursor-pointer"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="floating-coach-toggle"
                            className="sr-only peer"
                            checked={isFloatingCoachActive}
                            onChange={toggleFloatingCoachActive}
                          />
                          <div className="w-10 h-6 bg-muted rounded-full peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-800 after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <ThemePreview /> {/* Add ThemePreview here */}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === "language" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                title="Langue et Région"
                className="bg-card text-card-foreground border-border"
              >
                <div className="space-y-6">
                  {/* Language Selection */}
                  <div>
                    <label
                      htmlFor="language-select"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Langue de l'application
                    </label>
                    <div className="relative">
                      <select
                        id="language-select"
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="input appearance-none bg-background text-foreground px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border w-full"
                      >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                      </select>
                      <ChevronRight
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>

                  {/* Region Selection */}
                  <div>
                    <label
                      htmlFor="region-select"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Région
                    </label>
                    <div className="relative">
                      <select
                        id="region-select"
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="input appearance-none bg-background text-foreground px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border w-full"
                      >
                        <option value="US">United States</option>
                        <option value="FR">France</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                      </select>
                      <ChevronRight
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>

                  {/* Date Format Example */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      Exemple de format de date :
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString(
                        selectedLanguage + "-" + selectedRegion,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex justify-end">
                  <button
                    onClick={handleSaveLanguageRegion}
                    className="btn btn-primary"
                  >
                    Sauvegarder les modifications
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                title="Préférences de notifications"
                className="bg-white dark:bg-gray-800"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Notifications par email
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recevez des mises à jour par email
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle("email")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.email
                          ? "bg-primary"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.email
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Notifications push
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recevez des notifications sur votre appareil
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle("push")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.push
                          ? "bg-primary"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.push ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Réalisations
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Notifications pour les nouveaux badges
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle("achievements")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.achievements
                          ? "bg-primary"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.achievements
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Rappels d'activité
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recevez des rappels pour vos activités planifiées
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle("reminders")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.reminders
                          ? "bg-primary"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.reminders
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Mises à jour produit
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recevez des informations sur les nouvelles
                        fonctionnalités et mises à jour
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle("updates")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.updates
                          ? "bg-primary"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.updates
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === "devices" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card title="Appareils connectés">
                <div className="space-y-4">
                  {(user?.connectedDevices || []).map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-all dark:border-gray-700 dark:hover:border-primary-600"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Activity size={24} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">
                            {device.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {device.type}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Dernière synchronisation:{" "}
                            {new Date(device.lastSync).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {device.status === "connected" && (
                          <Badge
                            variant="success"
                            className="flex items-center gap-1"
                          >
                            <Check size={12} /> Connecté
                          </Badge>
                        )}
                        {device.status === "disconnected_by_user" && (
                          <Badge
                            variant="default"
                            className="flex items-center gap-1 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                          >
                            Déconnecté
                          </Badge>
                        )}
                        {device.status === "sync_error" && (
                          <Badge
                            variant="error"
                            className="flex items-center gap-1"
                          >
                            Erreur Sync
                          </Badge>
                        )}
                        {device.status === "connected" && (
                          <button
                            onClick={() => handleRevokeDevice(device.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <X
                              size={16}
                              className="text-gray-400 dark:text-gray-500"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      alert("Feature to add new devices is coming soon!")
                    }
                    className="w-full p-4 border border-dashed rounded-lg text-center hover:border-primary hover:bg-gray-50 transition-all dark:border-gray-700 dark:hover:border-primary-600 dark:hover:bg-gray-700"
                  >
                    <span className="text-primary font-medium">
                      + Ajouter un appareil
                    </span>
                  </button>
                </div>
              </Card>

              <Card
                title="Synchronisation"
                className="bg-white dark:bg-gray-800"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Synchronisation automatique
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Synchroniser automatiquement les données
                      </p>
                    </div>
                    <button
                      onClick={() => handleSyncToggle("autoSync")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        syncSettings.autoSync
                          ? "bg-primary"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          syncSettings.autoSync
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Synchronisation en arrière-plan
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Mettre à jour même lorsque l'app est fermée
                      </p>
                    </div>
                    <button
                      onClick={() => handleSyncToggle("backgroundSync")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        syncSettings.backgroundSync
                          ? "bg-primary"
                          : "bg-gray-200 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          syncSettings.backgroundSync
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Dernière synchronisation
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {/* This could be dynamic based on user.lastSyncGlobal or similar */}
                        Il y a 5 minutes (simulation)
                      </p>
                    </div>
                    <button
                      onClick={() => console.log("Attempting manual sync...")}
                      className="btn btn-outline dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20"
                    >
                      Synchroniser maintenant
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === "privacy" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card title="Confidentialité">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Visibilité du profil</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="visibility"
                          className="text-primary"
                          defaultChecked
                        />
                        <span>Public</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="visibility"
                          className="text-primary"
                        />
                        <span>Amis uniquement</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="visibility"
                          className="text-primary"
                        />
                        <span>Privé</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">Données de localisation</h3>
                        <p className="text-sm text-gray-500">
                          Gérez l'accès à votre position
                        </p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </button>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield size={16} />
                        <span>Vos données de localisation sont cryptées</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-3">
                      Exportation des données
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Téléchargez une copie de vos données personnelles
                    </p>
                    <button className="btn btn-outline">
                      Exporter les données
                    </button>
                  </div>
                </div>
              </Card>

              <Card title="Sécurité">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">
                        Authentification à deux facteurs
                      </h3>
                      <p className="text-sm text-gray-500">
                        Ajoutez une couche de sécurité supplémentaire
                      </p>
                    </div>
                    <Badge variant="warning">Non activé</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Sessions actives</h3>
                      <p className="text-sm text-gray-500">
                        Gérez vos connexions actives
                      </p>
                    </div>
                    <Badge variant="primary">2 appareils</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === "connected-accounts" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                title="Comptes connectés"
                className="bg-white dark:bg-gray-800"
              >
                <div className="space-y-4">
                  {availableSocialIntegrations.map((integration) => {
                    const contextAccount = user?.socialAccounts?.find(
                      (sa) => sa.id === integration.id
                    );
                    const isConnected = contextAccount
                      ? contextAccount.connected
                      : false;
                    return (
                      <div
                        key={integration.id}
                        className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary-600 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400">
                            {integration.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 dark:text-white">
                              {integration.name}
                            </h3>
                            <p
                              className={`text-sm ${
                                isConnected
                                  ? "text-green-500 dark:text-green-400"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {isConnected ? "Connecté" : "Non connecté"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleToggleAccountConnection(integration.id)
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isConnected
                              ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900"
                              : "bg-primary-50 text-primary hover:bg-primary-100 dark:bg-primary-800/60 dark:text-primary-300 dark:hover:bg-primary-700"
                          }`}
                        >
                          {isConnected ? "Déconnecter" : "Connecter"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === "billing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card
                title="Votre Abonnement"
                className="bg-card text-card-foreground border-border"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Plan Actuel:</span>
                    <Badge variant="primary" className="text-sm">
                      Pro
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Prochain renouvellement:
                    </span>
                    <span className="text-foreground font-medium">
                      15 Avril 2024
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Prix:</span>
                    <span className="text-foreground font-medium">
                      9.99€ / mois
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
                  <button className="btn btn-primary w-full sm:w-auto">
                    Changer de Plan
                  </button>
                  <button className="btn btn-outline w-full sm:w-auto dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20">
                    Annuler l'Abonnement
                  </button>
                </div>
              </Card>

              <Card
                title="Moyens de Paiement"
                className="bg-card text-card-foreground border-border"
              >
                <div className="space-y-3">
                  {/* Mock Payment Method 1 */}
                  <div className="flex justify-between items-center p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} className="text-primary" />
                      <div>
                        <p className="font-medium text-foreground">
                          Visa se terminant par 1234
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expire le 12/25
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm text-xs p-1 h-auto">
                        Modifier
                      </button>
                      <button className="btn btn-ghost btn-sm text-xs text-destructive p-1 h-auto">
                        Supprimer
                      </button>
                    </div>
                  </div>
                  {/* Mock Payment Method 2 */}
                  <div className="flex justify-between items-center p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} className="text-primary" />{" "}
                      {/* Could use a different icon for Mastercard, etc. */}
                      <div>
                        <p className="font-medium text-foreground">
                          Mastercard se terminant par 5678
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expire le 08/26
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm text-xs p-1 h-auto">
                        Modifier
                      </button>
                      <button className="btn btn-ghost btn-sm text-xs text-destructive p-1 h-auto">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="btn btn-outline w-full sm:w-auto dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20">
                    + Ajouter un moyen de paiement
                  </button>
                </div>
              </Card>

              <Card
                title="Historique de Facturation"
                className="bg-card text-card-foreground border-border"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left">
                      <tr className="border-b border-border">
                        <th className="py-2 pr-2 font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">
                          Description
                        </th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">
                          Montant
                        </th>
                        <th className="py-2 px-2 font-medium text-muted-foreground">
                          Statut
                        </th>
                        <th className="py-2 pl-2 font-medium text-muted-foreground text-right">
                          Facture
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Mock Billing History Item 1 */}
                      <tr className="border-b border-border">
                        <td className="py-3 pr-2 text-foreground">
                          15 Mars 2024
                        </td>
                        <td className="py-3 px-2 text-foreground">
                          Abonnement Mensuel Pro
                        </td>
                        <td className="py-3 px-2 text-foreground">9.99€</td>
                        <td className="py-3 px-2">
                          <Badge variant="success" className="text-xs">
                            Payé
                          </Badge>
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <button className="btn btn-ghost btn-sm text-xs p-1 h-auto">
                            <Download size={14} className="mr-1" />
                            Télécharger
                          </button>
                        </td>
                      </tr>
                      {/* Mock Billing History Item 2 */}
                      <tr className="border-b border-border">
                        <td className="py-3 pr-2 text-foreground">
                          15 Février 2024
                        </td>
                        <td className="py-3 px-2 text-foreground">
                          Abonnement Mensuel Pro
                        </td>
                        <td className="py-3 px-2 text-foreground">9.99€</td>
                        <td className="py-3 px-2">
                          <Badge variant="success" className="text-xs">
                            Payé
                          </Badge>
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <button className="btn btn-ghost btn-sm text-xs p-1 h-auto">
                            <Download size={14} className="mr-1" />
                            Télécharger
                          </button>
                        </td>
                      </tr>
                      {/* Mock Billing History Item 3 */}
                      <tr className="border-b border-border">
                        <td className="py-3 pr-2 text-foreground">
                          15 Janvier 2024
                        </td>
                        <td className="py-3 px-2 text-foreground">
                          Abonnement Mensuel Pro
                        </td>
                        <td className="py-3 px-2 text-foreground">9.99€</td>
                        <td className="py-3 px-2">
                          <Badge variant="success" className="text-xs">
                            Payé
                          </Badge>
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <button className="btn btn-ghost btn-sm text-xs p-1 h-auto">
                            <Download size={14} className="mr-1" />
                            Télécharger
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
