import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import PasswordSecuritySettings from "../components/profile/PasswordSecuritySettings"; // Added import
import PersonalInfoSettings from "../components/profile/PersonalInfoSettings"; // Added import
import NotificationSettings from "../components/profile/NotificationSettings"; // Added import
import ConnectedDevicesSettings from "../components/profile/ConnectedDevicesSettings"; // Added import
import ConnectedAccountsSettings from "../components/profile/ConnectedAccountsSettings"; // Added import
import {
  User,
  Mail,
  Calendar,
  Edit,
  LogOut,
  Bell,
  Lock,
  Activity,
  Link as LinkIcon,
  ChevronRight,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUserContext } from "../hooks/useUser";
import { parseDate } from "../utils/date-formatter";
import { useMessages } from "../hooks/useMessage";
import { MessageCode } from "../types/message";
import { extractErrorMessage } from "../utils/error-handler";
import Spiner from "../components/ui/Spiner";
import FormattedDate from "../components/ui/FormattedDate";
import { useLanguage } from "../providers/LanguageProvider";

export default function Profile() {
  const { user, updateUserProfile, updateUserPreferences, logout } = useUserContext(); // Added logout
  const { showMessage } = useMessages();
  const { currentLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState("account");
  const [accountSubView, setAccountSubView] = useState<
    | "overview"
    // | "personalInfo"
    | "notifications"
    | "password"
    | "connectedDevices"
    | "connectedAccounts"
  >("overview");

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingUpdates, setIsSavingUpdates] = useState(false);
  const [editedFname, setEditedFname] = useState(user?.fname || "");
  const [editedLname, setEditedLname] = useState(user?.lname || "");
  const [editedEmail, setEditedEmail] = useState(user?.email || "");
  const [editedPhone, setEditedPhone] = useState(user?.phone || "");
  const [editedProfileImage, setEditedProfileImage] = useState(
    user?.image || ""
  );

  // Preferences State - Initialize with defaults, then update from user.preferences in useEffect
  const [distanceUnit, setDistanceUnit] = useState(
    user?.preferences?.distanceUnit || "kilometers"
  );
  const [preferredRunDays, setPreferredRunDays] = useState(
    user?.preferences?.preferredRunDays || ["Mon", "Wed", "Fri"]
  );
  const [preferredRunTime, setPreferredRunTime] = useState(
    user?.preferences?.preferredRunTime || "morning"
  );
  const [trainingFocus, setTrainingFocus] = useState(
    user?.preferences?.trainingFocus || "endurance"
  );

  // Privacy Settings State - Initialize with defaults, update from user.privacy in useEffect
  const [activityVisibility, setActivityVisibility] = useState(
    user?.privacy?.activityVisibility || "friends"
  );
  const [profileVisibility, setProfileVisibility] = useState(
    user?.privacy?.profileVisibility || "friends"
  );
  const [dataSharing, setDataSharing] = useState(
    user?.privacy?.dataSharing || false
  );
  const [locationSharing, setLocationSharing] = useState(
    user?.privacy?.locationSharing || true
  );

  // Effect to update edited fields AND preferences if user object changes
  useEffect(() => {
    if (user) {
      setEditedEmail(user.email);
      setEditedProfileImage(user.image); // Add this line
      if (user.preferences) {
        setDistanceUnit(user.preferences.distanceUnit || "kilometers");
        setPreferredRunDays(
          user.preferences.preferredRunDays || ["Mon", "Wed", "Fri"]
        );
        setPreferredRunTime(user.preferences.preferredRunTime || "morning");
        setTrainingFocus(user.preferences.trainingFocus || "endurance");
        // Initialize privacy settings from user.preferences
        setActivityVisibility(user.preferences.activityVisibility || "friends");
        setProfileVisibility(user.preferences.profileVisibility || "friends");
        setDataSharing(user.preferences.dataSharing || false);
        setLocationSharing(user.preferences.locationSharing || true);
      }
    }
  }, [user]); // Rerun when the user object from context changes

  if (!user) return null;

  const handleSavePreferences = () => {
    if (!updateUserPreferences) return; // Guard if function is not available
    const preferencesToSave = {
      distanceUnit,
      preferredRunDays,
      preferredRunTime,
      trainingFocus,
      // Keep existing privacy settings when saving general preferences
      activityVisibility: user?.preferences?.activityVisibility,
      profileVisibility: user?.preferences?.profileVisibility,
      dataSharing: user?.preferences?.dataSharing,
      locationSharing: user?.preferences?.locationSharing,
    };
    updateUserPreferences(preferencesToSave);
    // Optionally: show a success notification/toast
    console.log("Preferences saved:", preferencesToSave);
  };

  const handleSavePrivacySettings = () => {
    if (!updateUserPreferences) return; // Guard, reuse updateUserPreferences
    const privacySettingsToSave = {
      // Keep existing general preferences
      distanceUnit: user?.preferences?.distanceUnit,
      preferredRunDays: user?.preferences?.preferredRunDays,
      preferredRunTime: user?.preferences?.preferredRunTime,
      trainingFocus: user?.preferences?.trainingFocus,
      // Update privacy settings
      activityVisibility,
      profileVisibility,
      dataSharing,
      locationSharing,
    };
    updateUserPreferences(privacySettingsToSave);
    // Optionally: show a success notification/toast
    console.log("Privacy settings saved:", privacySettingsToSave);
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      // Entering edit mode, initialize with current user data
      setEditedFname(user.fname);
      setEditedLname(user.lname);
      setEditedEmail(user.email || "");
      setEditedProfileImage(user.image || "");
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    setIsSavingUpdates(true);
    try {
      await updateUserProfile({
        fname: editedFname,
        lname: editedLname,
        email: editedEmail,
        phone: editedPhone,
        image: editedProfileImage,
      });

      showMessage("USER_UPDATED", {}, { language: "fr" });
      setIsEditing(false);
    } catch (error) {
      console.log("error:", error);
      showMessage(extractErrorMessage(error).message as MessageCode, {}, { language: "fr" });
    } finally {
      setIsSavingUpdates(false);
    }
  };

  const handleCancelEdit = () => {
    // Revert changes to original user data
    setEditedFname(user.fname);
    setEditedLname(user.lname);
    setEditedEmail(user.email || "");
    setEditedPhone(user.phone || "");
    setEditedProfileImage(user.image || ""); // Add this line
    setIsEditing(false);
  };

  const accountSettings = [
    // {
    //   id: "s1",
    //   name: "Personal Information",
    //   description: "Update your name, email, and profile picture",
    //   icon: <User size={18} />,
    //   action: () => setAccountSubView("personalInfo"),
    // },
    {
      id: "s2",
      name: "Notifications",
      description: "Configure email and push notification preferences",
      icon: <Bell size={18} />,
      action: () => setAccountSubView("notifications"),
    },
    {
      id: "s3",
      name: "Password & Security",
      description: "Update your password and security settings",
      icon: <Lock size={18} />,
      action: () => setAccountSubView("password"),
    },
    {
      id: "s4",
      name: "Connected Devices",
      description: "Manage devices that sync with your account",
      icon: <Activity size={18} />,
      action: () => setAccountSubView("connectedDevices"),
    },
    {
      id: "s5",
      name: "Connected Accounts",
      description: "Connect to other fitness services and social media",
      icon: <LinkIcon size={18} />,
      action: () => setAccountSubView("connectedAccounts"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-4 bg-card text-card-foreground border-border">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {/* Avatar avec initiales si pas d'image */}
              {(isEditing ? editedProfileImage : user.image) ? (
                <img
                  src={isEditing ? editedProfileImage : user.image}
                  alt={editedFname + " " + editedLname}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-sm bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-semibold">
                    {editedFname?.charAt(0)?.toUpperCase() || ""}{editedLname?.charAt(0)?.toUpperCase() || ""}
                  </span>
                </div>
              )}
              {isEditing ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (
                            event.target &&
                            typeof event.target.result === "string"
                          ) {
                            setEditedProfileImage(event.target.result); // Preview image using data URL
                          }
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                    className="absolute bottom-0 right-0 h-8 w-8 opacity-0 cursor-pointer" // Basic styling, can be improved
                    aria-label="Change profile picture"
                  />
                  <div className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm pointer-events-none">
                    <Edit size={14} />
                  </div>
                </>
              ) : (
                <button
                  onClick={handleEditToggle} // This button now mainly toggles text fields for editing
                  className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm hover:bg-primary-600"
                  aria-label="Edit profile details"
                >
                  <Edit size={14} />
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="mb-4 grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={editedFname}
                  onChange={(e) => setEditedFname(e.target.value)}
                  className="input mt-4 text-md font-bold w-full max-w-xs bg-background text-foreground border-border focus:ring-primary focus:border-primary
                  col-span-2 md:col-span-1"
                  aria-label="User name"
                />
                <input
                  type="text"
                  value={editedLname}
                  onChange={(e) => setEditedLname(e.target.value)}
                  className="input mt-2 md:mt-4 text-md font-bold w-full max-w-xs bg-background text-foreground border-border focus:ring-primary focus:border-primary
                  col-span-2 md:col-span-1"
                  aria-label="User name"
                />
              </div>
            ) : (
              <h2 className="text-xl font-bold mt-4 text-foreground">
                {user.fname} {user.lname}
              </h2>
            )}
            <p className="text-muted-foreground">
              Runner - Level {user.stats?.level}
            </p>

            <div className="w-full mt-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Level Progress</span>
                <span>{user.stats?.points || 0 % 1000} / 1000 XP</span>
              </div>
              <ProgressBar
                value={user.stats?.points || 0 % 1000}
                max={1000}
                className="mt-1"
              // ProgressBar itself might need internal theming if not using CSS vars for its colors
              />
            </div>

            <div className="w-full mt-6 pt-6 border-t border-border">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail size={18} />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="input w-full max-w-xs text-md font-bold bg-background text-foreground border-border focus:ring-primary focus:border-primary"
                      aria-label="User email"
                    />
                  ) : (
                    <span>{user.email || "--"}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone size={18} />
                  {isEditing ? (
                    <input
                      type="phone"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      className="input w-full max-w-xs text-md font-bold bg-background text-foreground border-border focus:ring-primary focus:border-primary"
                      aria-label="User phone"
                    />
                  ) : (
                    <span>{user.phone || "--"}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar size={18} />
                  <span>
                    Joined : <FormattedDate date={user.createdAt} mode="full" locale={currentLanguage} />
                  </span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="w-full mt-6 space-y-3">
                <button
                  onClick={handleSaveChanges}
                  className="btn btn-primary w-full"
                  disabled={isSavingUpdates}
                >
                  {isSavingUpdates ?
                    <div className="flex items-center gap-2"><Spiner /> Saving...</div>
                    : "Save Changes"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="btn btn-outline w-full dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditToggle}
                className="btn btn-primary w-full mt-6"
              >
                Edit Profile
              </button>
            )}
          </div>
        </Card>

        {/* Settings Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("account")}
              className={`px-4 py-2 font-medium transition-colors ${activeTab === "account"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
            >
              Account Settings
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`px-4 py-2 font-medium transition-colors ${activeTab === "preferences"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
            >
              Running Preferences
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`px-4 py-2 font-medium transition-colors ${activeTab === "privacy"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
            >
              Privacy
            </button>
          </div>

          {/* Account Settings */}
          {activeTab === "account" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {accountSubView === "overview" && (
                <Card
                  title="Account Settings"
                  className="bg-card text-card-foreground border-border"
                >
                  <div className="space-y-4">
                    {accountSettings.map((setting, index) => (
                      <motion.div
                        key={setting.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.1,
                          duration: 0.25,
                          ease: "easeOut",
                        }}
                        className="p-4 border border-border rounded-lg hover:border-primary hover:shadow-sm transition-all flex justify-between items-center cursor-pointer"
                        onClick={setting.action}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                            {setting.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">
                              {setting.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {setting.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-muted-foreground"
                        />
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex justify-end">
                    <button
                      onClick={logout}
                      className="btn btn-ghost text-destructive hover:bg-destructive/10 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </Card>
              )}

              {accountSubView === "password" && (
                <PasswordSecuritySettings
                  onBack={() => setAccountSubView("overview")}
                />
              )}
              {/* {accountSubView === "personalInfo" && (
                <PersonalInfoSettings
                  onBack={() => setAccountSubView("overview")}
                />
              )} */}
              {accountSubView === "notifications" && (
                <NotificationSettings
                  onBack={() => setAccountSubView("overview")}
                />
              )}
              {accountSubView === "connectedDevices" && (
                <ConnectedDevicesSettings
                  onBack={() => setAccountSubView("overview")}
                />
              )}
              {accountSubView === "connectedAccounts" && (
                <ConnectedAccountsSettings
                  onBack={() => setAccountSubView("overview")}
                />
              )}
            </motion.div>
          )}

          {/* Running Preferences */}
          {activeTab === "preferences" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Card
                title="Running Preferences"
                className="bg-card text-card-foreground border-border"
              >
                <div className="space-y-6">
                  {/* Distance Unit */}
                  <div>
                    <h3 className="font-medium mb-3 text-foreground">
                      Distance Unit
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDistanceUnit("kilometers")}
                        className={`px-4 py-2 rounded-lg ${distanceUnit === "kilometers"
                          ? "btn-primary"
                          : "btn-outline dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20"
                          }`}
                      >
                        Kilometers
                      </button>
                      <button
                        onClick={() => setDistanceUnit("miles")}
                        className={`px-4 py-2 rounded-lg ${distanceUnit === "miles"
                          ? "btn-primary"
                          : "btn-outline dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20"
                          }`}
                      >
                        Miles
                      </button>
                    </div>
                  </div>

                  {/* Preferred Run Days */}
                  <div>
                    <h3 className="font-medium mb-3 text-foreground">
                      Preferred Run Days
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (day) => (
                          <button
                            key={day}
                            onClick={() =>
                              setPreferredRunDays((prevDays) =>
                                prevDays.includes(day)
                                  ? prevDays.filter((d) => d !== day)
                                  : [...prevDays, day]
                              )
                            }
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${preferredRunDays.includes(day)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80 dark:hover:bg-muted"
                              }`}
                          >
                            {day.charAt(0)}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Preferred Run Time */}
                  <div>
                    <h3 className="font-medium mb-3 text-foreground">
                      Preferred Run Time
                    </h3>
                    <div className="flex gap-3">
                      {["morning", "afternoon", "evening"].map((time) => (
                        <button
                          key={time}
                          onClick={() => setPreferredRunTime(time)}
                          className={`px-4 py-2 rounded-lg capitalize ${preferredRunTime === time
                            ? "btn-primary"
                            : "btn-outline dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20"
                            }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Training Focus */}
                  <div>
                    <h3 className="font-medium mb-3 text-foreground">
                      Training Focus
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "endurance",
                        "speed",
                        "race training",
                        "weight loss",
                      ].map((focus) => (
                        <button
                          key={focus}
                          onClick={() => setTrainingFocus(focus)}
                          className={`px-4 py-2 rounded-lg capitalize ${trainingFocus === focus
                            ? "btn-primary"
                            : "btn-outline dark:border-muted dark:text-muted-foreground dark:hover:bg-muted/20"
                            }`}
                        >
                          {focus}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    className="btn btn-primary"
                  >
                    Save Preferences
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Privacy Settings */}
          {activeTab === "privacy" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Card
                title="Privacy Settings"
                className="bg-card text-card-foreground border-border"
              >
                <div className="space-y-6">
                  {/* Activity Visibility */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Activity Visibility
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Control who can see your running activities
                      </p>
                    </div>
                    <div className="relative">
                      <select
                        value={activityVisibility}
                        onChange={(e) => setActivityVisibility(e.target.value)}
                        className="input appearance-none bg-background text-foreground px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border"
                      >
                        <option value="only_me">Only Me</option>
                        <option value="friends">Friends</option>
                        <option value="public">Public</option>
                      </select>
                      <ChevronRight
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>

                  {/* Profile Visibility */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Profile Visibility
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Control who can see your profile information
                      </p>
                    </div>
                    <div className="relative">
                      <select
                        value={profileVisibility}
                        onChange={(e) => setProfileVisibility(e.target.value)}
                        className="input appearance-none bg-background text-foreground px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-border"
                      >
                        <option value="only_me">Only Me</option>
                        <option value="friends">Friends</option>
                        <option value="public">Public</option>
                      </select>
                      <ChevronRight
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>

                  {/* Data Sharing Section */}
                  <div className="space-y-4 p-4 border border-border rounded-lg bg-background">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">
                          Partage de données
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Contrôlez quelles données peuvent être partagées
                        </p>
                      </div>
                      <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                        <input
                          type="checkbox"
                          id="data-sharing-enabled"
                          className="sr-only peer"
                          checked={dataSharing.enabled}
                          onChange={(e) => setDataSharing(prev => ({ ...prev, enabled: e.target.checked }))}
                        />
                        <label
                          htmlFor="data-sharing-enabled"
                          className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors ${dataSharing.enabled ? "bg-primary" : "bg-muted"
                            }`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${dataSharing.enabled ? "translate-x-6" : ""
                              }`}
                          ></span>
                        </label>
                      </div>
                    </div>

                    {dataSharing.enabled && (
                      <div className="space-y-3 pl-4 border-l border-2 border-primary/20">
                        {/* Nutrition Sharing */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-foreground">Partage nutritionnel</h4>
                            <p className="text-xs text-muted-foreground">Partagez vos repas et analyses nutritionnelles</p>
                          </div>
                          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                            <input
                              type="checkbox"
                              id="share-nutrition"
                              className="sr-only peer"
                              checked={dataSharing.shareNutrition}
                              onChange={(e) => setDataSharing(prev => ({ ...prev, shareNutrition: e.target.checked }))}
                            />
                            <label
                              htmlFor="share-nutrition"
                              className={`block h-5 overflow-hidden rounded-full cursor-pointer transition-colors ${dataSharing.shareNutrition ? "bg-primary" : "bg-muted"
                                }`}
                            >
                              <span
                                className={`block h-5 w-5 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${dataSharing.shareNutrition ? "translate-x-5" : ""
                                  }`}
                              ></span>
                            </label>
                          </div>
                        </div>

                        {/* Activities Sharing */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-foreground">Partage d'activités</h4>
                            <p className="text-xs text-muted-foreground">Partagez vos courses et entraînements</p>
                          </div>
                          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                            <input
                              type="checkbox"
                              id="share-activities"
                              className="sr-only peer"
                              checked={dataSharing.shareActivities}
                              onChange={(e) => setDataSharing(prev => ({ ...prev, shareActivities: e.target.checked }))}
                            />
                            <label
                              htmlFor="share-activities"
                              className={`block h-5 overflow-hidden rounded-full cursor-pointer transition-colors ${dataSharing.shareActivities ? "bg-primary" : "bg-muted"
                                }`}
                            >
                              <span
                                className={`block h-5 w-5 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${dataSharing.shareActivities ? "translate-x-5" : ""
                                  }`}
                              ></span>
                            </label>
                          </div>
                        </div>

                        {/* Goals Sharing */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-foreground">Partage d'objectifs</h4>
                            <p className="text-xs text-muted-foreground">Partagez vos objectifs et progrès</p>
                          </div>
                          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                            <input
                              type="checkbox"
                              id="share-goals"
                              className="sr-only peer"
                              checked={dataSharing.shareGoals}
                              onChange={(e) => setDataSharing(prev => ({ ...prev, shareGoals: e.target.checked }))}
                            />
                            <label
                              htmlFor="share-goals"
                              className={`block h-5 overflow-hidden rounded-full cursor-pointer transition-colors ${dataSharing.shareGoals ? "bg-primary" : "bg-muted"
                                }`}
                            >
                              <span
                                className={`block h-5 w-5 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${dataSharing.shareGoals ? "translate-x-5" : ""
                                  }`}
                              ></span>
                            </label>
                          </div>
                        </div>

                        {/* Achievements Sharing */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-foreground">Partage de réalisations</h4>
                            <p className="text-xs text-muted-foreground">Partagez vos badges et accomplissements</p>
                          </div>
                          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                            <input
                              type="checkbox"
                              id="share-achievements"
                              className="sr-only peer"
                              checked={dataSharing.shareAchievements}
                              onChange={(e) => setDataSharing(prev => ({ ...prev, shareAchievements: e.target.checked }))}
                            />
                            <label
                              htmlFor="share-achievements"
                              className={`block h-5 overflow-hidden rounded-full cursor-pointer transition-colors ${dataSharing.shareAchievements ? "bg-primary" : "bg-muted"
                                }`}
                            >
                              <span
                                className={`block h-5 w-5 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${dataSharing.shareAchievements ? "translate-x-5" : ""
                                  }`}
                              ></span>
                            </label>
                          </div>
                        </div>

                        {/* Friend Requests */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-foreground">Demandes d'amis</h4>
                            <p className="text-xs text-muted-foreground">Autorisez les autres à vous envoyer des demandes</p>
                          </div>
                          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                            <input
                              type="checkbox"
                              id="allow-friend-requests"
                              className="sr-only peer"
                              checked={dataSharing.allowFriendRequests}
                              onChange={(e) => setDataSharing(prev => ({ ...prev, allowFriendRequests: e.target.checked }))}
                            />
                            <label
                              htmlFor="allow-friend-requests"
                              className={`block h-5 overflow-hidden rounded-full cursor-pointer transition-colors ${dataSharing.allowFriendRequests ? "bg-primary" : "bg-muted"
                                }`}
                            >
                              <span
                                className={`block h-5 w-5 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${dataSharing.allowFriendRequests ? "translate-x-5" : ""
                                  }`}
                              ></span>
                            </label>
                          </div>
                        </div>

                        {/* Show in Search */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-foreground">Visible dans la recherche</h4>
                            <p className="text-xs text-muted-foreground">Permettez aux autres de vous trouver par recherche</p>
                          </div>
                          <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                            <input
                              type="checkbox"
                              id="show-in-search"
                              className="sr-only peer"
                              checked={dataSharing.showInSearch}
                              onChange={(e) => setDataSharing(prev => ({ ...prev, showInSearch: e.target.checked }))}
                            />
                            <label
                              htmlFor="show-in-search"
                              className={`block h-5 overflow-hidden rounded-full cursor-pointer transition-colors ${dataSharing.showInSearch ? "bg-primary" : "bg-muted"
                                }`}
                            >
                              <span
                                className={`block h-5 w-5 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${dataSharing.showInSearch ? "translate-x-5" : ""
                                  }`}
                              ></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {!dataSharing.enabled && (
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center">
                          <AlertTriangle size={16} className="mr-2" /> Le partage de données est désactivé. Vous ne pourrez pas partager de contenu ou être trouvé par d'autres utilisateurs.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Location Sharing Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Partage de localisation
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Montrez les localisations précises dans vos activités
                      </p>
                    </div>
                    <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
                      <input
                        type="checkbox"
                        id="location-sharing"
                        className="sr-only peer"
                        checked={locationSharing}
                        onChange={(e) => setLocationSharing(e.target.checked)}
                      />
                      <label
                        htmlFor="location-sharing"
                        className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors ${locationSharing ? "bg-primary" : "bg-muted"
                          }`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${locationSharing ? "translate-x-6" : ""
                            }`}
                        ></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex justify-end">
                  <button
                    onClick={handleSavePrivacySettings}
                    className="btn btn-primary"
                  >
                    Save Privacy Settings
                  </button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
/* Tab navigation and other sections also updated to use themed colors like text-foreground, text-muted-foreground, border-border, bg-muted etc. */
/* This makes the entire page consistent with the new theming system. */