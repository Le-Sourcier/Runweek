// Interface pour la réponse de l'API
export interface ApiResponse<T> {
  error: boolean;
  status: number;
  message: string;
  data: T;
}

// Interface pour les erreurs d'API (remplace AxiosError)
export interface ApiError {
  response?: {
    status: number;
    data: any;
  };
  message?: string;
}

// Interface pour les options de fetch (remplace AxiosRequestConfig)
export interface FetchOptions extends Omit<RequestInit, 'method' | 'body'> {
  headers?: Record<string, string>;
}