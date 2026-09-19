import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { apiRequest } from '../../services/api';
import {
  CreditCard,
  Search,
  RefreshCw,
  Sparkles,
  Receipt,
  X,
  AlertTriangle,
  Link2,
} from 'lucide-react';

interface EnrichedPaiement {
  id: string;
  entreprise_id: string;
  creance_id: string;
  client_id: string;
  montant: number;
  date_paiement: string;
  moyen_paiement: string;
  reference: string;
  notes: string;
  created_at: string;
  client_nom: string;
  client_telephone: string;
  motif_creance: string;
}

export const PaiementsPage: React.FC = () => {
  const { company } = useAuth();
  const { t, isRTL } = useLanguage();
  const primaryColor = company?.couleur_principale || '#10b981';

  const [paiements, setPaiements] = useState<EnrichedPaiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPaiements = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await apiRequest<{ paiements: EnrichedPaiement[]; total: number }>('/api/company/paiements');
      setPaiements(res.paiements);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaiements();
  }, []);

  const filteredPaiements = useMemo(() => {
    return paiements.filter(p => {
      const q = search.toLowerCase();
      return (
        p.client_nom.toLowerCase().includes(q) ||
        p.motif_creance.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.moyen_paiement.toLowerCase().includes(q)
      );
    });
  }, [paiements, search]);

  const totalCollected = useMemo(() => {
    return paiements.reduce((acc, p) => acc + p.montant, 0);
  }, [paiements]);

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {errorMsg && (
        <div style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <AlertTriangle size={15} />
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} style={{ marginInlineStart: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* Unified Compact Top Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2 }}>
                {t.paiements.title}
              </h1>
              <span style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                {filteredPaiements.length}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {t.paiements.totalCollected} : <strong style={{ color: '#34d399' }}>{totalCollected.toLocaleString()} {t.common.currency}</strong>
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.65rem',
              minWidth: '220px',
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.common.search}
              style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.82rem', width: '100%', outline: 'none' }}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={12} />
              </button>
            )}
          </div>

          <Link
            to="/entreprise/demandes-paiement"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
          >
            <Link2 size={13} color={primaryColor} />
            <span>{t.layout.paymentLinks}</span>
          </Link>

          <button
            type="button"
            onClick={fetchPaiements}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.6rem' }}
            title={t.common.refresh}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* High-density Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-spin" size={24} color={primaryColor} style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ fontSize: '0.85rem' }}>{t.common.loading}</div>
        </div>
      ) : filteredPaiements.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <Receipt size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{t.paiements.noPaymentsFound}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{t.paiements.subtitle}</div>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.common.client}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.paiements.motif}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.paiements.reference} & {t.common.notes}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.common.date}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: 'center' }}>{t.paiements.method}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: isRTL ? 'left' : 'right' }}>{t.paiements.amount}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaiements.map(p => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.1s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ fontWeight: 700, color: 'white' }}>{p.client_nom}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.client_telephone}</div>
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)' }}>
                      {p.motif_creance}
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span style={{ fontWeight: 700, color: 'white' }}>{p.reference}</span>
                      {p.notes && <span style={{ color: 'var(--text-muted)', marginInlineStart: '0.35rem', fontSize: '0.72rem' }}>• {p.notes}</span>}
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)' }}>
                      {p.date_paiement}
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.68rem', padding: '0.12rem 0.4rem', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', color: 'white', fontWeight: 700, textTransform: 'uppercase' }}>
                        {p.moyen_paiement}
                      </span>
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem', textAlign: isRTL ? 'left' : 'right' }}>
                      <span style={{ fontWeight: 800, color: '#34d399', fontSize: '0.92rem' }}>
                        +{p.montant.toLocaleString()} {t.common.currency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
