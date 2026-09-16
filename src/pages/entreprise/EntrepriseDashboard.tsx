import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  TrendingDown,
  TrendingUp,
  Clock,
  Users,
  AlertCircle,
  Settings,
  Activity,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface DashboardResponse {
  company: {
    id: string;
    nom: string;
    secteur: string;
    couleur_principale: string;
  };
  stats: {
    totalToRecover: number;
    totalCollected: number;
    pendingCount: number;
    remindCount: number;
    paidCount: number;
    recoveryRate: number;
  };
  creances: Array<{
    id: string;
    client_nom: string;
    client_telephone: string;
    montant: number;
    motif: string;
    statut: 'en_attente' | 'relance' | 'paye';
    echeance: string;
  }>;
  recentPayments: Array<{
    id: string;
    client_nom: string;
    montant: number;
    motif: string;
    created_at: string;
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    details: string;
    created_at: string;
  }>;
}

export const EntrepriseDashboard: React.FC = () => {
  const { company } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest<DashboardResponse>('/api/company/dashboard');
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur chargement dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const primaryColor = company?.couleur_principale || '#10b981';

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${primaryColor}20 0%, rgba(15, 23, 42, 0.7) 100%)`,
          border: `1px solid ${primaryColor}40`,
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(1.5rem, 3vw, 2rem)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div className="badge-pill" style={{ marginBottom: '0.5rem' }}>
            <Sparkles size={14} />
            <span>Tableau de bord • {company?.nom}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800, color: 'white', margin: 0 }}>
            Bienvenue sur votre espace d'encaissement
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
            Suivez ce que vos clients vous doivent et pilotez vos rentrées financières en temps réel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchDashboard}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
          <Link
            to="/entreprise/parametres"
            className="btn btn-primary btn-sm btn-glow"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Settings size={14} />
            <span>Personnaliser ma marque</span>
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Essential Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* 1. Total à récupérer */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fb7185' }}>
              Total à récupérer
            </span>
            <TrendingDown size={20} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>
            {data ? data.stats.totalToRecover.toLocaleString() : '...'} FCFA
          </div>
          <span style={{ fontSize: '0.78rem', color: '#fda4af' }}>
            Dettes clients en attente ou échues
          </span>
        </div>

        {/* 2. Total encaissé */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#34d399' }}>
              Total encaissé
            </span>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>
            {data ? data.stats.totalCollected.toLocaleString() : '...'} FCFA
          </div>
          <span style={{ fontSize: '0.78rem', color: '#86efac' }}>
            Règlements reçus et confirmés
          </span>
        </div>

        {/* 3. Créances en attente */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fbbf24' }}>
              Créances en attente
            </span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>
            {data ? data.stats.pendingCount : '...'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Factures ouvertes en attente de paiement
          </span>
        </div>

        {/* 4. Clients à relancer */}
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#a5b4fc' }}>
              Clients à relancer
            </span>
            <Users size={20} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>
            {data ? data.stats.remindCount : '...'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Relance recommandée WhatsApp/SMS
          </span>
        </div>
      </div>

      {/* Main Two-Column View: Recent Claims & Payments + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Créances & Paiements récents */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>
              Créances & Paiements de votre entreprise
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Données isolées
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.creances && data.creances.length > 0 ? (
              data.creances.map(cr => (
                <div
                  key={cr.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '0.92rem' }}>
                      {cr.client_nom}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {cr.motif} • {cr.client_telephone}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>
                      {cr.montant.toLocaleString()} FCFA
                    </div>
                    <div>
                      {cr.statut === 'paye' && (
                        <span style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                          Encaissé
                        </span>
                      )}
                      {cr.statut === 'relance' && (
                        <span style={{ fontSize: '0.72rem', color: '#fb7185', background: 'rgba(244, 63, 94, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                          À relancer
                        </span>
                      )}
                      {cr.statut === 'en_attente' && (
                        <span style={{ fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                          En attente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                Aucune créance enregistrée pour l'instant.
              </div>
            )}
          </div>
        </div>

        {/* Right: Activité récente & Raccourcis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Activité récente */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Activity size={18} color={primaryColor} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>
                Activité récente
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data?.recentActivities && data.recentActivities.length > 0 ? (
                data.recentActivities.map(act => (
                  <div
                    key={act.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem 0.85rem',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.2rem' }}>
                      {act.action}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {act.details}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  Aucune activité récente enregistrée.
                </div>
              )}
            </div>
          </div>

          {/* Module Links Shortcut */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
            }}
          >
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem' }}>
              Modules opérationnels
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Link
                to="/entreprise/clients"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>👥 Clients</span>
                <ArrowRight size={14} color="var(--primary)" />
              </Link>

              <Link
                to="/entreprise/creances"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>📄 Créances</span>
                <ArrowRight size={14} color="var(--primary)" />
              </Link>

              <Link
                to="/entreprise/paiements"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>💳 Paiements</span>
                <ArrowRight size={14} color="var(--primary)" />
              </Link>

              <Link
                to="/entreprise/relances"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>🔔 Relances</span>
                <ArrowRight size={14} color="var(--primary)" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
