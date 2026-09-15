import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useCompanyCustomizer } from '../context/CompanyCustomizerContext';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Copy,
  Check,
  Building,
} from 'lucide-react';

interface MockTransaction {
  id: string;
  client: string;
  phone: string;
  service: string;
  amount: number;
  currency: string;
  date: string;
  daysLate: number;
  status: 'overdue' | 'pending' | 'paid';
}

export const DashboardMockupSection: React.FC = () => {
  const { t } = useLanguage();
  const { company } = useCompanyCustomizer();
  const [filter, setFilter] = useState<'all' | 'overdue' | 'pending' | 'paid'>('all');
  const [remindedId, setRemindedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [transactions] = useState<MockTransaction[]>([
    {
      id: 'TRX-101',
      client: 'Kouassi Jean',
      phone: '+225 07 44 22 11',
      service: 'Pressing 4 costumes & 6 chemises',
      amount: 45000,
      currency: company.currency,
      date: '10 Sept 2026',
      daysLate: 5,
      status: 'overdue',
    },
    {
      id: 'TRX-102',
      client: 'Mme Fatou Diallo',
      phone: '+221 77 654 32 10',
      service: 'Frais de scolarité Trimestre 2',
      amount: 150000,
      currency: company.currency,
      date: '08 Sept 2026',
      daysLate: 7,
      status: 'overdue',
    },
    {
      id: 'TRX-103',
      client: 'Entreprise SOGETRA SA',
      phone: '+225 01 02 03 04',
      service: 'Révision 4x4 et plaquettes de frein',
      amount: 285000,
      currency: company.currency,
      date: '12 Sept 2026',
      daysLate: 3,
      status: 'pending',
    },
    {
      id: 'TRX-104',
      client: 'Salma Bennani',
      phone: '+212 661 22 33 44',
      service: 'Forfait Mariage Deluxe & Soin visage',
      amount: 95000,
      currency: company.currency,
      date: '14 Sept 2026',
      daysLate: 1,
      status: 'pending',
    },
    {
      id: 'TRX-105',
      client: 'Dr. Mamadou Cissé',
      phone: '+223 70 80 90 10',
      service: 'Travaux de peinture & menuiserie',
      amount: 320000,
      currency: company.currency,
      date: '02 Sept 2026',
      daysLate: 0,
      status: 'paid',
    },
    {
      id: 'TRX-106',
      client: 'Cabinet Bâ & Associés',
      phone: '+225 05 99 88 77',
      service: 'Honoraires audit informatique',
      amount: 450000,
      currency: company.currency,
      date: '04 Sept 2026',
      daysLate: 0,
      status: 'paid',
    },
  ]);

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleRemind = (id: string) => {
    setRemindedId(id);
    setTimeout(() => {
      setRemindedId(null);
    }, 2500);
  };

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <section id="dashboard" className="section" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="badge-pill" style={{ marginBottom: '0.85rem' }}>
            <LayoutDashboard size={15} />
            <span>{t.dashboard.tag}</span>
          </div>
          <h2 className="section-title">
            {t.dashboard.title}
          </h2>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: 'var(--radius-full)',
              padding: '0.5rem 1.25rem',
              color: '#a5b4fc',
              fontWeight: 700,
              fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)',
              marginTop: '0.5rem',
            }}
          >
            🎯 Question clé : {t.dashboard.question}
          </div>
        </div>

        {/* Dashboard Mockup Frame */}
        <div className="dashboard-frame">
          {/* Topbar */}
          <div className="dashboard-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: company.primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building size={18} color="white" />
                )}
              </div>
              <div>
                <span style={{ fontWeight: 700, color: 'white', fontSize: '0.92rem' }}>
                  {company.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>
                  Espace Entreprise • Relancio Pro
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '0.25rem 0.65rem', borderRadius: '4px', fontWeight: 600 }}>
                ● En direct
              </span>
            </div>
          </div>

          {/* Dashboard Body Content */}
          <div style={{ padding: 'clamp(1rem, 2.5vw, 2rem)', background: '#0a0f1d' }}>
            {/* Answer directly: Key Financial Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              {/* Total à récupérer (Warning / Alert) */}
              <div className="kpi-card" style={{ borderLeft: '4px solid #f43f5e', background: 'rgba(244, 63, 94, 0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: '#fb7185', fontWeight: 700 }}>
                    {t.dashboard.totalToRecover}
                  </span>
                  <TrendingDown size={18} color="#f43f5e" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
                  1 450 000 {company.currency}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#fda4af', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertTriangle size={13} />
                  <span>8 créances échues à recouvrer</span>
                </div>
              </div>

              {/* Total encaissé (Success / Emerald) */}
              <div className="kpi-card" style={{ borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700 }}>
                    {t.dashboard.totalCollected}
                  </span>
                  <TrendingUp size={18} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
                  3 820 000 {company.currency}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#86efac' }}>
                  +24% récupéré ce mois-ci
                </div>
              </div>

              {/* Clients à relancer */}
              <div className="kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 700 }}>
                    {t.dashboard.clientsToRemind}
                  </span>
                  <Users size={18} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
                  8 clients
                </div>
                <div style={{ fontSize: '0.76rem', color: '#fde68a' }}>
                  Relance automatique prête
                </div>
              </div>

              {/* Taux de recouvrement */}
              <div className="kpi-card" style={{ borderLeft: '4px solid #6366f1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: '#a5b4fc', fontWeight: 700 }}>
                    {t.dashboard.recoveryRate}
                  </span>
                  <CheckCircle2 size={18} color="#6366f1" />
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff' }}>
                  82.4 %
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '82.4%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                </div>
              </div>
            </div>

            {/* Transactions & Claims Table Section */}
            <div
              style={{
                background: 'rgba(17, 24, 39, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
                    {t.dashboard.recentTransactions}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Suivi précis de chaque facture et action en un clic
                  </span>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    style={{
                      background: filter === 'all' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                      color: filter === 'all' ? '#0b0f19' : 'var(--text-secondary)',
                      border: 'none',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Toutes ({transactions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('overdue')}
                    style={{
                      background: filter === 'overdue' ? '#f43f5e' : 'rgba(255, 255, 255, 0.05)',
                      color: filter === 'overdue' ? '#ffffff' : 'var(--text-secondary)',
                      border: 'none',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    À relancer d'urgence
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('pending')}
                    style={{
                      background: filter === 'pending' ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                      color: filter === 'pending' ? '#0b0f19' : 'var(--text-secondary)',
                      border: 'none',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    En attente
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('paid')}
                    style={{
                      background: filter === 'paid' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                      color: filter === 'paid' ? '#0b0f19' : 'var(--text-secondary)',
                      border: 'none',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Encaissées
                  </button>
                </div>
              </div>

              {/* Responsive Table Container */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '680px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Client & Contact</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Prestation / Motif</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Montant</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Statut</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions directes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(tx => (
                      <tr
                        key={tx.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          fontSize: '0.86rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <div style={{ fontWeight: 700, color: 'white' }}>{tx.client}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.phone}</div>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)' }}>
                          {tx.service}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontWeight: 800, color: 'white', whiteSpace: 'nowrap' }}>
                          {tx.amount.toLocaleString()} {tx.currency}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          {tx.status === 'overdue' && (
                            <span style={{ fontSize: '0.74rem', padding: '0.2rem 0.55rem', borderRadius: '4px', background: 'rgba(244,63,94,0.15)', color: '#fb7185', fontWeight: 700 }}>
                              Retard ({tx.daysLate}j)
                            </span>
                          )}
                          {tx.status === 'pending' && (
                            <span style={{ fontSize: '0.74rem', padding: '0.2rem 0.55rem', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontWeight: 700 }}>
                              En attente
                            </span>
                          )}
                          {tx.status === 'paid' && (
                            <span style={{ fontSize: '0.74rem', padding: '0.2rem 0.55rem', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 700 }}>
                              Encaissé
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.45rem' }}>
                            {tx.status !== 'paid' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRemind(tx.id)}
                                  title="Envoyer une relance WhatsApp"
                                  style={{
                                    background: remindedId === tx.id ? '#10b981' : '#25D366',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.35rem 0.65rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                  }}
                                >
                                  {remindedId === tx.id ? (
                                    <>
                                      <Check size={12} />
                                      <span>Envoyé !</span>
                                    </>
                                  ) : (
                                    <>
                                      <MessageCircle size={12} />
                                      <span>Relancer</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(tx.id)}
                                  title="Copier le lien de paiement"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    color: 'white',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '6px',
                                    padding: '0.35rem 0.55rem',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {copiedId === tx.id ? <Check size={12} color="var(--primary)" /> : <Copy size={12} />}
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <CheckCircle2 size={14} /> Soldé
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
