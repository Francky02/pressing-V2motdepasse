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
    // Si la session est révoquée/invalide (401), déclencher l'événement d'invalidation
    if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/register')) {
      window.dispatchEvent(new CustomEvent('relancio_unauthorized'));
    }
    const message = data.error || data.message || `Erreur requête (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}

export type DemandePaiementStatut = 'en_attente' | 'partiellement_payee' | 'payee' | 'expiree' | 'annulee';

export interface DemandePaiementItem {
  id: string;
  entreprise_id: string;
  creance_id: string;
  client_id: string;
  montant: number;
  montant_paye?: number;
  motif: string;
  token: string;
  date_creation: string;
  date_expiration: string;
  statut: DemandePaiementStatut;
  description?: string;
  client_nom?: string;
  client_telephone?: string;
  motif_creance?: string;
  creance_statut?: string;
  created_at: string;
  updated_at: string;
}

export interface PublicPaymentPageData {
  demande: {
    id: string;
    token: string;
    montant: number;
    montant_paye: number;
    motif: string;
    description: string;
    date_creation: string;
    date_expiration: string;
    statut: DemandePaiementStatut;
    created_at: string;
  };
  company: {
    id: string;
    nom: string;
    logo: string | null;
    couleur_principale: string;
    couleur_secondaire: string;
    email: string;
    telephone: string;
    adresse: string;
    secteur: string;
  };
  client: {
    id: string;
    nom: string;
    telephone: string;
  };
  creance: {
    id: string;
    motif: string;
    montant_total: number;
    montant_paye: number;
    solde: number;
    date_echeance: string;
    statut: string;
  };
}

