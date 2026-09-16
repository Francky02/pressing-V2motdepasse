// API Client with automatic token management and dynamic base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('relancio_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || data.message || `Erreur requête (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}
