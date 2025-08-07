import { ApiResponse } from "../types";

export const STORAGE_KEYS = {
  USER: "jurilex_user",
  AUTH_TOKEN: "jurilex_auth_token",
  REMEMBER_ME: "jurilex_remember_me",
};

export const clearAuthData = (keys: string[]) => {
  keys.forEach((key) => localStorage.removeItem(key));
};
export const saveAuthData = (keys: Record<string, string>) => {
  Object.entries(keys).forEach(([key, value]) =>
    localStorage.setItem(key, value)
  );
};
export const getAuthData = (key: string) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};
export const isAuthDataValid = (key: string, maxAge: number) => {
  const timestamp = localStorage.getItem(`${key}_timestamp`);
  if (!timestamp) return false;

  const age = Date.now() - parseInt(timestamp);
  return age < maxAge;
};

// const fetchData () = fetch()

export async function fetchApi<T>(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    // Fusionne les headers existants avec les headers par défaut
    const mergedHeaders = {
      ...defaultHeaders,
      ...(init.headers || {}),
    };

    const response = await fetch(input, {
      ...init,
      headers: mergedHeaders,
    });

    const result: ApiResponse<T> = await response.json();

    return result;
  } catch (error: unknown) {
    return {
      error: true,
      status: 0,
      message: error instanceof Error ? error.message : "Erreur de connexion",
    };
  }
}

export async function fetchWithRefresh<T>(
  url: string,
  options: RequestInit,
  getAccessToken: () => string | null,
  setAccessToken: (token: string) => void
): Promise<T> {
  const accessToken = getAccessToken();

  const res = await fetchApi<T>(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Si token expiré, tente de le rafraîchir
  if (res.message === "TOKEN_EXPIRED" || res.message === "TOKEN_INVALID") {
    const refreshToken = localStorage.getItem("rft");
    if (!refreshToken) throw new Error("Aucun refreshToken");

    const refreshRes = await fetchApi<{
      accessToken: string;
      refreshToken: string;
    }>(`${import.meta.env.VITE_API_URL}/user/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.data?.accessToken) throw new Error("Refresh échoué");

    const newToken = refreshRes.data.accessToken;
    const newRefresh = refreshRes.data.refreshToken;

    // On met à jour le token
    setAccessToken(newToken);
    localStorage.setItem("aspk", newToken);
    if (newRefresh) localStorage.setItem("rft", newRefresh);

    // Rejoue la requête
    const retryRes = await fetchApi<T>(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      },
    });

    return retryRes.data as T;
  }

  return res.data as T;
}
