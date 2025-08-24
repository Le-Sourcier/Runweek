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
  FRIENDS_REQUESTS: "/friends/requests",
  FRIENDS_REQUEST: "/friends/request",
  FRIENDS_SEARCH: "/friends/search",
  FRIENDS_CONVERSATIONS: "/friends/conversations",
  FRIENDS_ACTIVITY_FEED: "/friends/activity-feed",
  FRIENDS_SHARE_ACTIVITY: "/friends/share-activity",
  FRIENDS_ACTIVITY: "/friends/activity",
  FRIENDS_REPORT: "/friends/report",
  FRIENDS_STATS: "/friends/stats",

  /**
   * Fonction pour les url à paramètres sous la forme url/:id
   */
  parameterized: (item: string, parameter: string | number) =>
    item.replace(":id", parameter.toString()),

  queryable: (item: string, queries: Array<{ key: any; value: string }>) => {
    item += "?";
    queries.forEach((query) => {
      item += `${query.key}=${query.value}&`;
    });
    return item.slice(0, -1);
  },
} as const;
