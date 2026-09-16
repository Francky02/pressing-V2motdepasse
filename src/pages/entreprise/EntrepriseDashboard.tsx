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
  Activity,
  Sparkles,
  RefreshCw,
  Plus,
  FileText,
  CreditCard,
  BellRing,
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
    partiallyPaidCount: number;
    overdueCount: number;
    paidCount: number;
    clientsToRemindCount: number;
    totalClients: number;
    recoveryRate: number;
  };
  creances: Array<{
    id: string;
    client_id: string;
    client_nom?: string;
    client_telephone?: string;
    montant_total: number;
    montant_paye: number;
    solde: number;
    motif: string;
    statut: 'en_attente' | 'partiellement_payee' | 'payee' | 'en_retard';
    date_echeance: string;
    echeance?: string;
    montant?: number;
  }>;
  recentPayments: Array<{
    id: string;
    client_nom: string;
    montant: number;
    motif: string;
    date_paiement?: string;
    moyen_paiement?: string;
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

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'payee':
      case 'paye':
        return (
          <span style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            Encaissé
          </span>
        );
      case 'partiellement_payee':
        return (
          <span style={{ fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            Partiellement payé
          </span>
        );
      case 'en_retard':
      case 'relance':
        return (
          <span style={{ fontSize: '0.72rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            À relancer
          </span>
        );
      case 'en_attente':
      default:
        return (
          <span style={{ fontSize: '0.72rem', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            En attente
          </span>
        );
    }
  };

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
            <Sparkles size={14} color={primaryColor} />
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
            to="/entreprise/clients"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
          >
            <Users size={14} />
            <span>Gérer mes clients</span>
          </Link>
          <Link
            to="/entreprise/creances"
            className="btn btn-primary btn-sm btn-glow"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: primaryColor, borderColor: primaryColor, textDecoration: 'none' }}
          >
            <Plus size={14} />
            <span>Nouvelle créance</span>
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
        <Link
          to="/entreprise/creances"
          className="glass-card"
          style={{ padding: '1.5rem', borderLeft: '4px solid #f43f5e', textDecoration: 'none', display: 'block' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fb7185' }}>
              Total à récupérer
            </span>
            <TrendingDown size={20} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'white' }}>
            {data ? data.stats.totalToRecover.toLocaleString('fr-FR') : '...'} FCFA
          </div>
          <span style={{ fontSize: '0.78rem', color: '#fda4af' }}>
            Somme des soldes restants dus
          </span>
        </Link>

        {/* 2. Total encaissé */}
        <Link
          to="/entreprise/paiements"
          className="glass-card"
          style={{ padding: '1.5rem', borderLeft: '4px solid #10b981', textDecoration: 'none', display: 'block' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#34d399' }}>
              Total encaissé
            </span>
            <TrendingUp size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'white' }}>
            {data ? data.stats.totalCollected.toLocaleString('fr-FR') : '...'} FCFA
          </div>
          <span style={{ fontSize: '0.78rem', color: '#86efac' }}>
            Règlements reçus et confirmés
          </span>
        </Link>

        {/* 3. Créances en attente */}
        <Link
          to="/entreprise/creances"
          className="glass-card"
          style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b', textDecoration: 'none', display: 'block' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fbbf24' }}>
              Créances en cours
            </span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'white' }}>
            {data ? data.stats.pendingCount : '...'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Dossiers avec un solde à recouvrer
          </span>
        </Link>

        {/* 4. Clients à relancer */}
        <Link
          to="/entreprise/relances"
          className="glass-card"
          style={{ padding: '1.5rem', borderLeft: '4px solid #6366f1', textDecoration: 'none', display: 'block' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#a5b4fc' }}>
              Clients à relancer
            </span>
            <BellRing size={20} color="#6366f1" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'white' }}>
            {data ? (data.stats.clientsToRemindCount || data.stats.overdueCount || 0) : '...'}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Clients ayant dépassé l'échéance
          </span>
        </Link>
      </div>

      {/* Main Two-Column View: Recent Claims & Payments + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Créances récentes */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color={primaryColor} />
              <span>Créances récentes</span>
            </h3>
            <Link to="/entreprise/creances" style={{ fontSize: '0.78rem', color: primaryColor, textDecoration: 'none', fontWeight: 700 }}>
              Tout voir →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.creances && data.creances.length > 0 ? (
              data.creances.slice(0, 5).map(cr => {
                const total = cr.montant_total || cr.montant || 0;
                const solde = cr.solde !== undefined ? cr.solde : (cr.statut === 'payee' ? 0 : total);

                return (
                  <Link
                    key={cr.id}
                    to="/entreprise/creances"
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
                      textDecoration: 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'white', fontSize: '0.92rem' }}>
                        {cr.client_nom}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {cr.motif} {cr.client_telephone ? `• ${cr.client_telephone}` : ''}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Échéance : {cr.date_echeance || cr.echeance}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>
                        {total.toLocaleString('fr-FR')} FCFA
                      </div>
                      <div style={{ fontSize: '0.74rem', color: solde > 0 ? '#f87171' : '#34d399', marginBottom: '0.2rem' }}>
                        Solde : {solde.toLocaleString('fr-FR')} FCFA
                      </div>
                      <div>
                        {getStatusBadge(cr.statut)}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                Aucune créance enregistrée pour l'instant.
              </div>
            )}
          </div>
        </div>

        {/* Right: Paiements récents & Activité */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Derniers règlements reçus */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} color="#34d399" />
                <span>Derniers encaissements</span>
              </h3>
              <Link to="/entreprise/paiements" style={{ fontSize: '0.78rem', color: '#34d399', textDecoration: 'none', fontWeight: 700 }}>
                Journal complet →
              </Link>
            </div>

            {data?.recentPayments && data.recentPayments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {data.recentPayments.map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'white' }}>
                        {p.client_nom}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {p.motif} {p.moyen_paiement ? `• ${p.moyen_paiement.toUpperCase()}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399' }}>
                      +{p.montant.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Aucun paiement enregistré pour l'instant.
              </div>
            )}
          </div>

          {/* Activité récente isolée */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="#60a5fa" />
                <span>Journal d'activités</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {data?.recentActivities && data.recentActivities.length > 0 ? (
                data.recentActivities.map(act => (
                  <div
                    key={act.id}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderLeft: `3px solid ${primaryColor}`,
                      fontSize: '0.78rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'white' }}>{act.action}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{act.details}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '1rem' }}>
                  Aucune activité récente.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
