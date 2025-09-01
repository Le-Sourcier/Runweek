import { useNavigate, NavigateOptions } from "react-router-dom";

// Types pour une meilleure sécurité de type
export interface NavigationParams {
  [key: string]: string | number | boolean | null | undefined;
}

export interface NavigateWithParamsOptions
  extends Omit<NavigateOptions, "state"> {
  state?: any;
  preserveQuery?: boolean; // Préserver les query params existants
  replace?: boolean;
}

// Hook personnalisé pour la navigation centralisée
export const useAppNavigation = () => {
  const navigate = useNavigate();

  /**
   * Navigate vers une route avec des paramètres d'URL
   * @param path - Le chemin de base (ex: '/user/:id')
   * @param urlParams - Les paramètres à remplacer dans l'URL (ex: { id: '123' })
   * @param queryParams - Les query parameters (ex: { tab: 'profile', edit: true })
   * @param options - Options de navigation
   */
  const navigateWithParams = (
    path: string,
    urlParams: NavigationParams = {},
    queryParams: NavigationParams = {},
    options: NavigateWithParamsOptions = {}
  ) => {
    // Remplacer les paramètres dans le path
    let finalPath = path;
    Object.entries(urlParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        finalPath = finalPath.replace(`:${key}`, String(value));
      }
    });

    // Construire les query parameters
    const searchParams = new URLSearchParams();

    // Préserver les query params existants si demandé
    if (options.preserveQuery) {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.forEach((value, key) => {
        searchParams.set(key, value);
      });
    }

    // Ajouter les nouveaux query params
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.set(key, String(value));
      } else {
        searchParams.delete(key);
      }
    });

    // Construire l'URL finale
    const queryString = searchParams.toString();
    const fullPath = queryString ? `${finalPath}?${queryString}` : finalPath;

    // Naviguer
    navigate(fullPath, {
      replace: options.replace || false,
      state: options.state,
      ...options,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Navigate vers une route simple avec query parameters uniquement
   */
  const navigateWithQuery = (
    path: string,
    queryParams: NavigationParams = {},
    options: NavigateWithParamsOptions = {}
  ) => {
    navigateWithParams(path, {}, queryParams, options);
  };

  /**
   * Navigate vers une route avec des paramètres d'URL uniquement
   */
  const navigateWithUrlParams = (
    path: string,
    urlParams: NavigationParams = {},
    options: NavigateWithParamsOptions = {}
  ) => {
    navigateWithParams(path, urlParams, {}, options);
  };

  /**
   * Mettre à jour uniquement les query parameters de la page actuelle
   */
  const updateQueryParams = (
    queryParams: NavigationParams,
    options: { replace?: boolean; preserveExisting?: boolean } = {}
  ) => {
    const searchParams = new URLSearchParams();

    // Préserver les paramètres existants si demandé
    if (options.preserveExisting !== false) {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.forEach((value, key) => {
        searchParams.set(key, value);
      });
    }

    // Ajouter/modifier les nouveaux paramètres
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.set(key, String(value));
      } else {
        searchParams.delete(key);
      }
    });

    const queryString = searchParams.toString();
    const newPath = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    navigate(newPath, { replace: options.replace !== false });
  };

  /**
   * Navigation avec gestion des erreurs et validation
   */
  const safeNavigate = (
    path: string,
    urlParams: NavigationParams = {},
    queryParams: NavigationParams = {},
    options: NavigateWithParamsOptions = {}
  ) => {
    try {
      // Validation basique du path
      if (!path || typeof path !== "string") {
        console.error("Invalid path provided to safeNavigate:", path);
        return false;
      }

      // Vérifier que tous les paramètres requis sont fournis
      const requiredParams = path.match(/:(\w+)/g);
      if (requiredParams) {
        const missing = requiredParams
          .map((param) => param.substring(1))
          .filter(
            (param) =>
              urlParams[param] === undefined || urlParams[param] === null
          );

        if (missing.length > 0) {
          console.error("Missing required URL parameters:", missing);
          return false;
        }
      }

      navigateWithParams(path, urlParams, queryParams, options);
      return true;
    } catch (error) {
      console.error("Navigation error:", error);
      return false;
    }
  };

  /**
   * Récupère l'URL actuelle avec ses paramètres.
   * @returns Un objet contenant le chemin, la chaîne de requête et les paramètres de requête parsés.
   */
  const getCurrentLocation = () => {
    const { pathname, search } = window.location;
    const searchParams = new URLSearchParams(search);
    const queryParams: NavigationParams = {};

    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    return {
      pathname,
      search,
      queryParams,
    };
  };

  return {
    navigateWithParams,
    navigateWithQuery,
    navigateWithUrlParams,
    updateQueryParams,
    safeNavigate,
    getCurrentLocation,
    // Expose la fonction navigate originale si besoin
    navigate,
  };
};

// Utilitaires pour construire des URLs sans naviguer
export const buildUrl = (
  path: string,
  urlParams: NavigationParams = {},
  queryParams: NavigationParams = {}
): string => {
  // Remplacer les paramètres dans le path
  let finalPath = path;
  Object.entries(urlParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      finalPath = finalPath.replace(`:${key}`, String(value));
    }
  });

  // Construire les query parameters
  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${finalPath}?${queryString}` : finalPath;
};

// Constantes pour les routes communes (optionnel)
export const ROUTES = {
  HOME: "/home",
  WELCOME: "/",
  DASHBOARD: "/dashboard",

  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-mail",
  RESET_PASSWORD: "/reset-password/:token",
  FORGOT_PASSWORD: "/forgot-password",
  PROFILE: "/profile",
  FRIENDS: "/friends",
  SETTINGS: "/settings",
  STATISTICS: "/statistics",
  CALENDAR: "/calendar",
  ACHIEVEMENTS: "/achievements",
  PERSONAL_RECORDS: "/personal-records",
  DIET: "/diet",
  SUPPORT: "/support",
  COACH: "/coach",
  TRAINING_PLAN: "/training-plan",
  GOALS: "/goals",
} as const;
