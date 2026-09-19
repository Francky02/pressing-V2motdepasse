import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { apiRequest } from '../services/api';
import type { SupportedLocale } from '../types';
import { Sparkles, Mail, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Globe, ExternalLink } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { t, locale, setLocale, isRTL } = useLanguage();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDevResetUrl(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError(locale === 'ar' ? 'صيغة البريد الإلكتروني غير صالحة.' : 'Veuillez saisir une adresse e-mail valide.');
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest<{
        message: string;
        devResetUrl?: string;
        smtpConfigured?: boolean;
      }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });

      setSuccessMessage(data.message || t.auth.resetLinkSent);
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.common.error;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      {/* En-tête */}
      <header style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="brand-logo-link">
            <div className="brand-logo-icon" style={{ width: '32px', height: '32px' }}>
              <Sparkles size={18} />
            </div>
            <span className="brand-logo-text" style={{ fontSize: '1.15rem' }}>Relancio</span>
            <span className="brand-logo-tag" style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>SaaS</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.45rem', borderRadius: '6px' }}>
              <Globe size={13} color="var(--text-muted)" />
              {(['fr', 'en', 'ar'] as SupportedLocale[]).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  style={{
                    background: locale === l ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                    border: locale === l ? '1px solid #10b981' : '1px solid transparent',
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
            <Link
              to="/connexion"
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
              <span>{t.auth.signIn}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.25rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Logo & Titre */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: 'var(--primary)',
              }}
            >
              <Mail size={26} />
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'white', marginBottom: '0.35rem' }}>
              {t.auth.forgotPasswordTitle}
            </h1>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t.auth.forgotPasswordSubtitle}
            </p>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: '#fb7185',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.84rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMessage ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#34d399',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  textAlign: isRTL ? 'right' : 'left',
                }}
              >
                <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{successMessage}</span>
              </div>

              {devResetUrl && (
                <div
                  style={{
                    background: 'rgba(37, 99, 235, 0.12)',
                    border: '1px solid rgba(37, 99, 235, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    textAlign: isRTL ? 'right' : 'left',
                    fontSize: '0.82rem',
                    color: '#93c5fd',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ExternalLink size={14} />
                    <span>Lien direct généré (Développement sans SMTP) :</span>
                  </div>
                  <a
                    href={devResetUrl}
                    style={{
                      color: '#60a5fa',
                      wordBreak: 'break-all',
                      textDecoration: 'underline',
                      fontSize: '0.78rem',
                    }}
                  >
                    {devResetUrl}
                  </a>
                </div>
              )}

              <Link
                to="/connexion"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                <span>{t.auth.backToLogin}</span>
                {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  {t.common.email}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contact@entreprise.com"
                    autoComplete="email"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: isRTL ? '0.75rem 2.5rem 0.75rem 0.85rem' : '0.75rem 0.85rem 0.75rem 2.5rem',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg btn-glow"
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.92rem',
                }}
              >
                {loading ? (
                  <span>{t.common.loading}</span>
                ) : (
                  <>
                    <span>{t.auth.sendResetLink}</span>
                    {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <Link
                  to="/connexion"
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {isRTL ? <ArrowRight size={13} /> : <ArrowLeft size={13} />}
                  <span>{t.auth.backToLogin}</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
