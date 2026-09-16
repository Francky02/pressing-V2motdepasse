import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import {
  ShieldAlert,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Activity,
  LogOut,
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
  const { user, logout, isAuthenticated, isLoading } = useAuth();

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
    } else {
      setStats(null);
      setCompanies([]);
      setSelectedCompany(null);
    }
  }, [isSuperAdmin]);

  const handleAdminLogout = () => {
    setStats(null);
    setCompanies([]);
    setSelectedCompany(null);
    logout();
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

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <ShieldAlert className="animate-badge" size={36} color="#f59e0b" style={{ margin: '0 auto 1rem auto' }} />
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>Vérification de la session Super Admin...</div>
        </div>
      </div>
    );
  }

  // Protection stricte : si non authentifié ou non Super Admin, redirection immédiate vers /connexion
  if (!isSuperAdmin) {
    return <Navigate to="/connexion" replace />;
  }

  // Super Admin Logged In Dashboard
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: 'var(--text-primary)' }}>
      {/* Admin Top Navigation */}
      <header
        style={{
          background: '#0d1322',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.75rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/" className="brand-logo-link">
              <div className="brand-logo-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', width: '30px', height: '30px' }}>
                <ShieldAlert size={18} />
              </div>
              <span className="brand-logo-text" style={{ fontSize: '1.15rem' }}>Relancio</span>
            </Link>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.15rem 0.55rem',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              SUPER ADMIN CONSOLE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white' }}>{user?.nom}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
            <button
              type="button"
              onClick={handleAdminLogout}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fb7185', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
            >
              <LogOut size={14} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 1.5rem' }}>
        {actionSuccess && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle size={16} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Global KPI Cards */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>
              Supervision Globale de la Plateforme
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Mise à jour en temps réel
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {/* Total Entreprises */}
            <div className="glass-card" style={{ padding: '0.85rem 1rem', borderLeft: '3px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 700 }}>
                  Entreprises totales
                </span>
                <Building2 size={16} color="#6366f1" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                {stats ? stats.totalCompanies : '...'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Comptes professionnels
              </span>
            </div>

            {/* Entreprises Actives */}
            <div className="glass-card" style={{ padding: '0.85rem 1rem', borderLeft: '3px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                  Entreprises actives
                </span>
                <CheckCircle size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                {stats ? stats.activeCompanies : '...'}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#34d399' }}>
                Autorisées à encaisser
              </span>
            </div>

            {/* Entreprises Désactivées */}
            <div className="glass-card" style={{ padding: '0.85rem 1rem', borderLeft: '3px solid #f43f5e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: 700 }}>
                  Entreprises désactivées
                </span>
                <XCircle size={16} color="#f43f5e" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                {stats ? stats.inactiveCompanies : '...'}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#fb7185' }}>
                Accès suspendu
              </span>
            </div>

            {/* Nombre d'utilisateurs */}
            <div className="glass-card" style={{ padding: '0.85rem 1rem', borderLeft: '3px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#fde68a', fontWeight: 700 }}>
                  Utilisateurs inscrits
                </span>
                <Users size={16} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
                {stats ? stats.totalUsers : '...'}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Admins & Super Admin
              </span>
            </div>
          </div>
        </div>

        {/* Entreprises Management Table */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.15rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>
                Gestion des Entreprises Clientes
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                Contrôle d'accès et supervision des tenants de la plateforme
              </p>
            </div>
            <button
              type="button"
              onClick={loadAdminData}
              className="btn btn-secondary btn-sm"
              disabled={isLoadingData}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              {isLoadingData ? 'Actualisation...' : 'Rafraîchir'}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '820px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '0.55rem 0.65rem' }}>Entreprise</th>
                  <th style={{ padding: '0.55rem 0.65rem' }}>Responsable</th>
                  <th style={{ padding: '0.55rem 0.65rem' }}>Email & Tél</th>
                  <th style={{ padding: '0.55rem 0.65rem' }}>Secteur</th>
                  <th style={{ padding: '0.55rem 0.65rem' }}>Statut</th>
                  <th style={{ padding: '0.55rem 0.65rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(comp => (
                  <tr
                    key={comp.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      fontSize: '0.84rem',
                    }}
                  >
                    <td style={{ padding: '0.55rem 0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
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
                            <Building2 size={15} color="white" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{comp.nom}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ID: {comp.id}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.55rem 0.65rem', color: 'var(--text-primary)' }}>
                      {comp.responsable}
                    </td>

                    <td style={{ padding: '0.55rem 0.65rem' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{comp.email}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{comp.telephone}</div>
                    </td>

                    <td style={{ padding: '0.55rem 0.65rem' }}>
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {comp.secteur}
                      </span>
                    </td>

                    <td style={{ padding: '0.55rem 0.65rem' }}>
                      {comp.actif ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          <Check size={11} /> Actif
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: 'rgba(244, 63, 94, 0.15)',
                            color: '#fb7185',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                          }}
                        >
                          <X size={11} /> Désactivé
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.55rem 0.65rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedCompany(comp)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                        >
                          <Eye size={12} />
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
                            padding: '0.25rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
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
            borderRadius: 'var(--radius-lg)',
            padding: '1.15rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <Activity size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>
              Journal d'Activité Récent
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {stats?.recentActivities.map(act => (
              <div
                key={act.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.55rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: 'white', fontSize: '0.82rem', marginRight: '0.45rem' }}>
                    {act.action}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {act.details}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  <Clock size={11} />
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
          <div className="modal-dialog" style={{ maxWidth: '520px', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedCompany(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.15rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: selectedCompany.couleur_principale,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {selectedCompany.logo ? (
                  <img src={selectedCompany.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building2 size={22} color="white" />
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  {selectedCompany.nom}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Tenant ID: {selectedCompany.id}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem', fontSize: '0.82rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Responsable:</span> <strong style={{ color: 'white' }}>{selectedCompany.responsable}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <strong style={{ color: 'white' }}>{selectedCompany.email}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Téléphone:</span> <strong style={{ color: 'white' }}>{selectedCompany.telephone}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Secteur:</span> <strong style={{ color: 'white' }}>{selectedCompany.secteur}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Adresse:</span> <strong style={{ color: 'white' }}>{selectedCompany.adresse || 'N/A'}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Couleur:</span> <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', backgroundColor: selectedCompany.couleur_principale, verticalAlign: 'middle', margin: '0 4px' }} />{selectedCompany.couleur_principale}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Statut:</span> <strong style={{ color: selectedCompany.actif ? '#34d399' : '#fb7185' }}>{selectedCompany.actif ? 'Actif' : 'Désactivé'}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Inscrit le:</span> <strong style={{ color: 'white' }}>{new Date(selectedCompany.created_at).toLocaleDateString('fr-FR')}</strong></div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
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
                style={{ color: selectedCompany.actif ? '#fb7185' : '#0b0f19', fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
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
