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


  /**
 * Fonction pour les url à paramètres sous la forme url/:id
 */
  parameterized: (item: string, parameter: string | number) => item.replace(':id', parameter.toString()),

  queryable: (item: string, queries: Array<{ key: any, value: string }>) => {
    item += '?';
    queries.forEach((query) => {
      item += `${query.key}=${query.value}&`;
    });
    return item.slice(0, -1);
  }
} as const;