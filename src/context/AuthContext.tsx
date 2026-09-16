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
  login: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  updateCompanyProfile: (updates: Partial<Entreprise>) => Promise<Entreprise>;
  deleteCompanyLogo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        console.warn('Session expiré ou invalide:', err);
        localStorage.removeItem('relancio_token');
        setToken(null);
        setUser(null);
        setCompany(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await apiRequest<{ token: string; user: User; company: Entreprise }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('relancio_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setCompany(res.company);
  };

  const loginAdmin = async (email: string, password: string): Promise<void> => {
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('relancio_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setCompany(null);
  };

  const register = async (data: RegisterFormData): Promise<void> => {
    const res = await apiRequest<{ token: string; user: User; company: Entreprise }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    localStorage.setItem('relancio_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setCompany(res.company);
  };

  const logout = () => {
    localStorage.removeItem('relancio_token');
    setToken(null);
    setUser(null);
    setCompany(null);
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
