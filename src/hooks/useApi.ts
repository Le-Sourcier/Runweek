// Imports nécessaires
import { ApiError, ApiResponse, FetchOptions } from "../interfaces/ApiInterface.ts";
import { ApiUrl } from "../utils/api-url.ts";
import { LoginResponse } from "../types/user.tsx";
import { getBaseMessage } from "../utils/error-handler.ts";
import sec from "react-secure-storage";

// Headers communs pour toutes les requêtes
const commonHeaders = {
	'Content-Type': 'application/json',
	Accept: 'application/json',
	'Access-Control-Allow-Origin': '*',
};

// URL de base de l'API
const baseURL = import.meta.env.VITE_API_URL;

// Fonction pour définir les headers (avec token si nécessaire)
export const defineHeaders = (options: RequestInit, isSecure: boolean): HeadersInit => {
	const headers = new Headers(options.headers);

	// Ajouter les headers communs
	Object.entries(commonHeaders).forEach(([key, value]) => {
		headers.set(key, value);
	});

	if (isSecure) {
		const token = sec.getItem("aspk");
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}
	}

	return headers;
};

// Fonction pour créer une ApiError à partir d'une Response
const createApiError = async (response: Response): Promise<ApiError> => {
	let responseData;
	try {
		responseData = await response.json();
	} catch {
		responseData = { message: response.statusText };
	}

	return {
		response: {
			status: response.status,
			data: responseData
		}
	} as ApiError;
};

// Fonction principale de fetch avec gestion des erreurs et du refresh token
const apiFetch = async <T = never>(endpoint: string, options: RequestInit = {}, isSecure: boolean): Promise<T> => {
	const headers = defineHeaders(options, isSecure);
	const url = `${baseURL}${endpoint}`;

	const config: RequestInit = {
		...options,
		headers
	};

	try {
		const response = await fetch(url, config);

		if (!response.ok) {
			const apiError = await createApiError(response);

			// Gestion du token expiré
			if (response.status === 401) {
				const refreshToken = sec.getItem("rft");

				if (refreshToken) {
					if (endpoint === ApiUrl.VERIFY_MAIL) {
						throw new Error(getBaseMessage('fr', 'TOKEN_EXPIRED'));
					}

					try {
						// Récupération d'un nouveau token
						const refreshResponse = await fetch(`${baseURL}${ApiUrl.REFRESH}`, {
							method: 'POST',
							headers: commonHeaders,
							body: JSON.stringify({ refreshToken })
						});

						if (!refreshResponse.ok) {
							throw new Error('Failed to refresh token');
						}

						const refreshData: LoginResponse = await refreshResponse.json();
						console.log("refreshData:", refreshData);

						// Utiliser les méthodes du store
						sec.setItem("aspk", refreshData.accessToken as string);
						sec.setItem("rft", refreshData.refreshToken as string);

						// Réessaie de la requête avec le nouveau token
						const newHeaders = defineHeaders(options, isSecure);
						const retryResponse = await fetch(url, {
							...config,
							headers: newHeaders
						});

						if (!retryResponse.ok) {
							const retryError = await createApiError(retryResponse);
							throw retryError;
						}

						return await retryResponse.json();
					} catch (error) {
						sec.removeItem("aspk");
						sec.removeItem("rft");
						throw new Error(getBaseMessage('fr', 'TOKEN_EXPIRED'));
					}
				} else {
					sec.removeItem("aspk");
					sec.removeItem("rft");
					location.href = "/login";
					throw apiError;
				}
			}

			throw apiError;
		}

		return await response.json();
	} catch (error: unknown) {
		// Si c'est déjà une ApiError, on la relance
		if (error && typeof error === 'object' && 'response' in error) {
			throw error;
		}

		// Sinon, on crée une nouvelle erreur
		throw error;
	}
};

// Export des méthodes d'API
export const apiUtils = {
	// Requête GET
	get: async <T = never>(endpoint: string, options: FetchOptions = {}, isSecure: boolean = true): Promise<ApiResponse<T>> => {
		return apiFetch<ApiResponse<T>>(endpoint, { method: 'GET', ...options }, isSecure);
	},

	// Requête POST
	post: async <T = never>(endpoint: string, data: object = {}, options: FetchOptions = {}, isSecure: boolean = true): Promise<ApiResponse<T>> => {
		return apiFetch<ApiResponse<T>>(endpoint, {
			method: 'POST',
			body: JSON.stringify(data),
			...options
		}, isSecure);
	},

	// Requête PUT
	put: async <T = never>(endpoint: string, data: object = {}, options: FetchOptions = {}, isSecure: boolean = true): Promise<ApiResponse<T>> => {
		return apiFetch<ApiResponse<T>>(endpoint, {
			method: 'PUT',
			body: JSON.stringify(data),
			...options
		}, isSecure);
	},

	// Requête DELETE
	del: async <T = never>(endpoint: string, options: FetchOptions = {}, isSecure: boolean = true): Promise<ApiResponse<T>> => {
		return apiFetch<ApiResponse<T>>(endpoint, { method: 'DELETE', ...options }, isSecure);
	},
};