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
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: `linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.65) 100%)`,
          border: `1px solid rgba(239, 68, 68, 0.3)`,
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
            <BellRing size={14} color="#f87171" />
            <span>Centre de Relances & Recouvrement • {company?.nom}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)', fontWeight: 800, color: 'white', margin: 0 }}>
            Relances des Créances en Retard
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
            Identifiez instantanément les clients hors délai et déclenchez vos relances WhatsApp et SMS.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchOverdue}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>Montant Total en Retard</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>
            {totalOverdueAmount.toLocaleString('fr-FR')} <span style={{ fontSize: '0.88rem' }}>FCFA</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {overdueCreances.length} créance(s) ayant dépassé la date d'échéance
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Canaux de Relance Prêts</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginTop: '0.35rem', display: 'flex', gap: '0.5rem' }}>
            <span style={{ color: '#22c55e' }}>WhatsApp Direct</span> • <span style={{ color: '#60a5fa' }}>SMS</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Messages pré-remplis avec montant et échéance
          </div>
        </div>
      </div>

      {/* Choisir le ton du message */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>Modèle de message à utiliser :</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedTemplate('amicale')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedTemplate === 'amicale' ? '1px solid #10b981' : '1px solid var(--border-subtle)',
              background: selectedTemplate === 'amicale' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: selectedTemplate === 'amicale' ? '#34d399' : 'var(--text-secondary)',
            }}
          >
            Relance Amicale (J+1)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTemplate('ferme')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedTemplate === 'ferme' ? '1px solid #f59e0b' : '1px solid var(--border-subtle)',
              background: selectedTemplate === 'ferme' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: selectedTemplate === 'ferme' ? '#fbbf24' : 'var(--text-secondary)',
            }}
          >
            Relance Ferme (J+7)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTemplate('mise_en_demeure')}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedTemplate === 'mise_en_demeure' ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
              background: selectedTemplate === 'mise_en_demeure' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              color: selectedTemplate === 'mise_en_demeure' ? '#f87171' : 'var(--text-secondary)',
            }}
          >
            Dernier Avis (J+15)
          </button>
        </div>
      </div>

      {/* List of overdue clients */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-spin" size={28} color={primaryColor} style={{ margin: '0 auto 1rem auto' }} />
          <div>Recherche des créances en retard...</div>
        </div>
      ) : overdueCreances.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <CheckCircle2 size={36} color="#34d399" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontWeight: 700 }}>Excellente nouvelle !</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Aucune créance n'est actuellement en retard de paiement. Vos clients sont à jour.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {overdueCreances.map(creance => {
            const message = getMessageTemplate(creance, selectedTemplate);
            const waPhone = creance.client_telephone ? creance.client_telephone.replace(/[^0-9]/g, '') : '';

            return (
              <div
                key={creance.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: 'white', fontSize: '1.05rem' }}>
                        {creance.client_nom}
                      </span>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 700 }}>
                        ÉCHÉANCE DÉPASSÉE LE {creance.date_echeance}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Motif : {creance.motif} • Téléphone : <strong style={{ color: 'white' }}>{creance.client_telephone || 'Non renseigné'}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Solde restant dû</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f87171' }}>
                      {creance.solde.toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                </div>

                {/* Message preview */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <strong style={{ color: 'white' }}>Aperçu du message : </strong>
                  {message}
                </div>

                {/* Send action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  {waPhone ? (
                    <a
                      href={`https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
                    >
                      <Send size={14} />
                      <span>Envoyer la relance via WhatsApp</span>
                    </a>
                  ) : (
                    <button type="button" disabled className="btn btn-secondary btn-sm" style={{ opacity: 0.5 }}>
                      Numéro manquant
                    </button>
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
