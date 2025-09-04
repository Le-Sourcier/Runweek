import React, { useState, ReactNode } from "react";
import { toast } from "react-toastify";
import {
  User,
  UserGoal,
  UserPreferences,
  UserAchievement,
  LoginResponse,
  UserCredentials,
  UserRegistration,
} from "../types/user";
import { UserContext } from "../context/UserContext";
import sec from "react-secure-storage";
import { useLocation, useNavigate } from "react-router-dom";
import { useMessages } from "../hooks/useMessage";
import { MessageCode } from "../types/message";
import { getCookie, removeCookie } from "../utils/Cookies";
import { apiUtils } from "../hooks/useApi";
import { ApiUrl } from "../utils/api-url";
import { extractErrorMessage } from "../utils/error-handler";
import { ROUTES } from "../hooks/useAppNavigation";

export const defaultDashboardWidgetsConfig = {
  statsGrid: { isVisible: true, order: 1, defaultSpan: 2 },
  heartRateTrend: { isVisible: true, order: 2, defaultSpan: 2 },
  goalSummary: { isVisible: true, order: 3, defaultSpan: 1 },
  upcomingWorkouts: { isVisible: true, order: 4, defaultSpan: 1 },
  recentAchievements: { isVisible: true, order: 5, defaultSpan: 1 },
  recentPRs: { isVisible: true, order: 6, defaultSpan: 1 },
  weeklySummary: { isVisible: true, order: 7, defaultSpan: 1 },
  tipOfTheDay: { isVisible: true, order: 8, defaultSpan: 1 },
  motivationOfTheDay: { isVisible: true, order: 9, defaultSpan: 1 },
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true); // Default to true, as we'll check sec
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { showMessage } = useMessages();

  const navigate = useNavigate();
  const location = useLocation();
  const [accessToken, setAccessToken] = useState<string | null>(
    () => (sec.getItem("aspk") as string) || null
  );

  const isAuthenticated = !!user;

  const handleAuthSuccess = (data: LoginResponse | undefined) => {
    if (data) {
      sec.setItem("aspk", data.accessToken as string);
      setAccessToken(data.accessToken);
    } else {
      sec.removeItem("aspk");
      setAccessToken("");
    }
    // Récupère le chemin de redirection depuis les cookies ou le state
    const redirectPath =
      getCookie("redirect_path") ||
      (location.state?.from?.pathname as string) ||
      "/dashboard";

    // Nettoie le cookie
    removeCookie("redirect_path");

    // Redirige vers le chemin sauvegardé ou la page par défaut
    navigate(redirectPath, { replace: true });
  };

  const fetchUser = async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await apiUtils.get<User>(ApiUrl.ME);
      if (data) setUser(data);

      const socialAccounts = data.socialAccounts || [];

      setUser({ ...data, socialAccounts });
    } catch (error: any) {
      console.log("Error:", error);

      if (error.response && error.response.status === 401) {
        await refreshUserTokens();
        await fetchUser();
      }

      console.error("Erreur lors du fetch user:", error);
      setUser(null);
      setAccessToken(null);
      sec.removeItem("aspk");
      sec.removeItem("rft");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserTokens = async () => {
    const refreshToken = localStorage.getItem("rft");
    if (!refreshToken) throw new Error("Aucun refreshToken");

    const { data } = await apiUtils.post<LoginResponse>(ApiUrl.REFRESH, {
      refreshToken,
    });

    if (!data.accessToken) throw new Error("Refresh échoué");

    const newToken = data.accessToken;
    const newRefresh = data.refreshToken;

    // On met à jour le token
    setAccessToken(newToken);
    localStorage.setItem("aspk", newToken);
    if (newRefresh) localStorage.setItem("rft", newRefresh);
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
  }, [accessToken]);

  const login = async (props: UserCredentials) => {
    setIsLoading(true);
    try {
      const { data } = await apiUtils.post<LoginResponse>(ApiUrl.LOGIN, props);

      if (!data || !data.accessToken) {
        const _message = "Erreur lors de la connexion : données manquantes.";
        setMessage(_message);
        throw new Error(_message);
      }

      handleAuthSuccess(data);

      showMessage(message as MessageCode, { username: user?.fname ?? "" });

    } catch (err) {
      const error = extractErrorMessage(err);

      setMessage(error.message);

      showMessage(error.message as MessageCode);
      console.error("Erreur lors de la connexion (message) :", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (props: UserRegistration) => {
    setIsLoading(true);
    try {
      await apiUtils.post(ApiUrl.REGISTER, props);
    } catch (err) {
      const error = extractErrorMessage(err);

      setMessage(error.message);

      showMessage(
        error.message as MessageCode,
        {},
        {
          language: "fr",
        }
      );
      console.error("Erreur lors de la creation de compte (message) :", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMail = async (
    token: string
  ): Promise<{ message: string; error: boolean }> => {
    setIsLoading(true);
    try {
      const { message, error } = await apiUtils.post(ApiUrl.VERIFY_MAIL, {
        token,
      });
      if (error) {
        showMessage(
          message as MessageCode,
          {},
          {
            language: "fr",
          }
        );
        return { error: true, message: "EMAIL_VERIFICATION_FAILED" };
      }
      showMessage(
        message as MessageCode,
        {},
        {
          language: "fr",
        }
      );
      return { error: true, message: "EMAIL_VERIFIED_SUCCESS" };
    } catch {
      showMessage("EMAIL_VERIFICATION_FAILED");
      return {
        error: true,
        message: "EMAIL_VERIFICATION_FAILED",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationMail = async (email: string) => {
    setIsLoading(true);
    try {
      await apiUtils.post(ApiUrl.RESEND_VERIFICATION_MAIL, { email });
    } catch (err) {
      const error = extractErrorMessage(err);

      setMessage(error.message);

      showMessage(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sec.removeItem("aspk"); // Remove user from storage
    sec.removeItem("rft");
    setUser(null);
    setMessage(null);
    toast.info("You have been logged out.");

    navigate(ROUTES.LOGIN);
  };

  const updateUserProfile = async (updatedProfileData: Partial<User>) => {
    const { message, error, data } = await apiUtils.put<User>(
      ApiUrl.UPDATE_PROFILE,
      updatedProfileData
    );
    if (error) {
      showMessage(
        message as MessageCode,
        {},
        {
          language: "fr",
        }
      );
    } else {
      setUser(data);
      await fetchUser();
      showMessage(
        message as MessageCode,
        {},
        {
          language: "fr",
        }
      );
    }
  };

  const updatePassword = async (updatePasswordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const { message, error, data } = await apiUtils.put<User>(
      ApiUrl.UPDATE_PASSWORD,
      updatePasswordData
    );
    if (error) {
      showMessage(
        message as MessageCode,
        {},
        {
          language: "fr",
        }
      );
    } else {
      setUser(data);
      await fetchUser();
      showMessage(message as MessageCode);
    }
  };

  //Link google account to an existant user account
  const linkGoogleAccount = async () => {
    const token = sec.getItem("aspk") as string;
    try {
      const { data, message, error } = await apiUtils.post(
        ApiUrl.LINK_GOOGLE_ACCOUNT,
        {
          googleToken: token,
        }
      );

      if (error) {
        const _message = extractErrorMessage(error);
        // setMessage(_message.message);
        showMessage(message as MessageCode);
        throw new Error(_message.message);
      }

      if (data) {
        // const updatedUser = { ...user, googleAuth: data };
        // setUser(updatedUser);
        // const u =  await fetchUser();
        // setMessage(message);
        console.log("Google account linked successfully:", data);

        showMessage(message as MessageCode);
        // update user data
        // setUser({ ...user, socialAccounts: data });
      } else {
        const _message = message || "Failed to link Google account.";
        setMessage(message);
        showMessage(message as MessageCode);
        throw new Error(_message);
      }
      // if (data) {
      //   toast.success("Google account linked successfully!");
      //   await fetchUser();
      // }

      // setMessage(_message);
    } catch (error) {
      console.error("Error linking Google account:", error);
      throw error;
    }
  };

  // Unlink google account from an existant user account
  // This will remove the googleAuth object from the user object
  const unlinkGoogleAccount = async () => {
    try {
      const { data, message, error } = await apiUtils.post(
        ApiUrl.UNLINK_GOOGLE_ACCOUNT
      );

      if (error) {
        const _message = extractErrorMessage(error);
        // setMessage(_message.message);
        showMessage(message as MessageCode);
        throw new Error(_message.message);
      }

      if (data) {
        // const updatedUser = { ...user, googleAuth: data };
        // setUser(updatedUser);
        await fetchUser();
        // setMessage(message);

        showMessage(message as MessageCode);
      } else {
        const _message = message || "Failed to link Google account.";
        setMessage(message);
        showMessage(
          message as MessageCode,
          {},
          {
            language: "fr",
          }
        );
        throw new Error(_message);
      }
      // if (data) {
      //   toast.success("Google account linked successfully!");
      //   await fetchUser();
      // }

      // setMessage(_message);
    } catch (error) {
      console.error("Error linking Google account:", error);
      throw error;
    }
  };

  const linkedAccount = async (accountId: string) => {
    switch (accountId) {
      case "google":
        await linkGoogleAccount();
        break;
      case "facebook":
        // Implement Facebook linking logic here
        toast.info("Facebook linking is not implemented yet.");
        break;
      case "twitter":
        // Implement Twitter linking logic here
        toast.info("Twitter linking is not implemented yet.");
        break;
      case "strava":
        // Implement Strava linking logic here
        toast.info("Strava linking is not implemented yet.");
        break;
      case "garmin":
        // Implement Garmin linking logic here
        toast.info("Garmin linking is not implemented yet.");
        break;
      default:
        toast.error("Unknown account type.");
        break;
    }
    await fetchUser();
    return (user?.socialAccounts || []).filter((acc) => acc);
  };

  const unlinkedAccount = async (accountId: string) => {
    switch (accountId) {
      case "google":
        await unlinkGoogleAccount();
        break;
      case "facebook":
        // Implement Facebook linking logic here
        toast.info("Facebook linking is not implemented yet.");
        break;
      case "twitter":
        // Implement Twitter linking logic here
        toast.info("Twitter linking is not implemented yet.");
        break;
      case "strava":
        // Implement Strava linking logic here
        toast.info("Strava linking is not implemented yet.");
        break;
      case "garmin":
        // Implement Garmin linking logic here
        toast.info("Garmin linking is not implemented yet.");
        break;
      default:
        toast.error("Unknown account type.");
        break;
    }

    return (user?.socialAccounts || []).filter((acc) => acc);
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
      const updatedUser = {
        ...prevUser,
        goals: [newGoal, ...(prevUser.goals || [])],
      };
      sec.setItem("user", JSON.stringify(updatedUser));
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
      const updatedGoals = (prevUser.goals || []).map((goal) => {
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
      sec.setItem("user", JSON.stringify(updatedUser));
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
      const updatedGoals = (prevUser.goals || []).filter(
        (goal) => goal.id !== goalId
      );
      const updatedUser = { ...prevUser, goals: updatedGoals };
      sec.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const updateUserPreferences = async (preferences: UserPreferences) => {
    try {
      await apiUtils.put<UserPreferences>(ApiUrl.UPDATE_DATA_SHARING_PREFERENCE, preferences);
      await fetchUser();
      setUser((prevUser) => {
        if (!prevUser) return null;
        const updatedUser = {
          ...prevUser,
          preferences: { ...(prevUser.preferences || {}), ...preferences },
        };
        sec.setItem("user", JSON.stringify(updatedUser)); // Persist changes       
        toast.success("Preferences saved successfully!");
        return updatedUser;
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      toast.error("Failed to update preferences.");
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
      sec.setItem("user", JSON.stringify(updatedUser));
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
        register,
        linkedAccount,
        unlinkedAccount,
        verifyMail,
        resendVerificationMail,
        logout,
        updateUserProfile,
        updatePassword,
        updateUserPreferences,
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
