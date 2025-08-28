export const ApiUrl = {
  LOGIN: "/user/login",
  REGISTER: "/user/register",
  VERIFY_MAIL: "/user/verify-mail",
  REFRESH: "/user/refresh",
  ME: "/user/me",
  UPDATE_PROFILE: "/user/update",
  RESEND_VERIFICATION_MAIL: "/user/resend-mail",
  UPDATE_PASSWORD: "/user/update-password",

  GET_AI_COACH_MESSAGES: "/aicoach/history",
  SEND_AI_COACH_MESSAGES: "/aicoach",

  LINK_GOOGLE_ACCOUNT: "/auth/link-google",
  UNLINK_GOOGLE_ACCOUNT: "/auth/google/unlink",

  // Friends endpoints
  FRIENDS: "/friends",
  BLOCKED_FRIENDS: "/friends/blocked",
  FRIENDS_REQUESTS: "/friends/requests",
  FRIENDS_REQUEST: "/friends/request",
  FRIENDS_SEARCH: "/friends/search",
  FRIENDS_CONVERSATIONS: "/friends/conversations",
  FRIENDS_ACTIVITY_FEED: "/friends/activity-feed",
  FRIENDS_SHARE_ACTIVITY: "/friends/share-activity",
  FRIENDS_ACTIVITY: "/friends/activity",
  FRIENDS_REPORT: "/friends/report",
  FRIENDS_STATS: "/friends/stats",

  // achievements
  ACHIEVEMENTS: "/api/achievements",

  // Message
  CONVERSATIONS: "/conversations",


  // Nutritions
  NUTRITION_SEARCH: "/nutrition/foods/search",
  NUTRITION_FOODS: "/nutrition/foods",
  NUTRITION_DAILY: "/nutrition/daily/:date",
  NUTRITION_DAILY_MEALS: "/nutrition/daily/:date/meals",
  NUTRITION_DELETE_MEAL: "/nutrition/daily/:date/meals/:mealId",
  NUTRITION_UPDATE_WATER_INTAKE: "/nutrition/daily/:date/water",
  NUTRITION_GET_GOALS: "/nutrition/goals",
  NUTRITION_UPDATE_GOALS: "/nutrition/goals",
  NUTRITION_GET_WEEKLY_ANALYSIS: "/nutrition/analysis/:date",
  NUTRITION_GET_WEEKLY_NUTRITION: "/nutrition/weekly",
  NUTRITION_GET_NUTRITION_STATS: "/nutrition/stats",




  /**
   * Fonction pour les url à paramètres sous la forme url/:id
   */
  parameterized: (item: string, parameters: Record<string, string | number> | string | number) => {
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

  queryable: (item: string, queries: Array<{ key: any; value: string }>) => {
    item += "?";
    queries.forEach((query) => {
      item += `${query.key}=${query.value}&`;
    });
    return item.slice(0, -1);
  },
} as const;
