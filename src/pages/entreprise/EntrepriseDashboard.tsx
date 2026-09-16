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
          <span style={{ fontSize: '0.7rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            Encaissé
          </span>
        );
      case 'partiellement_payee':
        return (
          <span style={{ fontSize: '0.7rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            Partiel
          </span>
        );
      case 'en_retard':
      case 'relance':
        return (
          <span style={{ fontSize: '0.7rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            En retard
          </span>
        );
      case 'en_attente':
      default:
        return (
          <span style={{ fontSize: '0.7rem', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.15)', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            En attente
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Header - Compact & Direct */}
      <div
        style={{
          background: `linear-gradient(135deg, ${primaryColor}15 0%, rgba(15, 23, 42, 0.6) 100%)`,
          border: `1px solid ${primaryColor}30`,
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: `${primaryColor}25`,
              color: primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2 }}>
                Tableau de bord
              </h1>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• {company?.nom}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
              Suivi en temps réel de vos créances, encaissements et relances
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchDashboard}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
          <Link
            to="/entreprise/clients"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
          >
            <Users size={13} />
            <span>Clients</span>
          </Link>
          <Link
            to="/entreprise/creances"
            className="btn btn-primary btn-sm"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: primaryColor, borderColor: primaryColor, textDecoration: 'none' }}
          >
            <Plus size={13} />
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
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
          }}
        >
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Essential Summary Cards - Ultra Compact & Visible Together */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.85rem',
        }}
      >
        {/* 1. Total à récupérer */}
        <Link
          to="/entreprise/creances"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderLeft: '4px solid #ef4444',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.1rem',
            textDecoration: 'none',
            display: 'block',
            transition: 'transform 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#f87171' }}>
              Total à récupérer
            </span>
            <TrendingDown size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'white' }}>
            {data ? data.stats.totalToRecover.toLocaleString('fr-FR') : '...'} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>FCFA</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: '0.15rem' }}>
            {data ? data.stats.pendingCount : 0} créance(s) avec solde dû
          </div>
        </Link>

        {/* 2. Total encaissé */}
        <Link
          to="/entreprise/paiements"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderLeft: '4px solid #10b981',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.1rem',
            textDecoration: 'none',
            display: 'block',
            transition: 'transform 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#34d399' }}>
              Total encaissé
            </span>
            <TrendingUp size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'white' }}>
            {data ? data.stats.totalCollected.toLocaleString('fr-FR') : '...'} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>FCFA</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#86efac', marginTop: '0.15rem' }}>
            Taux de recouvrement : {data ? data.stats.recoveryRate : 0}%
          </div>
        </Link>

        {/* 3. Créances en attente */}
        <Link
          to="/entreprise/creances"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderLeft: '4px solid #f59e0b',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.1rem',
            textDecoration: 'none',
            display: 'block',
            transition: 'transform 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#fbbf24' }}>
              Créances en cours
            </span>
            <Clock size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'white' }}>
            {data ? data.stats.pendingCount : '...'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {data ? data.stats.partiallyPaidCount : 0} partiellement payée(s)
          </div>
        </Link>

        {/* 4. Clients à relancer */}
        <Link
          to="/entreprise/relances"
          style={{
            background: 'var(--bg-surface)',
            border: (data?.stats.clientsToRemindCount || 0) > 0 ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--border-subtle)',
            borderLeft: '4px solid #6366f1',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.1rem',
            textDecoration: 'none',
            display: 'block',
            transition: 'transform 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: (data?.stats.clientsToRemindCount || 0) > 0 ? '#f87171' : '#a5b4fc' }}>
              Clients à relancer
            </span>
            <BellRing size={16} color={(data?.stats.clientsToRemindCount || 0) > 0 ? '#ef4444' : '#6366f1'} />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: (data?.stats.clientsToRemindCount || 0) > 0 ? '#f87171' : 'white' }}>
            {data ? (data.stats.clientsToRemindCount || data.stats.overdueCount || 0) : '...'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {data?.stats.overdueCount || 0} créance(s) en retard
          </div>
        </Link>
      </div>

      {/* Main Two-Column View - Highly Compact & Informative */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {/* Left: Créances récentes */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.15rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FileText size={16} color={primaryColor} />
              <span>Créances récentes</span>
            </h3>
            <Link to="/entreprise/creances" style={{ fontSize: '0.75rem', color: primaryColor, textDecoration: 'none', fontWeight: 700 }}>
              Gérer toutes les créances →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      textDecoration: 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'white', fontSize: '0.86rem' }}>
                        {cr.client_nom}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {cr.motif} {cr.client_telephone ? `• ${cr.client_telephone}` : ''}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: 'white', fontSize: '0.88rem' }}>
                          {total.toLocaleString('fr-FR')} F
                        </div>
                        <div style={{ fontSize: '0.7rem', color: solde > 0 ? '#f87171' : '#34d399' }}>
                          Solde: {solde.toLocaleString('fr-FR')} F
                        </div>
                      </div>
                      {getStatusBadge(cr.statut)}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Aucune créance enregistrée pour l'instant.
              </div>
            )}
          </div>
        </div>

        {/* Right: Paiements récents & Activité */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Derniers encaissements */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem 1.15rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <CreditCard size={16} color="#34d399" />
                <span>Derniers encaissements</span>
              </h3>
              <Link to="/entreprise/paiements" style={{ fontSize: '0.75rem', color: '#34d399', textDecoration: 'none', fontWeight: 700 }}>
                Journal complet →
              </Link>
            </div>

            {data?.recentPayments && data.recentPayments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {data.recentPayments.slice(0, 4).map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'white', fontSize: '0.82rem' }}>
                        {p.client_nom}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {p.motif} {p.moyen_paiement ? `• ${p.moyen_paiement.toUpperCase()}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#34d399' }}>
                      +{p.montant.toLocaleString('fr-FR')} F
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Aucun paiement enregistré pour l'instant.
              </div>
            )}
          </div>

          {/* Activité récente */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.85rem 1.15rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
              <Activity size={15} color="#60a5fa" />
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'white', margin: 0 }}>
                Activité récente
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {data?.recentActivities && data.recentActivities.length > 0 ? (
                data.recentActivities.slice(0, 3).map(act => (
                  <div
                    key={act.id}
                    style={{
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderLeft: `2px solid ${primaryColor}`,
                      fontSize: '0.74rem',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: 'white' }}>{act.action}</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>{act.details}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', padding: '0.75rem' }}>
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
