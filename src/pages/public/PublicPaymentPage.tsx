import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import type { SupportedLocale } from '../../types';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  CreditCard,
  Smartphone,
  Info,
  X,
  Globe,
} from 'lucide-react';
import { apiRequest, type PublicPaymentPageData } from '../../services/api';

export const PublicPaymentPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t, locale, setLocale, isRTL } = useLanguage();

  const [data, setData] = useState<PublicPaymentPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchDemande = async () => {
      if (!token) {
        setError(t.publicPayment.linkExpired);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await apiRequest<PublicPaymentPageData>(`/api/public/payer/${token}`);
        setData(res);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t.publicPayment.linkExpired);
      } finally {
        setLoading(false);
      }
    };

    fetchDemande();
  }, [token, t]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#090d16',
          color: 'white',
          padding: '1.5rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Sparkles className="animate-spin" size={36} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>{t.common.loading}</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.35rem' }}>{t.publicPayment.securedByRelancio}</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#090d16',
          color: 'white',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '16px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
            {t.publicPayment.linkExpired}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            {error || t.publicPayment.contactMerchant}
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.84rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            {t.common.back}
          </Link>
        </div>
      </div>
    );
  }

  const { demande, company, client, creance } = data;
  const primaryColor = company.couleur_principale || '#10b981';
  const secondaryColor = company.couleur_secondaire || '#0ea5e9';

  const isExpired = demande.statut === 'expiree';
  const isPaid = demande.statut === 'payee';
  const isCanceled = demande.statut === 'annulee';
  const isPending = demande.statut === 'en_attente' || demande.statut === 'partiellement_payee';

  const getStatusBadge = () => {
    switch (demande.statut) {
      case 'payee':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
            <CheckCircle2 size={13} />
            {t.common.statusLabels.payee}
          </span>
        );
      case 'expiree':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
            <Clock size={13} />
            {t.common.statusLabels.expire}
          </span>
        );
      case 'annulee':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
            <AlertCircle size={13} />
            {t.common.statusLabels.annule}
          </span>
        );
      case 'partiellement_payee':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
            <Clock size={13} />
            {t.common.statusLabels.partiellement_payee}
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
            <Clock size={13} />
            {t.common.statusLabels.en_attente}
          </span>
        );
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#070a12',
        backgroundImage: `radial-gradient(circle at 50% 0%, ${primaryColor}22 0%, transparent 60%)`,
        color: 'white',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Language Switcher Bar at top */}
      <div style={{ maxWidth: '520px', width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Globe size={13} color="var(--text-muted)" />
          {(['fr', 'en', 'ar'] as SupportedLocale[]).map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              style={{
                background: locale === l ? `${primaryColor}30` : 'transparent',
                border: locale === l ? `1px solid ${primaryColor}60` : '1px solid transparent',
                borderRadius: '4px',
                color: locale === l ? 'white' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.4rem',
                cursor: 'pointer',
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Container */}
      <div style={{ maxWidth: '520px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Top Header Card : Emetteur */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: `0 4px 14px ${primaryColor}40`,
              }}
            >
              {company.logo ? (
                <img src={company.logo} alt={company.nom} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <Building2 size={24} color="white" />
              )}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>
                {company.nom}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                {company.secteur} {company.adresse ? `• ${company.adresse}` : ''}
              </div>
            </div>
          </div>

          <div style={{ textAlign: isRTL ? 'left' : 'right', flexShrink: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.68rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 700 }}>
              <ShieldCheck size={12} />
              {t.publicPayment.securedByRelancio.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Main Payment Card */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: `1px solid ${primaryColor}44`,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: `0 20px 45px rgba(0,0,0,0.6), 0 0 30px ${primaryColor}15`,
          }}
        >
          {/* Visual Header Banner */}
          <div
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              padding: '1.25rem 1.5rem',
              color: 'white',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9, fontWeight: 700 }}>
                  {t.publicPayment.secureCheckout}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  {demande.motif}
                </div>
              </div>

              {getStatusBadge()}
            </div>

            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', background: 'rgba(0,0,0,0.2)', padding: '0.35rem 0.75rem', borderRadius: '8px', width: 'fit-content' }}>
              <span>{t.publicPayment.billedTo} :</span>
              <strong style={{ color: 'white' }}>{client.nom}</strong>
              {client.telephone && <span style={{ opacity: 0.8 }}>({client.telephone})</span>}
            </div>
          </div>

          {/* Amount Box */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                padding: '1.25rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                {t.publicPayment.remainingToPay}
              </div>
              <div
                style={{
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  color: 'white',
                  margin: '0.35rem 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {demande.montant.toLocaleString()} <span style={{ fontSize: '1.2rem', color: primaryColor }}>{t.common.currency}</span>
              </div>

              {/* Financial Context breakdown */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.74rem',
                }}
              >
                <div>
                  <div style={{ color: '#64748b' }}>{t.publicPayment.initialAmount}</div>
                  <div style={{ fontWeight: 700, color: '#e2e8f0', marginTop: '0.15rem' }}>
                    {creance.montant_total.toLocaleString()} {t.common.currency}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748b' }}>{t.publicPayment.amountAlreadyPaid}</div>
                  <div style={{ fontWeight: 700, color: '#34d399', marginTop: '0.15rem' }}>
                    {(creance.montant_paye || 0).toLocaleString()} {t.common.currency}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748b' }}>{t.common.balance}</div>
                  <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '0.15rem' }}>
                    {creance.solde.toLocaleString()} {t.common.currency}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates & Expiration info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: '#94a3b8',
                background: 'rgba(255,255,255,0.02)',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div>
                {t.common.date} : <strong style={{ color: '#cbd5e1' }}>{demande.date_creation}</strong>
              </div>
              <div>
                {t.publicPayment.dueDate} : <strong style={{ color: isExpired ? '#f87171' : '#cbd5e1' }}>{demande.date_expiration}</strong>
              </div>
            </div>

            {/* Description if present */}
            {demande.description && (
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', borderInlineStart: `3px solid ${primaryColor}` }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', marginBottom: '0.2rem' }}>{t.creances.description} :</span>
                {demande.description}
              </div>
            )}

            {/* Status-specific Call to Action */}
            {isPending && (
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                style={{
                  width: '100%',
                  background: primaryColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.95rem 1.25rem',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: `0 8px 20px ${primaryColor}40`,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 12px 25px ${primaryColor}60`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 8px 20px ${primaryColor}40`;
                }}
              >
                <Lock size={16} />
                <span>{t.publicPayment.payNow} ({demande.montant.toLocaleString()} {t.common.currency})</span>
                <ArrowRight size={16} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
              </button>
            )}

            {isPaid && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#34d399',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle2 size={18} />
                <span>{t.publicPayment.paymentSuccess}</span>
              </div>
            )}

            {isExpired && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {t.publicPayment.linkExpired} {t.publicPayment.contactMerchant}
              </div>
            )}

            {isCanceled && (
              <div
                style={{
                  background: 'rgba(148, 163, 184, 0.12)',
                  border: '1px solid rgba(148, 163, 184, 0.35)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {t.publicPayment.linkCancelled}
              </div>
            )}

            {/* Quick Actions (Copy Link, Company Contact) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#cbd5e1',
                  borderRadius: '8px',
                  padding: '0.45rem 0.8rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {copiedLink ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                <span>{copiedLink ? t.common.copied : t.demandes.copyLink}</span>
              </button>

              {company.telephone && (
                <a
                  href={`tel:${company.telephone}`}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#cbd5e1',
                    borderRadius: '8px',
                    padding: '0.45rem 0.8rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Phone size={13} color={primaryColor} />
                  <span>{t.publicPayment.contactMerchant.split(' ')[0]}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Company Contact Information Box */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            fontSize: '0.78rem',
            color: '#94a3b8',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <div style={{ fontWeight: 700, color: 'white', marginBottom: '0.15rem' }}>
            {t.settings.companyInfo} :
          </div>
          {company.telephone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={13} color={primaryColor} />
              <span>{company.telephone}</span>
            </div>
          )}
          {company.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={13} color={primaryColor} />
              <span>{company.email}</span>
            </div>
          )}
          {company.adresse && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={13} color={primaryColor} />
              <span>{company.adresse}</span>
            </div>
          )}
        </div>

        {/* Security & Branding Footer */}
        <div style={{ textAlign: 'center', padding: '0.5rem', color: '#64748b', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>{t.publicPayment.securedByRelancio}</span>
          </div>
          <div>{t.publicPayment.sslEncryption}</div>
        </div>

      </div>

      {/* Demo / Gateway Information Modal */}
      {isDemoModalOpen && (
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
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#0f172a',
              border: `1px solid ${primaryColor}55`,
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(false)}
              className="modal-close-btn"
              style={{
                position: 'absolute',
                top: '1rem',
                right: isRTL ? 'auto' : '1rem',
                left: isRTL ? '1rem' : 'auto',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#94a3b8',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${primaryColor}25`,
                  color: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CreditCard size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  {t.publicPayment.title}
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {t.publicPayment.secureCheckout}
                </div>
              </div>
            </div>

            {/* Clarification banner */}
            <div
              style={{
                background: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                fontSize: '0.8rem',
                color: '#e0f2fe',
                lineHeight: 1.45,
              }}
            >
              <Info size={18} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>{t.publicPayment.paymentMethods}</strong> : Wave, Orange Money, MTN, Moov, Carte Visa/Mastercard.
              </div>
            </div>

            {/* Methods Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { name: 'Wave Mobile Money', icon: <Smartphone size={16} color="#00d4ff" /> },
                { name: 'Orange Money', icon: <Smartphone size={16} color="#ff7900" /> },
                { name: 'MTN Mobile Money / Moov', icon: <Smartphone size={16} color="#ffcc00" /> },
                { name: 'Carte Bancaire (Visa / Mastercard)', icon: <CreditCard size={16} color="#a855f7" /> },
              ].map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
                    {m.icon}
                    <span>{m.name}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '6px', background: `${primaryColor}20`, color: primaryColor, fontWeight: 700 }}>
                    {t.common.active}
                  </span>
                </div>
              ))}
            </div>

            {/* Direct Contact for manual payment */}
            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                padding: '0.85rem',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                {t.publicPayment.remainingToPay} : <strong>{demande.montant.toLocaleString()} {t.common.currency}</strong>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {company.telephone && (
                  <a
                    href={`tel:${company.telephone}`}
                    className="btn btn-primary btn-sm"
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.85rem',
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={13} />
                    {company.telephone}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem' }}
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
