import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { apiRequest, type DemandePaiementItem } from '../../services/api';
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
  Check,
  Sparkles,
  Link2,
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
  const { t, locale, isRtl } = useLanguage();
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
  const [isDemandeModalOpen, setIsDemandeModalOpen] = useState(false);
  const [targetCreanceForDemande, setTargetCreanceForDemande] = useState<CreanceItem | null>(null);
  const [createdDemande, setCreatedDemande] = useState<{ token: string; url: string; montant: number; clientNom: string } | null>(null);
  const [creanceDemandes, setCreanceDemandes] = useState<DemandePaiementItem[]>([]);
  const [demandeForm, setDemandeForm] = useState({
    montant: '',
    motif: '',
    description: '',
    expiration: '14',
    customExp: '',
  });

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

  const formatAmount = (val: number) => {
    return val.toLocaleString(locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-US' : 'fr-FR');
  };

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
      setErrorMsg(err instanceof Error ? err.message : t.common.error);
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
      const [res, demandesRes] = await Promise.all([
        apiRequest<CreanceDetailResponse>(`/api/company/creances/${creanceId}`),
        apiRequest<{ demandes: DemandePaiementItem[] }>(`/api/company/creances/${creanceId}/demandes-paiement`).catch(() => ({ demandes: [] })),
      ]);
      setSelectedCreanceDetail(res);
      setCreanceDemandes(demandesRes.demandes || []);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t.common.error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenCreateDemande = (creance: CreanceItem) => {
    setTargetCreanceForDemande(creance);
    setDemandeForm({
      montant: creance.solde.toString(),
      motif: `${t.creances.motif} - ${creance.motif}`,
      description: creance.description || '',
      expiration: '14',
      customExp: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    });
    setIsDemandeModalOpen(true);
  };

  const handleSubmitCreateDemande = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCreanceForDemande) return;

    try {
      setActionLoading(true);
      setErrorMsg(null);
      const res = await apiRequest<{ message: string; demande: DemandePaiementItem; public_url: string }>(
        '/api/company/demandes-paiement',
        {
          method: 'POST',
          body: JSON.stringify({
            creance_id: targetCreanceForDemande.id,
            montant: Number(demandeForm.montant),
            motif: demandeForm.motif,
            description: demandeForm.description,
            date_expiration: demandeForm.customExp,
          }),
        }
      );

      setSuccessMsg(t.demandes.createSuccess);
      setIsDemandeModalOpen(false);
      setCreatedDemande({
        token: res.demande.token,
        url: `${window.location.origin}/payer/${res.demande.token}`,
        montant: res.demande.montant,
        clientNom: targetCreanceForDemande.client_nom || t.common.client,
      });

      if (selectedCreanceDetail && selectedCreanceDetail.creance.id === targetCreanceForDemande.id) {
        const updatedDemandes = await apiRequest<{ demandes: DemandePaiementItem[] }>(
          `/api/company/creances/${targetCreanceForDemande.id}/demandes-paiement`
        ).catch(() => ({ demandes: [] }));
        setCreanceDemandes(updatedDemandes.demandes || []);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t.common.error);
    } finally {
      setActionLoading(false);
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

  const handleSaveCreance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.client_id) {
      setErrorMsg(locale === 'ar' ? 'يرجى اختيار عميل أو إنشاء عميل جديد' : 'Veuillez sélectionner un client ou en créer un nouveau');
      return;
    }

    const amount = Number(createForm.montant_total);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg(locale === 'ar' ? 'يرجى إدخال مبلغ أكبر من 0' : 'Veuillez saisir un montant valide');
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg(null);
      await apiRequest('/api/company/creances', {
        method: 'POST',
        body: JSON.stringify({
          client_id: createForm.client_id,
          motif: createForm.motif === 'Autre' && createForm.custom_motif ? createForm.custom_motif : createForm.motif,
          description: createForm.description,
          montant_total: amount,
          date_creation: createForm.date_creation,
          date_echeance: createForm.date_echeance,
          notes: createForm.notes,
        }),
      });

      setSuccessMsg(t.creances.createSuccess);
      setIsCreateModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t.common.error);
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const handleCreateFastClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fastClientForm.nom.trim() || !fastClientForm.telephone.trim()) {
      setErrorMsg(
        locale === 'ar'
          ? 'يرجى إدخال الاسم ورقم الهاتف'
          : locale === 'en'
          ? 'Please enter customer name and phone number'
          : 'Veuillez remplir le nom et le numéro de téléphone'
      );
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiRequest<{ client: ClientOption }>(`/api/company/clients`, {
        method: 'POST',
        body: JSON.stringify(fastClientForm),
      });

      setClients(prev => [res.client, ...prev]);
      setCreateForm(prev => ({ ...prev, client_id: res.client.id }));
      setIsFastClientModalOpen(false);
      setFastClientForm({ nom: '', telephone: '', type: 'particulier' });
      setSuccessMsg(t.clients.createSuccess);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t.common.error);
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleOpenPayment = (creance: CreanceItem) => {
    setPaymentForm({
      montant: String(creance.solde),
      moyen_paiement: 'especes',
      date_paiement: new Date().toISOString().split('T')[0],
      reference: `REG-${Date.now().toString().slice(-6)}`,
      notes: '',
    });
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreanceDetail) return;

    const amount = Number(paymentForm.montant);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg(locale === 'ar' ? 'يرجى إدخال مبلغ دفع صالح' : 'Veuillez saisir un montant de paiement valide');
      return;
    }

    if (amount > selectedCreanceDetail.creance.solde) {
      setErrorMsg(locale === 'ar' ? 'المبلغ المدخل يتجاوز الرصيد المتبقي' : `Le montant ne peut dépasser le solde restant`);
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

      setSuccessMsg(t.creances.paymentRecordedSuccess);
      setIsPaymentModalOpen(false);
      await fetchData();
      await openCreanceDetail(selectedCreanceDetail.creance.id);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t.common.error);
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMsg(null), 3500);
    }
  };

  const handleCopyPaymentLink = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

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

  const stats = useMemo(() => {
    let toRecover = 0;
    let collected = 0;
    let overdueCount = 0;
    let pendingCount = 0;
    let partialCount = 0;

    for (const c of creances) {
      toRecover += c.solde;
      collected += c.montant_paye;
      if (c.statut === 'en_retard') overdueCount++;
      if (c.statut === 'en_attente') pendingCount++;
      if (c.statut === 'partiellement_payee') partialCount++;
    }

    return {
      toRecover,
      collected,
      overdueCount,
      pendingCount,
      partialCount,
    };
  }, [creances]);

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'payee':
        return (
          <span style={{ fontSize: '0.7rem', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            {t.common.statusLabels.payee}
          </span>
        );
      case 'partiellement_payee':
        return (
          <span style={{ fontSize: '0.7rem', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 700, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            {t.common.statusLabels.partiellement_payee}
          </span>
        );
      case 'en_retard':
        return (
          <span style={{ fontSize: '0.7rem', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 700, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            {t.common.statusLabels.en_retard}
          </span>
        );
      case 'en_attente':
      default:
        return (
          <span style={{ fontSize: '0.7rem', padding: '0.12rem 0.45rem', borderRadius: '4px', fontWeight: 700, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            {t.common.statusLabels.en_attente}
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Alertes messages */}
      {errorMsg && (
        <div style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <AlertTriangle size={15} />
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} style={{ [isRtl ? 'marginRight' : 'marginLeft']: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <CheckCircle2 size={15} />
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} style={{ [isRtl ? 'marginRight' : 'marginLeft']: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
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
        {/* Title & Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${primaryColor}20`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2 }}>
                {t.creances.title}
              </h1>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                {filteredCreances.length}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {t.creances.remainingBalance} : <strong style={{ color: '#f87171' }}>{formatAmount(stats.toRecover)} {t.common.currency}</strong> • {t.common.statusLabels.en_retard} : <strong style={{ color: stats.overdueCount > 0 ? '#f87171' : 'var(--text-muted)' }}>{stats.overdueCount}</strong>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.35rem 0.65rem',
            minWidth: '200px',
            flex: 1,
            maxWidth: '280px',
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`${t.common.search}...`}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.82rem', width: '100%', outline: 'none' }}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filters pills & Action button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', padding: '0.15rem' }}>
            {[
              { id: 'toutes', label: t.creances.filterAll },
              { id: 'en_attente', label: t.creances.filterPending },
              { id: 'partiellement_payee', label: t.creances.filterPartial },
              { id: 'en_retard', label: t.creances.filterOverdue },
              { id: 'payee', label: t.creances.filterPaid },
            ].map(f => {
              const isActive = statusFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  style={{
                    padding: '0.3rem 0.55rem',
                    borderRadius: 'var(--radius-xs)',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: isActive ? `${primaryColor}30` : 'transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={fetchData}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.55rem' }}
            title={t.common.refresh}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: primaryColor, borderColor: primaryColor }}
          >
            <Plus size={14} />
            <span>{t.creances.newReceivable}</span>
          </button>
        </div>
      </div>

      {/* Debts Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-spin" size={24} color={primaryColor} style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ fontSize: '0.85rem' }}>{t.common.loading}</div>
        </div>
      ) : filteredCreances.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <FileText size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
            {search ? t.creances.noCreancesFound : t.creances.subtitle}
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm"
            style={{ marginTop: '1rem', backgroundColor: primaryColor, borderColor: primaryColor }}
          >
            <Plus size={14} />
            <span>{t.creances.newReceivable}</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.common.client} & {t.common.phone}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.creances.motif} & {t.creances.description}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: isRtl ? 'left' : 'right' }}>{t.creances.initialAmount}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: isRtl ? 'left' : 'right' }}>{t.creances.paidAmount}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: isRtl ? 'left' : 'right' }}>{t.creances.remainingBalance}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.creances.dueDate}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: 'center' }}>{t.common.status}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: isRtl ? 'left' : 'right' }}>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredCreances.map(creance => {
                  const percentPaid = creance.montant_total > 0
                    ? Math.min(100, Math.round((creance.montant_paye / creance.montant_total) * 100))
                    : 0;
                  const isOverdue = creance.statut === 'en_retard';

                  return (
                    <tr
                      key={creance.id}
                      onClick={() => openCreanceDetail(creance.id)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isOverdue ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = isOverdue ? 'rgba(239, 68, 68, 0.03)' : 'transparent')}
                    >
                      {/* Client */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ fontWeight: 700, color: 'white' }}>{creance.client_nom}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>{creance.client_telephone}</div>
                      </td>

                      {/* Motif */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ fontWeight: 600, color: 'white' }}>{creance.motif}</div>
                        {creance.description && creance.description !== creance.motif && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                            {creance.description}
                          </div>
                        )}
                      </td>

                      {/* Montant total */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: isRtl ? 'left' : 'right', fontWeight: 700, color: 'white' }}>
                        {formatAmount(creance.montant_total)} {t.common.currency}
                      </td>

                      {/* Montant payé */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: isRtl ? 'left' : 'right' }}>
                        <div style={{ color: '#34d399', fontWeight: 600 }}>{formatAmount(creance.montant_paye)} {t.common.currency}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', direction: 'ltr' }}>{percentPaid}%</div>
                      </td>

                      {/* Solde restant dû */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: isRtl ? 'left' : 'right' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: creance.solde > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: creance.solde > 0 ? '#f87171' : '#34d399',
                            border: creance.solde > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          {formatAmount(creance.solde)} {t.common.currency}
                        </span>
                      </td>

                      {/* Échéance */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ color: isOverdue ? '#f87171' : 'var(--text-secondary)', fontWeight: isOverdue ? 700 : 500 }}>
                          {creance.date_echeance}
                        </div>
                      </td>

                      {/* Statut badge */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                        {getStatusBadge(creance.statut)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: isRtl ? 'left' : 'right' }}>
                        <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-start' : 'flex-end', gap: '0.35rem' }} onClick={e => e.stopPropagation()}>
                          {creance.solde > 0 && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCreateDemande(creance);
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                title={t.demandes.newLink}
                              >
                                <Link2 size={12} color={primaryColor} />
                                <span>{t.demandes.token}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCreanceDetail(creance.id).then(() => {
                                    handleOpenPayment(creance);
                                  });
                                }}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', backgroundColor: primaryColor, borderColor: primaryColor, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <CreditCard size={12} />
                                <span>{t.creances.recordPayment}</span>
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => openCreanceDetail(creance.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                          >
                            {t.common.details}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1 : NOUVELLE CRÉANCE */}
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
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '540px',
              padding: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                {t.creances.newReceivable}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCreance} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Row 1: Client & Motif */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {t.common.client} *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsFastClientModalOpen(true)}
                      style={{ background: 'none', border: 'none', color: primaryColor, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + {t.creances.addNewClientFast}
                    </button>
                  </div>
                  <select
                    required
                    value={createForm.client_id}
                    onChange={e => setCreateForm({ ...createForm, client_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nom} ({c.telephone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                    {t.creances.motif} *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.motif}
                    onChange={e => setCreateForm({ ...createForm, motif: e.target.value })}
                    placeholder={locale === 'ar' ? 'نوع الخدمة أو الفاتورة...' : 'Prestation de service...'}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Montant & Échéance */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                    {t.creances.initialAmount} ({t.common.currency}) *
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
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.84rem',
                      outline: 'none',
                      direction: 'ltr',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                    {t.creances.dueDate} *
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.date_echeance}
                    onChange={e => setCreateForm({ ...createForm, date_echeance: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'white',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
                  {t.creances.description}
                </label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder={locale === 'ar' ? 'تفاصيل إضافية عن الفاتورة...' : 'Détails facturés...'}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={actionLoading}
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary btn-sm"
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                >
                  {actionLoading ? t.common.saving : t.creances.newReceivable}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : CRÉATION RAPIDE DE CLIENT */}
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
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '420px',
              padding: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ color: 'white', margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                {t.creances.addNewClientFast}
              </h4>
              <button type="button" onClick={() => setIsFastClientModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateFastClient} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 600 }}>
                  {t.clients.name} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={locale === 'ar' ? 'السيدة عائشة' : 'Mme Koné Aïssata'}
                  value={fastClientForm.nom}
                  onChange={e => setFastClientForm({ ...fastClientForm, nom: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'white', fontSize: '0.84rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 600 }}>
                  {t.common.phone} (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+225 07 11 22 33"
                  value={fastClientForm.telephone}
                  onChange={e => setFastClientForm({ ...fastClientForm, telephone: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'white', fontSize: '0.84rem', outline: 'none', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.35rem' }}>
                <button type="button" onClick={() => setIsFastClientModalOpen(false)} className="btn btn-secondary btn-sm">{t.common.cancel}</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm" style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>
                  {actionLoading ? t.common.saving : t.creances.addNewClientFast}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3 : FICHE CRÉANCE COMPACTE */}
      {isDetailModalOpen && (
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
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 45px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: `${primaryColor}22`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <h3 style={{ color: 'white', margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                      {selectedCreanceDetail?.creance.client_nom}
                    </h3>
                    {selectedCreanceDetail && getStatusBadge(selectedCreanceDetail.creance.statut)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {t.creances.motif} : {selectedCreanceDetail?.creance.motif} • {t.creances.dueDate} : <strong>{selectedCreanceDetail?.creance.date_echeance}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {selectedCreanceDetail && selectedCreanceDetail.creance.solde > 0 && (
                  <button
                    type="button"
                    onClick={() => handleOpenPayment(selectedCreanceDetail.creance)}
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor, fontSize: '0.76rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <CreditCard size={13} />
                    <span>{t.creances.recordPayment}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', [isRtl ? 'marginRight' : 'marginLeft']: '0.3rem' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.15rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {detailLoading || !selectedCreanceDetail ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <Sparkles className="animate-spin" size={24} color={primaryColor} style={{ margin: '0 auto 0.5rem auto' }} />
                  <div>{t.common.loading}</div>
                </div>
              ) : (
                <>
                  {/* Financial Strip */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                    <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.65rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.creances.initialAmount}</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', marginTop: '0.15rem' }}>
                        {formatAmount(selectedCreanceDetail.creance.montant_total)} {t.common.currency}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-main)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.65rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#34d399' }}>{t.creances.paidAmount}</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', marginTop: '0.15rem' }}>
                        {formatAmount(selectedCreanceDetail.creance.montant_paye)} {t.common.currency}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-main)', border: selectedCreanceDetail.creance.solde > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.65rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: selectedCreanceDetail.creance.solde > 0 ? '#f87171' : 'var(--text-muted)' }}>
                        {t.creances.remainingBalance}
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: selectedCreanceDetail.creance.solde > 0 ? '#f87171' : 'white', marginTop: '0.15rem' }}>
                        {formatAmount(selectedCreanceDetail.creance.solde)} {t.common.currency}
                      </div>
                    </div>
                  </div>

                  {/* Paiements Enregistrés */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CreditCard size={15} color="#34d399" />
                        <span>{t.creances.paymentHistory} ({selectedCreanceDetail.paiements.length})</span>
                      </span>
                    </div>

                    {selectedCreanceDetail.paiements.length === 0 ? (
                      <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                        {t.paiements.noPaymentsFound}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {selectedCreanceDetail.paiements.map(p => (
                          <div
                            key={p.id}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.5rem 0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.78rem',
                            }}
                          >
                            <div>
                              <strong style={{ color: 'white' }}>{p.reference}</strong> ({p.moyen_paiement}) • {p.date_paiement}
                            </div>
                            <div style={{ fontWeight: 800, color: '#34d399' }}>
                              +{formatAmount(p.montant)} {t.common.currency}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section Lien de Paiement Public */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'white', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Link2 size={14} color={primaryColor} />
                          <span>{t.demandes.title} ({creanceDemandes.length})</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {t.demandes.subtitle}
                        </div>
                      </div>

                      {selectedCreanceDetail.creance.solde > 0 && (
                        <button
                          type="button"
                          onClick={() => handleOpenCreateDemande(selectedCreanceDetail.creance)}
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: primaryColor, borderColor: primaryColor, fontSize: '0.72rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Plus size={12} />
                          <span>{t.demandes.newLink}</span>
                        </button>
                      )}
                    </div>

                    {creanceDemandes.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                        {creanceDemandes.map(d => {
                          const linkUrl = `${window.location.origin}/payer/${d.token}`;
                          return (
                            <div
                              key={d.id}
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '6px',
                                padding: '0.45rem 0.65rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.5rem',
                                fontSize: '0.76rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                                <span style={{ fontWeight: 700, color: 'white' }}>{formatAmount(d.montant)} {t.common.currency}</span>
                                <span style={{ color: 'var(--text-muted)', direction: 'ltr' }}>• /payer/{d.token.substring(0, 10)}...</span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleCopyPaymentLink(linkUrl)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.2rem 0.45rem', fontSize: '0.68rem' }}
                                  title={t.common.copy}
                                >
                                  <Copy size={11} />
                                </button>
                                <a
                                  href={`/payer/${d.token}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.2rem 0.45rem', fontSize: '0.68rem' }}
                                  title={t.demandes.openPublicPage}
                                >
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Relance WhatsApp Directe */}
                  {selectedCreanceDetail.creance.client_telephone && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {t.relances.sendWhatsApp} : <strong>{selectedCreanceDetail.creance.client_nom}</strong>
                      </span>

                      <a
                        href={`https://wa.me/${selectedCreanceDetail.creance.client_telephone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          locale === 'ar'
                            ? `مرحباً ${selectedCreanceDetail.creance.client_nom}، تحيطكم ${company?.nom} علماً بأن مستحقاتكم بشأن "${selectedCreanceDetail.creance.motif}" تبلغ ${formatAmount(selectedCreanceDetail.creance.solde)} ${t.common.currency} وتاريخ الاستحقاق هو ${selectedCreanceDetail.creance.date_echeance}. نرجو منكم سرعة السداد.`
                            : `Bonjour ${selectedCreanceDetail.creance.client_nom}, ${company?.nom} vous informe que votre créance concernant "${selectedCreanceDetail.creance.motif}" s'élève à ${selectedCreanceDetail.creance.solde.toLocaleString('fr-FR')} FCFA avec une échéance fixée au ${selectedCreanceDetail.creance.date_echeance}. Merci de procéder au règlement.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', color: '#22c55e', fontSize: '0.74rem', padding: '0.3rem 0.6rem' }}
                      >
                        <Send size={12} />
                        <span>{t.demandes.shareWhatsApp}</span>
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4 : ENCAISSER UN PAIEMENT */}
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
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '440px',
              padding: '1.25rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                  {t.creances.recordPayment}
                </h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {t.creances.remainingBalance} : <strong style={{ color: '#f87171' }}>{formatAmount(selectedCreanceDetail.creance.solde)} {t.common.currency}</strong>
                </div>
              </div>
              <button type="button" onClick={() => setIsPaymentModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {t.creances.paymentAmount} ({t.common.currency}) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, montant: String(selectedCreanceDetail.creance.solde) })}
                    style={{ background: 'none', border: 'none', color: primaryColor, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {t.creances.fullBalance} ({formatAmount(selectedCreanceDetail.creance.solde)} {t.common.currency})
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedCreanceDetail.creance.solde}
                  required
                  placeholder="50000"
                  value={paymentForm.montant}
                  onChange={e => setPaymentForm({ ...paymentForm, montant: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'white', fontSize: '0.88rem', outline: 'none', direction: 'ltr' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 600 }}>
                    {t.common.paymentMethod} *
                  </label>
                  <select
                    value={paymentForm.moyen_paiement}
                    onChange={e => setPaymentForm({ ...paymentForm, moyen_paiement: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', color: 'white', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="especes">{locale === 'ar' ? 'نقداً / بالصندوق' : 'Espèces / Caisse'}</option>
                    <option value="wave">Wave</option>
                    <option value="om">Orange Money</option>
                    <option value="momo">MTN MoMo</option>
                    <option value="virement">{t.publicPayment.bankTransfer}</option>
                    <option value="carte">{t.publicPayment.bankCard}</option>
                    <option value="autre">{locale === 'ar' ? 'طريقة أخرى' : 'Autre'}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 600 }}>
                    {t.creances.paymentDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date_paiement}
                    onChange={e => setPaymentForm({ ...paymentForm, date_paiement: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'white', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 600 }}>
                  {t.common.reference} / {t.common.notes}
                </label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  placeholder="ENC-12345"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'white', fontSize: '0.82rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.35rem' }}>
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn btn-secondary btn-sm">{t.common.cancel}</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm" style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}>
                  {actionLoading ? t.common.saving : t.common.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5 : CRÉER DEMANDE DE PAIEMENT */}
      {isDemandeModalOpen && targetCreanceForDemande && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 13, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 130,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsDemandeModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '480px',
              padding: '1.25rem',
              boxShadow: '0 20px 45px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${primaryColor}22`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link2 size={16} />
                </div>
                <div>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '1.02rem', fontWeight: 800 }}>
                    {t.demandes.newLink}
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {t.common.client} : <strong>{targetCreanceForDemande.client_nom}</strong>
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setIsDemandeModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateDemande} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 600 }}>
                  {t.demandes.requestedAmount} ({t.common.currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  max={targetCreanceForDemande.solde > 0 ? targetCreanceForDemande.solde : undefined}
                  value={demandeForm.montant}
                  onChange={e => setDemandeForm({ ...demandeForm, montant: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'white', fontSize: '0.85rem', fontWeight: 700, outline: 'none', direction: 'ltr' }}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {t.creances.remainingBalance} : {formatAmount(targetCreanceForDemande.solde)} {t.common.currency}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 600 }}>
                  {t.creances.motif} *
                </label>
                <input
                  type="text"
                  required
                  value={demandeForm.motif}
                  onChange={e => setDemandeForm({ ...demandeForm, motif: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'white', fontSize: '0.82rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 600 }}>
                  {t.demandes.expiresOn}
                </label>
                <input
                  type="date"
                  required
                  value={demandeForm.customExp}
                  onChange={e => setDemandeForm({ ...demandeForm, customExp: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'white', fontSize: '0.82rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.35rem' }}>
                <button type="button" onClick={() => setIsDemandeModalOpen(false)} className="btn btn-secondary btn-sm">{t.common.cancel}</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary btn-sm" style={{ backgroundColor: primaryColor, borderColor: primaryColor, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {actionLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  <span>{t.demandes.newLink}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6 : CONFIRMATION LIEN GÉNÉRÉ */}
      {createdDemande && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 13, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setCreatedDemande(null)}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${primaryColor}55`,
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '460px',
              padding: '1.5rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${primaryColor}20`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <CheckCircle2 size={26} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0 }}>{t.demandes.createdModalTitle}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                {t.common.amount} : <strong style={{ color: 'white' }}>{formatAmount(createdDemande.montant)} {t.common.currency}</strong> • {t.common.client} : <strong>{createdDemande.clientNom}</strong>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.78rem', color: primaryColor, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                {createdDemande.url}
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(createdDemande.url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: primaryColor, borderColor: primaryColor, padding: '0.3rem 0.6rem', fontSize: '0.74rem', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedLink ? t.common.copied : t.common.copy}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a
                href={createdDemande.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
              >
                <ExternalLink size={13} />
                <span>{t.demandes.openPublicPage}</span>
              </a>

              <button
                type="button"
                onClick={() => setCreatedDemande(null)}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.5rem', fontSize: '0.78rem' }}
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
