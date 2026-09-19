import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Link2,
  Search,
  Plus,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  AlertTriangle,
  Sparkles,
  Send,
  Ban,
  Clock,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { apiRequest, type DemandePaiementItem, type DemandePaiementStatut } from '../../services/api';

interface CreanceOption {
  id: string;
  client_id: string;
  motif: string;
  solde: number;
  montant_total: number;
  statut: string;
  client_nom?: string;
  client_telephone?: string;
}

export const DemandesPaiementPage: React.FC = () => {
  const { company } = useAuth();
  const { t, locale, isRTL } = useLanguage();
  const primaryColor = company?.couleur_principale || '#10b981';

  const [demandes, setDemandes] = useState<DemandePaiementItem[]>([]);
  const [creances, setCreances] = useState<CreanceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('toutes');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createdDemandeResult, setCreatedDemandeResult] = useState<{ demande: DemandePaiementItem; public_url: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Feedback notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create Form State
  const [selectedCreanceId, setSelectedCreanceId] = useState('');
  const [customMontant, setCustomMontant] = useState('');
  const [customMotif, setCustomMotif] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [expirationDays, setExpirationDays] = useState('14');
  const [customExpDate, setCustomExpDate] = useState(
    new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [demandesRes, creancesRes] = await Promise.all([
        apiRequest<{ demandes: DemandePaiementItem[]; total: number }>('/api/company/demandes-paiement'),
        apiRequest<{ creances: CreanceOption[]; total: number }>('/api/company/creances'),
      ]);
      setDemandes(demandesRes.demandes);
      setCreances(creancesRes.creances.filter(c => c.solde > 0));
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreanceSelect = (creanceId: string) => {
    setSelectedCreanceId(creanceId);
    const selected = creances.find(c => c.id === creanceId);
    if (selected) {
      setCustomMontant(selected.solde.toString());
      setCustomMotif(`${selected.motif}`);
    }
  };

  const handleExpirationChange = (days: string) => {
    setExpirationDays(days);
    if (days !== 'custom') {
      const numDays = parseInt(days, 10) || 14;
      setCustomExpDate(new Date(Date.now() + numDays * 24 * 3600 * 1000).toISOString().split('T')[0]);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreanceId) {
      setErrorMsg(t.creances.selectClient);
      return;
    }

    const amount = Number(customMontant);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg(t.common.error);
      return;
    }

    try {
      setActionLoading(true);
      setErrorMsg(null);

      const res = await apiRequest<{ message: string; demande: DemandePaiementItem; public_url: string }>(
        '/api/company/demandes-paiement',
        {
          method: 'POST',
          body: JSON.stringify({
            creance_id: selectedCreanceId,
            montant: amount,
            motif: customMotif,
            description: customDescription,
            date_expiration: customExpDate,
          }),
        }
      );

      setSuccessMsg(t.demandes.createSuccess);
      setCreatedDemandeResult(res);
      setIsCreateModalOpen(false);

      // Reset form
      setSelectedCreanceId('');
      setCustomMontant('');
      setCustomMotif('');
      setCustomDescription('');

      // Refresh list
      await fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t.common.error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelDemande = async (id: string) => {
    if (!window.confirm(t.demandes.cancelConfirm)) {
      return;
    }

    try {
      setActionLoading(true);
      await apiRequest(`/api/company/demandes-paiement/${id}/annuler`, { method: 'PATCH' });
      setSuccessMsg(t.demandes.cancelSuccess);
      await fetchData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t.common.error);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const openWhatsAppShare = (d: DemandePaiementItem) => {
    const fullUrl = `${window.location.origin}/payer/${d.token}`;
    const clientName = d.client_nom || t.common.client;
    let message = '';
    if (locale === 'ar') {
      message = `مرحباً ${clientName}، إليك رابط الدفع الآمن بمبلغ ${d.montant.toLocaleString()} ${t.common.currency} (${d.motif}) الصادر من ${company?.nom || ''} : ${fullUrl}`;
    } else if (locale === 'en') {
      message = `Hello ${clientName}, here is your secure payment link for ${d.montant.toLocaleString()} ${t.common.currency} (${d.motif}) from ${company?.nom || ''}: ${fullUrl}`;
    } else {
      message = `Bonjour ${clientName}, voici votre lien de paiement sécurisé de ${d.montant.toLocaleString()} ${t.common.currency} (${d.motif}) émis par ${company?.nom || 'notre établissement'} : ${fullUrl}`;
    }
    const cleanPhone = (d.client_telephone || '').replace(/[^0-9]/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // KPIs
  const kpis = useMemo(() => {
    let pendingCount = 0;
    let pendingAmount = 0;
    let paidCount = 0;
    let expiredCount = 0;

    for (const d of demandes) {
      if (d.statut === 'en_attente' || d.statut === 'partiellement_payee') {
        pendingCount++;
        pendingAmount += (d.montant - (d.montant_paye || 0));
      } else if (d.statut === 'payee') {
        paidCount++;
      } else if (d.statut === 'expiree' || d.statut === 'annulee') {
        expiredCount++;
      }
    }

    return { pendingCount, pendingAmount, paidCount, expiredCount };
  }, [demandes]);

  // Filtered list
  const filteredDemandes = useMemo(() => {
    return demandes.filter(d => {
      const q = search.toLowerCase();
      const matchSearch =
        (d.client_nom && d.client_nom.toLowerCase().includes(q)) ||
        (d.motif && d.motif.toLowerCase().includes(q)) ||
        (d.token && d.token.toLowerCase().includes(q)) ||
        (d.client_telephone && d.client_telephone.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'toutes' || d.statut === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [demandes, search, statusFilter]);

  const getBadgeForStatut = (statut: DemandePaiementStatut) => {
    switch (statut) {
      case 'payee':
        return (
          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={11} /> {t.common.statusLabels.payee}
          </span>
        );
      case 'partiellement_payee':
        return (
          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={11} /> {t.common.statusLabels.partiellement_payee}
          </span>
        );
      case 'expiree':
        return (
          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={11} /> {t.common.statusLabels.expire}
          </span>
        );
      case 'annulee':
        return (
          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Ban size={11} /> {t.common.statusLabels.annule}
          </span>
        );
      default:
        return (
          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={11} /> {t.common.statusLabels.en_attente}
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Toast Alerts */}
      {errorMsg && (
        <div style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <AlertTriangle size={15} />
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} style={{ marginInlineStart: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <CheckCircle2 size={15} />
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg(null)} style={{ marginInlineStart: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* Top Bar with KPIs & Action Button */}
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
          <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${primaryColor}25`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Link2 size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2 }}>
                {t.demandes.title}
              </h1>
              <span style={{ fontSize: '0.72rem', color: primaryColor, background: `${primaryColor}20`, padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                {filteredDemandes.length}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              {t.demandes.subtitle}
            </div>
          </div>
        </div>

        {/* KPIs quick view */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t.common.statusLabels.en_attente} : </span>
            <strong style={{ color: '#fbbf24' }}>{kpis.pendingAmount.toLocaleString()} {t.common.currency}</strong> ({kpis.pendingCount})
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t.common.statusLabels.payee} : </span>
            <strong style={{ color: '#34d399' }}>{kpis.paidCount}</strong>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: primaryColor, borderColor: primaryColor, display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            <Plus size={14} />
            <span>{t.demandes.newLink}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.65rem',
              minWidth: '240px',
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

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.02)', padding: '0.2rem', borderRadius: '6px' }}>
            <Filter size={12} color="var(--text-muted)" style={{ margin: '0 0.25rem' }} />
            {[
              { id: 'toutes', label: t.common.all },
              { id: 'en_attente', label: t.common.statusLabels.en_attente },
              { id: 'payee', label: t.common.statusLabels.payee },
              { id: 'expiree', label: t.common.statusLabels.expire },
              { id: 'annulee', label: t.common.statusLabels.annule },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  background: statusFilter === tab.id ? `${primaryColor}30` : 'transparent',
                  color: statusFilter === tab.id ? 'white' : 'var(--text-muted)',
                  border: statusFilter === tab.id ? `1px solid ${primaryColor}60` : '1px solid transparent',
                  borderRadius: '4px',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.74rem',
                  fontWeight: statusFilter === tab.id ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.35rem 0.6rem' }}
          title={t.common.refresh}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table List of Demandes */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-spin" size={26} color={primaryColor} style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ fontSize: '0.85rem' }}>{t.common.loading}</div>
        </div>
      ) : filteredDemandes.length === 0 ? (
        <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <Link2 size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{t.demandes.noDemandesFound}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', maxWidth: '420px', margin: '0.25rem auto 1rem auto' }}>
            {t.demandes.directLinkNotice}
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ backgroundColor: primaryColor, borderColor: primaryColor, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Plus size={14} />
            <span>{t.demandes.newLink}</span>
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.common.client}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.creances.motif}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.common.amount}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.common.status}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.common.date}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{t.demandes.token}</th>
                  <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, textAlign: isRTL ? 'left' : 'right' }}>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDemandes.map(d => {
                  const fullUrl = `${window.location.origin}/payer/${d.token}`;
                  return (
                    <tr
                      key={d.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.1s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Client */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ fontWeight: 700, color: 'white' }}>{d.client_nom}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.client_telephone}</div>
                      </td>

                      {/* Motif */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ color: 'white', fontWeight: 600 }}>{d.motif}</div>
                        {d.motif_creance && d.motif_creance !== d.motif && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.paiements.reference}: {d.motif_creance}</div>
                        )}
                      </td>

                      {/* Montant */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ fontWeight: 800, color: '#e2e8f0', fontSize: '0.9rem' }}>
                          {d.montant.toLocaleString()} {t.common.currency}
                        </div>
                        {d.montant_paye && d.montant_paye > 0 ? (
                          <div style={{ fontSize: '0.68rem', color: '#34d399' }}>
                            {t.creances.paidAmount} : {d.montant_paye.toLocaleString()} {t.common.currency}
                          </div>
                        ) : null}
                      </td>

                      {/* Statut */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        {getBadgeForStatut(d.statut)}
                      </td>

                      {/* Dates */}
                      <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        <div>{d.date_creation}</div>
                        <div style={{ color: d.statut === 'expiree' ? '#f87171' : 'var(--text-muted)' }}>
                          {t.demandes.expiresOn} : {d.date_expiration}
                        </div>
                      </td>

                      {/* Lien public token & copy */}
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <code
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              padding: '0.15rem 0.4rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              color: primaryColor,
                              maxWidth: '120px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              direction: 'ltr',
                              textAlign: 'left',
                            }}
                            title={fullUrl}
                          >
                            /payer/{d.token}
                          </code>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(fullUrl, d.id)}
                            style={{
                              background: copiedId === d.id ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.25rem 0.4rem',
                              color: copiedId === d.id ? '#34d399' : 'var(--text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              fontSize: '0.7rem',
                            }}
                            title={t.demandes.copyLink}
                          >
                            {copiedId === d.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: isRTL ? 'left' : 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <a
                            href={`/payer/${d.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem' }}
                            title={t.demandes.openPublicPage}
                          >
                            <ExternalLink size={12} />
                          </a>

                          <button
                            type="button"
                            onClick={() => openWhatsAppShare(d)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', color: '#22c55e' }}
                            title={t.demandes.shareWhatsApp}
                          >
                            <Send size={12} />
                          </button>

                          {d.statut === 'en_attente' && (
                            <button
                              type="button"
                              onClick={() => handleCancelDemande(d.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.72rem', color: '#f87171' }}
                              title={t.demandes.cancelLink}
                              disabled={actionLoading}
                            >
                              <Ban size={12} />
                            </button>
                          )}
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

      {/* Modal : Créer une demande de paiement */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#0f172a',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${primaryColor}25`, color: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link2 size={16} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  {t.demandes.newLink}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Select Creance */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  {t.demandes.targetReceivable} *
                </label>
                <select
                  value={selectedCreanceId}
                  onChange={e => handleCreanceSelect(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.55rem 0.75rem',
                    color: 'white',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                >
                  <option value="" style={{ background: '#0f172a', color: 'white' }}>-- {t.creances.selectClient} --</option>
                  {creances.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#0f172a', color: 'white' }}>
                      {c.client_nom} • {c.motif} ({t.creances.remainingBalance} : {c.solde.toLocaleString()} {t.common.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Montant demandé */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  {t.demandes.requestedAmount} ({t.common.currency}) *
                </label>
                <input
                  type="number"
                  value={customMontant}
                  onChange={e => setCustomMontant(e.target.value)}
                  placeholder="Ex: 50000"
                  required
                  min="100"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.55rem 0.75rem',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Motif de la demande */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  {t.creances.motif} *
                </label>
                <input
                  type="text"
                  value={customMotif}
                  onChange={e => setCustomMotif(e.target.value)}
                  placeholder="Ex: Prestation..."
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.55rem 0.75rem',
                    color: 'white',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Expiration preset */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  {t.demandes.validityDuration}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {[
                    { id: '7', label: t.demandes.sevenDays },
                    { id: '14', label: t.demandes.fourteenDays },
                    { id: '30', label: t.demandes.thirtyDays },
                    { id: 'custom', label: t.demandes.customDate },
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleExpirationChange(p.id)}
                      style={{
                        background: expirationDays === p.id ? `${primaryColor}30` : 'rgba(255,255,255,0.04)',
                        border: expirationDays === p.id ? `1px solid ${primaryColor}` : '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        color: expirationDays === p.id ? 'white' : 'var(--text-muted)',
                        fontSize: '0.74rem',
                        fontWeight: expirationDays === p.id ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {expirationDays === 'custom' && (
                  <input
                    type="date"
                    value={customExpDate}
                    onChange={e => setCustomExpDate(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '0.4rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.45rem 0.75rem',
                      color: 'white',
                      fontSize: '0.82rem',
                      outline: 'none',
                    }}
                  />
                )}
              </div>

              {/* Description facultative */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  {t.creances.description}
                </label>
                <textarea
                  value={customDescription}
                  onChange={e => setCustomDescription(e.target.value)}
                  placeholder="..."
                  rows={2}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.75rem',
                    color: 'white',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Submit buttons */}
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
                  className="btn btn-primary btn-sm"
                  disabled={actionLoading}
                  style={{ backgroundColor: primaryColor, borderColor: primaryColor, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {actionLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  <span>{t.demandes.newLink}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Modal when a payment request was just created */}
      {createdDemandeResult && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 110,
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              width: '100%',
              background: '#0f172a',
              border: `1px solid ${primaryColor}60`,
              borderRadius: '20px',
              padding: '1.75rem 1.5rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: `${primaryColor}20`,
                color: primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <CheckCircle2 size={28} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: 0 }}>
                {t.demandes.createdModalTitle}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                {t.demandes.createdModalSubtitle}
              </p>
            </div>

            {/* URL Display with 1-click copy */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  color: primaryColor,
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  direction: 'ltr',
                  textAlign: 'left',
                }}
              >
                {window.location.origin}/payer/{createdDemandeResult.demande.token}
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(`${window.location.origin}/payer/${createdDemandeResult.demande.token}`, 'modal_result')}
                className="btn btn-primary btn-sm"
                style={{
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                {copiedId === 'modal_result' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedId === 'modal_result' ? t.common.copied : t.common.copy}</span>
              </button>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => openWhatsAppShare(createdDemandeResult.demande)}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  color: '#22c55e',
                  borderColor: 'rgba(34, 197, 94, 0.4)',
                  padding: '0.6rem',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <Send size={14} />
                <span>{t.demandes.shareWhatsApp}</span>
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={`/payer/${createdDemandeResult.demande.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, padding: '0.55rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <ExternalLink size={13} />
                  <span>{t.demandes.openPublicPage}</span>
                </a>

                <button
                  type="button"
                  onClick={() => setCreatedDemandeResult(null)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.55rem', fontSize: '0.78rem' }}
                >
                  {t.common.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
