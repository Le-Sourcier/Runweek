export const ApiUrl = {
  LOGIN: "/user/login",
  REGISTER: "/user/register",
  VERIFY_MAIL: "/user/verify-mail",
  REFRESH: "/user/refresh",
  ME: "/user/me",
  UPDATE_PROFILE: "/user/update",
  RESEND_VERIFICATION_MAIL: "/user/resend-mail",
  UPDATE_PASSWORD: "/user/update-password",
  RECOVERY_PASSWORD_REQUEST: "/user/forget-password",

  GET_AI_COACH_MESSAGES: "/aicoach/history",
  SEND_AI_COACH_MESSAGES: "/aicoach",
  MOTIVATION: "/aicoach/motivation",
  GET_AI_COACH_TRAINING_PLANS: "/aicoach/plans",
  GET_AI_COACH_SUGGESTED_WORKOUTS: "/aicoach/workouts",
  GET_AI_COACH_SUGGESTED_NUTRITION: "/aicoach/nutrition",
  GET_AI_ADVICES: "/aicoach/advices",

  // Google
  GOOGLE_AUTH: "/auth/google",
  GOOGLE_AUTH_CALLBACK: "/auth/google/callback",
  GOOGLE_AUTH_CONFIRMATION: "/auth/google/exchange-code",
  LINK_GOOGLE_ACCOUNT: "/auth/link-google",
  UNLINK_GOOGLE_ACCOUNT: "/auth/google/unlink",

  // Friends endpoints
  FRIENDS: "/friends",
  BLOCKED_FRIENDS: "/friends/blocked",
  FRIENDS_REQUESTS: "/friends/requests",
  FRIENDS_REQUEST: "/friends/request",
  FRIENDS_SEARCH: "/friends/search",
  FRIENDS_CONVERSATIONS: "/friends/conversations",
  FRIENDS_SEND_MESSAGE: "/friends/:friendId/message",
  FRIENDS_ACTIVITY_FEED: "/friends/activity-feed",
  FRIENDS_SHARE_ACTIVITY: "/friends/share-activity",
  FRIENDS_ACTIVITY: "/friends/activity",
  FRIENDS_REPORT: "/friends/report",
  FRIENDS_STATS: "/friends/stats",

  // achievements
  ACHIEVEMENTS: "/achievements",
  UNLOCK_ACHIEVEMENTS: "/achievements/unlock",
  CHECK_ACHIEVEMENTS: "/achievements/check",
  GET_ACHIEVEMENT_STATS: "/achievements/stats",
  GET_AVAILABLE_ACHIEVEMENTS: "/achievements/available",

  // Message
  CONVERSATIONS: "/conversations",
  READ_CONVERSATION: "/conversations/:id/read",

  // Personal Records
  PERSONAL_RECORDS: "/personal-records",
  PERSONAL_RECORDS_SEARCH: "/personal-records/search",
  PERSONAL_RECORDS_UPDATE: "/personal-records/:id",

  // Nutritions
  NUTRITION_SEARCH: "/nutrition/foods/search",
  NUTRITION_FOODS: "/nutrition/foods",
  NUTRITION_DAILY: "/nutrition/daily/:date",
  NUTRITION_DAILY_MEALS: "/nutrition/daily/:date/meals",
  NUTRITION_DELETE_MEAL: "/nutrition/daily/:date/meals/:meal_id",
  NUTRITION_UPDATE_WATER_INTAKE: "/nutrition/daily/:date/water",
  NUTRITION_GET_GOALS: "/nutrition/goals",
  NUTRITION_UPDATE_GOALS: "/nutrition/goals",
  NUTRITION_GET_WEEKLY_ANALYSIS: "/nutrition/analysis/:date",
  NUTRITION_GET_WEEKLY_NUTRITION: "/nutrition/weekly",
  NUTRITION_GET_NUTRITION_STATS: "/nutrition/stats",

  GET_DATA_SHARING_PREFERENCE: "/data-sharing/preferences",
  UPDATE_DATA_SHARING_PREFERENCE: "/data-sharing/preferences",
  GET_DATA_SHARING_PREFERENCE_BY_ADMIN: "/data-sharing/preferences/:id",

  GOALS: "/goals",
  GET_GOAL: "/goals/:id",
  UPDATE_GOAL: "/goals/:id",
  DELETE_GOAL: "/goals/:id",
  GET_GOALS_STATISTIC: "/goals/statistic",
  ADD_PROGRESS_TO_GOAL: "/goals/:id/progress",

  EVENTS: "/calendar/events",
  DELETE_EVENT: "/calendar/events/:id",

  // GET_PACE_STATS: "/statistics/pace",
  // GET_SLEEP_STATS: "/statistics/sleep",
  // GET_DAILY_STATS: "/statistics/daily",
  // GET_WEEKLY_STATS: "/statistics/weekly",
  // GET_MONTH_STATS: "/statistics/monthly",
  // GET_ACTIVITY_TYPE_STATS: "/statistics/activity-types",
  // GET_PERSONAL_RECORDS_STATS: "/statistics/personal-records",
  // GET_HEART_RATE_STATS: "/statistics/heart-rate",

  // URLs existantes
  GET_WEEKLY_STATS: "/statistics/weekly",
  GET_MONTHLY_STATS: "/statistics/monthly",
  GET_PACE_STATS: "/statistics/pace",
  GET_RUN_TYPE_STATS: "/statistics/run-types",
  GET_HEART_RATE_STATS: "/statistics/heart-rate",

  // Nouvelles URLs
  GET_RECENT_ACTIVITIES: "/statistics/activities",
  GET_PERFORMANCE_METRICS: "/statistics/metrics",
  GET_STATISTICS: "/statistics",
  GET_PERSONAL_RECORDS: "/statistics/personal-records",
  GET_SLEEP_DATA: "/statistics/sleep",

  /**
   * Fonction pour les url à paramètres sous la forme url/:id
   */
  parameterized: (
    item: string,
    parameters: Record<string, string | number> | string | number
  ) => {
    // Si on passe directement un string ou un number → c'est l'id par défaut
    if (typeof parameters === "string" || typeof parameters === "number") {
      return item.replace(":id", parameters.toString());
    }

    // Sinon on parcourt l'objet
    Object.entries(parameters).forEach(([key, value]) => {
      item = item.replace(`:${key}`, value.toString());
    });

    return item;
  },

  /**
   * Fonction pour les query strings sous la forme url?key=value
   */
  queryable: (
    item: string,
    queries: Record<string, string | number> | string | number
  ) => {
    // Si on passe directement un string ou un number → c'est le paramètre 'id' par défaut
    if (typeof queries === "string" || typeof queries === "number") {
      return `${item}?q=${encodeURIComponent(queries.toString())}`;
    }

    // Sinon on construit les query strings à partir de l'objet
    const queryString = Object.entries(queries)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`
      )
      .join("&");

    return queryString ? `${item}?${queryString}` : item;
  },
} as const;
