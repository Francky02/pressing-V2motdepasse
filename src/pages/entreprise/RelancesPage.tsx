import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  BellRing,
  Send,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface OverdueCreance {
  id: string;
  client_id: string;
  client_nom?: string;
  client_telephone?: string;
  motif: string;
  montant_total: number;
  montant_paye: number;
  solde: number;
  date_echeance: string;
  statut: string;
}

export const RelancesPage: React.FC = () => {
  const { company } = useAuth();
  const primaryColor = company?.couleur_principale || '#10b981';

  const [overdueCreances, setOverdueCreances] = useState<OverdueCreance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<'amicale' | 'ferme' | 'mise_en_demeure'>('amicale');

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ creances: OverdueCreance[] }>('/api/company/creances?status=en_retard');
      setOverdueCreances(res.creances);
    } catch (err: unknown) {
      console.error('Erreur chargement relances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const totalOverdueAmount = useMemo(() => {
    return overdueCreances.reduce((acc, c) => acc + c.solde, 0);
  }, [overdueCreances]);

  const getMessageTemplate = (creance: OverdueCreance, type: 'amicale' | 'ferme' | 'mise_en_demeure') => {
    const clientName = creance.client_nom || 'Client';
    const compName = company?.nom || 'notre établissement';
    const amount = creance.solde.toLocaleString('fr-FR');
    const motif = creance.motif;
    const date = creance.date_echeance;

    switch (type) {
      case 'amicale':
        return `Bonjour ${clientName}, sauf erreur de notre part, votre facture concernant "${motif}" pour un montant restant de ${amount} FCFA est arrivée à échéance le ${date}. Merci de bien vouloir procéder à son règlement. Cordialement, ${compName}.`;
      case 'ferme':
        return `Rappel important : Bonjour ${clientName}, nous constatons que votre créance de ${amount} FCFA (${motif}) auprès de ${compName} n'a pas encore été réglée malgré l'échéance dépassée du ${date}. Merci d'effectuer votre paiement dès aujourd'hui.`;
      case 'mise_en_demeure':
        return `URGENT - DERNIER AVIS : ${clientName}, votre impayé de ${amount} FCFA chez ${compName} pour "${motif}" fait l'objet d'un retard prolongé. Sans règlement sous 48h, votre dossier sera transmis au service contentieux. Contactez-nous immédiatement.`;
    }
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Unified Compact Top Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
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
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BellRing size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2 }}>
                Relances & Recouvrement
              </h1>
              <span style={{ fontSize: '0.72rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                {overdueCreances.length} en retard
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Montant total en souffrance : <strong style={{ color: '#f87171' }}>{totalOverdueAmount.toLocaleString('fr-FR')} FCFA</strong>
            </div>
          </div>
        </div>

        {/* Tone Selector & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '0.15rem' }}>
            <button
              type="button"
              onClick={() => setSelectedTemplate('amicale')}
              style={{
                padding: '0.28rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: selectedTemplate === 'amicale' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                color: selectedTemplate === 'amicale' ? '#34d399' : 'var(--text-secondary)',
              }}
            >
              Amicale (J+1)
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate('ferme')}
              style={{
                padding: '0.28rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: selectedTemplate === 'ferme' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                color: selectedTemplate === 'ferme' ? '#fbbf24' : 'var(--text-secondary)',
              }}
            >
              Ferme (J+7)
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate('mise_en_demeure')}
              style={{
                padding: '0.28rem 0.55rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: selectedTemplate === 'mise_en_demeure' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                color: selectedTemplate === 'mise_en_demeure' ? '#f87171' : 'var(--text-secondary)',
              }}
            >
              Dernier avis (J+15)
            </button>
          </div>

          <button
            type="button"
            onClick={fetchOverdue}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.6rem' }}
            title="Actualiser"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Overdue list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-spin" size={24} color={primaryColor} style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ fontSize: '0.85rem' }}>Recherche des créances en retard...</div>
        </div>
      ) : overdueCreances.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <CheckCircle2 size={28} color="#34d399" style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Tous les paiements sont à jour !</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Aucune créance n'a actuellement dépassé sa date d'échéance.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {overdueCreances.map(creance => {
            const message = getMessageTemplate(creance, selectedTemplate);
            const waPhone = creance.client_telephone ? creance.client_telephone.replace(/[^0-9]/g, '') : '';

            return (
              <div
                key={creance.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontWeight: 800, color: 'white', fontSize: '0.92rem' }}>
                      {creance.client_nom}
                    </span>
                    <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 700 }}>
                      Échue le {creance.date_echeance}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {creance.motif} • {creance.client_telephone}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.6rem', borderRadius: '4px', fontStyle: 'italic', maxWidth: '600px' }}>
                    "{message}"
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Solde dû</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171' }}>
                      {creance.solde.toLocaleString('fr-FR')} F
                    </div>
                  </div>

                  {waPhone ? (
                    <a
                      href={`https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      <Send size={13} />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pas de tél.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
