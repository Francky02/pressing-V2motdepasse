import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export interface User {
  id: string;
  entreprise_id: string | null;
  nom: string;
  email: string;
  telephone: string;
  role: 'SUPER_ADMIN' | 'ENTREPRISE_ADMIN' | 'EMPLOYE';
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface Entreprise {
  id: string;
  nom: string;
  responsable: string;
  email: string;
  telephone: string;
  secteur: string;
  logo: string | null;
  couleur_principale: string;
  couleur_secondaire: string;
  adresse: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterFormData {
  nom_entreprise: string;
  responsable: string;
  email: string;
  telephone: string;
  secteur: string;
  password: string;
  confirm_password: string;
}

interface AuthContextType {
  user: User | null;
  company: Entreprise | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginAdmin: (email: string, password: string) => Promise<User>;
  register: (data: RegisterFormData) => Promise<User>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateCompanyProfile: (updates: Partial<Entreprise>) => Promise<Entreprise>;
  deleteCompanyLogo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Nettoyage complet des stockages côté client
const clearBrowserSessionStorage = () => {
  try {
    // 1. Nettoyer localStorage de toutes les clés de session Relancio
    localStorage.removeItem('relancio_token');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('relancio_')) {
        localStorage.removeItem(key);
      }
    });

    // 2. Nettoyer complètement sessionStorage
    sessionStorage.clear();

    // 3. Expirer immédiatement les cookies du domaine
    if (typeof document !== 'undefined' && document.cookie) {
      document.cookie.split(';').forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      });
    }
  } catch (err) {
    console.error('Erreur lors du nettoyage du stockage:', err);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Entreprise | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('relancio_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Rehydrate on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('relancio_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiRequest<{ user: User; company?: Entreprise }>('/api/auth/me');
        setUser(res.user);
        if (res.company) {
          setCompany(res.company);
        }
      } catch (err) {
        console.warn('Session expirée ou invalide:', err);
        clearBrowserSessionStorage();
        setToken(null);
        setUser(null);
        setCompany(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = () => {
    // 1. Notification au serveur (best-effort pour clore le cycle)
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});

    // 2. Suppression de tous les stockages de session (localStorage, sessionStorage, cookies)
    clearBrowserSessionStorage();

    // 3. Réinitialisation complète du state React
    setToken(null);
    setUser(null);
    setCompany(null);
    setIsLoading(false);

    // 4. Événement global pour nettoyer d'éventuels caches mémoire
    window.dispatchEvent(new CustomEvent('relancio_logout'));

    // 5. Redirection propre et inconditionnelle vers /connexion en remplaçant l'historique
    window.location.replace('/connexion');
  };

  // Synchronisation avec les événements de déconnexion et protection bfcache (bouton Précédent/Suivant)
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      // Si la page est restaurée depuis le cache navigateur (bfcache) ou si le token est absent
      const storedToken = localStorage.getItem('relancio_token');
      if (event.persisted || !storedToken) {
        setToken(null);
        setUser(null);
        setCompany(null);
        const path = window.location.pathname;
        if (path.startsWith('/entreprise') || path.startsWith('/admin')) {
          window.location.replace('/connexion');
        }
      }
    };

    window.addEventListener('relancio_unauthorized', handleUnauthorized);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('relancio_unauthorized', handleUnauthorized);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await apiRequest<{ token: string; user: User; company?: Entreprise }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('relancio_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setCompany(res.company || null);
    return res.user;
  };

  const loginAdmin = async (email: string, password: string): Promise<User> => {
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('relancio_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setCompany(null);
    return res.user;
  };

  const register = async (data: RegisterFormData): Promise<User> => {
    const res = await apiRequest<{ token: string; user: User; company: Entreprise }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    localStorage.setItem('relancio_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setCompany(res.company);
    return res.user;
  };

  const refreshSession = async () => {
    try {
      const res = await apiRequest<{ user: User; company?: Entreprise }>('/api/auth/me');
      setUser(res.user);
      if (res.company) {
        setCompany(res.company);
      }
    } catch {
      logout();
    }
  };

  const updateCompanyProfile = async (updates: Partial<Entreprise>): Promise<Entreprise> => {
    const res = await apiRequest<{ message: string; company: Entreprise }>('/api/company/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    setCompany(res.company);
    return res.company;
  };

  const deleteCompanyLogo = async (): Promise<void> => {
    const res = await apiRequest<{ message: string; company: Entreprise }>('/api/company/logo', {
      method: 'DELETE',
    });
    setCompany(res.company);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        loginAdmin,
        register,
        logout,
        refreshSession,
        updateCompanyProfile,
        deleteCompanyLogo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
