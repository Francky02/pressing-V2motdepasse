import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import {
  FileText,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  CreditCard,
  Send,
  ExternalLink,
  Copy,
  Sparkles,
  Building2,
  Calendar,
} from 'lucide-react';

interface ClientOption {
  id: string;
  nom: string;
  telephone: string;
  type: 'particulier' | 'entreprise';
}

interface CreanceItem {
  id: string;
  entreprise_id: string;
  client_id: string;
  client_nom?: string;
  client_telephone?: string;
  motif: string;
  description: string;
  montant_total: number;
  montant_paye: number;
  solde: number;
  date_creation: string;
  date_echeance: string;
  statut: 'en_attente' | 'partiellement_payee' | 'payee' | 'en_retard';
  notes: string;
  created_at: string;
}

interface PaiementItem {
  id: string;
  montant: number;
  date_paiement: string;
  moyen_paiement: string;
  reference: string;
  notes: string;
  created_at: string;
}

interface CreanceDetailResponse {
  creance: CreanceItem;
  client: ClientOption | null;
  paiements: PaiementItem[];
  paymentLinkPreview: {
    companyName: string;
    companyLogo: string | null;
    primaryColor: string;
    secondaryColor: string;
    clientName: string;
    clientPhone: string;
    motif: string;
    description: string;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    dueDate: string;
    status: string;
    paymentUrl: string;
  };
  remindersSummary: {
    totalRemindersSent: number;
    lastReminderDate: string | null;
    nextScheduledReminder: string | null;
    preferredChannel: string;
  };
}

export const CreancesPage: React.FC = () => {
  const { company } = useAuth();
  const primaryColor = company?.couleur_principale || '#10b981';

  const [creances, setCreances] = useState<CreanceItem[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('toutes');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isFastClientModalOpen, setIsFastClientModalOpen] = useState(false);
  const [selectedCreanceDetail, setSelectedCreanceDetail] = useState<CreanceDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Feedback notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // New Creance form state
  const [createForm, setCreateForm] = useState({
    client_id: '',
    motif: 'Prestation de service',
    custom_motif: '',
    description: '',
    montant_total: '',
    date_creation: new Date().toISOString().split('T')[0],
    date_echeance: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  // Fast client creation state
  const [fastClientForm, setFastClientForm] = useState({
    nom: '',
    telephone: '',
    type: 'particulier' as 'particulier' | 'entreprise',
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    montant: '',
    moyen_paiement: 'especes',
    date_paiement: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [creancesRes, clientsRes] = await Promise.all([
        apiRequest<{ creances: CreanceItem[]; total: number }>(`/api/company/creances`),
        apiRequest<{ clients: ClientOption[]; total: number }>(`/api/company/clients?includeInactive=false`),
      ]);
      setCreances(creancesRes.creances);
      setClients(clientsRes.clients);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors du chargement des créances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreanceDetail = async (creanceId: string) => {
    try {
      setDetailLoading(true);
      setIsDetailModalOpen(true);
      const res = await apiRequest<CreanceDetailResponse>(`/api/company/creances/${creanceId}`);
      setSelectedCreanceDetail(res);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Impossible de charger la créance');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCreateForm({
      client_id: clients.length > 0 ? clients[0].id : '',
      motif: 'Prestation de service',
      custom_motif: '',
      description: '',
      montant_total: '',
      date_creation: new Date().toISOString().split('T')[0],
      date_echeance: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
      notes: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateFastClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastClientForm.nom.trim() || !fastClientForm.telephone.trim()) {
      setErrorMsg('Nom et téléphone requis pour créer un client');
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiRequest<{ client: ClientOption }>('/api/company/clients', {
        method: 'POST',
        body: JSON.stringify(fastClientForm),
      });

      setClients(prev => [res.client, ...prev]);
      setCreateForm(prev => ({ ...prev, client_id: res.client.id }));
      setIsFastClientModalOpen(false);
      setFastClientForm({ nom: '', telephone: '', type: 'particulier' });
      setSuccessMsg(`Client ${res.client.nom} créé et sélectionné !`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur création client');
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const handleSaveCreance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.client_id) {
      setErrorMsg('Veuillez sélectionner ou créer un client');
      return;
    }

    const amount = Number(createForm.montant_total);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Le montant doit être un nombre supérieur à zéro');
      return;
    }

    if (!createForm.date_echeance) {
      setErrorMsg('La date d\'échéance est obligatoire');
      return;
    }

    const finalMotif = createForm.motif === 'Autre' && createForm.custom_motif.trim()
      ? createForm.custom_motif.trim()
      : createForm.motif;

    try {
      setActionLoading(true);
      await apiRequest('/api/company/creances', {
        method: 'POST',
        body: JSON.stringify({
          client_id: createForm.client_id,
          motif: finalMotif,
          description: createForm.description,
          montant_total: amount,
          date_creation: createForm.date_creation,
          date_echeance: createForm.date_echeance,
          notes: createForm.notes,
        }),
      });

      setSuccessMsg(`Créance de ${amount.toLocaleString('fr-FR')} FCFA enregistrée avec succès`);
      setIsCreateModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de la créance');
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleOpenPayment = (creance: CreanceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPaymentForm({
      montant: String(creance.solde),
      moyen_paiement: 'especes',
      date_paiement: new Date().toISOString().split('T')[0],
      reference: 'ENC-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      notes: 'Règlement de facture',
    });
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreanceDetail) return;

    const amount = Number(paymentForm.montant);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Le montant à encaisser doit être supérieur à zéro');
      return;
    }

    if (amount > selectedCreanceDetail.creance.solde) {
      setErrorMsg(`Le montant (${amount.toLocaleString('fr-FR')} F) ne peut dépasser le solde restant (${selectedCreanceDetail.creance.solde.toLocaleString('fr-FR')} F)`);
      return;
    }

    try {
      setActionLoading(true);
      await apiRequest(`/api/company/creances/${selectedCreanceDetail.creance.id}/paiements`, {
        method: 'POST',
        body: JSON.stringify({
          montant: amount,
          moyen_paiement: paymentForm.moyen_paiement,
          date_paiement: paymentForm.date_paiement,
          reference: paymentForm.reference,
          notes: paymentForm.notes,
        }),
      });

      setSuccessMsg(`Encaissement de ${amount.toLocaleString('fr-FR')} FCFA validé avec succès !`);
      setIsPaymentModalOpen(false);
      await fetchData();
      // Rafraîchir les détails de la créance
      await openCreanceDetail(selectedCreanceDetail.creance.id);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement du paiement');
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleCopyPaymentLink = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Filtrage
  const filteredCreances = useMemo(() => {
    return creances.filter(c => {
      const matchSearch =
        (c.client_nom && c.client_nom.toLowerCase().includes(search.toLowerCase())) ||
        (c.motif && c.motif.toLowerCase().includes(search.toLowerCase())) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase())) ||
        (c.client_telephone && c.client_telephone.toLowerCase().includes(search.toLowerCase()));

      if (!matchSearch) return false;

      if (statusFilter === 'toutes') return true;
      return c.statut === statusFilter;
    });
  }, [creances, search, statusFilter]);

  // KPI stats
  const stats = useMemo(() => {
    let toRecover = 0;
    let collected = 0;
    let overdueCount = 0;
    let pendingCount = 0;

    for (const c of creances) {
      toRecover += c.solde;
      collected += c.montant_paye;
      if (c.statut === 'en_retard') overdueCount++;
      if (c.solde > 0) pendingCount++;
    }

    return {
      toRecover,
      collected,
      overdueCount,
      pendingCount,
    };
  }, [creances]);

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'payee':
        return (
          <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            PAYÉE
          </span>
        );
      case 'partiellement_payee':
        return (
          <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            PARTIELLEMENT PAYÉE
          </span>
        );
      case 'en_retard':
        return (
          <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            EN RETARD
          </span>
        );
      case 'en_attente':
      default:
        return (
          <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            EN ATTENTE
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Alertes messages */}
      {errorMsg && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={16} /></button>
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
            <FileText size={14} color={primaryColor} />
            <span>Créances & Dettes Clients • {company?.nom}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)', fontWeight: 800, color: 'white', margin: 0 }}>
            Suivi des Créances & Encaissements
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
            Qui vous doit de l'argent ? Combien ? Pour quoi ? Et pour quelle échéance ?
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: primaryColor, borderColor: primaryColor }}
          >
            <Plus size={16} />
            <span>Nouvelle créance</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>Total à Récupérer</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171', marginTop: '0.25rem' }}>
            {stats.toRecover.toLocaleString('fr-FR')} <span style={{ fontSize: '0.88rem' }}>FCFA</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {stats.pendingCount} créance(s) avec solde dû
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>Total Déjà Encaissé</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
            {stats.collected.toLocaleString('fr-FR')} <span style={{ fontSize: '0.88rem' }}>FCFA</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Fonds effectivement reçus
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: stats.overdueCount > 0 ? '#f87171' : 'var(--text-muted)', fontWeight: 600 }}>
            Créances en Retard
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stats.overdueCount > 0 ? '#f87171' : 'white', marginTop: '0.25rem' }}>
            {stats.overdueCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Échéances dépassées à relancer
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par client, motif, téléphone..."
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '0.88rem',
              width: '100%',
              outline: 'none',
            }}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'toutes', label: 'Toutes' },
            { id: 'en_attente', label: 'En attente' },
            { id: 'partiellement_payee', label: 'Partielles' },
            { id: 'en_retard', label: 'En retard' },
            { id: 'payee', label: 'Payées' },
          ].map(f => {
            const isActive = statusFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive ? `1px solid ${primaryColor}` : '1px solid var(--border-subtle)',
                  background: isActive ? `${primaryColor}22` : 'transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Creances List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-spin" size={28} color={primaryColor} style={{ margin: '0 auto 1rem auto' }} />
          <div>Chargement des créances...</div>
        </div>
      ) : filteredCreances.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: `${primaryColor}15`,
              color: primaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <FileText size={28} />
          </div>
          <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
            {search ? 'Aucune créance ne correspond à votre filtre' : 'Aucune créance enregistrée pour l\'instant'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
            {search
              ? 'Essayez de changer les filtres de recherche.'
              : 'Enregistrez votre première créance pour savoir immédiatement qui vous doit quoi.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary"
            style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
          >
            <Plus size={16} />
            <span>Créer une créance</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredCreances.map(creance => {
            const percentPaid = creance.montant_total > 0
              ? Math.min(100, Math.round((creance.montant_paye / creance.montant_total) * 100))
              : 0;

            return (
              <div
                key={creance.id}
                onClick={() => openCreanceDetail(creance.id)}
                style={{
                  background: 'var(--bg-surface)',
                  border: creance.statut === 'en_retard' ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  cursor: 'pointer',
                  flexWrap: 'wrap',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = primaryColor;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = creance.statut === 'en_retard' ? 'rgba(239, 68, 68, 0.35)' : 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Client & Motif */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '220px', flex: 1 }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: `${primaryColor}20`,
                      color: primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={20} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: 'white', fontSize: '1rem' }}>
                        {creance.client_nom || 'Client'}
                      </span>
                      {getStatusBadge(creance.statut)}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {creance.motif}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <Calendar size={12} />
                      <span>Échéance : <strong>{creance.date_echeance}</strong></span>
                      {creance.client_telephone && (
                        <>
                          <span>•</span>
                          <span>{creance.client_telephone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar and amounts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '200px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Montant Total :</span>
                    <strong style={{ color: 'white' }}>{creance.montant_total.toLocaleString('fr-FR')} FCFA</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#34d399' }}>Payé ({percentPaid}%) :</span>
                    <strong style={{ color: '#34d399' }}>{creance.montant_paye.toLocaleString('fr-FR')} FCFA</strong>
                  </div>

                  {/* Visual Progress Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentPaid}%`, height: '100%', background: percentPaid === 100 ? '#10b981' : primaryColor, borderRadius: '3px' }} />
                  </div>
                </div>

                {/* Solde restant & Actions */}
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Solde restant dû</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: creance.solde > 0 ? '#f87171' : '#34d399' }}>
                      {creance.solde.toLocaleString('fr-FR')} <span style={{ fontSize: '0.8rem' }}>FCFA</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {creance.solde > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreanceDetail(creance.id).then(() => {
                            handleOpenPayment(creance);
                          });
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.76rem', padding: '0.45rem 0.75rem', backgroundColor: primaryColor, borderColor: primaryColor, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <CreditCard size={13} />
                        <span>Encaisser</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openCreanceDetail(creance.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.76rem', padding: '0.45rem 0.75rem' }}
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1 : NOUVELLE CRÉANCE */}
      {/* ==================================================== */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 7, 13, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '560px',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${primaryColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color={primaryColor} />
                </div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  Enregistrer une nouvelle créance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCreance} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Choix du client avec raccourci ajout rapide */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Client débiteur *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsFastClientModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: primaryColor, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Plus size={12} />
                    <span>Créer un nouveau client</span>
                  </button>
                </div>

                {clients.length === 0 ? (
                  <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.8rem' }}>
                    Aucun client enregistré. Cliquez sur "Créer un nouveau client" ci-dessus.
                  </div>
                ) : (
                  <select
                    required
                    value={createForm.client_id}
                    onChange={e => setCreateForm({ ...createForm, client_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nom} ({c.telephone})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Motif (Multi-secteurs) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Motif de la créance *
                </label>
                <select
                  value={createForm.motif}
                  onChange={e => setCreateForm({ ...createForm, motif: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                >
                  <option value="Prestation de service">Prestation de service</option>
                  <option value="Produit / Marchandise">Produit / Vente de marchandise</option>
                  <option value="Réparation / SAV">Réparation mécanique / Électronique / SAV</option>
                  <option value="Scolarité / Écolage">Scolarité / Cantine / Formation</option>
                  <option value="Nettoyage / Pressing">Nettoyage / Blanchisserie / Pressing</option>
                  <option value="Commande / Devis">Commande / Devis validé</option>
                  <option value="Honoraires / Consultation">Honoraires / Consultation</option>
                  <option value="Autre">Autre motif personnalisé</option>
                </select>

                {createForm.motif === 'Autre' && (
                  <input
                    type="text"
                    required
                    placeholder="Précisez le motif..."
                    value={createForm.custom_motif}
                    onChange={e => setCreateForm({ ...createForm, custom_motif: e.target.value })}
                    style={{
                      width: '100%',
                      marginTop: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                )}
              </div>

              {/* Montant total */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Montant total dû (FCFA) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Ex: 100000"
                  value={createForm.montant_total}
                  onChange={e => setCreateForm({ ...createForm, montant_total: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Dates : Création & Échéance */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Date de la créance
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.date_creation}
                    onChange={e => setCreateForm({ ...createForm, date_creation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Date d'échéance *
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.date_echeance}
                    onChange={e => setCreateForm({ ...createForm, date_echeance: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Description des prestations / articles
                </label>
                <textarea
                  rows={2}
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Détails pour la facture ou le reçu..."
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                >
                  {actionLoading ? 'Enregistrement...' : 'Créer la créance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2 : CRÉATION RAPIDE DE CLIENT */}
      {/* ==================================================== */}
      {isFastClientModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 7, 13, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 115,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsFastClientModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '440px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                Nouveau client rapide
              </h4>
              <button
                type="button"
                onClick={() => setIsFastClientModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFastClient} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Nom complet / Raison sociale *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mme Koné Aïssata"
                  value={fastClientForm.nom}
                  onChange={e => setFastClientForm({ ...fastClientForm, nom: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Téléphone (WhatsApp / SMS) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: +225 07 11 22 33"
                  value={fastClientForm.telephone}
                  onChange={e => setFastClientForm({ ...fastClientForm, telephone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsFastClientModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                >
                  {actionLoading ? 'Création...' : 'Créer et sélectionner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3 : FICHE CRÉANCE & ENCAISSEMENT */}
      {/* ==================================================== */}
      {isDetailModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 7, 13, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: `${primaryColor}22`,
                    color: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}
                >
                  <FileText size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ color: 'white', margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                      Créance #{selectedCreanceDetail?.creance.id}
                    </h3>
                    {selectedCreanceDetail && getStatusBadge(selectedCreanceDetail.creance.statut)}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Client : <strong style={{ color: 'white' }}>{selectedCreanceDetail?.creance.client_nom}</strong> • {selectedCreanceDetail?.creance.motif}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedCreanceDetail && selectedCreanceDetail.creance.solde > 0 && (
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(selectedCreanceDetail.creance)}
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <CreditCard size={14} />
                    <span>Encaisser</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {detailLoading || !selectedCreanceDetail ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Sparkles className="animate-spin" size={28} color={primaryColor} style={{ margin: '0 auto 1rem auto' }} />
                  <div>Chargement des données de la créance...</div>
                </div>
              ) : (
                <>
                  {/* Financial Overview Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Montant Total</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', marginTop: '0.2rem' }}>
                        {selectedCreanceDetail.creance.montant_total.toLocaleString('fr-FR')} F
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-main)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: '#34d399' }}>Déjà Payé</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                        {selectedCreanceDetail.creance.montant_paye.toLocaleString('fr-FR')} F
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-main)', border: selectedCreanceDetail.creance.solde > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: selectedCreanceDetail.creance.solde > 0 ? '#f87171' : 'var(--text-muted)' }}>
                        Solde Restant
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: selectedCreanceDetail.creance.solde > 0 ? '#f87171' : 'white', marginTop: '0.2rem' }}>
                        {selectedCreanceDetail.creance.solde.toLocaleString('fr-FR')} F
                      </div>
                    </div>
                  </div>

                  {/* Details Description */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: 'white' }}>Description : </strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{selectedCreanceDetail.creance.description || 'Aucune description'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <div>Date émission : {selectedCreanceDetail.creance.date_creation}</div>
                      <div>Date d'échéance : <strong style={{ color: selectedCreanceDetail.creance.statut === 'en_retard' ? '#f87171' : 'white' }}>{selectedCreanceDetail.creance.date_echeance}</strong></div>
                      {selectedCreanceDetail.client?.telephone && <div>Téléphone : {selectedCreanceDetail.client.telephone}</div>}
                    </div>
                  </div>

                  {/* Paiements Enregistrés */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h4 style={{ color: 'white', margin: 0, fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CreditCard size={16} color="#34d399" />
                        <span>Règlements reçus ({selectedCreanceDetail.paiements.length})</span>
                      </h4>

                      {selectedCreanceDetail.creance.solde > 0 && (
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(selectedCreanceDetail.creance)}
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: primaryColor, borderColor: primaryColor, fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                        >
                          + Enregistrer un versement
                        </button>
                      )}
                    </div>

                    {selectedCreanceDetail.paiements.length === 0 ? (
                      <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                        Aucun paiement partiel ou total n'a encore été enregistré.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {selectedCreanceDetail.paiements.map(p => (
                          <div
                            key={p.id}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.65rem 0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.8rem',
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 600, color: 'white' }}>{p.reference}</span>
                              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({p.moyen_paiement})</span>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.date_paiement} • {p.notes}</div>
                            </div>
                            <div style={{ fontWeight: 800, color: '#34d399' }}>
                              +{p.montant.toLocaleString('fr-FR')} FCFA
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ==================================================== */}
                  {/* PRÉPARATION DE LA SUITE 1 : LIEN DE PAIEMENT PUBLIC */}
                  {/* ==================================================== */}
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}12 0%, rgba(15, 23, 42, 0.7) 100%)`,
                      border: `1px solid ${primaryColor}35`,
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
                        <ExternalLink size={16} color={primaryColor} />
                        <span>Aperçu du futur Lien de Paiement Personnalisé</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyPaymentLink(selectedCreanceDetail.paymentLinkPreview.paymentUrl)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Copy size={12} />
                        <span>{copiedLink ? 'Copié !' : 'Copier le lien'}</span>
                      </button>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Ce lien sécurisé permettra au client <strong>{selectedCreanceDetail.paymentLinkPreview.clientName}</strong> de régler ses <strong>{selectedCreanceDetail.paymentLinkPreview.balance.toLocaleString('fr-FR')} FCFA</strong> restants via Mobile Money ou Carte bancaire dans la prochaine étape.
                    </p>

                    {/* Simulation de la carte de paiement personnalisée */}
                    <div
                      style={{
                        background: 'rgba(11, 15, 25, 0.85)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: selectedCreanceDetail.paymentLinkPreview.primaryColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {selectedCreanceDetail.paymentLinkPreview.companyLogo ? (
                            <img src={selectedCreanceDetail.paymentLinkPreview.companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <Building2 size={16} color="white" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'white', fontSize: '0.88rem' }}>
                            {selectedCreanceDetail.paymentLinkPreview.companyName}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Motif : {selectedCreanceDetail.paymentLinkPreview.motif}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Montant à régler</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
                          {selectedCreanceDetail.paymentLinkPreview.balance.toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ==================================================== */}
                  {/* PRÉPARATION DE LA SUITE 2 : RELANCES WHATSAPP / SMS */}
                  {/* ==================================================== */}
                  <div
                    style={{
                      background: 'rgba(34, 197, 94, 0.08)',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontWeight: 700, fontSize: '0.9rem' }}>
                        <Send size={16} />
                        <span>Relance Client Directe</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Canal : WhatsApp & SMS
                      </span>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Envoyez immédiatement un message de relance professionnel et personnalisé à <strong>{selectedCreanceDetail.creance.client_nom}</strong> ({selectedCreanceDetail.creance.client_telephone}).
                    </p>

                    {selectedCreanceDetail.creance.client_telephone && (
                      <a
                        href={`https://wa.me/${selectedCreanceDetail.creance.client_telephone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Bonjour ${selectedCreanceDetail.creance.client_nom}, l'entreprise ${company?.nom} vous informe que votre créance concernant "${selectedCreanceDetail.creance.motif}" s'élève à ${selectedCreanceDetail.creance.solde.toLocaleString('fr-FR')} FCFA avec une échéance fixée au ${selectedCreanceDetail.creance.date_echeance}. Merci de procéder au règlement.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.4)' }}
                      >
                        <Send size={13} />
                        <span>Envoyer la relance via WhatsApp</span>
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4 : ENREGISTREMENT D'UN PAIEMENT PARTIEL OU TOTAL */}
      {/* ==================================================== */}
      {isPaymentModalOpen && selectedCreanceDetail && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 7, 13, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsPaymentModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '480px',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                    Encaisser un paiement
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Solde restant dû : <strong style={{ color: '#f87171' }}>{selectedCreanceDetail.creance.solde.toLocaleString('fr-FR')} FCFA</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Montant versé */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Montant encaissé (FCFA) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, montant: String(selectedCreanceDetail.creance.solde) })}
                    style={{ background: 'none', border: 'none', color: primaryColor, fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Régler tout le solde ({selectedCreanceDetail.creance.solde.toLocaleString('fr-FR')} F)
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedCreanceDetail.creance.solde}
                  required
                  placeholder="Ex: 50000"
                  value={paymentForm.montant}
                  onChange={e => setPaymentForm({ ...paymentForm, montant: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Moyen de paiement */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Moyen de paiement *
                </label>
                <select
                  value={paymentForm.moyen_paiement}
                  onChange={e => setPaymentForm({ ...paymentForm, moyen_paiement: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                >
                  <option value="especes">Espèces / Guichet</option>
                  <option value="wave">Wave</option>
                  <option value="om">Orange Money</option>
                  <option value="momo">MTN MoMo</option>
                  <option value="virement">Virement bancaire</option>
                  <option value="cheque">Chèque</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="autre">Autre moyen</option>
                </select>
              </div>

              {/* Date & Référence */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    Date de règlement
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date_paiement}
                    onChange={e => setPaymentForm({ ...paymentForm, date_paiement: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    N° Référence / Reçu
                  </label>
                  <input
                    type="text"
                    value={paymentForm.reference}
                    onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    placeholder="ENC-12345"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Notes sur l'encaissement
                </label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Remise en main propre, acompte, etc."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                >
                  {actionLoading ? 'Validation...' : 'Confirmer l\'encaissement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
