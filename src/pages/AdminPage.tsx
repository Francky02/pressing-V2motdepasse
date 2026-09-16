import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import {
  ShieldAlert,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Activity,
  Lock,
  Mail,
  LogOut,
  AlertCircle,
  Eye,
  Check,
  X,
  Clock,
} from 'lucide-react';

interface CompanyAdminItem {
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
  adminEmail: string;
}

interface AdminStats {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  totalUsers: number;
  recentActivities: Array<{
    id: string;
    entreprise_id: string | null;
    action: string;
    details: string;
    created_at: string;
  }>;
}

export const AdminPage: React.FC = () => {
  const { user, loginAdmin, logout, isAuthenticated } = useAuth();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Admin dashboard state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [companies, setCompanies] = useState<CompanyAdminItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyAdminItem | null>(null);

  const isSuperAdmin = isAuthenticated && user?.role === 'SUPER_ADMIN';

  const loadAdminData = async () => {
    try {
      setIsLoadingData(true);
      const [statsData, companiesData] = await Promise.all([
        apiRequest<AdminStats>('/api/admin/stats'),
        apiRequest<{ companies: CompanyAdminItem[] }>('/api/admin/companies'),
      ]);
      setStats(statsData);
      setCompanies(companiesData.companies);
    } catch (err) {
      console.error('Erreur chargement admin:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadAdminData();
    }
  }, [isSuperAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      setLoading(true);
      await loginAdmin(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Identifiants administrateur incorrects.';
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (companyId: string, currentStatus: boolean) => {
    try {
      const res = await apiRequest<{ message: string; company: CompanyAdminItem }>(
        `/api/admin/companies/${companyId}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ actif: !currentStatus }),
        }
      );

      setActionSuccess(res.message);
      setTimeout(() => setActionSuccess(null), 3000);

      // Refresh list
      setCompanies(prev =>
        prev.map(c => (c.id === companyId ? { ...c, actif: !currentStatus } : c))
      );
      if (stats) {
        setStats({
          ...stats,
          activeCompanies: !currentStatus ? stats.activeCompanies + 1 : stats.activeCompanies - 1,
          inactiveCompanies: !currentStatus ? stats.inactiveCompanies - 1 : stats.inactiveCompanies + 1,
        });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors du changement de statut');
    }
  };

  // If not super admin, show login form
  if (!isSuperAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#070a12' }}>
        <header style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" className="brand-logo-link">
              <div className="brand-logo-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <ShieldAlert size={20} />
              </div>
              <span className="brand-logo-text">Relancio</span>
              <span className="brand-logo-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                Portail Admin
              </span>
            </Link>
            <Link to="/" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              ← Retour au site
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#0d1322',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.1)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                }}
              >
                <ShieldAlert size={26} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '0.35rem' }}>
                Super Administrateur
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Espace réservé à la supervision globale de Relancio
              </p>
            </div>

            {loginError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  color: '#fb7185',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  fontSize: '0.88rem',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Email Administrateur
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@relancio.com"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem 0.75rem 2.4rem',
                      color: 'white',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem 0.75rem 2.4rem',
                      color: 'white',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-lg"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#0b0f19',
                  fontWeight: 800,
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 18px rgba(245, 158, 11, 0.35)',
                }}
              >
                {loading ? 'Vérification...' : 'Ouvrir la session Super Admin'}
              </button>
            </form>

            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px dashed rgba(245, 158, 11, 0.3)',
                fontSize: '0.78rem',
                color: '#fde68a',
              }}
            >
              <span style={{ fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Identifiants Super Admin initiaux :</span>
              Email : <code>admin@relancio.com</code><br />
              Mot de passe : <code>AdminRelancio2026!</code>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@relancio.com');
                  setPassword('AdminRelancio2026!');
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '0.5rem',
                  padding: '0.35rem',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                Remplir en 1 clic
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Super Admin Logged In Dashboard
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: 'var(--text-primary)' }}>
      {/* Admin Top Navigation */}
      <header
        style={{
          background: '#0d1322',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" className="brand-logo-link">
              <div className="brand-logo-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <ShieldAlert size={20} />
              </div>
              <span className="brand-logo-text">Relancio</span>
            </Link>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.65rem',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
              }}
            >
              SUPER ADMIN CONSOLE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white' }}>{user?.nom}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fb7185' }}
            >
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {actionSuccess && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.92rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle size={18} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Global KPI Cards */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '1.25rem' }}>
            Supervision Globale de la Plateforme
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Total Entreprises */}
            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#a5b4fc', fontWeight: 700 }}>
                  Nombre d'entreprises
                </span>
                <Building2 size={20} color="#6366f1" />
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white' }}>
                {stats ? stats.totalCompanies : '...'}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Comptes professionnels enregistrés
              </span>
            </div>

            {/* Entreprises Actives */}
            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700 }}>
                  Entreprises actives
                </span>
                <CheckCircle size={20} color="#10b981" />
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white' }}>
                {stats ? stats.activeCompanies : '...'}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#34d399' }}>
                Autorisées à encaisser
              </span>
            </div>

            {/* Entreprises Désactivées */}
            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f43f5e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#fb7185', fontWeight: 700 }}>
                  Entreprises désactivées
                </span>
                <XCircle size={20} color="#f43f5e" />
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white' }}>
                {stats ? stats.inactiveCompanies : '...'}
              </div>
              <span style={{ fontSize: '0.78rem', color: '#fb7185' }}>
                Accès suspendu par le Super Admin
              </span>
            </div>

            {/* Nombre d'utilisateurs */}
            <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#fde68a', fontWeight: 700 }}>
                  Nombre d'utilisateurs
                </span>
                <Users size={20} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white' }}>
                {stats ? stats.totalUsers : '...'}
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Admins entreprise & super admin
              </span>
            </div>
          </div>
        </div>

        {/* Entreprises Management Table */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            marginBottom: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', margin: 0 }}>
                Gestion des Entreprises Clientes
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                Contrôle d'accès et supervision des tenants de la plateforme
              </p>
            </div>
            <button
              type="button"
              onClick={loadAdminData}
              className="btn btn-secondary btn-sm"
              disabled={isLoadingData}
            >
              {isLoadingData ? 'Actualisation...' : 'Rafraîchir'}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '820px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Entreprise</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Responsable</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Email & Tél</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Secteur</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Statut</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(comp => (
                  <tr
                    key={comp.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: comp.couleur_principale,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          {comp.logo ? (
                            <img src={comp.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <Building2 size={18} color="white" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'white' }}>{comp.nom}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {comp.id}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-primary)' }}>
                      {comp.responsable}
                    </td>

                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{comp.email}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{comp.telephone}</div>
                    </td>

                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {comp.secteur}
                      </span>
                    </td>

                    <td style={{ padding: '1rem 0.75rem' }}>
                      {comp.actif ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          <Check size={12} /> Actif
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: 'rgba(244, 63, 94, 0.15)',
                            color: '#fb7185',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                          }}
                        >
                          <X size={12} /> Désactivé
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedCompany(comp)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                        >
                          <Eye size={13} />
                          <span>Consulter</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(comp.id, comp.actif)}
                          style={{
                            background: comp.actif ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                            border: `1px solid ${comp.actif ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.4)'}`,
                            color: comp.actif ? '#fb7185' : '#34d399',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          {comp.actif ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Platform Activities */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <Activity size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>
              Journal d'Activité Récent
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats?.recentActivities.map(act => (
              <div
                key={act.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: 'white', fontSize: '0.88rem', marginRight: '0.5rem' }}>
                    {act.action}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                    {act.details}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <Clock size={12} />
                  <span>{new Date(act.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* View Company Modal */}
      {selectedCompany && (
        <div className="modal-backdrop" onClick={() => setSelectedCompany(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedCompany(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: selectedCompany.couleur_principale,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {selectedCompany.logo ? (
                  <img src={selectedCompany.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building2 size={28} color="white" />
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  {selectedCompany.nom}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Identifiant tenant : {selectedCompany.id}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
              <div><strong>Responsable :</strong> {selectedCompany.responsable}</div>
              <div><strong>Email :</strong> {selectedCompany.email}</div>
              <div><strong>Téléphone :</strong> {selectedCompany.telephone}</div>
              <div><strong>Secteur :</strong> {selectedCompany.secteur}</div>
              <div><strong>Adresse :</strong> {selectedCompany.adresse || 'Non renseignée'}</div>
              <div><strong>Couleur principale :</strong> <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '3px', backgroundColor: selectedCompany.couleur_principale, verticalAlign: 'middle', marginRight: '4px' }} />{selectedCompany.couleur_principale}</div>
              <div><strong>Statut d'accès :</strong> {selectedCompany.actif ? '✅ Actif et autorisé' : '❌ Désactivé'}</div>
              <div><strong>Date d'inscription :</strong> {new Date(selectedCompany.created_at).toLocaleDateString('fr-FR')}</div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedCompany(null)}
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  handleToggleStatus(selectedCompany.id, selectedCompany.actif);
                  setSelectedCompany({ ...selectedCompany, actif: !selectedCompany.actif });
                }}
                className={`btn btn-sm ${selectedCompany.actif ? 'btn-secondary' : 'btn-primary'}`}
                style={{ color: selectedCompany.actif ? '#fb7185' : '#0b0f19' }}
              >
                {selectedCompany.actif ? 'Désactiver cette entreprise' : 'Réactiver cette entreprise'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
