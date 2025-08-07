import React, { useState, ReactNode } from "react";
import { toast } from "react-toastify";
import {
  User,
  UserGoal,
  UserPreferences,
  UserAchievement,
  UserWithToken,
  UserCredentials,
} from "../types/user";
import { fetchApi, fetchWithRefresh } from "../utils";
import { UserContext } from "../context/UserContext";

// // Hardcoded sample user for login
// const sampleUser: User = {
//   id: "1",
//   name: "Alex Runner",
//   email: "andre@runweek.fr", // Login with this email
//   profileImage:
//     "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150",
//   joinedDate: "2023-05-15",
//   stats: {
//     totalDistance: 327.5,
//     weeklyDistance: 23.4,
//     totalRuns: 42,
//     averagePace: "5:32",
//     streakDays: 12,
//     level: 8,
//     points: 3450,
//   },
//   goals: [
//     {
//       id: "g1",
//       title: "Weekly Distance",
//       category: "distance" as GoalCategory,
//       description: "Run 40km this week",
//       target: 40,
//       current: 23.4,
//       unit: "km",
//       deadline: "2025-06-01",
//       completed: false,
//     },
//     {
//       id: "g2",
//       title: "Run a Half Marathon",
//       category: "event" as GoalCategory,
//       description: "Complete a 21.1km race.",
//       target: 21.1,
//       current: 15, // Current longest run towards this, perhaps
//       unit: "km",
//       deadline: "2025-07-15",
//       completed: false,
//     },
//   ],
//   achievements: [
//     {
//       id: "a1",
//       title: "First Run",
//       description: "Completed your first run",
//       icon: "Award",
//       earnedDate: "2023-05-18",
//     },
//     {
//       id: "a2",
//       title: "10K Club",
//       description: "Completed a 10K run",
//       icon: "Medal",
//       earnedDate: "2023-06-02",
//     },
//   ],
//   preferences: {
//     distanceUnit: "kilometers",
//     preferredRunDays: ["Mon", "Wed", "Fri"],
//     preferredRunTime: "morning",
//     trainingFocus: "endurance",
//     // Default privacy settings for sampleUser
//     activityVisibility: "friends",
//     profileVisibility: "friends",
//     dataSharing: false,
//     locationSharing: true,
//     // Default language and region for sampleUser
//     language: "en",
//     region: "US",
//     notificationSettings: {
//       // Default values
//       email: true,
//       push: true,
//       achievements: true,
//       reminders: true,
//       updates: false,
//     },
//     isTwoFactorEnabled: false, // Default 2FA status
//     syncSettings: {
//       autoSync: true,
//       backgroundSync: false,
//     },
//   },
//   connectedDevices: [
//     {
//       id: "d1",
//       name: "Garmin Forerunner 955",
//       type: "Montre connectée",
//       lastSync: new Date().toISOString(), // Use dynamic date for freshness
//       status: "connected",
//     },
//     {
//       id: "d2",
//       name: "iPhone 15 Pro",
//       type: "Smartphone",
//       lastSync: new Date(Date.now() - 3600 * 1000 * 24).toISOString(), // Example: 1 day ago
//       status: "connected",
//     },
//   ],
//   socialAccounts: [
//     { id: "facebook", name: "Facebook", connected: false },
//     { id: "twitter", name: "Twitter", connected: false },
//     { id: "instagram", name: "Instagram", connected: false },
//     { id: "linkedin", name: "LinkedIn", connected: false },
//     { id: "strava", name: "Strava", connected: true },
//   ],
//   // preferences.dashboardWidgetsConfig is added below after defaultDashboardWidgetsConfig definition
// };

// // Define Default Widget Configuration
export const defaultDashboardWidgetsConfig = {
  statsGrid: { isVisible: true, order: 1, defaultSpan: 2 },
  heartRateTrend: { isVisible: true, order: 2, defaultSpan: 2 },
  goalSummary: { isVisible: true, order: 3, defaultSpan: 1 },
  upcomingWorkouts: { isVisible: true, order: 4, defaultSpan: 1 },
  recentAchievements: { isVisible: true, order: 5, defaultSpan: 1 },
  recentPRs: { isVisible: true, order: 6, defaultSpan: 1 },
  weeklySummary: { isVisible: true, order: 7, defaultSpan: 1 },
  tipOfTheDay: { isVisible: true, order: 8, defaultSpan: 1 },
};

// // Add dashboardWidgetsConfig to sampleUser's preferences
// sampleUser.preferences = {
//   ...sampleUser.preferences,
//   dashboardWidgetsConfig: {
//     statsGrid: { isVisible: true, order: 1, defaultSpan: 2 },
//     heartRateTrend: { isVisible: true, order: 2, defaultSpan: 2 },
//     goalSummary: { isVisible: true, order: 3, defaultSpan: 1 },
//     upcomingWorkouts: { isVisible: true, order: 4, defaultSpan: 1 },
//     recentAchievements: { isVisible: false, order: 5, defaultSpan: 1 }, // Example: hidden by default for sample user
//     recentPRs: { isVisible: true, order: 6, defaultSpan: 1 },
//     weeklySummary: { isVisible: true, order: 7, defaultSpan: 1 },
//     tipOfTheDay: { isVisible: false, order: 8, defaultSpan: 1 }, // Hidden for sample user
//   },
// };

const BASE_URL = import.meta.env.VITE_API_URL + "/user";

export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true); // Default to true, as we'll check localStorage
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(
    () => (localStorage.getItem("aspk") as string) || null
  );

  const isAuthenticated = !!user;

  const handleAuthSuccess = (data: UserWithToken) => {
    localStorage.setItem("aspk", data.accessToken);
    setAccessToken(data.accessToken);
  };

  const fetchUser = async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await fetchWithRefresh<User>(
        `${BASE_URL}/me`,
        { method: "GET" },
        () => accessToken,
        (token) => setAccessToken(token)
      );

      if (userData) setUser(userData);
    } catch (error) {
      console.error("Erreur lors du fetch user:", error);
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem("aspk");
      localStorage.removeItem("rft");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const init = async () => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      await fetchUser();
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const login = async (props: UserCredentials): Promise<UserWithToken> => {
    setIsLoading(true);
    try {
      const res = await fetchApi<UserWithToken>(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: props.email,
          password: props.password,
          rememberMe: props.rememberMe,
        }),
      });
      const { message, error, data } = res;

      if (error) {
        setMessage(message);
        setMessage(
          message ?? "Erreur lors de la connxion : données manquantes."
        );
      }

      if (!data) {
        setMessage(
          message ?? "Données utilisateur manquantes dans la réponse."
        );

        console.log("ERR: ", data);

        throw new Error("Données utilisateur manquantes dans la réponse.");
      }
      const { accessToken, refreshToken } = data;

      handleAuthSuccess(data);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user"); // Remove user from storage
    setUser(null);
    setMessage(null);
    toast.info("You have been logged out.");
  };

  const updateUserProfile = (updatedProfileData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...updatedProfileData };
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Persist changes
      toast.success("Profile updated successfully!");
      return updatedUser;
    });
  };

  const addGoal = (
    goalData: Omit<UserGoal, "id" | "current" | "completed">
  ) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const newGoal: UserGoal = {
        ...goalData,
        id: `goal_${Date.now().toString()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`,
        current: 0,
        completed: false,
      };
      const updatedUser = { ...prevUser, goals: [newGoal, ...prevUser.goals] };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Goal added successfully: " + newGoal.title);
      return updatedUser;
    });
  };

  const updateGoal = (
    goalId: string,
    updatedData: Partial<Omit<UserGoal, "id">>
  ) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      let goalCompletedToast = false;
      const updatedGoals = prevUser.goals.map((goal) => {
        if (goal.id === goalId) {
          const fullyUpdatedGoal = { ...goal, ...updatedData };
          // Check for auto-completion
          if (
            typeof fullyUpdatedGoal.current === "number" &&
            typeof fullyUpdatedGoal.target === "number" &&
            fullyUpdatedGoal.current >= fullyUpdatedGoal.target &&
            !goal.completed
          ) {
            fullyUpdatedGoal.completed = true;
            goalCompletedToast = true;
          }
          return fullyUpdatedGoal;
        }
        return goal;
      });
      const updatedUser = { ...prevUser, goals: updatedGoals };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (goalCompletedToast) {
        const completedGoal = updatedGoals.find((g) => g.id === goalId);
        toast.success(`Goal completed: ${completedGoal?.title}!`);
      } else {
        toast.success("Goal updated successfully!");
      }
      return updatedUser;
    });
  };

  const deleteGoal = (goalId: string) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const goalToDelete = prevUser.goals.find((g) => g.id === goalId);
      const updatedGoals = prevUser.goals.filter((goal) => goal.id !== goalId);
      const updatedUser = { ...prevUser, goals: updatedGoals };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (goalToDelete) {
        toast.info(`Goal deleted: ${goalToDelete.title}`);
      } else {
        toast.info("Goal deleted.");
      }
      return updatedUser;
    });
  };

  const updateUserPreferences = (preferences: UserPreferences) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = {
        ...prevUser,
        preferences: { ...(prevUser.preferences || {}), ...preferences },
      };
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Persist changes
      toast.success("Preferences saved successfully!");
      return updatedUser;
    });
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    console.log("UserContext: Attempting to change password.");
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Mock validation: In a real app, verify currentPassword against the stored one.
    // For this mock, let's assume 'password123' is the "current" password for the sampleUser if a user is logged in.
    // This check should ideally be against the actual current user's password hash.
    if (user && currentPassword === "password123") {
      // Simple mock check
      console.log(
        "UserContext: Password change successful (mocked). New password would be:",
        newPassword
      );
      // In a real app, you might update a lastPasswordChangedAt field in user state,
      // and the backend would handle storing the new hashed password.
      return {
        success: true,
        message: "Password changed successfully! (This is a mock response)",
      };
    } else {
      console.warn(
        "UserContext: Password change failed - incorrect current password or no user (mocked)."
      );
      return {
        success: false,
        message: "Incorrect current password. (This is a mock response)",
      };
    }
  };

  const unlockSpecificAchievement = () => {
    setUser((prevUser) => {
      if (!prevUser) return null;

      const achievementIdToUnlock = "a3"; // A new, predefined ID
      const isAlreadyUnlocked = prevUser.achievements.some(
        (ach) => ach.id === achievementIdToUnlock
      );

      if (isAlreadyUnlocked) {
        toast.info("You've already unlocked the 'Early Riser' achievement!");
        return prevUser;
      }

      const newAchievement: UserAchievement = {
        id: achievementIdToUnlock,
        title: "Early Riser",
        description: "Completed a run before 7 AM!",
        icon: "Sunrise", // Example icon name (Lucide icon names are typically capitalized)
        earnedDate: new Date().toISOString(),
      };

      const updatedUser = {
        ...prevUser,
        achievements: [...prevUser.achievements, newAchievement],
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Achievement Unlocked: Early Riser!");
      return updatedUser;
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        message,
        login,
        logout,
        updateUserProfile,
        updateUserPreferences,
        changePassword,
        unlockSpecificAchievement,
        addGoal,
        updateGoal,
        deleteGoal,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
