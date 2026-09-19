import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { apiRequest } from '../../services/api';
import {
  BellRing,
  Send,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  User,
  ArrowRight,
  ArrowLeft,
  Filter,
  Search,
  Settings,
  History,
  X,
  Phone,
  Play,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface CreanceRelance {
  id: string;
  client_id: string;
  client_nom?: string;
  client_telephone?: string;
  motif: string;
  montant_total: number;
  montant_paye: number;
  solde: number;
  date_echeance: string;
  statut: 'en_attente' | 'partiellement_payee' | 'en_retard' | 'payee';
}

interface RelanceLogItem {
  id: string;
  entreprise_id: string;
  creance_id: string;
  client_id: string;
  client_nom: string;
  client_telephone: string;
  telephone_normalise: string;
  type: 'manuel' | 'auto';
  milestone: string;
  montant_solde: number;
  montant_total: number;
  statut: 'envoye' | 'echec' | 'annule';
  motif_echec?: string;
  message: string;
  canal: 'whatsapp' | 'sms';
  created_at: string;
}

interface AutoSettings {
  active: boolean;
  milestones: string[];
}

interface RelancesResponse {
  overdue: CreanceRelance[];
  upcoming: CreanceRelance[];
  allUnpaid: CreanceRelance[];
  upToDate: CreanceRelance[];
  autoSettings?: AutoSettings;
  summary: {
    totalOverdueAmount: number;
    totalUpcomingAmount: number;
    totalUnpaidAmount: number;
    totalPaidAmount: number;
    overdueCount: number;
    upcomingCount: number;
    allUnpaidCount: number;
    upToDateCount: number;
    overdueClientsCount: number;
    upcomingClientsCount: number;
    totalUnpaidClientsCount: number;
    isFullyUpToDate: boolean;
  };
}

function normalizeWhatsAppPhone(phone: string | null | undefined, defaultCountryCode = '225'): {
  normalized: string;
  isValid: boolean;
  error?: string;
} {
  if (!phone || !phone.trim()) {
    return { normalized: '', isValid: false, error: 'Numéro de téléphone absent' };
  }

  let cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  } else {
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = defaultCountryCode + cleaned;
    } else if (cleaned.length <= 9) {
      cleaned = defaultCountryCode + cleaned;
    }
  }

  if (!/^\d{8,15}$/.test(cleaned)) {
    return { normalized: cleaned, isValid: false, error: 'Format de numéro international invalide' };
  }

  return { normalized: cleaned, isValid: true };
}

export const RelancesPage: React.FC = () => {
  const { company } = useAuth();
  const { t, locale, isRtl } = useLanguage();
  const primaryColor = company?.couleur_principale || '#10b981';

  const [data, setData] = useState<RelancesResponse | null>(null);
  const [logs, setLogs] = useState<RelanceLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overdue' | 'upcoming' | 'all' | 'history'>('overdue');
  const [overdueTone, setOverdueTone] = useState<'amicale' | 'ferme' | 'mise_en_demeure'>('amicale');
  const [upcomingTone, setUpcomingTone] = useState<'preventif' | 'info'>('preventif');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Missing phone modal state
  const [missingPhoneCreance, setMissingPhoneCreance] = useState<CreanceRelance | null>(null);
  const [inputPhone, setInputPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoActive, setAutoActive] = useState(true);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([
    'J-7',
    'J-3',
    'J0',
    'J+3',
    'J+7',
    'J+14',
    'J+30',
  ]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [processingAuto, setProcessingAuto] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const formatAmount = (val: number) => {
    return val.toLocaleString(locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-US' : 'fr-FR');
  };

  const ALL_MILESTONES = [
    { id: 'J-7', label: `J-7 (${t.relances.milestones.m_j_minus_7})` },
    { id: 'J-3', label: `J-3 (${t.relances.milestones.m_j_minus_3})` },
    { id: 'J0', label: `J0 (${t.relances.milestones.m_j_0})` },
    { id: 'J+3', label: `J+3 (${t.relances.milestones.m_j_plus_3})` },
    { id: 'J+7', label: `J+7 (${t.relances.milestones.m_j_plus_7})` },
    { id: 'J+14', label: `J+14 (${t.relances.milestones.m_j_plus_14})` },
    { id: 'J+30', label: `J+30 (${t.relances.milestones.m_j_plus_30})` },
  ];

  const fetchRelances = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<RelancesResponse>('/api/company/relances');
      setData(res);
      if (res.autoSettings) {
        setAutoActive(res.autoSettings.active);
        setSelectedMilestones(res.autoSettings.milestones);
      }
      if (res.summary.overdueCount === 0 && res.summary.upcomingCount > 0 && activeTab === 'overdue') {
        setActiveTab('upcoming');
      }
    } catch (err: unknown) {
      console.error('Erreur chargement relances:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await apiRequest<{ logs: RelanceLogItem[] }>('/api/company/relances/logs');
      setLogs(res.logs);
    } catch (err: unknown) {
      console.error('Erreur chargement historique relances:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchRelances();
    fetchLogs();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const getMessageTemplate = (creance: CreanceRelance) => {
    const clientName = creance.client_nom || t.common.client;
    const compName = company?.nom || 'Relancio';
    const amount = formatAmount(creance.solde);
    const motif = creance.motif;
    const date = creance.date_echeance;

    if (locale === 'ar') {
      if (creance.statut === 'en_retard') {
        switch (overdueTone) {
          case 'amicale':
            return `مرحباً ${clientName}، نود تذكيركم بأن فاتورتكم بشأن "${motif}" بمبلغ ${amount} ${t.common.currency} حل موعد استحقاقها في ${date}. نرجو منكم المبادرة بالسداد مع فائق الشكر، ${compName}.`;
          case 'ferme':
            return `تذكير هام: مرحباً ${clientName}، نلاحظ أن مستحقاتكم بقيمة ${amount} ${t.common.currency} (${motif}) لدى ${compName} لم تسدد بعد رغم تجاوز تاريخ الاستحقاق (${date}). يرجى السداد اليوم.`;
          case 'mise_en_demeure':
            return `عاجل - إنذار أخير: ${clientName}، تأخر سداد مستحقاتكم بقيمة ${amount} ${t.common.currency} لدى ${compName} بشأن "${motif}". نرجو السداد خلال 48 ساعة لتفادي اتخاذ الإجراءات النظامية.`;
        }
      } else {
        switch (upcomingTone) {
          case 'preventif':
            return `مرحباً ${clientName}، نود تذكيركم بلطف بأن فاتورتكم بشأن "${motif}" (المتبقي ${amount} ${t.common.currency}) يحل أجلها في ${date}. شكراً لكم، ${compName}.`;
          case 'info':
            return `مرحباً ${clientName}، للإحاطة فإن موعد سداد مبلغ ${amount} ${t.common.currency} بشأن "${motif}" لدى ${compName} هو ${date}. نحن في خدمتكم لأي استفسار.`;
        }
      }
    }

    if (locale === 'en') {
      if (creance.statut === 'en_retard') {
        switch (overdueTone) {
          case 'amicale':
            return `Hello ${clientName}, this is a gentle reminder that your invoice for "${motif}" with a balance of ${amount} ${t.common.currency} was due on ${date}. Thank you for arranging payment. Best regards, ${compName}.`;
          case 'ferme':
            return `Important reminder: Hello ${clientName}, your receivable of ${amount} ${t.common.currency} (${motif}) with ${compName} remains unpaid past its due date of ${date}. Please make payment today.`;
          case 'mise_en_demeure':
            return `URGENT - FINAL NOTICE: ${clientName}, your overdue balance of ${amount} ${t.common.currency} at ${compName} for "${motif}" is delayed. Please settle within 48 hours to avoid escalation. Contact us immediately.`;
        }
      } else {
        switch (upcomingTone) {
          case 'preventif':
            return `Hello ${clientName}, this is a friendly reminder that your invoice for "${motif}" (${amount} ${t.common.currency}) will be due on ${date}. Thank you, ${compName}.`;
          case 'info':
            return `Hello ${clientName}, for your information, payment of ${amount} ${t.common.currency} for "${motif}" is expected by ${date} at ${compName}. Feel free to contact us with any questions.`;
        }
      }
    }

    // Default French
    if (creance.statut === 'en_retard') {
      switch (overdueTone) {
        case 'amicale':
          return `Bonjour ${clientName}, sauf erreur de notre part, votre facture concernant "${motif}" pour un montant restant de ${amount} FCFA est arrivée à échéance le ${date}. Merci de bien vouloir procéder à son règlement. Cordialement, ${compName}.`;
        case 'ferme':
          return `Rappel important : Bonjour ${clientName}, nous constatons que votre créance de ${amount} FCFA (${motif}) auprès de ${compName} n'a pas encore été réglée malgré l'échéance dépassée du ${date}. Merci d'effectuer votre paiement dès aujourd'hui.`;
        case 'mise_en_demeure':
          return `URGENT - DERNIER AVIS : ${clientName}, votre impayé de ${amount} FCFA chez ${compName} pour "${motif}" fait l'objet d'un retard prolongé. Sans règlement sous 48h, votre dossier sera transmis au service contentieux. Contactez-nous immédiatement.`;
      }
    } else {
      switch (upcomingTone) {
        case 'preventif':
          return `Bonjour ${clientName}, nous vous rappelons amicalement que votre facture pour "${motif}" (solde de ${amount} FCFA) arrive à échéance le ${date}. Merci de préparer votre règlement. Bien cordialement, ${compName}.`;
        case 'info':
          return `Bonjour ${clientName}, pour information, le règlement de ${amount} FCFA concernant "${motif}" est attendu auprès de ${compName} d'ici le ${date}. Nous restons à votre disposition pour tout renseignement.`;
      }
    }
  };

  const handleManualRelanceClick = async (creance: CreanceRelance) => {
    const rawPhone = creance.client_telephone || '';
    const norm = normalizeWhatsAppPhone(rawPhone);

    if (!norm.isValid) {
      setMissingPhoneCreance(creance);
      setInputPhone(rawPhone);
      setPhoneError(null);
      return;
    }

    const message = getMessageTemplate(creance);
    const waUrl = `https://wa.me/${norm.normalized}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    try {
      await apiRequest('/api/company/relances/manual-log', {
        method: 'POST',
        body: JSON.stringify({
          creance_id: creance.id,
          message,
          canal: 'whatsapp',
        }),
      });
      fetchLogs();
      showFeedback('success', `${t.relances.sendWhatsApp} : ${creance.client_nom}`);
    } catch (err) {
      console.error('Erreur log relance manuelle:', err);
    }
  };

  const handleSavePhoneAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missingPhoneCreance) return;

    const norm = normalizeWhatsAppPhone(inputPhone);
    if (!norm.isValid) {
      setPhoneError(
        locale === 'ar'
          ? 'يرجى إدخال رقم هاتف صحيح'
          : locale === 'en'
          ? 'Please enter a valid phone number'
          : 'Veuillez saisir un numéro de téléphone valide'
      );
      return;
    }

    try {
      setSavingPhone(true);
      setPhoneError(null);

      await apiRequest(`/api/company/clients/${missingPhoneCreance.client_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          telephone: inputPhone.trim(),
        }),
      });

      const message = getMessageTemplate(missingPhoneCreance);
      const waUrl = `https://wa.me/${norm.normalized}?text=${encodeURIComponent(message)}`;

      await apiRequest('/api/company/relances/manual-log', {
        method: 'POST',
        body: JSON.stringify({
          creance_id: missingPhoneCreance.id,
          message,
          canal: 'whatsapp',
        }),
      });

      setMissingPhoneCreance(null);
      fetchRelances();
      fetchLogs();
      showFeedback('success', t.clients.updateSuccess);
      window.open(waUrl, '_blank');
    } catch (err: unknown) {
      setPhoneError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSavingPhone(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await apiRequest('/api/company/relances/settings', {
        method: 'PUT',
        body: JSON.stringify({
          active: autoActive,
          milestones: selectedMilestones,
        }),
      });
      setIsSettingsOpen(false);
      showFeedback('success', t.relances.settingsSaved);
      fetchRelances();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : t.common.error);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRunAutoProcess = async () => {
    try {
      setProcessingAuto(true);
      const res = await apiRequest<{
        message: string;
        result: { sentCount: number; failedCount: number; skippedCount: number };
      }>('/api/company/relances/auto-process', {
        method: 'POST',
      });
      showFeedback('success', res.message);
      fetchRelances();
      fetchLogs();
    } catch (err: unknown) {
      showFeedback('error', err instanceof Error ? err.message : t.common.error);
    } finally {
      setProcessingAuto(false);
    }
  };

  const toggleMilestone = (id: string) => {
    if (selectedMilestones.includes(id)) {
      setSelectedMilestones(selectedMilestones.filter(m => m !== id));
    } else {
      setSelectedMilestones([...selectedMilestones, id]);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const displayedList = useMemo(() => {
    if (!data) return [];
    let list: CreanceRelance[] = [];
    if (activeTab === 'overdue') {
      list = data.overdue;
    } else if (activeTab === 'upcoming') {
      list = data.upcoming;
    } else if (activeTab === 'all') {
      list = data.allUnpaid;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        c =>
          (c.client_nom && c.client_nom.toLowerCase().includes(q)) ||
          (c.motif && c.motif.toLowerCase().includes(q)) ||
          (c.client_telephone && c.client_telephone.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data, activeTab, searchTerm]);

  const displayedLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const q = searchTerm.toLowerCase().trim();
    return logs.filter(
      l =>
        l.client_nom.toLowerCase().includes(q) ||
        l.milestone.toLowerCase().includes(q) ||
        l.client_telephone.toLowerCase().includes(q) ||
        l.message.toLowerCase().includes(q)
    );
  }, [logs, searchTerm]);

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Toast Feedback */}
      {actionFeedback && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            [isRtl ? 'left' : 'right']: '20px',
            zIndex: 9999,
            background: actionFeedback.type === 'success' ? '#065f46' : '#991b1b',
            color: 'white',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: actionFeedback.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
          }}
        >
          {actionFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Unified Compact Top Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem 1.15rem',
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
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background:
                data && data.summary.overdueCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: data && data.summary.overdueCount > 0 ? '#f87171' : '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BellRing size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2 }}>
                {t.relances.title}
              </h1>
              {data && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: data.summary.overdueCount > 0 ? '#f87171' : '#34d399',
                    background:
                      data.summary.overdueCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    padding: '0.12rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  {data.summary.allUnpaidCount} {t.creances.title}
                </span>
              )}
              {autoActive ? (
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: '#34d399',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '0.12rem 0.45rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontWeight: 600,
                  }}
                >
                  {t.common.active} ({selectedMilestones.length})
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '0.12rem 0.45rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  {t.common.inactive}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {t.relances.subtitle}
            </div>
          </div>
        </div>

        {/* Global Action & Summary KPIs */}
        {data && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {t.creances.filterOverdue}
              </div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: data.summary.totalOverdueAmount > 0 ? '#f87171' : '#34d399',
                }}
              >
                {formatAmount(data.summary.totalOverdueAmount)} {t.common.currency}
              </div>
            </div>

            <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }} />

            <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {t.relances.upcomingDue}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#60a5fa' }}>
                {formatAmount(data.summary.totalUpcomingAmount)} {t.common.currency}
              </div>
            </div>

            {/* Auto-process button */}
            <button
              type="button"
              onClick={handleRunAutoProcess}
              disabled={processingAuto}
              className="btn btn-primary btn-sm"
              style={{
                backgroundColor: primaryColor,
                borderColor: primaryColor,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                fontSize: '0.76rem',
                fontWeight: 700,
              }}
              title={t.relances.tabAutomated}
            >
              <Play size={13} className={processingAuto ? 'animate-spin' : ''} />
              <span>{processingAuto ? t.common.loading : t.relances.tabAutomated}</span>
            </button>

            {/* Settings button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.65rem' }}
              title={t.settings.title}
            >
              <Settings size={14} />
            </button>

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => {
                fetchRelances();
                fetchLogs();
              }}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.65rem' }}
              title={t.common.refresh}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}
      </div>

      {/* Tabs and Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.6rem 0.85rem',
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('overdue')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'overdue' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid transparent',
              background: activeTab === 'overdue' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)',
              color: activeTab === 'overdue' ? '#f87171' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <AlertTriangle size={13} />
            <span>{t.relances.criticalOverdue}</span>
            <span
              style={{
                fontSize: '0.68rem',
                background: activeTab === 'overdue' ? '#ef4444' : 'rgba(239, 68, 68, 0.2)',
                color: 'white',
                padding: '0.05rem 0.35rem',
                borderRadius: '10px',
                fontWeight: 800,
              }}
            >
              {data?.summary.overdueCount || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'upcoming' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
              background: activeTab === 'upcoming' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
              color: activeTab === 'upcoming' ? '#60a5fa' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Clock size={13} />
            <span>{t.relances.upcomingDue}</span>
            <span
              style={{
                fontSize: '0.68rem',
                background: activeTab === 'upcoming' ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)',
                color: 'white',
                padding: '0.05rem 0.35rem',
                borderRadius: '10px',
                fontWeight: 800,
              }}
            >
              {data?.summary.upcomingCount || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'all' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              background: activeTab === 'all' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
              color: activeTab === 'all' ? '#fbbf24' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Filter size={13} />
            <span>{t.relances.allUnpaid}</span>
            <span
              style={{
                fontSize: '0.68rem',
                background: activeTab === 'all' ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)',
                color: 'white',
                padding: '0.05rem 0.35rem',
                borderRadius: '10px',
                fontWeight: 800,
              }}
            >
              {data?.summary.allUnpaidCount || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'history' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              background: activeTab === 'history' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
              color: activeTab === 'history' ? '#34d399' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <History size={13} />
            <span>{t.relances.tabHistory}</span>
            <span
              style={{
                fontSize: '0.68rem',
                background: activeTab === 'history' ? '#10b981' : 'rgba(16, 185, 129, 0.2)',
                color: 'white',
                padding: '0.05rem 0.35rem',
                borderRadius: '10px',
                fontWeight: 800,
              }}
            >
              {logs.length}
            </span>
          </button>
        </div>

        {/* Search input & Tone Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={13} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '0.55rem', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={`${t.common.search}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: isRtl ? '0.28rem 1.75rem 0.28rem 0.55rem' : '0.28rem 0.55rem 0.28rem 1.75rem',
                fontSize: '0.74rem',
                color: 'white',
                outline: 'none',
                width: '160px',
              }}
            />
          </div>

          {activeTab !== 'history' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.relances.previewMessage} :</span>
              {activeTab === 'overdue' ? (
                <div
                  style={{
                    display: 'flex',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.15rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOverdueTone('amicale')}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: overdueTone === 'amicale' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                      color: overdueTone === 'amicale' ? '#34d399' : 'var(--text-secondary)',
                    }}
                  >
                    {locale === 'ar' ? 'ودية (J+1)' : 'Amicale (J+1)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverdueTone('ferme')}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: overdueTone === 'ferme' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                      color: overdueTone === 'ferme' ? '#fbbf24' : 'var(--text-secondary)',
                    }}
                  >
                    {locale === 'ar' ? 'حازمة (J+7)' : 'Ferme (J+7)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverdueTone('mise_en_demeure')}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: overdueTone === 'mise_en_demeure' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                      color: overdueTone === 'mise_en_demeure' ? '#f87171' : 'var(--text-secondary)',
                    }}
                  >
                    {locale === 'ar' ? 'إنذار أخير (J+15)' : 'Dernier avis (J+15)'}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.15rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setUpcomingTone('preventif')}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: upcomingTone === 'preventif' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                      color: upcomingTone === 'preventif' ? '#60a5fa' : 'var(--text-secondary)',
                    }}
                  >
                    {locale === 'ar' ? 'تذكير وقائي (J-3)' : 'Préventif (J-3)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpcomingTone('info')}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: upcomingTone === 'info' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                      color: upcomingTone === 'info' ? '#34d399' : 'var(--text-secondary)',
                    }}
                  >
                    {locale === 'ar' ? 'إشعار بالموعد' : 'Info Échéance'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Sparkles className="animate-spin" size={26} color={primaryColor} style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ fontSize: '0.88rem' }}>{t.common.loading}</div>
        </div>
      ) : activeTab === 'history' ? (
        /* HISTORIQUE TAB */
        logsLoading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <Sparkles className="animate-spin" size={22} color={primaryColor} style={{ margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontSize: '0.84rem' }}>{t.common.loading}</div>
          </div>
        ) : displayedLogs.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <History size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.65rem auto' }} />
            <div style={{ color: 'white', fontWeight: 700, fontSize: '0.98rem' }}>{t.relances.noLogsFound}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
              {t.relances.logsSubtitle}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {displayedLogs.map(log => {
              const isSuccess = log.statut === 'envoye';
              const isAuto = log.type === 'auto';
              const formattedDate = new Date(log.created_at).toLocaleString(locale === 'ar' ? 'ar-EG' : locale === 'en' ? 'en-US' : 'fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: isSuccess ? '1px solid var(--border-subtle)' : '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, color: 'white', fontSize: '0.92rem' }}>{log.client_nom}</span>

                      {/* Type / Milestone Badge */}
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: isAuto ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isAuto ? '#60a5fa' : '#34d399',
                          fontWeight: 700,
                        }}
                      >
                        {isAuto ? `Auto • ${log.milestone}` : 'Manuel • WhatsApp'}
                      </span>

                      {/* Status Badge */}
                      {isSuccess ? (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <CheckCircle2 size={11} />
                          <span>{t.relances.statusSent}</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                          title={log.motif_echec}
                        >
                          <AlertCircle size={11} />
                          <span>{t.relances.statusFailed} : {log.motif_echec || 'Non envoyé'}</span>
                        </span>
                      )}

                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• {formattedDate}</span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {t.common.phone} : <strong style={{ direction: 'ltr', display: 'inline-block' }}>{log.telephone_normalise || log.client_telephone || 'N/A'}</strong> •
                      {t.creances.remainingBalance} : <strong style={{ color: '#f87171' }}>{formatAmount(log.montant_solde)} {t.common.currency}</strong>
                    </div>

                    {/* Preview message */}
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.35rem',
                        background: 'rgba(0,0,0,0.25)',
                        padding: '0.35rem 0.55rem',
                        borderRadius: '4px',
                        fontStyle: 'italic',
                        maxWidth: '680px',
                      }}
                    >
                      "{log.message}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(log.message, log.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.35rem 0.55rem', fontSize: '0.72rem' }}
                      title={t.common.copy}
                    >
                      {copiedId === log.id ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                      <span>{copiedId === log.id ? t.common.copied : t.common.copy}</span>
                    </button>

                    {log.telephone_normalise && (
                      <a
                        href={`https://wa.me/${log.telephone_normalise}?text=${encodeURIComponent(log.message)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{
                          padding: '0.35rem 0.55rem',
                          fontSize: '0.72rem',
                          color: '#34d399',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <ExternalLink size={12} />
                        <span>{t.common.details}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : data?.summary.isFullyUpToDate ? (
        /* GLOBAL EMPTY STATE */
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px dashed rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <CheckCircle2 size={36} color="#34d399" style={{ margin: '0 auto 0.75rem auto' }} />
          <div style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem' }}>{t.relances.allDebtsSettled}</div>
          <div
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              marginTop: '0.35rem',
              maxWidth: '500px',
              margin: '0.35rem auto 0 auto',
            }}
          >
            {t.relances.congratulationsNoDebts}
          </div>
        </div>
      ) : displayedList.length === 0 ? (
        /* TAB EMPTY STATE */
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
          }}
        >
          {activeTab === 'overdue' ? (
            <>
              <CheckCircle2 size={32} color="#34d399" style={{ margin: '0 auto 0.65rem auto' }} />
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.98rem' }}>{t.relances.upToDate}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                {t.relances.allDebtsSettled}
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>{t.relances.upcomingDue}</span>
                {isRtl ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
              </button>
            </>
          ) : activeTab === 'upcoming' ? (
            <>
              <Clock size={32} color="#60a5fa" style={{ margin: '0 auto 0.65rem auto' }} />
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.98rem' }}>{t.common.noData}</div>
              <button
                type="button"
                onClick={() => setActiveTab('overdue')}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>{t.relances.criticalOverdue}</span>
                {isRtl ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
              </button>
            </>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {t.common.noData}
            </div>
          )}
        </div>
      ) : (
        /* LIST OF UNPAID CREANCES */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {displayedList.map(creance => {
            const message = getMessageTemplate(creance);
            const rawPhone = creance.client_telephone || '';
            const norm = normalizeWhatsAppPhone(rawPhone);
            const hasValidPhone = norm.isValid;
            const isOverdue = creance.statut === 'en_retard';
            const isPartiallyPaid = creance.montant_paye > 0 && creance.solde > 0;

            return (
              <div
                key={creance.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: isOverdue ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.85rem',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontWeight: 800,
                        color: 'white',
                        fontSize: '0.94rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <User size={14} color="var(--text-secondary)" />
                      {creance.client_nom || t.common.client}
                    </span>

                    {/* Status Badge */}
                    {isOverdue ? (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          fontWeight: 700,
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        {t.common.statusLabels.en_retard} ({creance.date_echeance})
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '4px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#60a5fa',
                          fontWeight: 700,
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                        }}
                      >
                        {t.relances.upcomingDue} ({creance.date_echeance})
                      </span>
                    )}

                    {isPartiallyPaid && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '4px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#fbbf24',
                          fontWeight: 700,
                        }}
                      >
                        {t.creances.paidAmount} : {formatAmount(creance.montant_paye)} {t.common.currency}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    <strong>{creance.motif}</strong> • {t.common.phone} :{' '}
                    {hasValidPhone ? (
                      <strong style={{ color: '#34d399', direction: 'ltr', display: 'inline-block' }}>+{norm.normalized}</strong>
                    ) : (
                      <span style={{ color: '#f87171', fontWeight: 600 }}>{locale === 'ar' ? 'رقم الهاتف غير مسجل' : 'Numéro manquant'}</span>
                    )}
                  </div>

                  {/* Message Preview */}
                  <div
                    style={{
                      fontSize: '0.73rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.45rem',
                      background: 'rgba(0,0,0,0.25)',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '5px',
                      fontStyle: 'italic',
                      maxWidth: '680px',
                      lineHeight: 1.35,
                      border: '1px solid rgba(255,255,255,0.03)',
                    }}
                  >
                    "{message}"
                  </div>
                </div>

                {/* Balance and Action buttons */}
                <div style={{ textAlign: isRtl ? 'left' : 'right', display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {t.creances.remainingBalance}
                    </div>
                    <div
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        color: isOverdue ? '#f87171' : '#fbbf24',
                        lineHeight: 1.1,
                      }}
                    >
                      {formatAmount(creance.solde)} {t.common.currency}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {t.creances.initialAmount} : {formatAmount(creance.montant_total)} {t.common.currency}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(message, creance.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.74rem' }}
                      title={t.common.copy}
                    >
                      {copiedId === creance.id ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                      <span>{copiedId === creance.id ? t.common.copied : t.common.copy}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleManualRelanceClick(creance)}
                      className="btn btn-primary btn-sm"
                      style={{
                        backgroundColor: '#22c55e',
                        borderColor: '#22c55e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title={hasValidPhone ? 'WhatsApp' : t.common.edit}
                    >
                      <Send size={13} />
                      <span>{hasValidPhone ? t.relances.sendWhatsApp : t.common.phone}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MISSING PHONE MODAL */}
      {missingPhoneCreance && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '480px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={18} color="#22c55e" />
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  {t.common.phone} (WhatsApp)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMissingPhoneCreance(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
              {locale === 'ar'
                ? `يرجى إدخال رقم هاتف صحيح لـ ${missingPhoneCreance.client_nom} للمتابعة عبر واتساب:`
                : locale === 'en'
                ? `Please enter a valid WhatsApp phone number for ${missingPhoneCreance.client_nom}:`
                : `Veuillez saisir un numéro de téléphone WhatsApp valide pour ${missingPhoneCreance.client_nom} :`}
            </p>

            <form onSubmit={handleSavePhoneAndSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  {t.common.phone} (WhatsApp) :
                </label>
                <input
                  type="text"
                  placeholder="+225 07 00 00 00 00"
                  value={inputPhone}
                  onChange={e => {
                    setInputPhone(e.target.value);
                    setPhoneError(null);
                  }}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: phoneError ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.9rem',
                    color: 'white',
                    outline: 'none',
                    direction: 'ltr',
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                />
                {phoneError && (
                  <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.35rem' }}>{phoneError}</div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setMissingPhoneCreance(null)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={savingPhone || !inputPhone.trim()}
                  className="btn btn-primary btn-sm"
                  style={{
                    backgroundColor: '#22c55e',
                    borderColor: '#22c55e',
                    padding: '0.5rem 1.15rem',
                    fontWeight: 700,
                  }}
                >
                  {savingPhone ? t.common.saving : t.relances.sendWhatsApp}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTOMATION SETTINGS MODAL */}
      {isSettingsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '540px',
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} color={primaryColor} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  {t.relances.automatedTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0' }}>
              {t.relances.automatedSubtitle}
            </p>

            {/* Global toggle */}
            <div
              onClick={() => setAutoActive(!autoActive)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: autoActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)',
                border: autoActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: 'white', fontSize: '0.88rem' }}>
                  {t.relances.enableAutomation}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  {autoActive ? t.relances.activeAutomationNotice : t.relances.inactiveAutomationNotice}
                </div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '20px',
                  background: autoActive ? '#10b981' : 'rgba(255,255,255,0.2)',
                  position: 'relative',
                  transition: 'background 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: '3px',
                    left: autoActive ? (isRtl ? '3px' : '21px') : (isRtl ? '21px' : '3px'),
                    transition: 'left 0.2s ease',
                  }}
                />
              </div>
            </div>

            {/* Milestones list */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white', marginBottom: '0.6rem' }}>
                {t.relances.milestonesTitle}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {ALL_MILESTONES.map(m => {
                  const isChecked = selectedMilestones.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.45rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isChecked ? 'rgba(255,255,255,0.05)' : 'transparent',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        color: isChecked ? 'white' : 'var(--text-muted)',
                      }}
                    >
                      {isChecked ? <CheckSquare size={15} color="#34d399" /> : <Square size={15} color="var(--text-muted)" />}
                      <span style={{ fontWeight: isChecked ? 600 : 400 }}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.5rem 1rem' }}
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="btn btn-primary btn-sm"
                style={{
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                  padding: '0.5rem 1.25rem',
                  fontWeight: 700,
                }}
              >
                {savingSettings ? t.common.saving : t.relances.saveAutoSettings}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
