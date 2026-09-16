import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  CreditCard,
  Search,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Receipt,
  X,
  AlertTriangle,
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
      setErrorMsg(err instanceof Error ? err.message : 'Erreur chargement paiements');
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
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {errorMsg && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}
      {/* Header Banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${primaryColor}15 0%, rgba(15, 23, 42, 0.65) 100%)`,
          border: `1px solid ${primaryColor}35`,
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div className="badge-pill" style={{ marginBottom: '0.4rem' }}>
            <CreditCard size={14} color={primaryColor} />
            <span>Journal de Caisse • {company?.nom}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)', fontWeight: 800, color: 'white', margin: 0 }}>
            Historique des Encaissements
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
            Tous les paiements enregistrés, versements partiels et règlements complets confirmés.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchPaiements}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Total Card */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>Total des Fonds Encaissés</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
            {totalCollected.toLocaleString('fr-FR')} <span style={{ fontSize: '1rem' }}>FCFA</span>
          </div>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {paiements.length} transaction(s) d'encaissement validée(s)
        </div>
      </div>

      {/* Search */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par client, motif, référence, moyen..."
          style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.88rem', width: '100%', outline: 'none' }}
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table / List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-spin" size={28} color={primaryColor} style={{ margin: '0 auto 1rem auto' }} />
          <div>Chargement du journal des paiements...</div>
        </div>
      ) : filteredPaiements.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <Receipt size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontWeight: 700 }}>Aucun paiement trouvé</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Les encaissements enregistrés sur vos créances apparaîtront ici.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredPaiements.map(p => (
            <div
              key={p.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>
                    {p.client_nom}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Motif : {p.motif_creance} • Réf : <strong style={{ color: 'var(--text-muted)' }}>{p.reference}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                    +{p.montant.toLocaleString('fr-FR')} FCFA
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {p.date_paiement} • Moyen : <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{p.moyen_paiement}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
